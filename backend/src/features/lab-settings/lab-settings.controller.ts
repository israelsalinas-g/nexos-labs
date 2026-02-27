import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { LabSettingsService } from './lab-settings.service';
import { LabSetting } from '../../entities/lab-setting.entity';

class UpdateSettingDto {
  @IsString() key: string;
  @IsString() @IsOptional() value?: string;
}

class BulkUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingDto)
  updates: UpdateSettingDto[];
}

@ApiTags('Lab Settings')
@Controller('lab-settings')
export class LabSettingsController {
  constructor(private readonly service: LabSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los settings del laboratorio (público)' })
  @ApiResponse({ status: 200, type: [LabSetting] })
  getAll(): Promise<LabSetting[]> {
    return this.service.getAll();
  }

  @Get('map')
  @ApiOperation({ summary: 'Obtener settings como mapa clave-valor' })
  getAsMap(): Promise<Record<string, string>> {
    return this.service.getAsMap();
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Estado de integraciones externas (sin exponer credenciales)' })
  getIntegrations(): { smtp: boolean; twilio: boolean } {
    return this.service.getIntegrationStatus();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obtener setting individual por clave' })
  getByKey(@Param('key') key: string): Promise<string | null> {
    return this.service.getByKey(key);
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar múltiples settings (requiere SUPERADMIN)' })
  @ApiResponse({ status: 200, type: [LabSetting] })
  bulkUpdate(@Body() dto: BulkUpdateDto): Promise<LabSetting[]> {
    return this.service.bulkUpdate(dto.updates);
  }
}
