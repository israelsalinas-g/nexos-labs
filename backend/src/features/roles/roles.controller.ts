import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, CreatePermissionDto } from '../../dto/role.dto';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('SUPERADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo rol',
    description: 'Crea un nuevo rol del sistema. Solo SUPERADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: Role,
  })
  @ApiResponse({
    status: 403,
    description: 'Solo SUPERADMIN puede crear roles',
  })
  @ApiResponse({
    status: 409,
    description: 'El rol ya existe',
  })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Role> {
    return await this.rolesService.create(createRoleDto, currentUser);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Listar todos los roles',
    description: 'Obtiene una lista paginada de todos los roles',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles',
    type: Role,
    isArray: true,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.rolesService.findAll(page, limit);
  }

  @Get(':id/permissions')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener permisos de un rol',
    description: 'Lista todos los permisos asociados a un rol',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos del rol',
    type: Permission,
    isArray: true,
  })
  async getPermissions(@Param('id', new ParseUUIDPipe()) id: string): Promise<Permission[]> {
    return await this.rolesService.getPermissions(id);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Obtiene los detalles de un rol específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del rol',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Role> {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza los datos de un rol. Solo SUPERADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo SUPERADMIN puede actualizar roles',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Role> {
    return await this.rolesService.update(id, updateRoleDto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar rol',
    description: 'Elimina un rol del sistema. Solo SUPERADMIN. No se pueden eliminar roles predefinidos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado',
    schema: { properties: { message: { type: 'string' } } },
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar rol predefinido',
  })
  @ApiResponse({
    status: 409,
    description: 'Hay usuarios asociados a este rol',
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<{ message: string }> {
    return await this.rolesService.remove(id, currentUser);
  }

  @Post(':id/permissions')
  @Roles('SUPERADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar permiso a un rol',
    description: 'Crea un nuevo permiso para un rol. Solo SUPERADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Permiso agregado',
    type: Permission,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El permiso ya existe',
  })
  async addPermission(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Permission> {
    return await this.rolesService.addPermission(id, createPermissionDto, currentUser);
  }

  @Delete(':id/permissions/:permissionId')
  @Roles('SUPERADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remover permiso de un rol',
    description: 'Elimina un permiso de un rol. Solo SUPERADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'ID del permiso',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso removido',
    schema: { properties: { message: { type: 'string' } } },
  })
  @ApiResponse({
    status: 404,
    description: 'Rol o permiso no encontrado',
  })
  async removePermission(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('permissionId', new ParseUUIDPipe()) permissionId: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<{ message: string }> {
    return await this.rolesService.removePermission(id, permissionId, currentUser);
  }
}
