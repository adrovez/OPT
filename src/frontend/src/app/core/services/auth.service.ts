import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, EMPTY } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { SucursalContextService } from './sucursal-context.service';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY         = 'opt_token';
const REFRESH_TOKEN_KEY = 'opt_refresh_token';
const USER_KEY          = 'opt_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http            = inject(HttpClient);
  private router          = inject(Router);
  private sucursalContext = inject(SucursalContextService);
  private storage         = inject(StorageService);
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  readonly currentUser = signal<LoginResponse | null>(this.loadSession());

  private loadSession(): LoginResponse | null {
    try {
      const user = this.storage.get(USER_KEY);
      if (!user) return null;
      const response = JSON.parse(user) as LoginResponse;
      this.sucursalContext.init(response.sucursales ?? []);
      return response;
    } catch {
      return null;
    }
  }

  private saveSession(response: LoginResponse): void {
    this.storage.set(TOKEN_KEY, response.token);
    this.storage.set(REFRESH_TOKEN_KEY, response.refreshToken);
    this.storage.set(USER_KEY, JSON.stringify(response));
    this.currentUser.set(response);
    this.sucursalContext.init(response.sucursales ?? []);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  refresh(): Observable<LoginResponse> {
    const refreshToken = this.storage.get(REFRESH_TOKEN_KEY);
    const user = this.currentUser();
    if (!refreshToken || !user) {
      this.clearSession();
      return EMPTY;
    }
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {
      refreshToken,
      tenantId: user.tenantId,
    }).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  logout(): void {
    const refreshToken = this.storage.get(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      // Fire-and-forget: revocar en servidor sin bloquear el logout local
      this.http.post(`${this.apiUrl}/logout`, { refreshToken })
        .pipe(catchError(() => EMPTY))
        .subscribe();
    }
    this.clearSession();
  }

  private clearSession(): void {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(REFRESH_TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this.currentUser.set(null);
    this.sucursalContext.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean { return !!this.storage.get(TOKEN_KEY); }
  getToken(): string | null  { return this.storage.get(TOKEN_KEY); }
  getRefreshToken(): string | null { return this.storage.get(REFRESH_TOKEN_KEY); }
}
