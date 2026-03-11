import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (localStorage.getItem('access_token')) return true;

  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (localStorage.getItem('access_token')) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

/** Bloqueia moradores e redireciona para /perfil */
export const notMoradorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.user();
  // Se o user ainda não carregou (token presente mas request em andamento), deixa passar
  // O componente de destino vai tratar o redirect via effect()
  if (user && user.tipo === 'morador') {
    router.navigate(['/perfil']);
    return false;
  }
  return true;
};
