import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    if (authService.isTokenExpired(token)) {
      console.log('Token has expired, logging out');
      authService.logout();
      return next(req);
    }
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.log('Server rejected token (401), logging out');
          authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};
