import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ignorar rutas públicas que no requieren token
  const publicEndpoints = [
    '/auth/authenticate',
    '/auth/register',
    '/auth/validateEmail',
  ];

  // Si la URL contiene alguna ruta pública, no agregar token
  if (publicEndpoints.some((url) => req.url.includes(url))) {
    return next(req);
  }

  // Obtener token del localStorage
  const token = localStorage.getItem('token');

  // Si hay token, agregar header Authorization
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  // Si no hay token, enviar petición sin modificar
  return next(req);


};
