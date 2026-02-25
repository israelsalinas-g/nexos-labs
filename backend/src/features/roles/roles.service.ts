import {
  Injectable, ConflictException, ForbiddenException,
  Logger, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto, CreatePermissionDto } from '../../dto/role.dto';
import { PaginationResult } from '../../common/interfaces';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RoleEnum } from '../../common/enums/role.enum';
import { BaseService } from '../../common/bases/base.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class RolesService extends BaseService<Role> {
  protected readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {
    super(roleRepository);
  }

  async create(createRoleDto: CreateRoleDto, currentUser: JwtPayload): Promise<Role> {
    if (currentUser.roleLevel > 1) throw new ForbiddenException('Solo SUPERADMIN puede crear roles');

    const existing = await this.roleRepository.findOne({ where: { name: createRoleDto.name } });
    if (existing) throw new ConflictException(`El rol "${createRoleDto.name}" ya existe`);

    if (createRoleDto.level < 1 || createRoleDto.level > 4) {
      throw new BadRequestException('El nivel del rol debe estar entre 1 y 4');
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(page = 1, limit = 10): Promise<PaginationResult<Role>> {
    return super.findAll(page, limit, { relations: ['permissions'], order: { level: 'ASC' } });
  }

  async findOne(id: string): Promise<Role> {
    return super.findOne(id, { relations: ['permissions', 'users'] });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, currentUser: JwtPayload): Promise<Role> {
    if (currentUser.roleLevel > 1) throw new ForbiddenException('Solo SUPERADMIN puede actualizar roles');

    const role = await this.findOne(id);
    if (updateRoleDto.description) role.description = updateRoleDto.description;
    return await this.roleRepository.save(role);
  }

  async remove(id: string, currentUser: JwtPayload): Promise<{ message: string }> {
    if (currentUser.roleLevel > 1) throw new ForbiddenException('Solo SUPERADMIN puede eliminar roles');

    const role = await this.findOne(id);

    if (Object.values(RoleEnum).includes(role.name as RoleEnum)) {
      throw new BadRequestException(`No se puede eliminar el rol predefinido "${role.name}"`);
    }
    if (role.users?.length > 0) {
      throw new ConflictException(`No se puede eliminar el rol: ${role.users.length} usuario(s) lo utilizan`);
    }

    await this.roleRepository.remove(role);
    return { message: `Rol ${role.name} eliminado exitosamente` };
  }

  async getPermissions(roleId: string): Promise<Permission[]> {
    const role = await this.findOne(roleId);
    return role.permissions || [];
  }

  async addPermission(roleId: string, dto: CreatePermissionDto, currentUser: JwtPayload): Promise<Permission> {
    if (currentUser.roleLevel > 1) throw new ForbiddenException('Solo SUPERADMIN puede agregar permisos');

    const role = await this.findOne(roleId);
    const existing = await this.permissionRepository.findOne({ where: { code: dto.code, role: { id: roleId } } });
    if (existing) throw new ConflictException(`El permiso "${dto.code}" ya existe para este rol`);

    const permission = this.permissionRepository.create({ ...dto, role });
    return await this.permissionRepository.save(permission);
  }

  async removePermission(roleId: string, permissionId: string, currentUser: JwtPayload): Promise<{ message: string }> {
    if (currentUser.roleLevel > 1) throw new ForbiddenException('Solo SUPERADMIN puede remover permisos');

    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
    if (!permission) throw new NotFoundException(`Permiso con ID ${permissionId} no encontrado`);

    await this.permissionRepository.remove(permission);
    return { message: 'Permiso removido exitosamente' };
  }
}
