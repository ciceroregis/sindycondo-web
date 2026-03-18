import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcessosService } from '../core/services/acessos.service';
import { AuthService } from '../core/services/auth.service';
import { PaginationComponent } from '../core/components/pagination';
import { RegistroAcesso, TipoAcesso, TipoRegistro } from '../core/models';

@Component({
  selector: 'app-acessos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './acessos.html',
})
export class AcessosComponent implements OnInit {
  private svc = inject(AcessosService);
  readonly auth = inject(AuthService);

  loading = signal(false);
  acessos = signal<RegistroAcesso[]>([]);
  totalCount = signal(0);
  paginaAtual = signal(1);

  filtroData = signal('');
  filtroAutorizado = signal<'' | 'true' | 'false'>('');

  // QR Validation
  showQrForm = signal(false);
  qrCode = signal('');
  tipoRegistro = signal<'entrada' | 'saida'>('entrada');
  validando = signal(false);
  resultadoQr = signal<{ autorizado: boolean; mensagem: string } | null>(null);

  readonly isPorteiro = computed(() => this.auth.isPorteiro());

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    const filters: { data?: string; autorizado?: boolean } = {};
    if (this.filtroData()) filters.data = this.filtroData();
    if (this.filtroAutorizado() !== '') filters.autorizado = this.filtroAutorizado() === 'true';

    this.svc.listar(this.paginaAtual(), filters).subscribe({
      next: res => {
        this.acessos.set(res.results);
        this.totalCount.set(res.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFiltroData(valor: string) {
    this.filtroData.set(valor);
    this.paginaAtual.set(1);
    this.carregar();
  }

  onFiltroAutorizado(valor: '' | 'true' | 'false') {
    this.filtroAutorizado.set(valor);
    this.paginaAtual.set(1);
    this.carregar();
  }

  onPagina(p: number) {
    this.paginaAtual.set(p);
    this.carregar();
  }

  validarQr() {
    if (!this.qrCode().trim()) return;
    this.validando.set(true);
    this.resultadoQr.set(null);

    this.svc.validarQr({ qr_code_id: this.qrCode().trim(), tipo_registro: this.tipoRegistro() }).subscribe({
      next: res => {
        this.resultadoQr.set({
          autorizado: res.autorizado,
          mensagem: res.autorizado
            ? `Acesso autorizado${res.visitante ? ' — ' + res.visitante : ''}`
            : (res.motivo ?? 'Acesso negado')
        });
        this.validando.set(false);
        if (res.autorizado) {
          this.qrCode.set('');
          this.carregar();
        }
      },
      error: err => {
        const msg = err.error?.detail ?? err.error?.motivo ?? 'Erro ao validar QR Code.';
        this.resultadoQr.set({ autorizado: false, mensagem: msg });
        this.validando.set(false);
      }
    });
  }

  tipoAcessoLabel(tipo: TipoAcesso): string {
    const map: Record<TipoAcesso, string> = {
      qr: 'QR Code', facial: 'Facial', placa: 'Placa', manual: 'Manual', chave: 'Chave'
    };
    return map[tipo] ?? tipo;
  }

  tipoRegistroLabel(tipo: TipoRegistro): string {
    return tipo === 'entrada' ? 'Entrada' : 'Saída';
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
