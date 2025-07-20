import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service'; // Asegúrate de la ruta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _apiService = inject(ApiService);
  const _router = inject(Router);
  const _toast = inject(ToastService);

  const publicEndpoints = [
    '/auth/authenticate',
    '/auth/register',
    '/auth/validateEmail',
  ];

  if (publicEndpoints.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedRequest).pipe(
    catchError((error) => {
      console.log("🚀 ~ catchError ~ error:", error)
      if (error.status === 401) {
        _toast.show('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'warning');
        _apiService.clearSession();
        _router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
