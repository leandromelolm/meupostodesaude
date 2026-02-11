export interface Rua {
  id: number;
  nome: string;
  bairro: string;
  cidade: string;
  cep: string;
  descricao: string;
  responsavel: string;
  detalhes?: string[];
}
