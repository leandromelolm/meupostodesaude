import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rua } from '../../models/rua.model';
import { RuasService } from '../../services/ruas.service';

@Component({
  selector: 'app-busca-ruas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busca-ruas.component.html',
  styleUrl: './busca-ruas.component.css'
})
export class BuscaRuasComponent implements OnInit {
  termoBusca: string = '';
  ruasFiltradas: Rua[] = [];
  ruaSelecionada: Rua | null = null;
  private todasAsRuas: Rua[] = [];

  constructor(private ruasService: RuasService) { }

  ngOnInit(): void {
    this.todasAsRuas = this.ruasService.getRuas();
    this.ruasFiltradas = this.todasAsRuas;
  }

  buscar(): void {
    this.ruasFiltradas = this.ruasService.buscarRuas(this.termoBusca);
  }

  selecionarRua(rua: Rua): void {
    this.ruaSelecionada = rua;
  }

  fecharDetalhes(): void {
    this.ruaSelecionada = null;
  }
}
