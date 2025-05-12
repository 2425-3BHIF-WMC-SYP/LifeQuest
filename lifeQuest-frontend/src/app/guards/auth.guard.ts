import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {TokenPayload} from '../jwtToken';
import {jwtDecode} from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const router= inject(Router)
  const token= localStorage.getItem("token");

  if (token) {
    const decodedToken = jwtDecode<{ exp: number }>(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      router.navigate(['/login-page']);
      return false;
    }

    return true;
  } else {
    router.navigate(['/login-page']);
    return false;
  }
};
