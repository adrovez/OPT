import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TipoPrevisionDto {
  idTipoPrevision: number;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class PrevisionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tipo-previsiones`;
  private readonly prevision$ = this.http.get<TipoPrevisionDto[]>(this.apiUrl).pipe(shareReplay(1));

  getAll(): Observable<TipoPrevisionDto[]> {
    return this.prevision$;
  }
}
