import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitantes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Visitantes</h1>
        <p class="text-slate-500 text-sm mt-1">Controle de visitantes e autorizações</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-700">Módulo em desenvolvimento</h2>
        <p class="text-slate-400 text-sm mt-1 max-w-xs">A tela de visitantes com QR Code será implementada em breve.</p>
      </div>
    </div>
  `
})
export class VisitantesComponent {}
