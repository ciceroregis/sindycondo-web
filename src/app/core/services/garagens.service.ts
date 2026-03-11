import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Garagem, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class GaragensService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/garagens`;

  listar(page = 1, apenasDisponiveis = false) {
    let params = new HttpParams().set('page', page);
    if (apenasDisponiveis) params = params.set('disponivel', 'true');
    return this.http.get<PaginatedResponse<Garagem>>(`${this.base}/`, { params });
  }

  criar(data: { numero: string; condominio: number; morador?: number | null }) {
    return this.http.post<Garagem>(`${this.base}/`, data);
  }

  atualizar(id: number, data: { numero?: string; morador?: number | null }) {
    return this.http.patch<Garagem>(`${this.base}/${id}/`, data);
  }

  deletar(id: number) {
    return this.http.delete(`${this.base}/${id}/`);
  }
}
