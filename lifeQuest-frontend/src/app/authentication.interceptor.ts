import { HttpInterceptorFn } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from './jwtToken';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      const expirationDate = new Date(decodedToken.expiresAt);
      const currentDate = new Date();
      if (currentDate > expirationDate) {
        console.log('Token has expired, removing from localStorage');
        localStorage.removeItem('token');
        return next(req);
      }
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedRequest);
    } catch (error) {
      console.log('Invalid token in interceptor, removing from localStorage', error);
      localStorage.removeItem('token');
      return next(req);
    }
  }
  return next(req);
};
