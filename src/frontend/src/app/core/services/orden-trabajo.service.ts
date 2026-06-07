import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrdenTrabajoDto,
  OrdenTrabajoDetalleDto,
  CreateOrdenTrabajoRequest,
  UpdateOrdenTrabajoRequest,
  CambiarEtapaRequest,
  RegistrarPagoOTRequest,
  OrdenTrabajoFiltros,
  PagedResult,
} from '../models/orden-trabajo.model';
import { SucursalContextService } from './sucursal-context.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdenTrabajoService {
  private readonly http = inject(HttpClient);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly apiUrl = `${environment.apiUrl}/ordenes-trabajo`;

  private headers(): HttpHeaders {
    const sucursalId = this.sucursalContext.sucursalActual()?.sucursalId ?? '';
    return new HttpHeaders({ 'X-Sucursal-Id': sucursalId });
  }

  getAll(filtros: Partial<OrdenTrabajoFiltros> = {}): Observable<PagedResult<OrdenTrabajoDto>> {
    let params = new HttpParams()
      .set('page', (filtros.page ?? 1).toString())
      .set('pageSize', (filtros.pageSize ?? 20).toString());
    if (filtros.numeroOT?.trim())  params = params.set('numeroOT', filtros.numeroOT.trim());
    if (filtros.clienteId)         params = params.set('clienteId', filtros.clienteId);
    if (filtros.estadoPago)        params = params.set('estadoPago', filtros.estadoPago);
    if (filtros.etapaOT)           params = params.set('etapaOT', filtros.etapaOT);
    return this.http.get<PagedResult<OrdenTrabajoDto>>(this.apiUrl, {
      headers: this.headers(),
      params,
    });
  }

  getById(id: string): Observable<OrdenTrabajoDetalleDto> {
    return this.http.get<OrdenTrabajoDetalleDto>(`${this.apiUrl}/${id}`, {
      headers: this.headers(),
    });
  }

  verificarNumero(numeroOT: string, otId?: string): Observable<{ existe: boolean }> {
    let params = new HttpParams().set('numero', numeroOT);
    if (otId) params = params.set('excluirId', otId);
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/verificar-numero`, { params });
  }

  create(data: CreateOrdenTrabajoRequest): Observable<{ otId: string }> {
    return this.http.post<{ otId: string }>(this.apiUrl, data, {
      headers: this.headers(),
    });
  }

  update(id: string, data: UpdateOrdenTrabajoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data, {
      headers: this.headers(),
    });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.headers(),
    });
  }

  cambiarEtapa(id: string, data: CambiarEtapaRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/etapa`, data, {
      headers: this.headers(),
    });
  }

  registrarPago(id: string, data: RegistrarPagoOTRequest): Observable<{ pagoId: string }> {
    return this.http.post<{ pagoId: string }>(`${this.apiUrl}/${id}/pagos`, data, {
      headers: this.headers(),
    });
  }
}
