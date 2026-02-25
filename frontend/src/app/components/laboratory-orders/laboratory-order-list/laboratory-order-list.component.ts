import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LaboratoryOrder } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { LaboratoryOrderFormComponent } from '../laboratory-order-form/laboratory-order-form.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-laboratory-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LaboratoryOrderFormComponent],
  templateUrl: './laboratory-order-list.component.html',
  styleUrls: ['./laboratory-order-list.component.css']
})
export class LaboratoryOrderListComponent implements OnInit {
  orders: LaboratoryOrder[] = [];
  selectedOrder: LaboratoryOrder | null = null;
  showFormModal = false;
  isEditMode = false;
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  pageSize = 4;
  totalPages = 1;

  constructor(private orderService: LaboratoryOrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrders(
      this.currentPage,
      this.pageSize,
      this.statusFilter,
      undefined,
      this.searchTerm
    ).subscribe({
      next: (response: any) => {
        this.orders = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar las órdenes';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  openCreateModal(): void {
    this.selectedOrder = null;
    this.isEditMode = false;
    this.showFormModal = true;
  }

  editOrder(order: LaboratoryOrder): void {
    this.selectedOrder = order;
    this.isEditMode = true;
    this.showFormModal = true;
  }

  viewOrder(order: LaboratoryOrder): void {
    console.log('Ver orden:', order);
    // Implementar visualización de detalles
  }

  deleteOrder(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta orden?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err: any) => {
          this.error = 'Error al eliminar la orden';
        }
      });
    }
  }

  generatePdf(order: LaboratoryOrder): void {
    console.log('Generando PDF para orden:', order);
    // Implementar generación de PDF
    alert(`Generando PDF para la orden ${order.orderNumber}`);
  }

  onOrderSaved(order: LaboratoryOrder): void {
    this.closeFormModal();
    this.loadOrders();
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.selectedOrder = null;
    this.isEditMode = false;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }
}
