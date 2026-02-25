import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, RefreshTokenDto, ChangePasswordDto } from '../../dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuario',
    description: 'Autentica un usuario y retorna un JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario o contraseña incorrectos',
  })
  async login(@Body() loginDto: LoginDto): Promise<{
    accessToken: string;
    user: any;
  }> {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar JWT',
    description: 'Genera un nuevo JWT usando uno existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado',
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
  }> {
    return await this.authService.refreshToken(refreshTokenDto.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuario actual',
    description: 'Retorna la información del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getCurrentUser(@CurrentUser() user: JwtPayload): Promise<JwtPayload> {
    return user;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Permite a un usuario cambiar su contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
    schema: { properties: { message: { type: 'string' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.changePassword(user.sub, changePasswordDto);
  }
}
