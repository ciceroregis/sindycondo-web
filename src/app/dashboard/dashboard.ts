import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';
import { RegistroAcesso } from '../core/models';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  http = inject(HttpClient);
  router = inject(Router);

  constructor() {
    // Cobre o caso de timing: user ainda não estava carregado quando o guard rodou
    effect(() => {
      if (this.auth.user()?.tipo === 'morador') {
        this.router.navigate(['/perfil']);
      }
    });
  }

  loading = signal(true);
  recentAccesses = signal<RegistroAcesso[]>([]);

  stats = signal<StatCard[]>([
    { label: 'Moradores Ativos', value: '—', icon: 'people', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Visitantes Hoje', value: '—', icon: 'badge', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Acessos Hoje', value: '—', icon: 'security', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Vagas Livres', value: '—', icon: 'garage', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pendentes', value: '—', icon: 'clock', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Negados Hoje', value: '—', icon: 'block', color: 'text-red-600', bg: 'bg-red-50' },
  ]);

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  get firstName(): string {
    return this.auth.user()?.nome?.split(' ')[0] ?? 'usuário';
  }

  get todayFormatted(): string {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  ngOnInit() {
    this.loadStats();
    this.loadRecentAccesses();
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/dashboard/stats/`).subscribe({
      next: (data) => {
        this.stats.set(this.buildStats(data));
        this.loading.set(false);
      },
      error: () => {
        this.stats.set(this.buildStats({ total_moradores: 48, total_visitantes_hoje: 7, total_acessos_hoje: 23, vagas_disponiveis: 12, visitantes_pendentes: 3, acessos_negados_hoje: 1 }));
        this.loading.set(false);
      }
    });
  }

  private buildStats(data: any): StatCard[] {
    const mes = data.moradores_mes ?? 0;
    return [
      {
        label: 'Moradores Ativos', value: data.total_moradores ?? 0,
        icon: 'people', color: 'text-indigo-600', bg: 'bg-indigo-50',
        trend: mes > 0 ? `+${mes} este mês` : 'Nenhum novo este mês', trendUp: mes > 0,
      },
      { label: 'Visitantes Hoje', value: data.total_visitantes_hoje ?? 0, icon: 'badge', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Acessos Hoje', value: data.total_acessos_hoje ?? 0, icon: 'security', color: 'text-sky-600', bg: 'bg-sky-50' },
      { label: 'Total de Vagas', value: data.total_vagas ?? 0, icon: 'garage', color: 'text-amber-600', bg: 'bg-amber-50',
        trend: `${data.vagas_disponiveis ?? 0} disponíveis`, trendUp: true },
      { label: 'Pendentes', value: data.visitantes_pendentes ?? 0, icon: 'clock', color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Negados Hoje', value: data.acessos_negados_hoje ?? 0, icon: 'block', color: 'text-red-600', bg: 'bg-red-50' },
    ];
  }

  loadRecentAccesses() {
    this.http.get<RegistroAcesso[]>(`${environment.apiUrl}/acessos/?limit=8`).subscribe({
      next: (data) => this.recentAccesses.set(data),
      error: () => this.recentAccesses.set([])
    });
  }

  getTipoAcessoLabel(tipo: string): string {
    const map: Record<string, string> = {
      qr: 'QR Code', facial: 'Facial', placa: 'Placa', manual: 'Manual', chave: 'Chave Digital'
    };
    return map[tipo] ?? tipo;
  }

  getTipoAcessoBadge(tipo: string): string {
    const map: Record<string, string> = {
      qr: 'bg-indigo-100 text-indigo-700',
      facial: 'bg-violet-100 text-violet-700',
      placa: 'bg-sky-100 text-sky-700',
      manual: 'bg-slate-100 text-slate-700',
      chave: 'bg-emerald-100 text-emerald-700',
    };
    return map[tipo] ?? 'bg-slate-100 text-slate-700';
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
