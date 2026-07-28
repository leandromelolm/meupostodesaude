import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MenuMobileComponent } from './components/menu-mobile/menu-mobile.component';
import { MenuDesktopComponent } from './components/menu-desktop/menu-desktop.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuDesktopComponent, MenuMobileComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Minha Equipe de Saúde';
}
