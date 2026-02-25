import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto, ChangePasswordDto } from '../../dto/auth.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ROLE_LEVELS } from '../../common/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Autentica un usuario y retorna un JWT
   */
  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    user: any;
  }> {
    this.logger.log(`Intento de login: ${loginDto.username}`);

    // Buscar usuario por username, incluyendo relación de rol
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['role'],
    });

    if (!user) {
      this.logger.warn(`Usuario no encontrado: ${loginDto.username}`);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!user.isActive) {
      this.logger.warn(`Usuario inactivo: ${loginDto.username}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta: ${loginDto.username}`);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generar JWT
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      roleLevel: user.role.level,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Login exitoso: ${loginDto.username}`);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  /**
   * Valida un JWT y retorna la información del usuario
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Refresca un JWT
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.validateToken(token);

      // Verificar que el usuario sigue siendo válido
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }

      // Generar nuevo token
      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        roleLevel: user.role.level,
      };

      const accessToken = this.jwtService.sign(newPayload);
      this.logger.log(`Token refrescado para usuario: ${user.username}`);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('No se pudo refrescar el token');
    }
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
    this.logger.log(`Contraseña actualizada para usuario: ${user.username}`);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
