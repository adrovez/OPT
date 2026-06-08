import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

const AUTH_SKIP_URLS = ['/Auth/login', '/Auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage     = inject(StorageService);
  const authService = inject(AuthService);

  const token = storage.get('opt_token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRoute = AUTH_SKIP_URLS.some(url => req.url.includes(url));
      if (error.status === 401 && !isAuthRoute) {
        return authService.refresh().pipe(
          switchMap((newSession) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newSession.token}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
