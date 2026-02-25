import { Injectable } from '@nestjs/common';
import { DoctorsService } from '../features/doctors/doctors.service';

@Injectable()
export class SeedService {
  constructor(private readonly doctorsService: DoctorsService) {}

  async seedDoctors() {
    const doctors = [
      {
        firstName: 'Carlos Alberto',
        lastName: 'Martínez López',
        specialty: 'Medicina Interna',
        licenseNumber: 'CMH-4521',
        phone: '+50499123456',
        email: 'dr.martinez@clinica.com',
        address: 'Consultorio 301, Edificio Médico Plaza',
        institution: 'Hospital del Valle',
        isStaff: true,
        isActive: true,
        notes: 'Médico internista del staff con amplia experiencia en enfermedades metabólicas'
      },
      {
        firstName: 'María José',
        lastName: 'Sánchez Reyes',
        specialty: 'Ginecología y Obstetricia',
        licenseNumber: 'CMH-5632',
        phone: '+50498567432',
        email: 'dra.sanchez@clinica.com',
        address: 'Consultorio 205, Torre Médica Central',
        institution: 'Hospital Viera',
        isStaff: true,
        isActive: true,
        notes: 'Especialista en ginecología con subespecialidad en infertilidad'
      },
      {
        firstName: 'Juan Diego',
        lastName: 'Ramírez Castro',
        specialty: 'Pediatría',
        licenseNumber: 'CMH-3245',
        phone: '+50496789012',
        email: 'dr.ramirez@gmail.com',
        address: 'Clínica Pediátrica Ramírez, Col. Palmira',
        institution: 'Hospital Escuela',
        isStaff: false,
        isActive: true,
        notes: 'Pediatra con especialidad en neurodesarrollo infantil'
      },
      {
        firstName: 'Ana Patricia',
        lastName: 'González Mejía',
        specialty: 'Dermatología',
        licenseNumber: 'CMH-7890',
        phone: '+50495432167',
        email: 'dra.gonzalez@dermacenter.hn',
        address: 'DermaCenter, Mall Multiplaza',
        institution: 'Clínica DermaCenter',
        isStaff: false,
        isActive: true,
        notes: 'Especialista en dermatología clínica y estética'
      },
      {
        firstName: 'Roberto José',
        lastName: 'Mendoza Flores',
        specialty: 'Cardiología',
        licenseNumber: 'CMH-6543',
        phone: '+50497654321',
        email: 'dr.mendoza@clinica.com',
        address: 'Consultorio 401, Edificio Médico Plaza',
        institution: 'Instituto Cardiopulmonar',
        isStaff: true,
        isActive: true,
        notes: 'Cardiólogo intervencionista con especialidad en arritmias'
      }
    ];

    for (const doctor of doctors) {
      try {
        await this.doctorsService.create(doctor);
        console.log(`Doctor ${doctor.firstName} ${doctor.lastName} creado exitosamente`);
      } catch (error) {
        console.error(`Error al crear doctor ${doctor.firstName} ${doctor.lastName}:`, error.message);
      }
    }
  }
}

// Uso:
// const seedService = new SeedService(doctorsService);
// await seedService.seedDoctors();