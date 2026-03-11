import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { CondominiosService, CondominioForm } from '../core/services/condominios.service';
import { Condominio } from '../core/models';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.html'
})
export class ConfiguracoesComponent implements OnInit {
  auth = inject(AuthService);
  condominiosService = inject(CondominiosService);

  loading = signal(true);
  salvando = signal(false);
  editando = signal(false);
  showNovoModal = signal(false);

  condominio = signal<Condominio | null>(null);
  erroCarregamento = signal('');
  erro = signal('');
  sucesso = signal('');

  form: CondominioForm = this.formVazio();
  novoForm: CondominioForm = this.formVazio();
  erroNovo = signal('');
  salvandoNovo = signal(false);

  readonly estados = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
    'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
    'SP','SE','TO'
  ];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.erroCarregamento.set('');
    this.condominiosService.listar().subscribe({
      next: res => {
        const cond = res.results[0] ?? null;
        this.condominio.set(cond);
        if (cond) this.form = this.condToForm(cond);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.erroCarregamento.set('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        } else {
          this.erroCarregamento.set(`Erro ao carregar dados (${err.status}): ${err.error?.detail ?? 'tente novamente.'}`);
        }
      }
    });
  }

  iniciarEdicao() {
    const c = this.condominio();
    if (c) this.form = this.condToForm(c);
    this.erro.set('');
    this.sucesso.set('');
    this.editando.set(true);
  }

  cancelarEdicao() {
    this.editando.set(false);
    this.erro.set('');
  }

  salvar() {
    const c = this.condominio();
    if (!c) return;
    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set('');

    const vagasAntes = c.total_vagas ?? 0;

    this.condominiosService.atualizar(c.id, this.form).subscribe({
      next: updated => {
        this.condominio.set(updated);
        this.editando.set(false);
        this.salvando.set(false);
        const vagasDepois = updated.total_vagas ?? 0;
        const novas = vagasDepois - vagasAntes;
        if (novas > 0) {
          this.sucesso.set(`Dados atualizados! ${novas} nova(s) vaga(s) de garagem criada(s) automaticamente.`);
        } else {
          this.sucesso.set('Dados atualizados com sucesso!');
        }
        setTimeout(() => this.sucesso.set(''), 5000);
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

  abrirNovo() {
    this.novoForm = this.formVazio();
    this.erroNovo.set('');
    this.showNovoModal.set(true);
  }

  fecharNovo() {
    this.showNovoModal.set(false);
    this.erroNovo.set('');
  }

  criarCondominio() {
    this.salvandoNovo.set(true);
    this.erroNovo.set('');
    this.condominiosService.criar(this.novoForm).subscribe({
      next: created => {
        this.condominio.set(created);
        this.form = this.condToForm(created);
        this.fecharNovo();
        this.salvandoNovo.set(false);
        const vagas = created.total_vagas ?? 0;
        const msg = vagas > 0
          ? `Condomínio criado! ${vagas} vaga(s) de garagem geradas automaticamente.`
          : 'Condomínio criado com sucesso!';
        this.sucesso.set(msg);
        setTimeout(() => this.sucesso.set(''), 5000);
      },
      error: (err) => {
        this.salvandoNovo.set(false);
        const data = err.error;
        if (typeof data === 'object') {
          this.erroNovo.set(Object.values(data).flat().join(' '));
        } else {
          this.erroNovo.set('Erro ao criar. Tente novamente.');
        }
      }
    });
  }

  private condToForm(c: Condominio): CondominioForm {
    return {
      nome: c.nome,
      cnpj: c.cnpj ?? '',
      telefone: c.telefone ?? '',
      endereco: c.endereco ?? '',
      cidade: c.cidade ?? '',
      estado: c.estado ?? '',
      cep: c.cep ?? '',
      blocos: c.blocos,
      total_apartamentos: c.total_apartamentos,
      total_vagas: c.total_vagas,
    };
  }

  private formVazio(): CondominioForm {
    return {
      nome: '', cnpj: '', telefone: '', endereco: '',
      cidade: '', estado: '', cep: '',
      blocos: 1, total_apartamentos: 1, total_vagas: 0,
    };
  }
}
