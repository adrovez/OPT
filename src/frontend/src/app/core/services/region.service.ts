import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { RegionWithComunas } from '../models/region.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Regiones`;

  /**
   * Devuelve todas las regiones con sus comunas anidadas.
   * La respuesta se cachea con shareReplay(1) para evitar llamadas
   * repetidas al backend durante la misma sesion del usuario.
   */
  private readonly regiones$ = this.http
    .get<RegionWithComunas[]>(`${this.apiUrl}/WithComunas`)
    .pipe(shareReplay(1));

  getRegionesWithComunas(): Observable<RegionWithComunas[]> {
    return this.regiones$;
  }
}
