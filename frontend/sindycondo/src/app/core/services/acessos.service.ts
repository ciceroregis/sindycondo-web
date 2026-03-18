import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RegistroAcesso, PaginatedResponse } from '../models';

export interface ValidarQrPayload {
  qr_code_id: string;
  tipo_registro: 'entrada' | 'saida';
}

export interface ValidarQrResponse {
  autorizado: boolean;
  motivo?: string;
  visitante?: string;
  registro_id?: number;
}

@Injectable({ providedIn: 'root' })
export class AcessosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/acessos`;

  listar(page = 1, filters: { data?: string; autorizado?: boolean; visitante_id?: number } = {}) {
    let params = new HttpParams().set('page', page);
    if (filters.data) params = params.set('data', filters.data);
    if (filters.autorizado !== undefined) params = params.set('autorizado', String(filters.autorizado));
    if (filters.visitante_id !== undefined) params = params.set('visitante_id', filters.visitante_id);
    return this.http.get<PaginatedResponse<RegistroAcesso>>(`${this.base}/`, { params });
  }

  obter(id: number) {
    return this.http.get<RegistroAcesso>(`${this.base}/${id}/`);
  }

  validarQr(payload: ValidarQrPayload) {
    return this.http.post<ValidarQrResponse>(`${this.base}/validar-qr/`, payload);
  }
}
