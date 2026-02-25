import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly avatarDir = 'public/avatars';
  private readonly defaultAvatar = 'default.png';
  
  /**
   * Obtiene la lista de avatares disponibles
   * @returns Array con nombres de archivos disponibles
   */
  getAvailableAvatars(): string[] {
    try {
      const fullPath = join(process.cwd(), this.avatarDir);
      
      if (!existsSync(fullPath)) {
        return [this.defaultAvatar];
      }

      const files = readdirSync(fullPath).filter(file => {
        // Filtrar solo archivos de imagen
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
        return imageExtensions.includes(ext);
      });

      return files.length > 0 ? files : [this.defaultAvatar];
    } catch (error) {
      console.error('Error reading avatar directory:', error);
      return [this.defaultAvatar];
    }
  }

  /**
   * Valida que un avatar exista en el directorio
   * @param avatarName - Nombre del archivo
   * @returns true si existe
   */
  validateAvatar(avatarName: string): boolean {
    if (!avatarName) {
      return true; // null es válido (usa default)
    }

    // Validar que no intenten acceder a directorios
    if (avatarName.includes('..') || avatarName.includes('/') || avatarName.includes('\\')) {
      throw new BadRequestException('Avatar name inválido');
    }

    const availableAvatars = this.getAvailableAvatars();
    return availableAvatars.includes(avatarName);
  }

  /**
   * Obtiene la ruta del avatar
   * @param avatarName - Nombre del archivo (null para default)
   * @returns Ruta HTTP del avatar
   */
  getAvatarUrl(avatarName: string | null): string {
    if (!avatarName) {
      return `/avatars/${this.defaultAvatar}`;
    }

    if (!this.validateAvatar(avatarName)) {
      return `/avatars/${this.defaultAvatar}`;
    }

    return `/avatars/${avatarName}`;
  }

  /**
   * Obtiene el nombre del avatar por defecto
   */
  getDefaultAvatar(): string {
    return this.defaultAvatar;
  }
}

