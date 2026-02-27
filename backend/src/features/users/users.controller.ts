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
  BadRequestException,
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
import { UsersService } from './users.service';
import { UploadService } from '../upload/upload.service';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) { }

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description: 'Crea un nuevo usuario del sistema. Solo ADMIN y SUPERADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Permisos insuficientes',
  })
  @ApiResponse({
    status: 409,
    description: 'Username o email ya existe',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<User> {
    return await this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description: 'Obtiene una lista paginada de todos los usuarios. Solo ADMIN y SUPERADMIN.',
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
    description: 'Lista de usuarios',
    type: User,
    isArray: true,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene los detalles de un usuario específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos de un usuario. ADMIN/SUPERADMIN puede modificar a otros. Usuarios normales solo el suyo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para actualizar este usuario',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto, currentUser);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN', 'SUPERADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar/Desactivar usuario',
    description: 'Cambia el estado activo de un usuario. Solo ADMIN y SUPERADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del usuario actualizado',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async toggleActive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<User> {
    return await this.usersService.toggleActive(id, currentUser);
  }

  @Post(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seleccionar avatar de usuario',
    description: 'Permite que un usuario seleccione un avatar de la lista disponible',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar seleccionado exitosamente',
    schema: {
      example: {
        message: 'Avatar selected successfully',
        avatarUrl: '/avatars/avatar-01.png',
        user: {}
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Avatar inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Permisos insuficientes',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async selectAvatar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { avatar: string | null },
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // Validar que el usuario pueda cambiar avatar (debe ser él mismo o ser admin)
    if (currentUser.sub !== id && currentUser.roleLevel > 2) {
      throw new BadRequestException('Solo puedes actualizar tu propio avatar');
    }

    // Validar que el avatar sea válido
    if (body.avatar !== null && !this.uploadService.validateAvatar(body.avatar)) {
      throw new BadRequestException(`Avatar "${body.avatar}" no es válido. Use GET /users/avatars/available para ver opciones`);
    }

    // Actualizar usuario con el avatar seleccionado
    const updateDto: UpdateUserDto = { avatar: body.avatar };
    const updatedUser = await this.usersService.update(id, updateDto, currentUser);

    const avatarUrl = this.uploadService.getAvatarUrl(body.avatar);

    return {
      message: 'Avatar selected successfully',
      avatarUrl,
      user: updatedUser,
    };
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema. Solo SUPERADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado',
    schema: { properties: { message: { type: 'string' } } },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return await this.usersService.remove(id);
  }

  @Get('avatars/available')
  @ApiOperation({
    summary: 'Obtener avatares disponibles',
    description: 'Retorna lista de imágenes de avatar disponibles para que los usuarios seleccionen',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de avatares disponibles',
    schema: {
      example: {
        available: ['default.png', 'avatar-01.png', 'avatar-02.png'],
        default: 'default.png',
        total: 3,
        baseUrl: '/avatars',
      },
    },
  })
  getAvailableAvatars() {
    const available = this.uploadService.getAvailableAvatars();
    const defaultAvatar = this.uploadService.getDefaultAvatar();

    return {
      available,
      default: defaultAvatar,
      total: available.length,
      baseUrl: '/avatars',
    };
  }

  @Get('role/:roleId')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener usuarios por rol',
    description: 'Lista todos los usuarios que tienen un rol específico',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID del rol',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuarios con el rol especificado',
    type: User,
    isArray: true,
  })
  async findByRole(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.usersService.findByRole(roleId, page, limit);
  }
}
