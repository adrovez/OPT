import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockDto, MovimientoStockDto, RegistrarMovimientoRequest } from '../models/stock.model';
import { StockPorSucursalDto } from '../models/stock-por-sucursal.model';
import { SucursalContextService } from './sucursal-context.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly sucursalContext = inject(SucursalContextService);
  private readonly apiUrl = `${environment.apiUrl}/stock`;

  private headers(): HttpHeaders {
    const sucursalId = this.sucursalContext.sucursalActual()?.sucursalId ?? '';
    return new HttpHeaders({ 'X-Sucursal-Id': sucursalId });
  }

  getStock(): Observable<StockDto[]> {
    return this.http.get<{ items: StockDto[] }>(this.apiUrl, {
      headers: this.headers(),
      params: new HttpParams().set('pageSize', '1000'),
    }).pipe(map(r => r.items));
  }

  registrarMovimiento(request: RegistrarMovimientoRequest): Observable<{ movimientoId: string }> {
    return this.http.post<{ movimientoId: string }>(
      `${this.apiUrl}/movimiento`,
      request,
      { headers: this.headers() },
    );
  }

  getHistorial(params: { desde?: string; hasta?: string; tipo?: string } = {}): Observable<MovimientoStockDto[]> {
    let httpParams = new HttpParams();
    if (params.desde) httpParams = httpParams.set('desde', params.desde);
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
    if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
    return this.http.get<MovimientoStockDto[]>(`${this.apiUrl}/movimientos`, {
      headers: this.headers(),
      params: httpParams,
    });
  }

  getStockPorProducto(productoId: string): Observable<StockPorSucursalDto[]> {
    // NO incluir X-Sucursal-Id — este endpoint devuelve todas las sucursales del tenant
    return this.http.get<StockPorSucursalDto[]>(`${this.apiUrl}/por-producto/${productoId}`);
  }
}
