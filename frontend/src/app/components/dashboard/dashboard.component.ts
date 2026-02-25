import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardCard } from '../../models/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private dashboardService = inject(DashboardService);

  dashboardCards = signal<DashboardCard[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadDashboardCards();
  }

  loadDashboardCards(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dashboardService.getDashboardCards().subscribe({
      next: (cards: DashboardCard[]) => {
        if (cards.length === 0) {
          this.dashboardCards.set(this.getExampleCards());
        } else {
          this.dashboardCards.set(cards);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading dashboard cards:', error);
        this.errorMessage.set(error.message || 'Error al conectar con el servidor');
        this.hasError.set(true);
        this.dashboardCards.set(this.getExampleCards());
        this.isLoading.set(false);
      }
    });
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'fa fa-arrow-up';
      case 'down': return 'fa fa-arrow-down';
      default: return 'fa fa-minus';
    }
  }

  registerNewExam(): void {
    this.router.navigate(['/patients']);
  }

  private getExampleCards(): DashboardCard[] {
    return [
      { name: 'Médicos', value: 6, icon: 'fa-stethoscope', color: 'primary', description: 'Profesionales activos', trend: 'stable' },
      { name: 'Pacientes', value: 10, icon: 'fa-users', color: 'success', description: 'Pacientes registrados', trend: 'stable' },
      { name: 'Nuevos Hoy', value: 0, icon: 'fa-user-plus', color: 'info', description: 'Pacientes nuevos hoy', trend: 'stable' },
      { name: 'Exámenes Orina', value: 1, icon: 'fa-flask', color: 'warning', description: '0 completados', trend: 'down', trendPercent: 0 },
      { name: 'Exámenes Heces', value: 2, icon: 'fa-vial', color: 'warning', description: '0 completados', trend: 'down', trendPercent: 0 },
      { name: 'iChroma II', value: 42, icon: 'fa-microscope', color: 'secondary', description: '0 procesados', trend: 'down', trendPercent: 0 },
      { name: 'Hemogramas', value: 31, icon: 'fa-droplet', color: 'danger', description: '0 completados', trend: 'down', trendPercent: 0 },
      { name: 'Pendientes', value: 2, icon: 'fa-hourglass-end', color: 'warning', description: 'Exámenes en espera', trend: 'up' }
    ];
  }
}
