import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import { PaginationResult } from '../../common/interfaces';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { BaseService } from '../../common/bases/base.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UsersService extends BaseService<User> {
  protected readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private uploadService: UploadService,
  ) {
    super(userRepository);
  }

  async create(createUserDto: CreateUserDto, currentUser?: JwtPayload): Promise<User> {
    this.logger.log(`Creando nuevo usuario: ${createUserDto.username}`);

    const role = await this.roleRepository.findOne({ where: { id: createUserDto.roleId } });
    if (!role) throw new NotFoundException(`Rol con ID ${createUserDto.roleId} no encontrado`);

    if (currentUser && currentUser.roleLevel >= role.level) {
      throw new ForbiddenException('No tienes permiso para asignar este rol');
    }

    await this.validateUserUniqueness(createUserDto.username, createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
      isActive: createUserDto.isActive ?? true,
    });

    if (currentUser) {
      const creator = await this.userRepository.findOne({ where: { id: currentUser.sub } });
      if (creator) user.createdBy = creator;
    }

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result as User;
  }

  async findAll(page = 1, limit = 10): Promise<PaginationResult<User>> {
    return super.findAll(page, limit, { relations: ['role'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    return super.findOne(id, { relations: ['role'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: JwtPayload): Promise<User> {
    this.logger.log(`Actualizando usuario: ${id}`);

    const user = await this.findOne(id);

    if (currentUser && currentUser.sub !== id && currentUser.roleLevel > 1) {
      throw new ForbiddenException('Solo puedes actualizar tu propio perfil');
    }

    if (updateUserDto.roleId && updateUserDto.roleId !== user.role.id) {
      const newRole = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
      if (!newRole) throw new NotFoundException(`Rol con ID ${updateUserDto.roleId} no encontrado`);
      if (currentUser && currentUser.roleLevel >= newRole.level) {
        throw new ForbiddenException('No tienes permiso para asignar este rol');
      }
      user.role = newRole;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
      if (existing) throw new ConflictException(`El correo "${updateUserDto.email}" ya está registrado`);
      user.email = updateUserDto.email;
    }

    if (updateUserDto.avatar !== undefined) {
      if (updateUserDto.avatar === null) {
        user.avatar = null;
      } else if (typeof updateUserDto.avatar === 'string') {
        if (!this.uploadService.validateAvatar(updateUserDto.avatar)) {
          throw new BadRequestException(`Avatar "${updateUserDto.avatar}" no es válido`);
        }
        user.avatar = updateUserDto.avatar;
      }
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (typeof updateUserDto.isActive === 'boolean') user.isActive = updateUserDto.isActive;

    if (currentUser) {
      const updater = await this.userRepository.findOne({ where: { id: currentUser.sub } });
      if (updater) user.updatedBy = updater;
    }

    return await this.userRepository.save(user);
  }

  async toggleActive(id: string, currentUser: JwtPayload): Promise<User> {
    if (currentUser.roleLevel > 2) throw new ForbiddenException('No tienes permiso para cambiar el estado de usuarios');

    const user = await this.findOne(id);
    user.isActive = !user.isActive;

    const updater = await this.userRepository.findOne({ where: { id: currentUser.sub } });
    if (updater) user.updatedBy = updater;

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByRole(roleId: string, page = 1, limit = 10): Promise<PaginationResult<User>> {
    return super.findAll(page, limit, {
      where: { role: { id: roleId } },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  private async validateUserUniqueness(username: string, email: string): Promise<void> {
    const [existingUsername, existingEmail] = await Promise.all([
      this.userRepository.findOne({ where: { username } }),
      this.userRepository.findOne({ where: { email } }),
    ]);
    if (existingUsername) throw new ConflictException(`El nombre de usuario "${username}" ya está en uso`);
    if (existingEmail) throw new ConflictException(`El correo "${email}" ya está registrado`);
  }
}
