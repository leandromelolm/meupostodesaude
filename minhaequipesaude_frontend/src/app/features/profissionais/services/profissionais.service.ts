import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Profissional } from '../models/profissional.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ApiResposta } from '../../../shared/models/api-resposta.model';

@Injectable({
  providedIn: 'root',
})
export class ProfissionaisService {
  private platformId = inject(PLATFORM_ID);

  private scriptId = environment.scriptId;
  private readonly apiUrl = `https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/${this.scriptId}/exec?action=read&sheetnumber=2`;

  private readonly CACHE_KEY = 'profissionais_data';
  private readonly TIME_KEY = 'profissionais_last_fetch';
  // private readonly CACHE_DURATION_MS = 3600000; // 60 minutos
  private readonly CACHE_DURATION_MS = 7200000; // 120 minutos

  constructor(private http: HttpClient) {}

  getProfissionais(): Observable<Profissional[]> {
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
            const parsed = JSON.parse(dadosSalvos);
            if (Array.isArray(parsed)) {
              return of(parsed);
            }
          } catch (e) {
            sessionStorage.removeItem(this.CACHE_KEY);
            sessionStorage.removeItem(this.TIME_KEY);
          }
        }
      }
    }

    return this.http.get<ApiResposta<Profissional[]>>(this.apiUrl).pipe(
      map((response) => response?.data ?? []),
      tap((profissionais) => {
        if (
          isPlatformBrowser(this.platformId) &&
          Array.isArray(profissionais) &&
          profissionais.length > 0
        ) {
          sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(profissionais));
          sessionStorage.setItem(this.TIME_KEY, Date.now().toString());
        }
      }),
    );
  }

  getProfissionais2(): Observable<Profissional[]> {
    return this.http
      .get<ApiResposta<Profissional[]>>(this.apiUrl)
      .pipe(map((response) => response.data ?? []));
  }
}
