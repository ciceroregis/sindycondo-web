import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
  badge?: number;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './shell.html'
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);

  sidebarOpen = signal(true);
  mobileOpen = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', roles: ['admin', 'sindico', 'porteiro'] },
    { label: 'Meu Perfil', route: '/perfil', icon: 'perfil', roles: ['morador'] },
    { label: 'Moradores', route: '/moradores', icon: 'people', roles: ['admin', 'sindico', 'porteiro'] },
    { label: 'Visitantes', route: '/visitantes', icon: 'badge' },
    { label: 'Controle de Acesso', route: '/acessos', icon: 'security', roles: ['admin', 'sindico', 'porteiro'] },
    { label: 'Garagens', route: '/garagens', icon: 'garage', roles: ['admin', 'sindico', 'porteiro'] },
    { label: 'Configurações', route: '/configuracoes', icon: 'settings', roles: ['admin', 'sindico'] },
    { label: 'Meu Perfil', route: '/perfil', icon: 'perfil', roles: ['admin', 'sindico', 'porteiro'] },
  ];

  visibleItems = computed(() => {
    const tipo = this.auth.user()?.tipo;
    return this.navItems.filter(item =>
      !item.roles || !tipo || item.roles.includes(tipo)
    );
  });

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  toggleMobile() {
    this.mobileOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }

  getUserInitials(): string {
    const nome = this.auth.user()?.nome ?? '';
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getFirstName(): string {
    return this.auth.user()?.nome?.split(' ')[0] ?? '';
  }

  getTipoLabel(): string {
    const map: Record<string, string> = {
      admin: 'Administrador',
      sindico: 'Síndico',
      porteiro: 'Porteiro',
      morador: 'Morador'
    };
    return map[this.auth.user()?.tipo ?? ''] ?? '';
  }
}
