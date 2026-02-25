import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LaboratoryOrder } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { OrderStatus, OrderPriority } from '../../../enums/order-status.enums';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-laboratory-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './laboratory-order-detail.component.html',
  styleUrls: ['./laboratory-order-detail.component.css']
})
export class LaboratoryOrderDetailComponent implements OnInit, OnDestroy {
  order: LaboratoryOrder | null = null;
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();
  private orderId: string | null = null;

  constructor(
    private orderService: LaboratoryOrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderId = params['id'];
        if (this.orderId) {
          this.loadOrder();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(): void {
    if (!this.orderId) return;

    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error cargando la orden. Por favor, intente de nuevo.';
          this.loading = false;
          console.error('Error loading order:', err);
        }
      });
  }

  editOrder(): void {
    if (this.orderId) {
      this.router.navigate(['/laboratory-orders', this.orderId, 'edit']);
    }
  }

  cancelOrder(): void {
    if (!this.orderId) return;

    if (confirm('¿Está seguro de que desea cancelar esta orden?')) {
      this.orderService.updateOrderStatus(this.orderId, 'CANCELLED')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadOrder();
          },
          error: (err: any) => {
            console.error('Error canceling order:', err);
            this.error = 'Error al cancelar la orden.';
          }
        });
    }
  }

  addTests(): void {
    if (this.orderId) {
      this.router.navigate(['/laboratory-orders', this.orderId, 'add-tests']);
    }
  }

  removeTest(test: any): void {
    if (!this.orderId) return;

    if (confirm(`¿Desea eliminar la prueba ${test.name}?`)) {
      // Aquí iría la lógica para eliminar la prueba
      // Por ahora es un placeholder
      console.log('Eliminar prueba:', test);
    }
  }

  goBack(): void {
    this.router.navigate(['/laboratory-orders']);
  }

  formatStatus(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'ON_HOLD': 'En Espera'
    };
    return statusMap[status] || status;
  }

  formatPriority(priority: OrderPriority): string {
    const priorityMap: Record<OrderPriority, string> = {
      'STAT': 'STAT (Crítico)',
      'HIGH': 'Alta',
      'NORMAL': 'Normal',
      'LOW': 'Baja'
    };
    return priorityMap[priority] || priority;
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase().replace('_', '-');
  }
}
