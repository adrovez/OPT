import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransferenciaDto,
  TransferenciaPagedResult,
  CrearTransferenciaRequest,
} from '../models/transferencia.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransferenciaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transferencias`;

  getAll(params: {
    sucursalId?: string;
    estado?: string;
    page?: number;
    pageSize?: number;
  } = {}): Observable<TransferenciaPagedResult> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('pageSize', (params.pageSize ?? 50).toString());
    if (params.sucursalId) httpParams = httpParams.set('sucursalId', params.sucursalId);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    return this.http.get<TransferenciaPagedResult>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<TransferenciaDto> {
    return this.http.get<TransferenciaDto>(`${this.apiUrl}/${id}`);
  }

  crear(req: CrearTransferenciaRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, req);
  }

  confirmar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado: 'Confirmada' });
  }

  anular(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado: 'Anulada' });
  }
}
