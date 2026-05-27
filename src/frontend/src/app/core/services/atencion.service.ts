import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtencionDto, CreateAtencionRequest, IniciarAtencionRequest, IniciarAtencionResult, RegistrarCobroRequest } from '../models/atencion.model';
import { SucursalContextService } from './sucursal-context.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly http = inject(HttpClient);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly apiUrl = `${environment.apiUrl}/atenciones`;

  private headers(): HttpHeaders {
    const sucursalId = this.sucursalContext.sucursalActual()?.sucursalId ?? '';
    return new HttpHeaders({ 'X-Sucursal-Id': sucursalId });
  }

  getAll(params: { desde?: string; hasta?: string; estado?: string } = {}): Observable<AtencionDto[]> {
    let httpParams = new HttpParams();
    if (params.desde) httpParams = httpParams.set('desde', params.desde);
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    return this.http.get<AtencionDto[]>(this.apiUrl, { headers: this.headers(), params: httpParams });
  }

  getById(id: string): Observable<AtencionDto> {
    return this.http.get<AtencionDto>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  create(request: CreateAtencionRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request, { headers: this.headers() });
  }

  terminar(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/terminar`, {}, { headers: this.headers() });
  }

  derivarAOT(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/derivar-ot`, {}, { headers: this.headers() });
  }

  registrarCobro(id: string, request: RegistrarCobroRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cobro-servicio`, request, { headers: this.headers() });
  }

  iniciar(request: IniciarAtencionRequest): Observable<IniciarAtencionResult> {
    return this.http.post<IniciarAtencionResult>(`${this.apiUrl}/iniciar`, request, { headers: this.headers() });
  }
}
