import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto, CreatePermissionDto } from '../../dto/role.dto';
import { PaginationResult } from '../../common/interfaces';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ROLE_LEVELS, RoleEnum } from '../../common/enums/role.enum';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Crear un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto, currentUser: JwtPayload): Promise<Role> {
    this.logger.log(`Creando nuevo rol: ${createRoleDto.name}`);

    // Solo SUPERADMIN puede crear roles
    if (currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo SUPERADMIN puede crear roles');
    }

    // Verificar que el rol no existe
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(`El rol "${createRoleDto.name}" ya existe`);
    }

    // Validar que el level sea válido
    if (createRoleDto.level < 1 || createRoleDto.level > 4) {
      throw new BadRequestException('El nivel del rol debe estar entre 1 y 4');
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);

    this.logger.log(`Rol creado exitosamente: ${savedRole.name}`);
    return savedRole;
  }

  /**
   * Obtener todos los roles con paginación
   */
  async findAll(page: number = 1, limit: number = 10): Promise<PaginationResult<Role>> {
    this.logger.log(`Obteniendo roles - Página: ${page}, Límite: ${limit}`);

    const skip = (page - 1) * limit;
    const [roles, total] = await this.roleRepository.findAndCount({
      skip,
      take: limit,
      relations: ['permissions'],
      order: { level: 'ASC' },
    });

    return {
      data: roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un rol por ID
   */
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  /**
   * Obtener un rol por nombre
   */
  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Rol "${name}" no encontrado`);
    }

    return role;
  }

  /**
   * Actualizar un rol
   */
  async update(id: string, updateRoleDto: UpdateRoleDto, currentUser: JwtPayload): Promise<Role> {
    this.logger.log(`Actualizando rol: ${id}`);

    // Solo SUPERADMIN puede actualizar roles
    if (currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo SUPERADMIN puede actualizar roles');
    }

    const role = await this.findOne(id);

    if (updateRoleDto.description) {
      role.description = updateRoleDto.description;
    }

    const updatedRole = await this.roleRepository.save(role);
    this.logger.log(`Rol actualizado: ${id}`);

    return updatedRole;
  }

  /**
   * Eliminar un rol
   */
  async remove(id: string, currentUser: JwtPayload): Promise<{ message: string }> {
    this.logger.log(`Eliminando rol: ${id}`);

    // Solo SUPERADMIN puede eliminar roles
    if (currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo SUPERADMIN puede eliminar roles');
    }

    const role = await this.findOne(id);

    // No permitir eliminar roles predefinidos
    const predefinedRoles = Object.values(RoleEnum);
    if (predefinedRoles.includes(role.name as RoleEnum)) {
      throw new BadRequestException(
        `No se puede eliminar el rol predefinido "${role.name}"`,
      );
    }

    // Verificar que no haya usuarios con este rol
    if (role.users && role.users.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol porque ${role.users.length} usuario(s) lo utilizan`,
      );
    }

    await this.roleRepository.remove(role);
    this.logger.log(`Rol eliminado: ${id}`);

    return { message: `Rol ${role.name} eliminado exitosamente` };
  }

  /**
   * Obtener permisos de un rol
   */
  async getPermissions(roleId: string): Promise<Permission[]> {
    this.logger.log(`Obteniendo permisos del rol: ${roleId}`);

    const role = await this.findOne(roleId);
    return role.permissions || [];
  }

  /**
   * Agregar permiso a un rol
   */
  async addPermission(
    roleId: string,
    createPermissionDto: CreatePermissionDto,
    currentUser: JwtPayload,
  ): Promise<Permission> {
    this.logger.log(`Agregando permiso al rol: ${roleId}`);

    // Solo SUPERADMIN
    if (currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo SUPERADMIN puede agregar permisos');
    }

    const role = await this.findOne(roleId);

    // Verificar que el permiso no existe
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code, role: { id: roleId } },
    });

    if (existingPermission) {
      throw new ConflictException(
        `El permiso "${createPermissionDto.code}" ya existe para este rol`,
      );
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      role,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    this.logger.log(`Permiso agregado: ${createPermissionDto.code}`);

    return savedPermission;
  }

  /**
   * Remover permiso de un rol
   */
  async removePermission(
    roleId: string,
    permissionId: string,
    currentUser: JwtPayload,
  ): Promise<{ message: string }> {
    this.logger.log(`Removiendo permiso del rol: ${roleId}`);

    // Solo SUPERADMIN
    if (currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo SUPERADMIN puede remover permisos');
    }

    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${permissionId} no encontrado`);
    }

    await this.permissionRepository.remove(permission);
    this.logger.log(`Permiso removido: ${permissionId}`);

    return { message: 'Permiso removido exitosamente' };
  }
}
