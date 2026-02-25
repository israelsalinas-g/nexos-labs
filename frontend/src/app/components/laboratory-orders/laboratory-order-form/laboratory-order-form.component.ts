import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaboratoryOrder, CreateLaboratoryOrderDto, UpdateLaboratoryOrderDto } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { OrderPriority } from '../../../enums/order-status.enums';

@Component({
  selector: 'app-laboratory-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './laboratory-order-form.component.html',
  styleUrls: ['./laboratory-order-form.component.css']
})
export class LaboratoryOrderFormComponent implements OnInit {
  @Input() order: LaboratoryOrder | null = null;
  @Input() isEditMode = false;
  @Output() saved = new EventEmitter<LaboratoryOrder>();
  @Output() cancelled = new EventEmitter<void>();

  orderForm!: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';
  
  // Hacer accessible en el template
  OrderPriority = OrderPriority;

  constructor(
    private fb: FormBuilder,
    private orderService: LaboratoryOrderService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      patientId: [
        this.order?.patientId || '',
        [Validators.required]
      ],
      doctorId: [this.order?.doctorId || ''],
      priority: [
        this.order?.priority || '',
        [Validators.required]
      ],
      clinicalIndication: [this.order?.clinicalIndication || ''],
      notes: [this.order?.notes || ''],
      status: [this.order?.status || 'PENDING']
    });
  }

  onSubmit(): void {
    if (!this.orderForm.valid) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    const formValue = this.orderForm.value;

    if (this.isEditMode && this.order) {
      const updateData: UpdateLaboratoryOrderDto = {
        clinicalIndication: formValue.clinicalIndication,
        notes: formValue.notes,
        priority: formValue.priority,
        status: formValue.status
      };

      this.orderService.updateOrder(this.order.id, updateData).subscribe({
        next: (updatedOrder: LaboratoryOrder) => {
          this.submitSuccess = 'Orden actualizada exitosamente';
          setTimeout(() => {
            this.saved.emit(updatedOrder);
          }, 1000);
        },
        error: (err: any) => {
          this.submitError = err.message || 'Error al actualizar la orden';
          this.isSubmitting = false;
        }
      });
    } else {
      const createData: CreateLaboratoryOrderDto = {
        patientId: formValue.patientId,
        doctorId: formValue.doctorId || undefined,
        clinicalIndication: formValue.clinicalIndication,
        notes: formValue.notes,
        priority: formValue.priority
      };

      this.orderService.createOrder(createData).subscribe({
        next: (newOrder: LaboratoryOrder) => {
          this.submitSuccess = 'Orden creada exitosamente';
          setTimeout(() => {
            this.saved.emit(newOrder);
          }, 1000);
        },
        error: (err: any) => {
          this.submitError = err.message || 'Error al crear la orden';
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
