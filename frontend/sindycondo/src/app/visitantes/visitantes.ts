import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitantesService } from '../core/services/visitantes.service';
import { AuthService } from '../core/services/auth.service';
import { PaginationComponent } from '../core/components/pagination';
import { Visitante, VisitanteStatus } from '../core/models';

type TabStatus = '' | 'pending' | 'approved' | 'blocked' | 'expired';

interface FormVisitante {
  nome: string;
  cpf: string;
  telefone: string;
  data_inicio: string;
  data_fim: string;
  max_pessoas: number;
  observacoes: string;
  foto: File | null;
}

@Component({
  selector: 'app-visitantes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './visitantes.html',
})
export class VisitantesComponent implements OnInit {
  private svc = inject(VisitantesService);
  readonly auth = inject(AuthService);

  loading = signal(false);
  salvando = signal(false);
  visitantes = signal<Visitante[]>([]);
  totalCount = signal(0);
  paginaAtual = signal(1);
  busca = signal('');
  tabAtiva = signal<TabStatus>('');

  showModal = signal(false);
  editingId = signal<number | null>(null);
  erroModal = signal<string | null>(null);

  showQrModal = signal(false);
  visitanteQr = signal<Visitante | null>(null);

  form = signal<FormVisitante>({
    nome: '', cpf: '', telefone: '',
    data_inicio: '', data_fim: '',
    max_pessoas: 1, observacoes: '', foto: null
  });

  readonly isSindico = computed(() => this.auth.isSindico());
  readonly isMorador = computed(() => this.auth.user()?.tipo === 'morador');
  readonly podeNovoVisitante = computed(() => {
    const tipo = this.auth.user()?.tipo;
    return tipo === 'admin' || tipo === 'sindico' || tipo === 'morador';
  });

  readonly tabs: { label: string; value: TabStatus }[] = [
    { label: 'Todos', value: '' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Aprovados', value: 'approved' },
    { label: 'Bloqueados', value: 'blocked' },
    { label: 'Expirados', value: 'expired' },
  ];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.svc.listar(this.paginaAtual(), this.tabAtiva(), this.busca()).subscribe({
      next: res => {
        this.visitantes.set(res.results);
        this.totalCount.set(res.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onBusca(valor: string) {
    this.busca.set(valor);
    this.paginaAtual.set(1);
    this.carregar();
  }

  onTab(tab: TabStatus) {
    this.tabAtiva.set(tab);
    this.paginaAtual.set(1);
    this.carregar();
  }

  onPagina(p: number) {
    this.paginaAtual.set(p);
    this.carregar();
  }

  abrirNovoModal() {
    this.editingId.set(null);
    this.erroModal.set(null);
    const agora = new Date();
    const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    this.form.set({
      nome: '', cpf: '', telefone: '',
      data_inicio: this.toDatetimeLocal(agora),
      data_fim: this.toDatetimeLocal(amanha),
      max_pessoas: 1, observacoes: '', foto: null
    });
    this.showModal.set(true);
  }

  abrirEditarModal(v: Visitante) {
    this.editingId.set(v.id);
    this.erroModal.set(null);
    this.form.set({
      nome: v.nome, cpf: v.cpf, telefone: v.telefone,
      data_inicio: v.data_inicio.slice(0, 16),
      data_fim: v.data_fim.slice(0, 16),
      max_pessoas: v.max_pessoas,
      observacoes: v.observacoes,
      foto: null
    });
    this.showModal.set(true);
  }

  fecharModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  onFotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.update(f => ({ ...f, foto: file }));
  }

  salvar() {
    const f = this.form();
    if (!f.nome || !f.data_inicio || !f.data_fim) {
      this.erroModal.set('Preencha os campos obrigatórios.');
      return;
    }
    this.salvando.set(true);
    this.erroModal.set(null);

    const fd = new FormData();
    fd.append('nome', f.nome);
    fd.append('cpf', f.cpf);
    fd.append('telefone', f.telefone);
    fd.append('data_inicio', new Date(f.data_inicio).toISOString());
    fd.append('data_fim', new Date(f.data_fim).toISOString());
    fd.append('max_pessoas', String(f.max_pessoas));
    fd.append('observacoes', f.observacoes);
    if (f.foto) fd.append('foto', f.foto);

    const op = this.editingId()
      ? this.svc.atualizar(this.editingId()!, fd)
      : this.svc.criar(fd);

    op.subscribe({
      next: () => {
        this.fecharModal();
        this.carregar();
        this.salvando.set(false);
      },
      error: err => {
        const data = err.error;
        if (typeof data === 'object') {
          const msgs = Object.entries(data).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`);
          this.erroModal.set(msgs.join(' | '));
        } else {
          this.erroModal.set('Erro ao salvar. Tente novamente.');
        }
        this.salvando.set(false);
      }
    });
  }

  aprovar(v: Visitante) {
    this.svc.aprovar(v.id).subscribe({ next: () => this.carregar() });
  }

  bloquear(v: Visitante) {
    this.svc.bloquear(v.id).subscribe({ next: () => this.carregar() });
  }

  deletar(v: Visitante) {
    if (!confirm(`Excluir visitante "${v.nome}"?`)) return;
    this.svc.deletar(v.id).subscribe({ next: () => this.carregar() });
  }

  abrirQr(v: Visitante) {
    this.svc.obter(v.id).subscribe({
      next: full => {
        this.visitanteQr.set(full);
        this.showQrModal.set(true);
      }
    });
  }

  fecharQrModal() {
    this.showQrModal.set(false);
    this.visitanteQr.set(null);
  }

  podeEditar(v: Visitante): boolean {
    const user = this.auth.user();
    if (!user) return false;
    if (user.tipo === 'admin' || user.tipo === 'sindico') return true;
    if (user.tipo === 'morador') return v.morador === user.id;
    return false;
  }

  podeBloquear(v: Visitante): boolean {
    if (v.status === 'blocked' || v.status === 'expired') return false;
    return this.podeEditar(v);
  }

  statusBadge(status: VisitanteStatus): string {
    const map: Record<VisitanteStatus, string> = {
      pending:  'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      blocked:  'bg-red-100 text-red-700',
      expired:  'bg-slate-100 text-slate-500',
    };
    return map[status] ?? 'bg-slate-100 text-slate-500';
  }

  statusLabel(status: VisitanteStatus): string {
    const map: Record<VisitanteStatus, string> = {
      pending:  'Pendente',
      approved: 'Aprovado',
      blocked:  'Bloqueado',
      expired:  'Expirado',
    };
    return map[status] ?? status;
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private toDatetimeLocal(d: Date): string {
    return d.toISOString().slice(0, 16);
  }
}
