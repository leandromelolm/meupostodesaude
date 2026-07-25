import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Endereco } from './models/endereco.model';
import { EnderecosService } from './services/enderecos.service';
import { ProfissionaisService } from '../profissionais/services/profissionais.service'; // Importar
import { Profissional } from '../profissionais/models/profissional.model'; // Importar
import { ProfissionalDetalhesComponent } from '../profissional-detalhes/profissional-detalhes.component'; // Importar
import { finalize, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-enderecos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProfissionalDetalhesComponent
  ],
  templateUrl: './enderecos.component.html',
  styleUrl: './enderecos.component.css'
})
export class EnderecosComponent implements OnInit {

  private platformId = inject(PLATFORM_ID);

  private enderecoService = inject(EnderecosService);
  private profissionaisService = inject(ProfissionaisService);

  private readonly SCROLL_KEY = 'posicao_scroll_meu_componente';

  termoBusca: string = '';
  numeroBusca: string = '';
  enderecoSelecionado: Endereco | null = null;

  profissionalSelecionado: Profissional | null = null;
  exibirProfissionalDetalhes: boolean = false;

  enderecos$!: Observable<Endereco[]>;
  logradouroSelecionadoAcs: string = '';

  carregandoApi: boolean = false;
  buscaApiSemResultado: boolean = false;
  timeoutBuscaId: any;

  listaDeEnderecos: Endereco[] = [];
  @ViewChild('ruasList') ruasListElement!: ElementRef<HTMLDivElement>;
  private scrollPosicaoSalva: number = 0;


  private sub!: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.buscaApiSemResultado = false;
      this.enderecos$ = this.enderecoService.getEnderecos();
    }
  }

  abrirDetalhesAcs(event: MouseEvent, endereco: Endereco): void {
    // Evita a seleção da rua no card pai ao clicar no botão do ACS
    event.stopPropagation();

    this.selecionarRua(endereco)

    if (this.ruasListElement) {
      this.scrollPosicaoSalva = this.ruasListElement.nativeElement.scrollTop;
    }

    if (!endereco.acs || !endereco.micro) return;

    this.logradouroSelecionadoAcs = endereco.logradouro;

    this.profissionaisService.getProfissionais().subscribe({
      next: (profissionais) => {
        const microEndereco = String(endereco.micro).trim().toLowerCase();

        const acsEncontrado = profissionais.find(p =>
          p.micro && String(p.micro).trim().toLowerCase() === microEndereco
        );

        if (acsEncontrado) {
          this.profissionalSelecionado = acsEncontrado;
          this.exibirProfissionalDetalhes = true;
        } else {
          alert('Não foram encontrados os dados cadastrais completos deste Agente de Saúde.');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar dados do Agente de Saúde:', err);
      }
    });
  }

  fecharDetalhesAcs(): void {
    this.exibirProfissionalDetalhes = false;
    this.profissionalSelecionado = null;
    this.cdr.detectChanges();

    // Aplica a restauração após a renderização
    setTimeout(() => {
      if (this.ruasListElement) {
        this.ruasListElement.nativeElement.scrollTop = this.scrollPosicaoSalva;
      }
    }, 0);
  }

  buscar(): void {
    if (!this.termoBusca || !this.termoBusca.trim()) {
      this.numeroBusca = '';
      this.carregarDadosIniciais();
      return;
    }
    const resultadoFiltrado = this.enderecoService.buscarEndereco(this.termoBusca);
    this.enderecos$ = of(resultadoFiltrado);
  }

  selecionarRua(endereco: Endereco): void {
    this.enderecoSelecionado = endereco;
    this.termoBusca = endereco.logradouro;
  }

  dispararBuscaExata(): void {
    if (this.numeroBusca.trim().length < 2) return;

    const buscaCompleta = `${this.termoBusca.trim()}, ${this.numeroBusca.trim()}`;
    this.buscarEnderecoComNumero(buscaCompleta);
  }

  fecharDetalhes(): void {
    this.exibirProfissionalDetalhes = false;
    this.profissionalSelecionado = null;
    this.logradouroSelecionadoAcs = '';
  }

  buscarEnderecoComNumero(logradouro: string): void {
    if (!logradouro || !logradouro.trim() || this.carregandoApi) return;

    if (this.timeoutBuscaId) {
      clearTimeout(this.timeoutBuscaId);
    }

    this.carregandoApi = true;
    this.buscaApiSemResultado = false;
    this.enderecoSelecionado = null;

    this.timeoutBuscaId = setTimeout(() => {
      if (this.carregandoApi) {
        this.carregandoApi = false;
        console.warn("A requisição excedeu o tempo limite de 15 segundos.");
      }
    }, 15000);

    this.enderecoService.buscarEnderecoPorLogradouroENumero(logradouro)
      .pipe(
        finalize(() => {
          this.carregandoApi = false;
          if (this.timeoutBuscaId) {
            clearTimeout(this.timeoutBuscaId);
          }
        })
      )
      .subscribe({
        next: (enderecos) => {
          if (enderecos && enderecos.length > 0) {
            this.enderecos$ = of(enderecos);
            this.buscaApiSemResultado = false;
          } else {
            this.buscaApiSemResultado = true;
            this.enderecos$ = of([]);
          }
        },
        error: (err) => {
          console.error("Erro na requisição da API:", err);
          this.buscaApiSemResultado = true;
          this.enderecos$ = of([]);
        }
      });
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.numeroBusca = '';
    this.enderecoSelecionado = null;
    this.buscaApiSemResultado = false;
    this.fecharDetalhesAcs();
    this.recargarListaCompleta();
  }

  private recargarListaCompleta(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.enderecos$ = this.enderecoService.getEnderecos();
    }
  }

  getDataTest(): void {
    this.sub = this.enderecoService.getEnderecos().subscribe({
      next: (dados) => {
        this.listaDeEnderecos = dados;
      },
      error: (err) => console.error('Erro ao buscar endereços', err)
    });
  }
}