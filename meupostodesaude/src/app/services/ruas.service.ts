import { Injectable } from '@angular/core';
import { Rua } from '../models/rua.model';

@Injectable({
  providedIn: 'root'
})
export class RuasService {
  private ruas: Rua[] = [
    {
      id: 1,
      nome: 'Rua Carlos Pena Filho ',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano',
      detalhes: ['', '', '', '']
    },
    {
      id: 2,
      nome: 'Rua Lavinia ',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 3,
      nome: 'Rua Luis Pereira de Farias ',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 4,
      nome: 'Rua Madressilva',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 5,
      nome: 'Rua Arnaldo Pimentel ',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 6,
      nome: 'Rua Manoel Lubambo',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 7,
      nome: 'Rua Odilon Lima ',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 8,
      nome: 'Rua Bezerra de Palma',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 9,
      nome: 'Rua Carvalho de Mendoça',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 10,
      nome: 'Rua Francisco Porfirio',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 11,
      nome: 'Rua Carlos Alberto de Menezes',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 12,
      nome: 'Rua Santos Araujo',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    },
    {
      id: 13,
      nome: 'Rua Londrina',
      bairro: 'Afogados',
      cidade: 'Recife',
      cep: '50850030',
      descricao: '',
      responsavel: 'fulano'
    }

  ];

  constructor() { }

  getRuas(): Rua[] {
    return this.ruas;
  }

  getRuaById(id: number): Rua | undefined {
    return this.ruas.find(r => r.id === id);
  }

  buscarRuas(termo: string): Rua[] {
    if (!termo.trim()) {
      return this.ruas;
    }
    const termoLower = termo.toLowerCase();
    return this.ruas.filter(r =>
      r.nome.toLowerCase().includes(termoLower) ||
      r.bairro.toLowerCase().includes(termoLower) ||
      r.cidade.toLowerCase().includes(termoLower)
    );
  }
}
