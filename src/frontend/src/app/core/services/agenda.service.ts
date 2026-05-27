import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgendaDto, CreateAgendaRequest, UpdateAgendaRequest } from '../models/agenda.model';
import { SucursalContextService } from './sucursal-context.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly apiUrl = `${environment.apiUrl}/agenda`;

  private headers(): HttpHeaders {
    const sucursalId = this.sucursalContext.sucursalActual()?.sucursalId ?? '';
    return new HttpHeaders({ 'X-Sucursal-Id': sucursalId });
  }

  getAll(params: { desde?: string; hasta?: string; estado?: string; usuarioId?: string } = {}): Observable<AgendaDto[]> {
    let httpParams = new HttpParams();
    if (params.desde) httpParams = httpParams.set('desde', params.desde);
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.usuarioId) httpParams = httpParams.set('usuarioId', params.usuarioId);
    return this.http.get<AgendaDto[]>(this.apiUrl, { headers: this.headers(), params: httpParams });
  }

  getById(id: string): Observable<AgendaDto> {
    return this.http.get<AgendaDto>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  create(request: CreateAgendaRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request, { headers: this.headers() });
  }

  update(id: string, request: UpdateAgendaRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request, { headers: this.headers() });
  }

  cambiarEstado(id: string, estado: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado }, { headers: this.headers() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}
