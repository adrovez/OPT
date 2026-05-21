import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { RolDto } from '../models/rol.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  private readonly roles$ = this.http.get<RolDto[]>(this.apiUrl).pipe(shareReplay(1));

  getAll(): Observable<RolDto[]> {
    return this.roles$;
  }
}
