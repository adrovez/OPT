import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrecioProductoDto, PreciosPagedResult, SetPrecioRequest } from '../models/precio.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrecioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/precios`;

  getVigentes(params: {
    search?: string;
    categoriaId?: string;
    page?: number;
    pageSize?: number;
  } = {}): Observable<PreciosPagedResult> {
    let p = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('pageSize', (params.pageSize ?? 500).toString());
    if (params.search?.trim()) p = p.set('search', params.search.trim());
    if (params.categoriaId) p = p.set('categoriaId', params.categoriaId);
    return this.http.get<PreciosPagedResult>(this.apiUrl, { params: p });
  }

  getHistorial(productoId: string): Observable<PrecioProductoDto[]> {
    return this.http.get<PrecioProductoDto[]>(`${this.apiUrl}/${productoId}/historial`);
  }

  setPrecio(productoId: string, req: SetPrecioRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${productoId}`, req);
  }
}
