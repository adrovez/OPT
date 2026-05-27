import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { FormaPagoDto } from '../models/forma-pago.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FormaPagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forma-pagos`;

  readonly getAll = (): Observable<FormaPagoDto[]> =>
    this.http.get<FormaPagoDto[]>(this.apiUrl).pipe(shareReplay(1));
}
