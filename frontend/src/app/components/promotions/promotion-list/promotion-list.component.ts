import {
  Component, inject, signal, computed, OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Promotion } from '../../../models/promotion.interface';
import { PromotionService } from '../../../services/promotion.service';
import { PromotionFormComponent } from '../promotion-form/promotion-form.component';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PromotionFormComponent],
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.css'],
})
export class PromotionListComponent implements OnInit {
  private promotionService = inject(PromotionService);

  // State
  promotions = signal<Promotion[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalItems = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  searchTerm = signal('');
  includeInactive = signal(false);

  // Modal state
  showForm = signal(false);
  editingPromotion = signal<Promotion | undefined>(undefined);

  readonly today = new Date().toISOString().split('T')[0];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.promotionService.getAll({
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchTerm() || undefined,
      includeInactive: this.includeInactive(),
    }).subscribe({
      next: r => {
        this.promotions.set(r.data);
        this.totalItems.set(r.total);
        this.totalPages.set(r.totalPages);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.load();
  }

  onToggleInactive(): void {
    this.includeInactive.set(!this.includeInactive());
    this.currentPage.set(1);
    this.load();
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) {
      this.currentPage.set(p);
      this.load();
    }
  }

  openCreate(): void {
    this.editingPromotion.set(undefined);
    this.showForm.set(true);
  }

  openEdit(promo: Promotion): void {
    this.editingPromotion.set(promo);
    this.showForm.set(true);
  }

  onSaved(): void {
    this.showForm.set(false);
    this.editingPromotion.set(undefined);
    this.load();
  }

  onCancelled(): void {
    this.showForm.set(false);
    this.editingPromotion.set(undefined);
  }

  toggleActive(promo: Promotion): void {
    this.promotionService.toggleActive(promo.id).subscribe({
      next: () => this.load(),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  delete(promo: Promotion): void {
    if (!confirm(`¿Eliminar la promoción "${promo.name}"? Esta acción no se puede deshacer.`)) return;
    this.promotionService.delete(promo.id).subscribe({
      next: () => this.load(),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  isCurrentlyActive(promo: Promotion): boolean {
    return promo.isActive && promo.validFrom <= this.today && promo.validTo >= this.today;
  }

  isExpired(promo: Promotion): boolean {
    return promo.validTo < this.today;
  }

  isFuture(promo: Promotion): boolean {
    return promo.validFrom > this.today;
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  itemsCount(promo: Promotion): string {
    const t = promo.tests?.length ?? 0;
    const p = promo.profiles?.length ?? 0;
    const parts: string[] = [];
    if (t > 0) parts.push(`${t} prueba${t !== 1 ? 's' : ''}`);
    if (p > 0) parts.push(`${p} perfil${p !== 1 ? 'es' : ''}`);
    return parts.length ? parts.join(', ') : 'Sin ítems';
  }

  trackById(_: number, promo: Promotion): number { return promo.id; }
}
