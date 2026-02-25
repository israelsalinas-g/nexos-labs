import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';
import { DymindDh36ResultsService } from '../../features/dymind-dh36-results/dymind-dh36-results.service';

@Injectable()
export class LisServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LisServerService.name);
  private server: net.Server;
  private readonly port: number;

  constructor(
    private configService: ConfigService,
    private dymindDh36ResultsService: DymindDh36ResultsService,
  ) {
    this.port = this.configService.get<number>('LIS_PORT', 5600);
  }

  onModuleInit() {
    this.logger.log('╔════════════════════════════════════════╗');
    this.logger.log('║    INICIALIZANDO LIS SERVER (DYMIND)   ║');
    this.logger.log('╚════════════════════════════════════════╝');
    this.logger.log(`Puerto configurado: ${this.port}`);
    this.startServer();
  }

  onModuleDestroy() {
    if (this.server) {
      this.server.close(() => {
        this.logger.log('LIS Server stopped');
      });
    }
  }

  private startServer() {
    this.server = net.createServer((socket) => {
      const ipv4Address = socket.remoteAddress?.replace(/^::ffff:/, '') || 'unknown';
      this.logger.log('╔═══════════════════════════════════════════════════╗');
      this.logger.log('║         ✅ NUEVA CONEXIÓN ENTRANTE                  ║');
      this.logger.log('╚═══════════════════════════════════════════════════╝');
      this.logger.log(`📍 IP: ${ipv4Address}:${socket.remotePort}`);
      
      socket.setEncoding('utf8');
      
      let buffer = '';
      let messageTimer: NodeJS.Timeout | null = null;

      socket.on('data', (data: string) => {
        this.logger.log(`\n📨 DATOS RECIBIDOS - ${ipv4Address}:${socket.remotePort}`);
        this.logger.log(`📏 Tamaño: ${data.length} bytes`);
        this.logger.debug(`Contenido:\n${data}`);
        
        // Agregar los datos al buffer
        buffer += data;
        this.logger.log(`📦 Buffer actual: ${buffer.length} bytes acumulados`);
        
        // Reiniciar el timer cada vez que llegan datos
        if (messageTimer) {
          clearTimeout(messageTimer);
        }
        
        // Esperar 500ms después de recibir datos antes de procesarlos
        messageTimer = setTimeout(() => {
          this.logger.log('\n⏱️ TIMEOUT - Procesando buffer...');
          this.processMessage(buffer, socket);
          buffer = '';
        }, 500);
      });

      socket.on('end', () => {
        this.logger.log(`\n👋 Conexión finalizada: ${ipv4Address}:${socket.remotePort}`);
        if (messageTimer) {
          clearTimeout(messageTimer);
        }
      });

      socket.on('error', (error) => {
        this.logger.error(`\n⚠️ ERROR DE SOCKET: ${error.message}`);
        if (messageTimer) {
          clearTimeout(messageTimer);
        }
      });
    });

    this.server.listen(this.port, '0.0.0.0', () => {
      this.logger.log('╔═══════════════════════════════════════════════════╗');
      this.logger.log('║         🎯 LIS SERVER ESCUCHANDO                   ║');
      this.logger.log('╚═══════════════════════════════════════════════════╝');
      this.logger.log(`🔌 Interfaz: 0.0.0.0`);
      this.logger.log(`🔌 Puerto: ${this.port}`);
      this.logger.log(`🔌 Protocolo: TCP`);
      this.logger.log(`⚡ Estado: ACTIVO`);
    });

    this.server.on('error', (error) => {
      this.logger.error(`\n❌ ERROR EN SERVIDOR: ${error.message}`);
    });

    this.server.on('listening', () => {
      this.logger.log(`\n✅ Servidor escuchando en puerto ${this.port}`);
    });
  }

  private async processMessage(message: string, socket: net.Socket) {
    try {
      this.logger.log('\n╔═══════════════════════════════════════════════════╗');
      this.logger.log('║        🔄 PROCESANDO MENSAJE HL7                   ║');
      this.logger.log('╚═══════════════════════════════════════════════════╝');
      this.logger.log(`📝 Tamaño del mensaje: ${message.length} bytes`);
      this.logger.debug('Contenido original:\n' + message);

      // Limpiar el mensaje antes de procesarlo
      const cleanMessage = message
        .replace(/MSH\|.*?\n?/g, '')  // Remover cabecera MSH si existe
        .replace(/\r/g, '')           // Remover retornos de carro
        .replace(/\|\|F\|F\|F$/g, '') // Remover caracteres extra al final
        .replace(/OBX\|/g, '\nOBX|')  // Asegurar que OBX esté en nueva línea
        .replace(/OBR\|/g, '\nOBR|')  // Asegurar que OBR esté en nueva línea
        .replace(/\n+/g, '\n')        // Normalizar saltos de línea
        .trim();

      this.logger.debug('Mensaje después de limpieza:\n' + cleanMessage);

      this.logger.log('\n📡 Enviando a servicio de procesamiento...');
      const results = await this.dymindDh36ResultsService.processHL7Data(cleanMessage);
      
      if (results && results.length > 0) {
        this.logger.log('\n╔═══════════════════════════════════════════════════╗');
        this.logger.log('║         ✅ PROCESAMIENTO EXITOSO                   ║');
        this.logger.log('╚═══════════════════════════════════════════════════╝');
        this.logger.log(`📊 Muestras procesadas: ${results.length}`);
        results.forEach((result, index) => {
          this.logger.log(`\n  Muestra ${index + 1}:`);
          this.logger.log(`    ✓ ID: ${result.id}`);
          this.logger.log(`    ✓ Número: ${result.sampleNumber}`);
          this.logger.log(`    ✓ Parámetros: ${result.parameters?.length || 0}`);
          this.logger.log(`    ✓ Paciente (Dymind): ${result.patientNameDymind || 'No disponible'}`);
        });
        
        // Enviar ACK
        socket.write('MSH|^~\\&|||||||ACK^R01|1|P|2.3.1||||\nMSA|AA|1|Mensaje procesado correctamente\n');
      } else {
        this.logger.error('\n❌ No se procesaron resultados');
        // Enviar NACK
        socket.write('MSH|^~\\&|||||||ACK^R01|1|P|2.3.1||||\nMSA|AE|1|Error procesando el mensaje\n');
      }
    } catch (error) {
      this.logger.error('\n╔═══════════════════════════════════════════════════╗');
      this.logger.error('║         ❌ ERROR EN PROCESAMIENTO                   ║');
      this.logger.error('╚═══════════════════════════════════════════════════╝');
      this.logger.error(`Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      // Enviar NACK
      socket.write('MSH|^~\\&|||||||ACK^R01|1|P|2.3.1||||\nMSA|AE|1|Error procesando el mensaje\n');
    }
  }

  getServerStatus() {
    const status = {
      isRunning: !!this.server?.listening,
      port: this.port,
      connections: this.server?.connections || 0,
      startTime: this.server?.listening ? new Date() : null
    };

    return {
      success: true,
      message: 'LIS Server status retrieved successfully',
      data: status
    };
  }
}
