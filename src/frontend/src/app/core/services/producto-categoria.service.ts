import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductoCategoriaDto,
  CreateProductoCategoriaRequest,
  UpdateProductoCategoriaRequest,
} from '../models/producto.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoCategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categorias-producto`;

  getAll(): Observable<ProductoCategoriaDto[]> {
    return this.http.get<ProductoCategoriaDto[]>(this.apiUrl);
  }

  create(request: CreateProductoCategoriaRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, request);
  }

  update(id: string, request: UpdateProductoCategoriaRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
