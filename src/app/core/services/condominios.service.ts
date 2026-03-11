import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Condominio, PaginatedResponse } from '../models';

export interface CondominioForm {
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  blocos: number | null;
  total_apartamentos: number | null;
  total_vagas: number | null;
}

@Injectable({ providedIn: 'root' })
export class CondominiosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/condominios`;

  listar() {
    return this.http.get<PaginatedResponse<Condominio>>(`${this.base}/`);
  }

  obter(id: number) {
    return this.http.get<Condominio>(`${this.base}/${id}/`);
  }

  criar(data: CondominioForm) {
    return this.http.post<Condominio>(`${this.base}/`, data);
  }

  atualizar(id: number, data: Partial<CondominioForm>) {
    return this.http.patch<Condominio>(`${this.base}/${id}/`, data);
  }
}
