import { Routes } from '@angular/router';
import { MembrosComponent } from './components/membros/membros.component';
import { BuscaRuasComponent } from './components/busca-ruas/busca-ruas.component';

export const routes: Routes = [
  { path: '', redirectTo: '/membros', pathMatch: 'full' },
  { path: 'membros', component: MembrosComponent },
  { path: 'busca-ruas', component: BuscaRuasComponent }
];
