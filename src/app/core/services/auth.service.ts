import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, LoginPayload, Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<Usuario | null>(null);
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.tipo === 'admin');
  readonly isSindico = computed(() => ['admin', 'sindico'].includes(this._user()?.tipo ?? ''));
  readonly isPorteiro = computed(() => ['admin', 'sindico', 'porteiro'].includes(this._user()?.tipo ?? ''));

  constructor() {
    this.loadUserFromStorage();
  }

  login(payload: LoginPayload) {
    this._loading.set(true);
    return this.http.post<AuthTokens>(`${environment.apiUrl}/auth/login/`, payload).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      }),
      tap(() => {
        this.http.get<Usuario>(`${environment.apiUrl}/usuarios/me/`).subscribe({
          next: user => {
            this._user.set(user);
            this._loading.set(false);
          },
          error: () => this._loading.set(false)
        });
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  logout() {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${environment.apiUrl}/auth/logout/`, { refresh }).subscribe();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return throwError(() => new Error('No refresh token'));
    return this.http.post<{ access: string }>(`${environment.apiUrl}/auth/refresh/`, { refresh }).pipe(
      tap(res => localStorage.setItem('access_token', res.access))
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    this.http.get<Usuario>(`${environment.apiUrl}/usuarios/me/`).subscribe({
      next: user => this._user.set(user),
      error: () => this.logout()
    });
  }
}
