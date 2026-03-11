import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">

        <p class="text-xs text-slate-400">
          {{ rangeStart() }}–{{ rangeEnd() }} de <span class="font-medium text-slate-600">{{ count() }}</span> registros
        </p>

        <div class="flex items-center gap-1">
          <!-- Anterior -->
          <button
            (click)="pageChange.emit(currentPage() - 1)"
            [disabled]="currentPage() === 1"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600
                   hover:bg-white hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            ← Anterior
          </button>

          <!-- Páginas -->
          @for (p of pages(); track p) {
            @if (p === -1) {
              <span class="px-2 text-slate-300 text-xs">…</span>
            } @else {
              <button
                (click)="pageChange.emit(p)"
                [class]="'min-w-[32px] h-[30px] rounded-lg text-xs font-medium border transition-all ' +
                         (p === currentPage()
                           ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                           : 'border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300')">
                {{ p }}
              </button>
            }
          }

          <!-- Próxima -->
          <button
            (click)="pageChange.emit(currentPage() + 1)"
            [disabled]="currentPage() === totalPages()"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600
                   hover:bg-white hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Próxima →
          </button>
        </div>
      </div>
    } @else if (count() > 0) {
      <div class="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
        <p class="text-xs text-slate-400">{{ count() }} registro(s)</p>
      </div>
    }
  `
})
export class PaginationComponent {
  count = input.required<number>();
  currentPage = input.required<number>();
  pageSize = input<number>(20);
  pageChange = output<number>();

  totalPages = computed(() => Math.ceil(this.count() / this.pageSize()));

  rangeStart = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.count()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });
}
