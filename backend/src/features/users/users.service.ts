import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import { PaginationResult } from '../../common/interfaces';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ROLE_LEVELS } from '../../common/enums/role.enum';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private uploadService: UploadService,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto, currentUser?: JwtPayload): Promise<User> {
    this.logger.log(`Creando nuevo usuario: ${createUserDto.username}`);

    // Verificar que el rol existe
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${createUserDto.roleId} no encontrado`);
    }

    // Validar permisos: no se puede asignar un rol de nivel superior o igual al actual
    // Niveles más bajos = más poder (1=SUPERADMIN, 4=OPERADOR)
    if (currentUser && currentUser.roleLevel >= role.level) {
      throw new ForbiddenException(
        'No tienes permiso para asignar este rol. Solo puedes asignar roles de menor jerarquía.',
      );
    }

    // Verificar que el username no existe
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException(
        `El nombre de usuario "${createUserDto.username}" ya está en uso`,
      );
    }

    // Verificar que el email no existe
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException(`El correo "${createUserDto.email}" ya está registrado`);
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Obtener createdBy si existe
    let createdByUser: User | null = null;
    if (currentUser) {
      createdByUser = await this.userRepository.findOne({ where: { id: currentUser.sub } });
    }

    // Crear usuario
    const user = new User();
    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.name = createUserDto.name;
    user.lastName = createUserDto.lastName;
    user.email = createUserDto.email;
    user.role = role;
    user.isActive = createUserDto.isActive ?? true;
    if (createdByUser) {
      user.createdBy = createdByUser;
    }

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`Usuario creado exitosamente: ${savedUser.username}`);

    // No retornar la contraseña
    const { password, ...result } = savedUser;
    return result as User;
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  async findAll(page: number = 1, limit: number = 10): Promise<PaginationResult<User>> {
    this.logger.log(`Obteniendo usuarios - Página: ${page}, Límite: ${limit}`);

    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Obtener un usuario por username
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con nombre "${username}" no encontrado`);
    }

    return user;
  }

  /**
   * Actualizar un usuario
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: JwtPayload,
  ): Promise<User> {
    this.logger.log(`Actualizando usuario: ${id}`);

    const user = await this.findOne(id);

    // Validar que solo SUPERADMIN puede actualizar otros usuarios
    if (currentUser && currentUser.sub !== id && currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo puedes actualizar tu propio perfil');
    }

    // Si se cambia el rol, validar permisos
    if (updateUserDto.roleId && updateUserDto.roleId !== user.role.id) {
      const newRole = await this.roleRepository.findOne({
        where: { id: updateUserDto.roleId },
      });

      if (!newRole) {
        throw new NotFoundException(`Rol con ID ${updateUserDto.roleId} no encontrado`);
      }

      if (currentUser && currentUser.roleLevel >= newRole.level) {
        throw new ForbiddenException(
          'No tienes permiso para asignar este rol',
        );
      }

      user.role = newRole;
    }

    // Verificar email único si cambia
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException(`El correo "${updateUserDto.email}" ya está registrado`);
      }

      user.email = updateUserDto.email;
    }

    // Actualizar campos permitidos
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (typeof updateUserDto.isActive === 'boolean') user.isActive = updateUserDto.isActive;

    // Manejar avatar - validar que exista en la lista disponible
    if (updateUserDto.avatar !== undefined) {
      if (updateUserDto.avatar === null) {
        user.avatar = null;
      } else if (typeof updateUserDto.avatar === 'string') {
        // Validar que el avatar sea válido (existe en directorio)
        if (this.uploadService.validateAvatar(updateUserDto.avatar)) {
          user.avatar = updateUserDto.avatar;
        } else {
          throw new BadRequestException(`Avatar "${updateUserDto.avatar}" no es válido`);
        }
      }
    }

    if (currentUser) {
      const updatedByUser = await this.userRepository.findOne({ where: { id: currentUser.sub } });
      if (updatedByUser) {
        user.updatedBy = updatedByUser;
      }
    }

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`Usuario actualizado: ${id}`);

    return updatedUser;
  }

  /**
   * Activar/Desactivar un usuario
   */
  async toggleActive(id: string, currentUser: JwtPayload): Promise<User> {
    this.logger.log(`Alternando estado activo del usuario: ${id}`);

    const user = await this.findOne(id);

    // Solo ADMIN y superiores pueden desactivar usuarios
    if (currentUser.roleLevel > 2) {
      throw new ForbiddenException('No tienes permiso para cambiar el estado de usuarios');
    }

    user.isActive = !user.isActive;
    const updatedByUser = await this.userRepository.findOne({ where: { id: currentUser.sub } });
    if (updatedByUser) {
      user.updatedBy = updatedByUser;
    }

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`Estado actualizado para usuario: ${id}, isActive: ${updatedUser.isActive}`);

    return updatedUser;
  }

  /**
   * Eliminar un usuario (solo SUPERADMIN)
   */
  async remove(id: string, currentUser: JwtPayload): Promise<{ message: string }> {
    this.logger.log(`Eliminando usuario: ${id}`);

    // Solo SUPERADMIN puede eliminar usuarios
    if (currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo SUPERADMIN puede eliminar usuarios');
    }

    const user = await this.findOne(id);

    await this.userRepository.remove(user);
    this.logger.log(`Usuario eliminado: ${id}`);

    return { message: `Usuario ${user.username} eliminado exitosamente` };
  }

  /**
   * Obtener usuarios por rol
   */
  async findByRole(roleId: string, page: number = 1, limit: number = 10): Promise<PaginationResult<User>> {
    this.logger.log(`Obteniendo usuarios por rol: ${roleId}`);

    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAndCount({
      where: { role: { id: roleId } },
      relations: ['role'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
