import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FloatButtonComponent } from '../../components/float-button/float-button.component';

@Component({
  selector: 'app-sobre',
  imports: [RouterLink, RouterLinkActive, FloatButtonComponent],
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.scss',
})
export class SobreComponent {


  redirecionarFaleComSuaEquipe() {

    const telefone = '81991171407'
    const textoMensagem = `FALAR COM MINHA EQUIPE DE SAÚDE`;
    const urlWhatsapp = `https://wa.me/55${telefone}?text=${encodeURIComponent(textoMensagem)}`;

    window.open(urlWhatsapp, '_blank');
  }

}
