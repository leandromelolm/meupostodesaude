import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Endereco } from '../models/endereco.model';
import { map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { ApiResposta } from '../../../shared/models/api-resposta.model';

@Injectable({
  providedIn: 'root',
})
export class EnderecosService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private scriptId = environment.scriptId;
  private readonly apiUrl = `https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/${this.scriptId}/exec`;

  private readonly CACHE_KEY = 'enderecos_data';
  private readonly TIME_KEY = 'enderecos_last_fetch';
  // private readonly CACHE_DURATION_MS = 300000; // 5 minutos
  private readonly CACHE_DURATION_MS = 3600000; // 60 minutos

  private enderecosSignal = signal<Endereco[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const dadosSalvos = sessionStorage.getItem(this.CACHE_KEY);
      if (
        dadosSalvos &&
        dadosSalvos !== 'undefined' &&
        dadosSalvos !== 'null'
      ) {
        try {
          const parsed = JSON.parse(dadosSalvos);
          if (Array.isArray(parsed)) {
            this.enderecosSignal.set(parsed);
          }
        } catch (e) {
          sessionStorage.removeItem(this.CACHE_KEY);
        }
      }
    }
  }

  getEnderecos(): Observable<Endereco[]> {
    if (isPlatformBrowser(this.platformId)) {
      const dadosSalvos = sessionStorage.getItem(this.CACHE_KEY);
      const ultimaRequisicao = sessionStorage.getItem(this.TIME_KEY);
      const agora = Date.now();

      if (
        dadosSalvos &&
        dadosSalvos !== 'undefined' &&
        dadosSalvos !== 'null' &&
        ultimaRequisicao
      ) {
        const tempoDecorrido = agora - parseInt(ultimaRequisicao, 10);
        if (tempoDecorrido < this.CACHE_DURATION_MS) {
          try {
            const dados = JSON.parse(dadosSalvos);
            if (Array.isArray(dados)) {
              this.enderecosSignal.set(dados);
              return of(dados);
            }
          } catch (e) {
            sessionStorage.removeItem(this.CACHE_KEY);
            sessionStorage.removeItem(this.TIME_KEY);
          }
        }
      }
    }

    return this.http.get<ApiResposta<Endereco[]>>(`${this.apiUrl}?action=read&sheetnumber=1`)
      .pipe(map((resposta) => resposta?.data ?? []),
        map((dadosBrutos) => this.removerLogradourosDuplicados(dadosBrutos)),
        tap((dadosSemDuplicatas) => {
          if (
            isPlatformBrowser(this.platformId) &&
            Array.isArray(dadosSemDuplicatas) &&
            dadosSemDuplicatas.length > 0
          ) {
            sessionStorage.setItem(
              this.CACHE_KEY,
              JSON.stringify(dadosSemDuplicatas),
            );
            sessionStorage.setItem(this.TIME_KEY, Date.now().toString());
            this.enderecosSignal.set(dadosSemDuplicatas);
          }
        }),
      );
  }

  getRuaById(id: number): Endereco | undefined {
    return this.enderecosSignal().find((e) => e.id === id);
  }

  buscarEndereco(termo: string): Endereco[] {
    const listaAtual = this.enderecosSignal();
    if (!termo.trim()) {
      return listaAtual;
    }
    const termoFormatado = this.padronizarTexto(termo);
    return listaAtual.filter(
      (e) =>
        this.padronizarTexto(e.logradouro).includes(termoFormatado) ||
        this.padronizarTexto(e.bairro).includes(termoFormatado) ||
        this.padronizarTexto(e.cidade).includes(termoFormatado),
    );
  }

  private padronizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD') // Separa as letras dos acentos (ex: "í" vira "i" + acento)
      .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
      .toLowerCase();
  }

  buscarEnderecoPorLogradouroENumero(
    inputUsuario: string,
  ): Observable<Endereco[] | null> {
    if (!inputUsuario || !inputUsuario.trim()) {
      return of(null);
    }

    let textoLimpo = inputUsuario.replace(/,/g, '').trim();

    const regexNumeroNoFim = /(\d+\s*[a-zA-Z]?|\bS\/N\b)$/i;
    const match = textoLimpo.match(regexNumeroNoFim);

    let logradouro = textoLimpo;
    let numero = '';

    if (match) {
      numero = match[0].trim();
      logradouro = textoLimpo.substring(0, match.index).trim();
    }

    if (!numero) {
      logradouro = textoLimpo;
    }

    const urlBusca = `${this.apiUrl}?action=search&logradouro=${encodeURIComponent(logradouro)}&numero=${encodeURIComponent(numero)}`;

    return this.http.get<ApiResposta<Endereco[]>>(urlBusca).pipe(
      map((resposta) => {
        if (resposta.success && resposta.data) {
          return resposta.data;
        }
        return null;
      }),
    );
  }

  private removerLogradourosDuplicados(enderecos: Endereco[]): Endereco[] {
    if (!enderecos || enderecos.length === 0) {
      return [];
    }
    const logradourosUnicosMap = new Map<string, Endereco>();
    enderecos.forEach((endereco) => {
      const logradouroNormalizado = endereco.logradouro.trim().toLowerCase();
      const microNormalizada = endereco.micro
        ? endereco.micro.trim().toLowerCase()
        : '';
      const chaveUnica = `${logradouroNormalizado}|${microNormalizada}`;
      if (!logradourosUnicosMap.has(chaveUnica)) {
        logradourosUnicosMap.set(chaveUnica, endereco);
      }
    });
    return Array.from(logradourosUnicosMap.values());
  }
}