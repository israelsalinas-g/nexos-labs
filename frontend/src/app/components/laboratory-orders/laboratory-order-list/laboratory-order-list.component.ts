import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LaboratoryOrder } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { LaboratoryOrderFormComponent } from '../laboratory-order-form/laboratory-order-form.component';
import { ToastService } from '../../../services/toast.service';
import {
  OrderStatus,
  OrderPriority,
  OrderStatusLabels,
  OrderPriorityLabels,
} from '../../../enums/order-status.enums';

// Opciones para el selector de estado
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: OrderStatus.PENDING,    label: OrderStatusLabels[OrderStatus.PENDING] },
  { value: OrderStatus.PAID,       label: OrderStatusLabels[OrderStatus.PAID] },
  { value: OrderStatus.IN_PROCESS, label: OrderStatusLabels[OrderStatus.IN_PROCESS] },
  { value: OrderStatus.COMPLETED,  label: OrderStatusLabels[OrderStatus.COMPLETED] },
  { value: OrderStatus.BILLED,     label: OrderStatusLabels[OrderStatus.BILLED] },
  { value: OrderStatus.DELIVERED,  label: OrderStatusLabels[OrderStatus.DELIVERED] },
  { value: OrderStatus.CANCELLED,  label: OrderStatusLabels[OrderStatus.CANCELLED] },
];

@Component({
  selector: 'app-laboratory-order-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, LaboratoryOrderFormComponent],
  templateUrl: './laboratory-order-list.component.html',
  styleUrls: ['./laboratory-order-list.component.css'],
})
export class LaboratoryOrderListComponent implements OnInit {
  private orderService = inject(LaboratoryOrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  orders = signal<LaboratoryOrder[]>([]);
  selectedOrder = signal<LaboratoryOrder | null>(null);
  showFormModal = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  searchTerm = signal('');
  statusFilter = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);

  readonly statusOptions = STATUS_OPTIONS;
  readonly OrderStatusLabels = OrderStatusLabels;
  readonly OrderPriorityLabels = OrderPriorityLabels;

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
      this.searchTerm() || undefined,
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

  onStatusFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadOrders();
  }

  viewOrder(order: LaboratoryOrder): void {
    this.router.navigate(['/laboratory-orders', order.id]);
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

  deleteOrder(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta orden?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => { this.loadOrders(); this.toastService.success('Orden eliminada correctamente'); },
        error: () => this.toastService.error('Error al eliminar la orden'),
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
    if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadOrders(); }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.loadOrders(); }
  }

  getPatientName(order: LaboratoryOrder): string {
    if (order.patient) {
      return `${order.patient.firstName ?? ''} ${order.patient.lastName ?? ''}`.trim();
    }
    return order.patientId ?? '—';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'pending', 'Paid': 'paid', 'InProcess': 'in-process',
      'Completed': 'completed', 'Billed': 'billed',
      'Delivered': 'delivered', 'Cancelled': 'cancelled',
    };
    return map[status] ?? 'pending';
  }

  getPriorityClass(priority: string): string {
    return priority.toLowerCase(); // 'normal', 'urgent', 'stat'
  }
}
