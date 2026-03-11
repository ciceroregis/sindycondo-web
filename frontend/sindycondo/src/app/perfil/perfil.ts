import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { UsuariosService } from '../core/services/usuarios.service';

interface PerfilForm {
  nome: string;
  email: string;
  telefone: string;
  senha_atual: string;
  nova_senha: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html'
})
export class PerfilComponent {
  auth = inject(AuthService);
  usuariosService = inject(UsuariosService);

  salvando = signal(false);
  sucesso = signal(false);
  erro = signal('');

  readonly tipoLabels: Record<string, string> = {
    admin: 'Administrador', sindico: 'Síndico', porteiro: 'Porteiro', morador: 'Morador'
  };

  readonly papelLabels: Record<string, string> = {
    titular: 'Titular', dependente: 'Dependente'
  };

  form: PerfilForm = this.buildForm();

  get user() {
    return this.auth.user();
  }

  iniciais(nome: string): string {
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  avatarBg(nome: string): string {
    const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
    return colors[nome.charCodeAt(0) % colors.length];
  }

  salvar() {
    this.salvando.set(true);
    this.sucesso.set(false);
    this.erro.set('');

    const payload: any = {
      nome: this.form.nome,
      email: this.form.email,
      telefone: this.form.telefone,
    };
    if (this.form.nova_senha) {
      payload.senha_atual = this.form.senha_atual;
      payload.nova_senha = this.form.nova_senha;
    }

    this.usuariosService.meAtualizar(payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(true);
        this.form.senha_atual = '';
        this.form.nova_senha = '';
        setTimeout(() => this.sucesso.set(false), 3000);
      },
      error: (err) => {
        this.salvando.set(false);
        const data = err.error;
        if (typeof data === 'object') {
          this.erro.set(Object.values(data).flat().join(' '));
        } else {
          this.erro.set('Erro ao salvar. Tente novamente.');
        }
      }
    });
  }

  private buildForm(): PerfilForm {
    const u = this.auth.user();
    return {
      nome: u?.nome ?? '',
      email: u?.email ?? '',
      telefone: u?.telefone ?? '',
      senha_atual: '',
      nova_senha: '',
    };
  }
}
