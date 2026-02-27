import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LaboratoryOrder } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { OrderStatus, OrderPriority, OrderStatusLabels, OrderPriorityLabels } from '../../../enums/order-status.enums';

interface StatusAction {
  label: string;
  status: OrderStatus;
  btnClass: string;
  confirmMsg: string;
}

// Pasos del flujo visible en el stepper (no incluye Cancelled/Billed)
const FLOW_STEPS: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.IN_PROCESS,
  OrderStatus.COMPLETED,
  OrderStatus.DELIVERED,
];

// Transiciones permitidas: estado actual → acción primaria
const STATUS_TRANSITIONS: Partial<Record<OrderStatus, StatusAction>> = {
  [OrderStatus.PENDING]: {
    label: 'Marcar como Pagado',
    status: OrderStatus.PAID,
    btnClass: 'btn-info',
    confirmMsg: '¿Confirmar que la orden fue pagada?',
  },
  [OrderStatus.PAID]: {
    label: 'Iniciar Procesamiento',
    status: OrderStatus.IN_PROCESS,
    btnClass: 'btn-info',
    confirmMsg: '¿Iniciar el procesamiento de esta orden?',
  },
  [OrderStatus.IN_PROCESS]: {
    label: 'Completar Orden',
    status: OrderStatus.COMPLETED,
    btnClass: 'btn-success',
    confirmMsg: '¿Marcar esta orden como completada? No podrá volver atrás.',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Marcar como Entregada',
    status: OrderStatus.DELIVERED,
    btnClass: 'btn-success',
    confirmMsg: '¿Confirmar entrega de resultados al paciente?',
  },
};

@Component({
  selector: 'app-laboratory-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './laboratory-order-detail.component.html',
  styleUrls: ['./laboratory-order-detail.component.css']
})
export class LaboratoryOrderDetailComponent implements OnInit {
  private orderService = inject(LaboratoryOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  order = signal<LaboratoryOrder | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  transitioning = signal(false);

  readonly OrderStatus = OrderStatus;
  readonly OrderStatusLabels = OrderStatusLabels;
  readonly FLOW_STEPS = FLOW_STEPS;

  private orderId: string | null = null;

  // Computed: acción primaria disponible para el estado actual
  nextAction = computed<StatusAction | null>(() => {
    const status = this.order()?.status;
    if (!status) return null;
    return STATUS_TRANSITIONS[status] ?? null;
  });

  // Computed: índice del estado actual en el stepper
  currentStepIndex = computed(() => {
    const status = this.order()?.status;
    if (!status) return -1;
    return FLOW_STEPS.indexOf(status);
  });

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['id'];
    if (this.orderId) this.loadOrder();
  }

  loadOrder(): void {
    if (!this.orderId) return;
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: (err) => {
        this.error.set('Error cargando la orden. Por favor, intente de nuevo.');
        this.loading.set(false);
        console.error('Error loading order:', err);
      }
    });
  }

  transitionStatus(action: StatusAction): void {
    if (!this.orderId || this.transitioning()) return;
    if (!confirm(action.confirmMsg)) return;

    this.transitioning.set(true);
    this.orderService.updateOrderStatus(this.orderId, action.status).subscribe({
      next: () => { this.transitioning.set(false); this.loadOrder(); },
      error: (err: any) => {
        console.error('Error transitioning status:', err);
        this.error.set('Error al cambiar el estado de la orden.');
        this.transitioning.set(false);
      }
    });
  }

  editOrder(): void {
    if (this.orderId) this.router.navigate(['/laboratory-orders', this.orderId, 'edit']);
  }

  captureResults(): void {
    if (this.orderId) this.router.navigate(['/laboratory-orders', this.orderId, 'results']);
  }

  addTests(): void {
    if (this.orderId) this.router.navigate(['/laboratory-orders', this.orderId, 'add-tests']);
  }

  cancelOrder(): void {
    if (!this.orderId) return;
    if (confirm('¿Está seguro de que desea cancelar esta orden? Esta acción no se puede deshacer.')) {
      this.transitioning.set(true);
      this.orderService.updateOrderStatus(this.orderId, OrderStatus.CANCELLED).subscribe({
        next: () => { this.transitioning.set(false); this.loadOrder(); },
        error: (err: any) => {
          console.error('Error canceling order:', err);
          this.error.set('Error al cancelar la orden.');
          this.transitioning.set(false);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/laboratory-orders']);
  }

  getStatusLabel(status: OrderStatus): string { return OrderStatusLabels[status] ?? status; }
  getPriorityLabel(priority: OrderPriority): string { return OrderPriorityLabels[priority] ?? priority; }

  getStatusClass(status: OrderStatus): string {
    const map: Record<string, string> = {
      'Pending': 'pending', 'Paid': 'paid', 'InProcess': 'in-process',
      'Completed': 'completed', 'Billed': 'billed', 'Delivered': 'delivered', 'Cancelled': 'cancelled',
    };
    return map[status] ?? status.toLowerCase();
  }

  getPriorityClass(priority: OrderPriority): string { return priority.toLowerCase(); }

  getStepClass(stepStatus: OrderStatus): string {
    const currentIdx = this.currentStepIndex();
    const stepIdx = FLOW_STEPS.indexOf(stepStatus);
    const cancelled = this.order()?.status === OrderStatus.CANCELLED;

    if (cancelled) return 'step-cancelled';
    if (stepIdx < currentIdx) return 'step-done';
    if (stepIdx === currentIdx) return 'step-active';
    return 'step-pending';
  }

  canCapture(status: OrderStatus): boolean {
    return status === OrderStatus.PENDING || status === OrderStatus.PAID || status === OrderStatus.IN_PROCESS;
  }

  canEdit(status: OrderStatus): boolean {
    return status !== OrderStatus.COMPLETED && status !== OrderStatus.CANCELLED && status !== OrderStatus.DELIVERED;
  }

  canCancel(status: OrderStatus): boolean {
    return status !== OrderStatus.COMPLETED && status !== OrderStatus.CANCELLED && status !== OrderStatus.DELIVERED;
  }
}
