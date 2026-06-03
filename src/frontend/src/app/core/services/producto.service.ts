import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductoDto,
  ProductosPagedResult,
  CreateProductoRequest,
  UpdateProductoRequest,
} from '../models/producto.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  getAll(params: {
    page?: number;
    pageSize?: number;
    tipo?: string;
    categoriaId?: string;
    busqueda?: string;
    soloRaices?: boolean;
    padreId?: string;
  } = {}): Observable<ProductosPagedResult> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 1).toString())
      .set('pageSize', (params.pageSize ?? 20).toString());
    if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
    if (params.categoriaId) httpParams = httpParams.set('categoriaId', params.categoriaId);
    if (params.busqueda?.trim()) httpParams = httpParams.set('busqueda', params.busqueda.trim());
    if (params.soloRaices !== undefined) httpParams = httpParams.set('soloRaices', params.soloRaices.toString());
    if (params.padreId) httpParams = httpParams.set('padreId', params.padreId);
    return this.http.get<ProductosPagedResult>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ProductoDto> {
    return this.http.get<ProductoDto>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateProductoRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, request);
  }

  update(id: string, request: UpdateProductoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
