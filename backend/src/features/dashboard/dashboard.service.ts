import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { UrineTest } from '../../entities/urine-test.entity';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { StoolTest } from '../../entities/stool-test.entity';
import { Doctor } from '../../entities/doctor.entity';
import { DashboardStatsDto, ExamTypeStats, PatientStatsDto, SystemHealthDto } from '../../dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(UrineTest)
    private urineTestRepository: Repository<UrineTest>,
    @InjectRepository(DymindDh36Result)
    private dymindDh36ResultRepository: Repository<DymindDh36Result>,
    @InjectRepository(IChromaResult)
    private iChromaResultRepository: Repository<IChromaResult>,
    @InjectRepository(StoolTest)
    private stoolTestRepository: Repository<StoolTest>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  /**
   * Obtener estadísticas de pacientes
   */
  private async getPatientStats(): Promise<PatientStatsDto> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const semanaPasada = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalActivos, nuevosHoy, nuevosSemana] = await Promise.all([
      this.patientRepository.count({ where: { isActive: true } }),
      this.patientRepository
        .createQueryBuilder('patient')
        .where('patient.isActive = :isActive', { isActive: true })
        .andWhere('patient.createdAt >= :fecha', { fecha: hoy })
        .getCount(),
      this.patientRepository
        .createQueryBuilder('patient')
        .where('patient.isActive = :isActive', { isActive: true })
        .andWhere('patient.createdAt >= :fecha', { fecha: semanaPasada })
        .getCount()
    ]);

    // Contar pacientes únicos con exámenes pendientes (simplificado)
    const urinePatients = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .select('DISTINCT urineTest.patientId')
      .where('urineTest.status IN (:...statuses)', { statuses: ['pending', 'in_progress'] })
      .getRawMany();
      
    const iChromaPatients = await this.iChromaResultRepository
      .createQueryBuilder('iChromaResult')
      .select('DISTINCT iChromaResult.patientId')
      .where('iChromaResult.processingStatus IN (:...statuses)', { statuses: ['pending', 'processing'] })
      .getRawMany();

    // Combinar y contar pacientes únicos
    const allPatientIds = new Set([
      ...urinePatients.map(p => p.patientId),
      ...iChromaPatients.map(p => p.patientId)
    ]);
    const pacientesConPendientes = allPatientIds.size;

    return {
      totalActivos,
      nuevosHoy,
      nuevosSemana,
      conExamenesPendientes: pacientesConPendientes
    };
  }

  /**
   * Obtener estadísticas de médicos
   */
  private async getDoctorStats(): Promise<{ totalActivos: number; totalRegistrados: number; conPacientesAsignados: number }> {
    const [totalActivos, totalRegistrados] = await Promise.all([
      this.doctorRepository.count({ where: { isActive: true } }),
      this.doctorRepository.count()
    ]);

    // Contar doctores únicos con pacientes/tests asignados
    const doctoresConTests = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .select('DISTINCT urineTest.doctorId')
      .where('urineTest.doctorId IS NOT NULL')
      .getRawMany();

    const doctoresStoolTests = await this.stoolTestRepository
      .createQueryBuilder('stoolTest')
      .select('DISTINCT stoolTest.doctorId')
      .where('stoolTest.doctorId IS NOT NULL')
      .getRawMany();

    const allDoctorIds = new Set([
      ...doctoresConTests.map(d => d.urineTest_doctorId),
      ...doctoresStoolTests.map(d => d.stoolTest_doctorId)
    ]);

    return {
      totalActivos,
      totalRegistrados,
      conPacientesAsignados: allDoctorIds.size
    };
  }

  /**
   * Obtener estadísticas de exámenes de orina
   */
  private async getUrineTestStats(): Promise<ExamTypeStats> {
    const [total, completados, pendientes, enProgreso, rechazados] = await Promise.all([
      this.urineTestRepository.count(),
      this.urineTestRepository.count({ where: { status: 'completed' } }),
      this.urineTestRepository.count({ where: { status: 'pending' } }),
      this.urineTestRepository.count({ where: { status: 'in_progress' } }),
      this.urineTestRepository.count({ where: { status: 'rejected' } })
    ]);

    // Exámenes realizados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyCount = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .where('urineTest.createdAt >= :fecha', { fecha: hoy })
      .getCount();

    // Tendencia semanal (últimos 7 días)
    const tendenciaSemanal = await this.getTendenciaSemanal('urine_tests');

    return {
      total,
      completados,
      pendientes,
      enProgreso,
      rechazados,
      hoy: hoyCount,
      tendenciaSemanal
    };
  }

  /**
   * Obtener estadísticas de iChroma II
   */
  private async getIChromaStats(): Promise<ExamTypeStats> {
    const [total, completados, pendientes, enProgreso, rechazados] = await Promise.all([
      this.iChromaResultRepository.count(),
      this.iChromaResultRepository.count({ where: { processingStatus: 'completed' } }),
      this.iChromaResultRepository.count({ where: { processingStatus: 'pending' } }),
      this.iChromaResultRepository.count({ where: { processingStatus: 'processing' } }),
      this.iChromaResultRepository.count({ where: { processingStatus: 'error' } })
    ]);

    // Resultados procesados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyCount = await this.iChromaResultRepository
      .createQueryBuilder('iChromaResult')
      .where('iChromaResult.createdAt >= :fecha', { fecha: hoy })
      .getCount();

    // Tendencia semanal (últimos 7 días)
    const tendenciaSemanal = await this.getTendenciaSemanal('ichroma_results');

    return {
      total,
      completados,
      pendientes,
      enProgreso,
      rechazados,
      hoy: hoyCount,
      tendenciaSemanal
    };
  }

  /**
   * Obtener estadísticas de exámenes coprológicos
   */
  private async getStoolTestStats(): Promise<ExamTypeStats> {
    const [total, completados, pendientes, enProgreso, rechazados] = await Promise.all([
      this.stoolTestRepository.count(),
      this.stoolTestRepository.count({ where: { status: 'completed' } }),
      this.stoolTestRepository.count({ where: { status: 'pending' } }),
      this.stoolTestRepository.count({ where: { status: 'reviewed' } }),
      this.stoolTestRepository.count({ where: { status: 'rejected' } })
    ]);

    // Exámenes realizados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyCount = await this.stoolTestRepository
      .createQueryBuilder('stoolTest')
      .where('stoolTest.createdAt >= :fecha', { fecha: hoy })
      .getCount();

    // Tendencia semanal (últimos 7 días)
    const tendenciaSemanal = await this.getTendenciaSemanal('stool_tests');

    return {
      total,
      completados,
      pendientes,
      enProgreso,
      rechazados,
      hoy: hoyCount,
      tendenciaSemanal
    };
  }

  /**
   * Obtener estadísticas de hemogramas (DH36)
   */
  private async getHemogramaStats(): Promise<ExamTypeStats> {
    const [total, completados, pendientes, enProgreso, rechazados] = await Promise.all([
      this.dymindDh36ResultRepository.count(),
      this.dymindDh36ResultRepository.count({ where: { processingStatus: 'completed' } }),
      this.dymindDh36ResultRepository.count({ where: { processingStatus: 'pending' } }),
      this.dymindDh36ResultRepository.count({ where: { processingStatus: 'processing' } }),
      this.dymindDh36ResultRepository.count({ where: { processingStatus: 'error' } })
    ]);

    // Resultados procesados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyCount = await this.dymindDh36ResultRepository
      .createQueryBuilder('dymindDh36Result')
      .where('dymindDh36Result.createdAt >= :fecha', { fecha: hoy })
      .getCount();

    // Tendencia semanal (últimos 7 días)
    const tendenciaSemanal = await this.getTendenciaSemanal('dymind_dh36_results');

    return {
      total,
      completados,
      pendientes,
      enProgreso,
      rechazados,
      hoy: hoyCount,
      tendenciaSemanal
    };
  }

  /**
   * Obtener estadísticas de exámenes coprológicos (heces)
   */
  private async getHecesStats(): Promise<ExamTypeStats> {
    const [total, completados, pendientes, enProgreso, rechazados] = await Promise.all([
      this.stoolTestRepository.count(),
      this.stoolTestRepository.count({ where: { status: 'completed' } }),
      this.stoolTestRepository.count({ where: { status: 'pending' } }),
      this.stoolTestRepository.count({ where: { status: 'reviewed' } }),
      this.stoolTestRepository.count({ where: { status: 'rejected' } })
    ]);

    // Exámenes realizados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyCount = await this.stoolTestRepository
      .createQueryBuilder('stoolTest')
      .where('stoolTest.createdAt >= :fecha', { fecha: hoy })
      .getCount();

    // Tendencia semanal (últimos 7 días)
    const tendenciaSemanal = await this.getTendenciaSemanal('stool_tests');

    return {
      total,
      completados,
      pendientes,
      enProgreso: enProgreso,
      rechazados,
      hoy: hoyCount,
      tendenciaSemanal
    };
  }

  /**
   * Obtener tendencia semanal para una tabla específica
   */
  private async getTendenciaSemanal(tableName: string): Promise<number[]> {
    const tendencia: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);

      const fechaSiguiente = new Date(fecha);
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

      try {
        let count = 0;
        
        if (tableName === 'urine_tests') {
          count = await this.urineTestRepository
            .createQueryBuilder('urineTest')
            .where('urineTest.createdAt >= :fecha AND urineTest.createdAt < :fechaSiguiente', {
              fecha,
              fechaSiguiente
            })
            .getCount();
        } else if (tableName === 'ichroma_results') {
          count = await this.iChromaResultRepository
            .createQueryBuilder('iChromaResult')
            .where('iChromaResult.createdAt >= :fecha AND iChromaResult.createdAt < :fechaSiguiente', {
              fecha,
              fechaSiguiente
            })
            .getCount();
        } else if (tableName === 'stool_tests') {
          count = await this.stoolTestRepository
            .createQueryBuilder('stoolTest')
            .where('stoolTest.createdAt >= :fecha AND stoolTest.createdAt < :fechaSiguiente', {
              fecha,
              fechaSiguiente
            })
            .getCount();
        } else if (tableName === 'dymind_dh36_results') {
          count = await this.dymindDh36ResultRepository
            .createQueryBuilder('dymindDh36Result')
            .where('dymindDh36Result.createdAt >= :fecha AND dymindDh36Result.createdAt < :fechaSiguiente', {
              fecha,
              fechaSiguiente
            })
            .getCount();
        }

        tendencia.push(count);
      } catch (error) {
        tendencia.push(0);
      }
    }

    return tendencia;
  }

  /**
   * Obtener estado del sistema
   */
  private async getSystemHealth(): Promise<SystemHealthDto> {
    const alertas: string[] = [];
    let estado: 'healthy' | 'warning' | 'error' = 'healthy';

    // Verificar conexiones de equipos (simulado)
    const equiposConectados = 3; // iChroma II + DH36 + otros

    // Verificar último procesamiento
    const ultimoIChroma = await this.iChromaResultRepository
      .createQueryBuilder('iChromaResult')
      .orderBy('iChromaResult.createdAt', 'DESC')
      .limit(1)
      .getOne();

    const ultimoProcesamientoAutomatico = ultimoIChroma?.createdAt || new Date();

    // Generar alertas basadas en el estado
    const tiempoUltimoProcessamiento = Date.now() - ultimoProcesamientoAutomatico.getTime();
    if (tiempoUltimoProcessamiento > 2 * 60 * 60 * 1000) { // Más de 2 horas
      alertas.push('No se han procesado resultados automáticos en las últimas 2 horas');
      estado = 'warning';
    }

    // Verificar muestras rechazadas recientes
    const hace24horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const muestrasRechazadasHoy = await this.urineTestRepository
      .createQueryBuilder('urineTest')
      .where('urineTest.status = :status', { status: 'rejected' })
      .andWhere('urineTest.createdAt >= :fecha', { fecha: hace24horas })
      .getCount();

    if (muestrasRechazadasHoy > 10) {
      alertas.push(`Alto número de muestras rechazadas hoy: ${muestrasRechazadasHoy}`);
      estado = estado === 'healthy' ? 'warning' : estado;
    }

    return {
      estado,
      equiposConectados,
      ultimoProcesamientoAutomatico: ultimoProcesamientoAutomatico.toISOString(),
      alertas
    };
  }

  /**
   * Obtener estadísticas específicas de un tipo de examen
   */
  async getExamTypeSpecificStats(examType: 'hemogramas' | 'ichroma' | 'orina' | 'heces'): Promise<ExamTypeStats> {
    switch (examType) {
      case 'hemogramas':
        return this.getHemogramaStats();
      case 'ichroma':
        return this.getIChromaStats();
      case 'orina':
        return this.getUrineTestStats();
      case 'heces':
        return this.getHecesStats();
      default:
        throw new Error(`Tipo de examen no soportado: ${examType}`);
    }
  }

  /**
   * Obtener resumen rápido para notificaciones
   */
  async getQuickSummary(): Promise<{
    totalPendientes: number;
    alertasCriticas: number;
    equiposOffline: number;
  }> {
    const [urineStats, iChromaStats, systemHealth] = await Promise.all([
      this.getUrineTestStats(),
      this.getIChromaStats(),
      this.getSystemHealth()
    ]);

    return {
      totalPendientes: urineStats.pendientes + urineStats.enProgreso + iChromaStats.pendientes + iChromaStats.enProgreso,
      alertasCriticas: systemHealth.alertas.length,
      equiposOffline: 3 - systemHealth.equiposConectados
    };
  }

  /**
   * Obtener cards del dashboard - Formato simplificado para el frontend
   */
  async getDashboardCards(): Promise<any[]> {
    const [
      patientStats,
      doctorStats,
      urineStats,
      iChromaStats,
      stoolStats,
      hemogramaStats
    ] = await Promise.all([
      this.getPatientStats(),
      this.getDoctorStats(),
      this.getUrineTestStats(),
      this.getIChromaStats(),
      this.getStoolTestStats(),
      this.getHemogramaStats()
    ]);

    const cards = [
      {
        name: 'Médicos',
        value: doctorStats.totalActivos,
        icon: 'fa-stethoscope',
        color: 'primary',
        description: 'Profesionales activos',
        trend: doctorStats.totalActivos > 0 ? 'stable' : 'down'
      },
      {
        name: 'Pacientes',
        value: patientStats.totalActivos,
        icon: 'fa-users',
        color: 'success',
        description: 'Pacientes registrados',
        trend: patientStats.nuevosHoy > 0 ? 'up' : 'stable'
      },
      {
        name: 'Nuevos Hoy',
        value: patientStats.nuevosHoy,
        icon: 'fa-user-plus',
        color: 'info',
        description: 'Pacientes nuevos hoy',
        trend: 'stable'
      },
      {
        name: 'Exámenes Orina',
        value: urineStats.total,
        icon: 'fa-flask',
        color: 'warning',
        description: `${urineStats.completados} completados`,
        trend: urineStats.completados > urineStats.pendientes ? 'up' : 'down',
        trendPercent: urineStats.total > 0 ? Math.round((urineStats.completados / urineStats.total) * 100) : 0
      },
      {
        name: 'Exámenes Heces',
        value: stoolStats.total,
        icon: 'fa-vial',
        color: 'warning',
        description: `${stoolStats.completados} completados`,
        trend: stoolStats.completados > stoolStats.pendientes ? 'up' : 'down',
        trendPercent: stoolStats.total > 0 ? Math.round((stoolStats.completados / stoolStats.total) * 100) : 0
      },
      {
        name: 'iChroma II',
        value: iChromaStats.total,
        icon: 'fa-microscope',
        color: 'secondary',
        description: `${iChromaStats.completados} procesados`,
        trend: iChromaStats.completados > iChromaStats.pendientes ? 'up' : 'down',
        trendPercent: iChromaStats.total > 0 ? Math.round((iChromaStats.completados / iChromaStats.total) * 100) : 0
      },
      {
        name: 'Hemogramas',
        value: hemogramaStats.total,
        icon: 'fa-droplet',
        color: 'danger',
        description: `${hemogramaStats.completados} completados`,
        trend: hemogramaStats.completados > hemogramaStats.pendientes ? 'up' : 'down',
        trendPercent: hemogramaStats.total > 0 ? Math.round((hemogramaStats.completados / hemogramaStats.total) * 100) : 0
      },
      {
        name: 'Pendientes',
        value: urineStats.pendientes + stoolStats.pendientes + iChromaStats.pendientes + hemogramaStats.pendientes,
        icon: 'fa-hourglass-end',
        color: 'warning',
        description: 'Exámenes en espera',
        trend: urineStats.pendientes + stoolStats.pendientes + iChromaStats.pendientes + hemogramaStats.pendientes > 10 ? 'down' : 'up'
      }
    ];

    return cards;
  }
}
