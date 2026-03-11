import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { GaragensService } from '../core/services/garagens.service';
import { UsuariosService } from '../core/services/usuarios.service';
import { Garagem, Usuario } from '../core/models';
import { PaginationComponent } from '../core/components/pagination';

type TabFiltro = 'todas' | 'disponiveis' | 'ocupadas';

@Component({
  selector: 'app-garagens',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './garagens.html'
})
export class GaragensComponent implements OnInit {
  auth = inject(AuthService);
  garagensService = inject(GaragensService);
  usuariosService = inject(UsuariosService);

  loading = signal(true);
  salvando = signal(false);
  garagens = signal<Garagem[]>([]);
  totalCount = signal(0);
  paginaAtual = signal(1);
  readonly pageSize = 20;
  titulares = signal<Usuario[]>([]);

  tabAtiva = signal<TabFiltro>('todas');
  busca = signal('');

  // Modal de criação/edição
  showModal = signal(false);
  editingId = signal<number | null>(null);
  erroModal = signal('');
  formNumero = '';
  formMorador: number | null = null;
  formCondominio: number | null = null;

  // Modal de exclusão
  showDeleteModal = signal(false);
  vagaParaDeletar = signal<Garagem | null>(null);
  deletando = signal(false);
  erroDelete = signal('');

  readonly tabs: { key: TabFiltro; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'disponiveis', label: 'Disponíveis' },
    { key: 'ocupadas', label: 'Ocupadas' },
  ];

  stats = computed(() => {
    const all = this.garagens();
    const disp = all.filter(g => g.disponivel).length;
    return { total: all.length, disponiveis: disp, ocupadas: all.length - disp };
  });

  garajensFiltradas = computed(() => {
    const busca = this.busca().toLowerCase().trim();
    const tab = this.tabAtiva();
    return this.garagens().filter(g => {
      const matchBusca = !busca ||
        g.numero.toLowerCase().includes(busca) ||
        (g.morador_nome ?? '').toLowerCase().includes(busca);
      const matchTab =
        tab === 'todas' ? true :
        tab === 'disponiveis' ? g.disponivel :
        tab === 'ocupadas' ? !g.disponivel : true;
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
    this.garagensService.listar(page).subscribe({
      next: res => {
        this.garagens.set(res.results);
        this.totalCount.set(res.count);
        this.paginaAtual.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.usuariosService.listar(1).subscribe({
      next: res => this.titulares.set(
        res.results.filter(u => u.tipo === 'morador' && u.papel === 'titular' && u.ativo)
      )
    });
  }

  mudarPagina(page: number) {
    this.carregar(page);
  }

  abrirNova() {
    this.formNumero = '';
    this.formMorador = null;
    this.formCondominio = this.auth.user()?.condominio ?? null;
    this.editingId.set(null);
    this.erroModal.set('');
    this.showModal.set(true);
  }

  abrirEditar(g: Garagem) {
    this.formNumero = g.numero;
    this.formMorador = g.morador;
    this.formCondominio = g.condominio;
    this.editingId.set(g.id);
    this.erroModal.set('');
    this.showModal.set(true);
  }

  fecharModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.erroModal.set('');
  }

  salvar() {
    if (!this.formNumero.trim()) {
      this.erroModal.set('O número da vaga é obrigatório.');
      return;
    }
    this.salvando.set(true);
    this.erroModal.set('');

    const id = this.editingId();
    const op = id
      ? this.garagensService.atualizar(id, { numero: this.formNumero, morador: this.formMorador || null })
      : this.garagensService.criar({ numero: this.formNumero, condominio: this.formCondominio!, morador: this.formMorador || null });

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
          this.erroModal.set(Object.values(data).flat().join(' '));
        } else {
          this.erroModal.set('Erro ao salvar. Tente novamente.');
        }
      }
    });
  }

  liberar(g: Garagem, event: Event) {
    event.stopPropagation();
    this.garagensService.atualizar(g.id, { morador: null }).subscribe({
      next: () => this.carregar()
    });
  }

  confirmarDeletar(g: Garagem, event: Event) {
    event.stopPropagation();
    this.vagaParaDeletar.set(g);
    this.erroDelete.set('');
    this.showDeleteModal.set(true);
  }

  fecharDeleteModal() {
    this.showDeleteModal.set(false);
    this.vagaParaDeletar.set(null);
    this.erroDelete.set('');
  }

  deletar() {
    const g = this.vagaParaDeletar();
    if (!g) return;
    this.deletando.set(true);
    this.erroDelete.set('');
    this.garagensService.deletar(g.id).subscribe({
      next: () => {
        this.fecharDeleteModal();
        this.deletando.set(false);
        this.carregar();
      },
      error: (err) => {
        this.deletando.set(false);
        const data = err.error;
        if (Array.isArray(data)) {
          this.erroDelete.set(data.join(' '));
        } else if (typeof data === 'object') {
          this.erroDelete.set(Object.values(data).flat().join(' '));
        } else {
          this.erroDelete.set('Erro ao excluir a vaga.');
        }
      }
    });
  }

  titularesDisponiveis(garagemAtual: number | null): Usuario[] {
    const garagens = this.garagens();
    return this.titulares().filter(u =>
      !garagens.some(g => g.morador === u.id && g.id !== garagemAtual)
    );
  }
}
