import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecetaCristalesDto, CreateRecetaCristalesRequest, UpdateRecetaCristalesRequest } from '../models/receta-cristales.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecetaCristalesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/RecetaCristales`;

  getById(id: string): Observable<RecetaCristalesDto> {
    return this.http.get<RecetaCristalesDto>(`${this.apiUrl}/${id}`);
  }

  getByCliente(clienteId: string): Observable<RecetaCristalesDto[]> {
    return this.http.get<RecetaCristalesDto[]>(`${this.apiUrl}?clienteId=${clienteId}`);
  }

  create(request: CreateRecetaCristalesRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, request);
  }

  update(id: string, request: UpdateRecetaCristalesRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }
}
