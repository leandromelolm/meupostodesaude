import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FloatButtonComponent } from '../../components/float-button/float-button.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive, FloatButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  redirecionarFaleComSuaEquipe() {

    const telefone = '81991171407'
    const textoMensagem = `FALAR COM MINHA EQUIPE DE SAÚDE`;
    const urlWhatsapp = `https://wa.me/55${telefone}?text=${encodeURIComponent(textoMensagem)}`;

    window.open(urlWhatsapp, '_blank');
  }

}
