import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _apiService = inject(ApiService);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && _apiService.isValidateToken(token) && role === 'ADMINISTRATOR') {
    return true;
  }

  return _router.parseUrl('/login');
};
