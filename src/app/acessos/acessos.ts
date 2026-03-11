import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acessos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Controle de Acesso</h1>
        <p class="text-slate-500 text-sm mt-1">Histórico e gestão de acessos ao condomínio</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-700">Módulo em desenvolvimento</h2>
        <p class="text-slate-400 text-sm mt-1 max-w-xs">O controle de acesso com registro em tempo real será implementado em breve.</p>
      </div>
    </div>
  `
})
export class AcessosComponent {}
