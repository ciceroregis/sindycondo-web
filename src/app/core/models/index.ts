export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type UserTipo = 'admin' | 'sindico' | 'porteiro' | 'morador';
export type UserPapel = 'titular' | 'dependente';
export type VisitanteStatus = 'pending' | 'approved' | 'blocked' | 'expired';
export type TipoAcesso = 'qr' | 'facial' | 'placa' | 'manual' | 'chave';

export interface Condominio {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  blocos: number;
  total_apartamentos: number;
  total_vagas: number;
  ativo: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  nome: string;
  email: string;
  cpf: string;
  tipo: UserTipo;
  papel: UserPapel;
  apartamento: number | null;
  bloco: number | null;
  telefone: string;
  foto: string | null;
  condominio: number;
  condominio_nome?: string;
  garagem_numero?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Garagem {
  id: number;
  numero: string;
  condominio: number;
  morador: number | null;
  morador_nome?: string | null;
  disponivel: boolean;
}

export interface Visitante {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  foto: string | null;
  morador: number;
  condominio: number;
  data_inicio: string;
  data_fim: string;
  max_pessoas: number;
  status: VisitanteStatus;
  qr_code_id: string;
  qr_code_imagem: string | null;
  observacoes: string;
  usos_count: number;
}

export interface RegistroAcesso {
  id: number;
  condominio: number;
  visitante: number | null;
  morador: number;
  porteiro: number;
  tipo_acesso: TipoAcesso;
  autorizado: boolean;
  motivo_negado: string;
  timestamp: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface DashboardStats {
  total_moradores: number;
  total_visitantes_hoje: number;
  total_acessos_hoje: number;
  vagas_disponiveis: number;
  acessos_negados_hoje: number;
  visitantes_pendentes: number;
}
