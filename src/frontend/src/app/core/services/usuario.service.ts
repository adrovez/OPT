import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UsuarioDto,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  ChangePasswordRequest,
  AssignSucursalRequest,
} from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateUsuarioRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, request);
  }

  update(id: string, request: UpdateUsuarioRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changePassword(id: string, request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/password`, request);
  }

  assignSucursal(id: string, request: AssignSucursalRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/sucursales`, request);
  }

  removeSucursal(id: string, sucursalId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/sucursales/${sucursalId}`);
  }
}
