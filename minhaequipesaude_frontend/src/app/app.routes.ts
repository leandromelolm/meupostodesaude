import { Routes } from '@angular/router';
import { ProfissionaisComponent } from './features/profissionais/profissionais.component';
import { EnderecosComponent } from './features/enderecos/enderecos.component';
import { EquipesComponent } from './features/equipes/equipes.component';
import { SobreComponent } from './features/sobre/sobre.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  // linha seguinte da problema em produção no firebase. a rota "" não encontra página
  // { path: '', redirectTo: 'profissionais/4', pathMatch: 'full' },
  // { path: '', component: ProfissionaisComponent },
  { path: '', component: HomeComponent },
  { path: 'equipes', component: EquipesComponent },
  { path: 'profissionais', component: ProfissionaisComponent },
  { path: 'profissionais/:equipeApelido', component: ProfissionaisComponent },
  { path: 'busca-ruas', component: EnderecosComponent },
  { path: 'sobre', component: SobreComponent },
  { path: 'home', component: HomeComponent },
];
