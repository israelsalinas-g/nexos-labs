import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LaboratoryOrder } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { LaboratoryOrderFormComponent } from '../laboratory-order-form/laboratory-order-form.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-laboratory-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LaboratoryOrderFormComponent],
  templateUrl: './laboratory-order-list.component.html',
  styleUrls: ['./laboratory-order-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaboratoryOrderListComponent implements OnInit {
  private orderService = inject(LaboratoryOrderService);
  private toastService = inject(ToastService);

  orders = signal<LaboratoryOrder[]>([]);
  selectedOrder = signal<LaboratoryOrder | null>(null);
  showFormModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getOrders(
      this.currentPage(),
      this.pageSize(),
      this.statusFilter() || undefined,
      undefined,
      this.searchTerm() || undefined
    ).subscribe({
      next: (response) => {
        this.orders.set(response.data || []);
        this.totalPages.set(response.totalPages || 1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las órdenes');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadOrders();
  }

  onStatusFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  openCreateModal(): void {
    this.selectedOrder.set(null);
    this.isEditMode.set(false);
    this.showFormModal.set(true);
  }

  editOrder(order: LaboratoryOrder): void {
    this.selectedOrder.set(order);
    this.isEditMode.set(true);
    this.showFormModal.set(true);
  }

  viewOrder(order: LaboratoryOrder): void {
    console.log('Ver orden:', order);
  }

  deleteOrder(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta orden?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
          this.toastService.success('Orden eliminada correctamente');
        },
        error: () => this.toastService.error('Error al eliminar la orden')
      });
    }
  }

  generatePdf(order: LaboratoryOrder): void {
    this.toastService.info(`Generando PDF para la orden ${order.orderNumber}`);
  }

  onOrderSaved(order: LaboratoryOrder): void {
    this.closeFormModal();
    this.loadOrders();
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.selectedOrder.set(null);
    this.isEditMode.set(false);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadOrders();
    }
  }
}
