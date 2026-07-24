import { Component, computed, inject, input, signal, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Profissional } from './models/profissional.model';
import { ProfissionaisService } from './services/profissionais.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ProfissionalDetalhesComponent } from '../profissional-detalhes/profissional-detalhes.component';


@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [CommonModule, ProfissionalDetalhesComponent],
  templateUrl: './profissionais.component.html',
  styleUrl: './profissionais.component.css'
})
export class ProfissionaisComponent implements OnInit, OnDestroy {

  private viewportScroller = inject(ViewportScroller);
  private cdr = inject(ChangeDetectorRef);

  private readonly SCROLL_KEY = 'scroll_posicao_profissionais';

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private profissionalService = inject(ProfissionaisService);
  profissionalSelecionado: Profissional | null = null;

  // preencher o input automaticamente com o valor da URL :equipeApelido
  equipeApelido = input<string>('');

  todosMembros = signal<Profissional[]>([]);
  carregando = signal<boolean>(true);
  exibirComponenteProfissionalDetalhes: boolean = false;

  private sub: Subscription | null = null;

  ngOnInit(): void {
    if (this.router.url === '/' || this.router.url === '') {
      this.router.navigate(['/profissionais/4']);
    }
    if (isPlatformBrowser(this.platformId)) {
      this.carregarDados();
    }
  }

  carregarDados() {
    this.carregando.set(true);
    this.sub = this.profissionalService.getProfissionais().subscribe({
      next: (dados) => {
        this.todosMembros.set(dados || []);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar profissionais:', err);
        this.carregando.set(false);
      }
    });
  }

  membrosFiltrados = computed(() => {
    const apelidoAlvo = String(this.equipeApelido() || '').trim();
    const membros = this.todosMembros();
    this.restaurarScroll();
    if (!apelidoAlvo) {
      return membros;
    }

    return membros.filter(membro => String(membro.equipe).trim() === apelidoAlvo);
  });

  tituloEquipe = computed(() => {
    const apelido = this.equipeApelido();
    return apelido ? `${apelido}` : 'Geral';
  });

  abrirComponenteProfissionalDetalhes(exibir: boolean, membro?: any) {
    if (exibir) {
      const [x, y] = this.viewportScroller.getScrollPosition();
      sessionStorage.setItem(this.SCROLL_KEY, y.toString());

      this.profissionalSelecionado = membro;
      this.exibirComponenteProfissionalDetalhes = true;

      this.viewportScroller.scrollToPosition([0, 0]);
    } else {
      this.exibirComponenteProfissionalDetalhes = false;

      // Força o Angular a reconstruir o HTML do @if (!exibirComponenteProfissionalDetalhes)
      this.cdr.detectChanges();

      // Restaura o scroll após o Angular injetar os cards no DOM
      this.restaurarScroll();
    }
  }

  salvarPosicaoScroll() {
    const posicaoAtual = this.viewportScroller.getScrollPosition();
    sessionStorage.setItem(this.SCROLL_KEY, JSON.stringify(posicaoAtual));
  }

  restaurarScroll() {
    const posicaoSalva = sessionStorage.getItem(this.SCROLL_KEY);

    if (posicaoSalva) {
      const scrollY = Number(posicaoSalva);

      setTimeout(() => {
        window.scrollTo({
          top: scrollY,
          behavior: 'instant'
        });
      }, 50);
    }
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}