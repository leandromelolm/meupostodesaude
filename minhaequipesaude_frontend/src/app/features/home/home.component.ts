import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FloatButtonComponent } from '../../components/float-button/float-button.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive, FloatButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  readonly badgeElement = viewChild<ElementRef>('badgeElement');
  readonly floatButtonBottom = signal<number>(112);

  constructor() {
    afterNextRender(() => {

      if (window.innerWidth < 768) {
        setTimeout(() => {
          this.badgeElement()?.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 150);

      }


      const mediaQuery = window.matchMedia('(max-width: 768px)');
      this.atualizarBottom(mediaQuery.matches);
      mediaQuery.addEventListener('change', (e) => {
        this.atualizarBottom(e.matches);
      });

    });

  }

  private atualizarBottom(isMobile: boolean): void {
    this.floatButtonBottom.set(isMobile ? 75 : 112);
  }

  redirecionarFaleComSuaEquipe() {
    const telefone = '81991171407'
    const textoMensagem = `FALAR COM MINHA EQUIPE DE SAÚDE`;
    const urlWhatsapp = `https://wa.me/55${telefone}?text=${encodeURIComponent(textoMensagem)}`;
    window.open(urlWhatsapp, '_blank');
  }

}
