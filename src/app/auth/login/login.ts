import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  credential = signal('');
  password = signal('');
  showPassword = signal(false);
  error = signal('');
  loading = signal(false);

  onCredentialInput(value: string) {
    const digits = value.replace(/\D/g, '');
    if (/^\d/.test(value) && digits.length <= 11) {
      const masked = digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
      this.credential.set(masked);
    } else {
      this.credential.set(value);
    }
  }

  getRawCredential(): string {
    const val = this.credential();
    return val.replace(/\D/g, '').length === 11 ? val.replace(/\D/g, '') : val;
  }

  submit() {
    if (!this.credential() || !this.password()) {
      this.error.set('Preencha todos os campos.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login({
      login: this.getRawCredential(),
      password: this.password()
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 400) {
          this.error.set('CPF/e-mail ou senha inválidos.');
        } else {
          this.error.set('Erro ao conectar. Tente novamente.');
        }
      }
    });
  }
}
