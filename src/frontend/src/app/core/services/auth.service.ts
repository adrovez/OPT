import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { SucursalContextService } from './sucursal-context.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'opt_token';
const USER_KEY = 'opt_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private sucursalContext = inject(SucursalContextService);
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  readonly currentUser = signal<LoginResponse | null>(this.loadSession());

  private loadSession(): LoginResponse | null {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (!user) return null;
      const response = JSON.parse(user) as LoginResponse;
      this.sucursalContext.init(response.sucursales ?? []);
      return response;
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response));
        this.currentUser.set(response);
        this.sucursalContext.init(response.sucursales ?? []);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.sucursalContext.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
