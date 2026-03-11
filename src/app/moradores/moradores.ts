import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { UsuariosService, UsuarioForm } from '../core/services/usuarios.service';
import { Usuario } from '../core/models';
import { PaginationComponent } from '../core/components/pagination';

type TabFiltro = 'todos' | 'moradores' | 'equipe' | 'inativos';

@Component({
  selector: 'app-moradores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './moradores.html'
})
export class MoradoresComponent implements OnInit {
  auth = inject(AuthService);
  usuariosService = inject(UsuariosService);

  loading = signal(true);
  salvando = signal(false);
  usuarios = signal<Usuario[]>([]);
  totalCount = signal(0);
  paginaAtual = signal(1);
  readonly pageSize = 20;
  pendentesCount = signal(0);

  busca = signal('');
  tabAtiva = signal<TabFiltro>('todos');

  showModal = signal(false);
  editingId = signal<number | null>(null);
  erroModal = signal('');

  form: UsuarioForm = this.formVazio();

  readonly tabs: { key: TabFiltro; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'moradores', label: 'Moradores' },
    { key: 'equipe', label: 'Equipe' },
    { key: 'inativos', label: 'Inativos' },
  ];

  readonly tipoLabels: Record<string, string> = {
    admin: 'Admin', sindico: 'Síndico', porteiro: 'Porteiro', morador: 'Morador'
  };

  readonly papelLabels: Record<string, string> = {
    titular: 'Titular', dependente: 'Dependente'
  };

  usuariosFiltrados = computed(() => {
    const busca = this.busca().toLowerCase().trim();
    const tab = this.tabAtiva();
    return this.usuarios().filter(u => {
      const matchBusca = !busca ||
        u.nome.toLowerCase().includes(busca) ||
        u.email.toLowerCase().includes(busca) ||
        u.cpf.includes(busca) ||
        (u.apartamento !== null && String(u.apartamento).includes(busca));

      const matchTab =
        tab === 'todos' ? true :
        tab === 'moradores' ? u.tipo === 'morador' && u.ativo :
        tab === 'equipe' ? ['admin', 'sindico', 'porteiro'].includes(u.tipo) :
        tab === 'inativos' ? !u.ativo : true;

      return matchBusca && matchTab;
    });
  });

  ngOnInit() {
    this.carregar();
  }

  setBusca(valor: string) {
    this.busca.set(valor);
    this.carregar(1);
  }

  setTab(tab: TabFiltro) {
    this.tabAtiva.set(tab);
    this.carregar(1);
  }

  carregar(page = this.paginaAtual()) {
    this.loading.set(true);
    this.usuariosService.listar(page).subscribe({
      next: res => {
        this.usuarios.set(res.results);
        this.totalCount.set(res.count);
        this.paginaAtual.set(page);
        this.pendentesCount.set(res.results.filter(u => !u.ativo && u.tipo === 'morador').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  mudarPagina(page: number) {
    this.carregar(page);
  }

  abrirNovo() {
    this.form = this.formVazio();
    if (this.auth.user()?.condominio) {
      this.form.condominio = this.auth.user()!.condominio;
    }
    this.editingId.set(null);
    this.erroModal.set('');
    this.showModal.set(true);
  }

  abrirEditar(u: Usuario) {
    this.form = {
      nome: u.nome,
      email: u.email,
      cpf: u.cpf,
      telefone: u.telefone ?? '',
      tipo: u.tipo,
      papel: u.papel,
      apartamento: u.apartamento,
      bloco: u.bloco,
      condominio: u.condominio,
      ativo: u.ativo,
    };
    this.editingId.set(u.id);
    this.erroModal.set('');
    this.showModal.set(true);
  }

  fecharModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.erroModal.set('');
  }

  salvar() {
    this.salvando.set(true);
    this.erroModal.set('');
    const id = this.editingId();
    const op = id
      ? this.usuariosService.atualizar(id, this.form)
      : this.usuariosService.criar(this.form);

    op.subscribe({
      next: () => {
        this.fecharModal();
        this.carregar();
        this.salvando.set(false);
      },
      error: (err) => {
        this.salvando.set(false);
        const data = err.error;
        if (typeof data === 'object') {
          const msgs = Object.values(data).flat().join(' ');
          this.erroModal.set(msgs);
        } else {
          this.erroModal.set('Erro ao salvar. Tente novamente.');
        }
      }
    });
  }

  aprovar(u: Usuario, event: Event) {
    event.stopPropagation();
    this.usuariosService.aprovar(u.id).subscribe({
      next: () => this.carregar()
    });
  }

  rejeitar(u: Usuario, event: Event) {
    event.stopPropagation();
    this.usuariosService.rejeitar(u.id).subscribe({
      next: () => this.carregar()
    });
  }

  deletar(u: Usuario, event: Event) {
    event.stopPropagation();
    if (!confirm(`Remover ${u.nome}?`)) return;
    this.usuariosService.deletar(u.id).subscribe({
      next: () => this.carregar()
    });
  }

  get isMorador(): boolean {
    return this.form.tipo === 'morador';
  }

  iniciais(nome: string): string {
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  tipoBadge(tipo: string): string {
    const map: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      sindico: 'bg-violet-100 text-violet-700',
      porteiro: 'bg-sky-100 text-sky-700',
      morador: 'bg-indigo-100 text-indigo-700',
    };
    return map[tipo] ?? 'bg-slate-100 text-slate-600';
  }

  avatarBg(nome: string): string {
    const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
    return colors[nome.charCodeAt(0) % colors.length];
  }

  private formVazio(): UsuarioForm {
    return {
      nome: '', email: '', cpf: '', telefone: '',
      tipo: 'morador', papel: 'titular',
      apartamento: null, bloco: null,
      condominio: null, ativo: true,
    };
  }
}
