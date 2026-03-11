import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario, PaginatedResponse } from '../models';

export interface UsuarioForm {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipo: string;
  papel: string;
  apartamento: number | null;
  bloco: number | null;
  condominio: number | null;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  listar(page = 1) {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<Usuario>>(`${this.base}/`, { params });
  }

  pendentes() {
    return this.http.get<Usuario[]>(`${this.base}/pendentes/`);
  }

  criar(data: Partial<UsuarioForm>) {
    return this.http.post<Usuario>(`${this.base}/`, data);
  }

  atualizar(id: number, data: Partial<UsuarioForm>) {
    return this.http.patch<Usuario>(`${this.base}/${id}/`, data);
  }

  aprovar(id: number) {
    return this.http.patch<{ detail: string }>(`${this.base}/${id}/aprovar/`, {});
  }

  rejeitar(id: number) {
    return this.http.patch<{ detail: string }>(`${this.base}/${id}/rejeitar/`, {});
  }

  deletar(id: number) {
    return this.http.delete(`${this.base}/${id}/`);
  }

  meAtualizar(data: { nome?: string; email?: string; telefone?: string; senha_atual?: string; nova_senha?: string }) {
    return this.http.patch<any>(`${this.base}/me_update/`, data);
  }
}
