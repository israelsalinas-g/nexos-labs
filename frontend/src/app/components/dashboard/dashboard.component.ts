import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardCard } from '../../models/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardCards: DashboardCard[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardCards();
  }

  loadDashboardCards(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.dashboardService.getDashboardCards().subscribe({
      next: (cards: DashboardCard[]) => {
        console.log('✅ Dashboard cards recibidas:', cards);
        this.dashboardCards = cards;
        this.isLoading = false;
        
        // Si viene vacío, usar datos de ejemplo
        if (cards.length === 0) {
          console.warn('⚠️ El backend retornó un array vacío, usando datos de ejemplo');
          this.dashboardCards = this.getExampleCards();
        }
      },
      error: (error: any) => {
        console.error('❌ Error al cargar las tarjetas del dashboard:', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = error.message || 'Error al conectar con el servidor';
        
        // Usar datos de ejemplo en caso de error
        console.warn('⚠️ Usando datos de ejemplo debido al error');
        this.dashboardCards = this.getExampleCards();
      }
    });
  }

  private getExampleCards(): DashboardCard[] {
    return [
      {
        name: 'Médicos',
        value: 6,
        icon: 'fa-stethoscope',
        color: 'primary',
        description: 'Profesionales activos',
        trend: 'stable'
      },
      {
        name: 'Pacientes',
        value: 10,
        icon: 'fa-users',
        color: 'success',
        description: 'Pacientes registrados',
        trend: 'stable'
      },
      {
        name: 'Nuevos Hoy',
        value: 0,
        icon: 'fa-user-plus',
        color: 'info',
        description: 'Pacientes nuevos hoy',
        trend: 'stable'
      },
      {
        name: 'Exámenes Orina',
        value: 1,
        icon: 'fa-flask',
        color: 'warning',
        description: '0 completados',
        trend: 'down',
        trendPercent: 0
      },
      {
        name: 'Exámenes Heces',
        value: 2,
        icon: 'fa-vial',
        color: 'warning',
        description: '0 completados',
        trend: 'down',
        trendPercent: 0
      },
      {
        name: 'iChroma II',
        value: 42,
        icon: 'fa-microscope',
        color: 'secondary',
        description: '0 procesados',
        trend: 'down',
        trendPercent: 0
      },
      {
        name: 'Hemogramas',
        value: 31,
        icon: 'fa-droplet',
        color: 'danger',
        description: '0 completados',
        trend: 'down',
        trendPercent: 0
      },
      {
        name: 'Pendientes',
        value: 2,
        icon: 'fa-hourglass-end',
        color: 'warning',
        description: 'Exámenes en espera',
        trend: 'up'
      }
    ];
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'fa fa-arrow-up';
      case 'down':
        return 'fa fa-arrow-down';
      case 'stable':
        return 'fa fa-minus';
      default:
        return 'fa fa-minus';
    }
  }

  registerNewExam(): void {
    this.router.navigate(['/patients']);
  }
}
