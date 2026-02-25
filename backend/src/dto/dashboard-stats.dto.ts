import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cards del dashboard - Formato simple para el frontend
 */
export class DashboardCardDto {
  @ApiProperty({ 
    description: 'Nombre/Etiqueta de la métrica',
    example: 'Médicos'
  })
  name: string;

  @ApiProperty({ 
    description: 'Valor numérico de la métrica',
    example: 15
  })
  value: number;

  @ApiProperty({ 
    description: 'Icono de Font Awesome para mostrar en el frontend',
    example: 'fa-stethoscope'
  })
  icon: string;

  @ApiProperty({ 
    description: 'Clase de color para la card (opcional)',
    example: 'primary',
    required: false
  })
  color?: string;

  @ApiProperty({ 
    description: 'Descripción adicional (opcional)',
    example: 'Profesionales activos',
    required: false
  })
  description?: string;

  @ApiProperty({ 
    description: 'Tendencia (opcional): "up", "down", "stable"',
    example: 'up',
    required: false
  })
  trend?: 'up' | 'down' | 'stable';

  @ApiProperty({ 
    description: 'Porcentaje de cambio (opcional)',
    example: 5.2,
    required: false
  })
  trendPercent?: number;
}

export class DashboardStatsDto {
  @ApiProperty({ 
    description: 'Resultados entregados en total', 
    example: 1234 
  })
  resultadosEntregados: number;

  @ApiProperty({ 
    description: 'Exámenes pendientes de revisión', 
    example: 56 
  })
  pendientesRevision: number;

  @ApiProperty({ 
    description: 'Muestras rechazadas', 
    example: 12 
  })
  muestrasRechazadas: number;

  @ApiProperty({ 
    description: 'Nuevos pacientes registrados hoy', 
    example: 8 
  })
  nuevosPacientesHoy: number;

  @ApiProperty({ 
    description: 'Total de pacientes activos en el sistema', 
    example: 2450 
  })
  totalPacientes: number;

  @ApiProperty({ 
    description: 'Total de médicos activos en el sistema', 
    example: 15 
  })
  totalMedicos: number;

  @ApiProperty({ 
    description: 'Estadísticas detalladas por tipo de examen'
  })
  estadisticasPorTipo: {
    hemogramas: ExamTypeStats;
    ichroma: ExamTypeStats;
    orina: ExamTypeStats;
    heces: ExamTypeStats;
  };

  @ApiProperty({ 
    description: 'Última actualización de las estadísticas',
    example: '2025-09-28T10:30:00Z'
  })
  ultimaActualizacion: string;
}

export class ExamTypeStats {
  @ApiProperty({ 
    description: 'Total de exámenes de este tipo', 
    example: 150 
  })
  total: number;

  @ApiProperty({ 
    description: 'Exámenes completados', 
    example: 120 
  })
  completados: number;

  @ApiProperty({ 
    description: 'Exámenes pendientes', 
    example: 25 
  })
  pendientes: number;

  @ApiProperty({ 
    description: 'Exámenes en progreso', 
    example: 5 
  })
  enProgreso: number;

  @ApiProperty({ 
    description: 'Exámenes rechazados', 
    example: 3 
  })
  rechazados: number;

  @ApiProperty({ 
    description: 'Exámenes realizados hoy', 
    example: 12 
  })
  hoy: number;

  @ApiProperty({ 
    description: 'Tendencia semanal (últimos 7 días)', 
    type: [Number],
    example: [8, 12, 10, 15, 9, 11, 12] 
  })
  tendenciaSemanal: number[];
}

export class PatientStatsDto {
  @ApiProperty({ 
    description: 'Total de pacientes activos', 
    example: 2450 
  })
  totalActivos: number;

  @ApiProperty({ 
    description: 'Pacientes nuevos hoy', 
    example: 8 
  })
  nuevosHoy: number;

  @ApiProperty({ 
    description: 'Pacientes nuevos esta semana', 
    example: 45 
  })
  nuevosSemana: number;

  @ApiProperty({ 
    description: 'Pacientes con exámenes pendientes', 
    example: 156 
  })
  conExamenesPendientes: number;
}

export class SystemHealthDto {
  @ApiProperty({ 
    description: 'Estado general del sistema', 
    example: 'healthy' 
  })
  estado: 'healthy' | 'warning' | 'error';

  @ApiProperty({ 
    description: 'Conexiones activas a equipos', 
    example: 3 
  })
  equiposConectados: number;

  @ApiProperty({ 
    description: 'Último procesamiento automático', 
    example: '2025-09-28T10:25:00Z' 
  })
  ultimoProcesamientoAutomatico: string;

  @ApiProperty({ 
    description: 'Alertas del sistema', 
    type: [String],
    example: ['Equipo DH36-001 requiere mantenimiento'] 
  })
  alertas: string[];
}