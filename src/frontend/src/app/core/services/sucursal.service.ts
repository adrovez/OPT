import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SucursalDto, CreateSucursalRequest, UpdateSucursalRequest } from '../models/sucursal.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SucursalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sucursales`;

  getAll(): Observable<SucursalDto[]> {
    return this.http.get<SucursalDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<SucursalDto> {
    return this.http.get<SucursalDto>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateSucursalRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, request);
  }

  update(id: string, request: UpdateSucursalRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
