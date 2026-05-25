import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DocumentoStockDto,
  DocumentosPagedResult,
  CrearDocumentoRequest,
} from '../models/documento-stock.model';
import { SucursalContextService } from './sucursal-context.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentoStockService {
  private readonly http = inject(HttpClient);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly apiUrl = `${environment.apiUrl}/documentos-stock`;

  private headers(): HttpHeaders {
    const sucursalId = this.sucursalContext.sucursalActual()?.sucursalId ?? '';
    return new HttpHeaders({ 'X-Sucursal-Id': sucursalId });
  }

  getDocumentos(params: {
    tipo?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    pageSize?: number;
  } = {}): Observable<DocumentosPagedResult> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('pageSize', (params.pageSize ?? 100).toString());
    if (params.tipo)   httpParams = httpParams.set('tipo', params.tipo);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.desde)  httpParams = httpParams.set('desde', params.desde);
    if (params.hasta)  httpParams = httpParams.set('hasta', params.hasta);
    return this.http.get<DocumentosPagedResult>(this.apiUrl, {
      headers: this.headers(),
      params: httpParams,
    });
  }

  getById(id: string): Observable<DocumentoStockDto> {
    return this.http.get<DocumentoStockDto>(`${this.apiUrl}/${id}`, {
      headers: this.headers(),
    });
  }

  crear(request: CrearDocumentoRequest): Observable<{ documentoId: string }> {
    return this.http.post<{ documentoId: string }>(this.apiUrl, request, {
      headers: this.headers(),
    });
  }

  anular(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/anular`, null, {
      headers: this.headers(),
    });
  }
}
