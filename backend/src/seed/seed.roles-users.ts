import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RoleEnum, ROLE_LEVELS } from '../common/enums/role.enum';

@Injectable()
export class SeedRolesAndUsers implements OnModuleInit {
  private readonly logger = new Logger(SeedRolesAndUsers.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Solo ejecutar seed si está habilitado en variables de entorno
    const shouldSeed = process.env.SEED_INITIAL_DATA === 'true';
    
    if (!shouldSeed) {
      this.logger.log('Seed deshabilitado. Configure SEED_INITIAL_DATA=true para habilitar.');
      return;
    }

    await this.seedRoles();
    await this.seedSuperAdmin();
  }

  /**
   * Crear roles predefinidos si no existen
   */
  private async seedRoles(): Promise<void> {
    this.logger.log('🌱 Iniciando seed de roles...');

    const rolesToCreate = [
      {
        name: RoleEnum.SUPERADMIN,
        level: ROLE_LEVELS[RoleEnum.SUPERADMIN],
        description: 'Usuario con acceso total al sistema. Puede crear y eliminar usuarios, roles y permisos.',
      },
      {
        name: RoleEnum.ADMIN,
        level: ROLE_LEVELS[RoleEnum.ADMIN],
        description: 'Administrador del laboratorio. Puede gestionar test-definitions, test-sections, perfiles y auditoría.',
      },
      {
        name: RoleEnum.TECNICO,
        level: ROLE_LEVELS[RoleEnum.TECNICO],
        description: 'Técnico de laboratorio. Puede crear y actualizar exámenes, ver resultados y generar reportes.',
      },
      {
        name: RoleEnum.OPERADOR,
        level: ROLE_LEVELS[RoleEnum.OPERADOR],
        description: 'Operador con acceso de solo lectura. Puede consultar exámenes, pacientes y resultados.',
      },
    ];

    for (const roleData of rolesToCreate) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        this.logger.log(`✅ Rol creado: ${roleData.name} (nivel ${roleData.level})`);
      } else {
        this.logger.log(`⏭️  Rol ya existe: ${roleData.name}`);
      }
    }

    this.logger.log('✨ Seed de roles completado');
  }

  /**
   * Crear usuario SUPERADMIN inicial si no existe
   */
  private async seedSuperAdmin(): Promise<void> {
    this.logger.log('🌱 Iniciando seed de usuario SUPERADMIN...');

    // Buscar si ya existe un usuario SUPERADMIN
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: RoleEnum.SUPERADMIN },
    });

    if (!superAdminRole) {
      this.logger.error('❌ No se encontró el rol SUPERADMIN. Ejecute primero el seed de roles.');
      return;
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      this.logger.log('⏭️  Usuario SUPERADMIN ya existe: admin');
      return;
    }

    // Datos del usuario SUPERADMIN inicial
    const adminData = {
      username: 'admin',
      password: await bcrypt.hash('Admin@123', 10), // Contraseña inicial segura
      name: 'Administrador',
      lastName: 'del Sistema',
      email: 'admin@lab.com',
      role: superAdminRole,
      isActive: true,
    };

    const admin = this.userRepository.create(adminData);
    await this.userRepository.save(admin);

    this.logger.log('✅ Usuario SUPERADMIN creado exitosamente');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('📋 CREDENCIALES INICIALES:');
    this.logger.log('   Usuario: admin');
    this.logger.log('   Contraseña: Admin@123');
    this.logger.log('   ⚠️  IMPORTANTE: Cambie esta contraseña después del primer login');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('✨ Seed de usuario SUPERADMIN completado');
  }

  /**
   * Método manual para ejecutar el seed (útil para scripts)
   */
  async executeSeed(): Promise<void> {
    this.logger.log('🚀 Ejecutando seed manual de roles y usuarios...');
    await this.seedRoles();
    await this.seedSuperAdmin();
    this.logger.log('✅ Seed manual completado exitosamente');
  }
}
