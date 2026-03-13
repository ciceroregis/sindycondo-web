import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Visitante, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class VisitantesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/visitantes`;

  listar(page = 1, status = '', busca = '') {
    let params = new HttpParams().set('page', page);
    if (status) params = params.set('status', status);
    if (busca) params = params.set('search', busca);
    return this.http.get<PaginatedResponse<Visitante>>(`${this.base}/`, { params });
  }

  obter(id: number) {
    return this.http.get<Visitante>(`${this.base}/${id}/`);
  }

  criar(data: FormData) {
    return this.http.post<Visitante>(`${this.base}/`, data);
  }

  atualizar(id: number, data: FormData) {
    return this.http.patch<Visitante>(`${this.base}/${id}/`, data);
  }

  aprovar(id: number) {
    return this.http.patch<Visitante>(`${this.base}/${id}/aprovar/`, {});
  }

  bloquear(id: number) {
    return this.http.patch<Visitante>(`${this.base}/${id}/bloquear/`, {});
  }

  deletar(id: number) {
    return this.http.delete(`${this.base}/${id}/`);
  }
}
