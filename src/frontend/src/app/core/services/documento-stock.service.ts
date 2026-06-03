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
  private readonly apiUrl = `${environment.apiUrl}/documentos-entrada`;

  private headers(): HttpHeaders {
    const sucursalId = this.sucursalContext.sucursalActual()?.sucursalId ?? '';
    return new HttpHeaders({ 'X-Sucursal-Id': sucursalId });
  }

  getDocumentos(params: {
    estado?: string;
    page?: number;
    pageSize?: number;
  } = {}): Observable<DocumentosPagedResult> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('pageSize', (params.pageSize ?? 100).toString());
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
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
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/estado`,
      { estado: 'Anulado' },
      { headers: this.headers() },
    );
  }
}
