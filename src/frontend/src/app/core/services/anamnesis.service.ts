import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnamnesisDto, CreateAnamnesisRequest, UpdateAnamnesisRequest } from '../models/anamnesis.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnamnesisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Anamnesis`;

  getByCliente(clienteId: string): Observable<AnamnesisDto[]> {
    const params = new HttpParams().set('clienteId', clienteId);
    return this.http.get<AnamnesisDto[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<AnamnesisDto> {
    return this.http.get<AnamnesisDto>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateAnamnesisRequest): Observable<AnamnesisDto> {
    return this.http.post<AnamnesisDto>(this.apiUrl, request);
  }

  update(id: string, request: UpdateAnamnesisRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
