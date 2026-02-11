import { Injectable } from '@angular/core';
import { Membro } from '../models/membro.model';

@Injectable({
  providedIn: 'root'
})
export class MembrosService {
  private membros: Membro[] = [
    {
      id: 1,
      nome: 'Maria Silva',
      especialidade: 'Medica em Saúde da Família',
      registro: '',
      descricao: ''
    },
    {
      id: 2,
      nome: 'Joana Santos',
      especialidade: 'Enfermeira em Saúde da Família',
      registro: '',
      descricao: ''
    },
    {
      id: 3,
      nome: 'Ana Costa',
      especialidade: 'Dentista em Saúde da Família',
      registro: '',
      descricao: ''
    },
    {
      id: 4,
      nome: 'Carlos Oliveira',
      especialidade: 'Auxiliar em Saúde Bucal',
      registro: '',
      descricao: ''
    },
    {
      id: 5,
      nome: 'Paula Mendes',
      especialidade: 'Técnica em enfermagem',
      registro: '',
      descricao: ''
    },
    {
      id: 6,
      nome: 'Carlos Lima',
      especialidade: 'Agente Comunitário em Saúde',
      registro: '',
      descricao: 'Cobre as seguintes ruas: rua Carlos Pena Filho, Rua Lavinia'
    },
    {
      id: 7,
      nome: 'Carlos Lima',
      especialidade: 'Agente Comunitário em Saúde',
      registro: '',
      descricao: 'Cobre as seguintes ruas:'
    },
    {
      id: 8,
      nome: 'Carlos Lima',
      especialidade: 'Agente Comunitário em Saúde',
      registro: '',
      descricao: 'Cobre as seguintes ruas:'
    },
    {
      id: 9,
      nome: 'Carlos Lima',
      especialidade: 'Agente Comunitário em Saúde',
      registro: '',
      descricao: 'Cobre as seguintes ruas:'
    },
    {
      id: 10,
      nome: 'Carlos Lima',
      especialidade: 'Agente Comunitário em Saúde',
      registro: '',
      descricao: 'Cobre as seguintes ruas:'
    }
    
  ];

  constructor() { }

  getMembros(): Membro[] {
    return this.membros;
  }

  getMembroById(id: number): Membro | undefined {
    return this.membros.find(m => m.id === id);
  }
}
