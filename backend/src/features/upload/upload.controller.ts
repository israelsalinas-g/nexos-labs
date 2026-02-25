import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UploadService } from './upload.service';

/**
 * DEPRECATED: Mantener solo para compatibilidad con archivos estáticos
 * Los endpoints de avatares se han movido a UsersController:
 * - GET /users/avatars/available (antes GET /avatars/available)
 * - POST /users/:id/avatar (cambio de avatar)
 * 
 * Este controlador ahora solo sirve archivos estáticos de avatar
 */
@Controller('avatars')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * DEPRECATED: Usar GET /users/avatars/available
   * Obtiene lista de avatares disponibles
   * GET /avatars/available
   * 
   * @deprecated Moved to GET /users/avatars/available
   */
  @Get('available')
  @ApiOperation({ 
    summary: '[DEPRECATED] Obtener avatares disponibles',
    description: 'DEPRECATED: Use GET /users/avatars/available instead. Retorna lista de imágenes de avatar disponibles para que los usuarios seleccionen',
    deprecated: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de avatares disponibles',
    schema: {
      example: {
        available: ['default.png', 'avatar-01.png', 'avatar-02.png', 'avatar-03.jpg'],
        default: 'default.png',
        total: 4
      }
    }
  })
  getAvailableAvatars() {
    const available = this.uploadService.getAvailableAvatars();
    const defaultAvatar = this.uploadService.getDefaultAvatar();
    
    return {
      available,
      default: defaultAvatar,
      total: available.length,
      baseUrl: '/avatars',
      deprecated: 'Use GET /users/avatars/available instead'
    };
  }

  /**
   * Descarga un avatar específico (Archivo estático)
   * GET /avatars/:name
   */
  @Get(':name')
  @ApiOperation({ 
    summary: 'Obtener archivo de avatar (Static File)',
    description: 'Descarga una imagen de avatar específica. Los archivos están servidos como recursos estáticos.'
  })
  @ApiParam({ name: 'name', description: 'Nombre del archivo de avatar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo de imagen',
    content: {
      'image/png': {},
      'image/jpeg': {},
      'image/gif': {},
      'image/webp': {}
    }
  })
  @ApiResponse({ status: 404, description: 'Avatar no encontrado' })
  getAvatar(@Param('name') name: string) {
    // Validar que sea un nombre válido
    if (!this.uploadService.validateAvatar(name)) {
      return { redirect: `/avatars/${this.uploadService.getDefaultAvatar()}` };
    }

    return { file: name };
  }
}

