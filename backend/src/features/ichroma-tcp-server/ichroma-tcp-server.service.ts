import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as net from 'net';
import { IChromaResultsService } from '../ichroma-results/ichroma-results.service';

@Injectable()
export class IChromaTcpServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IChromaTcpServerService.name);
  private server: net.Server;
  private readonly port = 5001;

  constructor(
    private readonly ichromaResultsService: IChromaResultsService,
  ) {}

  onModuleInit() {
    this.startTcpServer();
  }

  onModuleDestroy() {
    if (this.server) {
      return new Promise<void>((resolve) => {
        this.server.close(() => {
          this.logger.log('🔌 Servidor TCP iChroma II detenido correctamente');
          resolve();
        });
      });
    }
  }

  private startTcpServer() {
    // Log antes de crear el servidor
    this.logger.log('⚡ Iniciando creación del servidor TCP iChroma...');
    
    this.server = net.createServer((socket) => {
      this.logger.log(`🔗 Cliente iChroma conectado desde ${socket.remoteAddress}:${socket.remotePort}`);
      
      // Log de la conexión establecida
      this.logger.log(`📡 Nueva conexión TCP establecida - Detalles de Socket:
        Local Address: ${socket.localAddress}:${socket.localPort}
        Remote Address: ${socket.remoteAddress}:${socket.remotePort}
      `);

      // Configurar el encoding del socket
      socket.setEncoding('utf8');
      
      // Log del estado inicial del socket
      this.logger.log(`📊 Estado inicial del socket:
        Encoding: ${socket.readableEncoding}
        Readable: ${socket.readable}
        Writable: ${socket.writable}
      `);

      socket.on('data', async (data) => {
        try {
          const rawMessage = data.toString();
          this.logger.log(`📥 Datos recibidos del iChroma II (${data.length} bytes): ${rawMessage}`);

          // Procesar los datos recibidos
          await this.processIChromaMessage(rawMessage);

          // Enviar ACK de confirmación
          const ack = '\x06'; // ACK character
          socket.write(ack);
          this.logger.log(`✅ ACK enviado al iChroma II`);

        } catch (error) {
          this.logger.error(`❌ Error procesando datos iChroma: ${error.message}`);
          
          // Enviar NACK en caso de error
          const nack = '\x15'; // NACK character
          socket.write(nack);
        }
      });

      socket.on('error', (error) => {
        this.logger.error(`❌ Error en conexión iChroma: ${error.message}`);
      });

      socket.on('close', () => {
        this.logger.log(`🔌 Cliente iChroma desconectado`);
      });

      socket.on('timeout', () => {
        this.logger.warn(`⚠️ Socket timeout detectado`);
      });

      // Configurar timeout de 60 segundos
      socket.setTimeout(60000);
    });

    this.server.listen(this.port, '0.0.0.0', () => {
      this.logger.log(`🧪 Servidor TCP iChroma II iniciado en puerto ${this.port}`);
      this.logger.log(`📌 Configuración del servidor:
        Puerto: ${this.port}
        Host: 0.0.0.0 (todas las interfaces)
        Estado: ${this.server.listening ? 'Escuchando' : 'No escuchando'}
      `);
    });

    this.server.on('error', (error) => {
      this.logger.error(`❌ Error en servidor iChroma TCP: ${error.message}`);
    });

    // Registrar intentos de conexión
    this.server.on('connection', (socket) => {
      this.logger.log(`👉 Nuevo intento de conexión desde ${socket.remoteAddress}:${socket.remotePort}`);
    });

    // Log de conexiones pendientes
    this.server.on('listening', () => {
      const connections = this.server.connections;
      this.logger.log(`ℹ️ Estado del servidor: ${connections} conexiones activas`);
    });
  }

  private async processIChromaMessage(rawMessage: string): Promise<void> {
    try {
      // El iChroma II podría enviar datos en formato JSON o HL7
      // Intentar parsear como JSON primero
      let ichromaData;
      
      try {
        ichromaData = JSON.parse(rawMessage);
        this.logger.log('📊 Datos parseados como JSON');
      } catch (jsonError) {
        // Si no es JSON, asumir que es un mensaje HL7 y crear estructura JSON
        this.logger.log('📋 Procesando como mensaje HL7');
        ichromaData = this.parseHL7ToIChromaFormat(rawMessage);
      }

      // Procesar con el servicio de iChroma
      const result = await this.ichromaResultsService.processIChromaData(ichromaData);
      
      this.logger.log(`✅ Resultado iChroma procesado exitosamente - ID: ${result.id}, Test: ${result.testName}, Resultado: ${result.result} ${result.unit}`);
      
    } catch (error) {
      this.logger.error(`❌ Error procesando mensaje iChroma: ${error.message}`);
      throw error;
    }
  }

  private parseHL7ToIChromaFormat(rawMessage: string): any {
    try {
      this.logger.log('🔄 Convirtiendo HL7 a formato iChroma');
      
      // Extraer información del mensaje HL7
      const lines = rawMessage.split('\r').filter(line => line.trim());
      
      let patientIdIchroma2 = '';
      let patientNameIchroma2 = '';
      let patientAgeIchroma2: number | null = null;
      let patientSexIchroma2 = '';
      let testType = '';
      let testName = '';
      let result = '';
      let unit = '';
      let referenceMin: number | null = null;
      let referenceMax: number | null = null;
      
      for (const line of lines) {
        if (line.startsWith('MSH|')) {
          // Extraer información del header
          const mshParts = line.split('|');
          if (mshParts.length > 4) {
            testType = mshParts[4] || '';
          }
        }
        
        if (line.startsWith('PID|')) {
          // Extraer información del paciente
          const pidParts = line.split('|');
          if (pidParts.length > 3) {
            patientIdIchroma2 = pidParts[3] || '';
          }
          if (pidParts.length > 5) {
            patientNameIchroma2 = pidParts[5] || '';
          }
          if (pidParts.length > 7) {
            const age = parseInt(pidParts[7]);
            patientAgeIchroma2 = isNaN(age) ? null : age;
          }
          if (pidParts.length > 8) {
            patientSexIchroma2 = pidParts[8] || '';
          }
        }
        
        if (line.startsWith('OBX|')) {
          // Extraer resultado
          const obxParts = line.split('|');
          if (obxParts.length > 3) {
            testName = obxParts[3] || '';
          }
          if (obxParts.length > 5) {
            result = obxParts[5] || '';
          }
          if (obxParts.length > 6) {
            unit = obxParts[6] || '';
          }
          if (obxParts.length > 7) {
            const refRange = obxParts[7] || '';
            const rangeParts = refRange.split('-');
            if (rangeParts.length === 2) {
              const minVal = parseFloat(rangeParts[0]);
              const maxVal = parseFloat(rangeParts[1]);
              referenceMin = isNaN(minVal) ? null : minVal;
              referenceMax = isNaN(maxVal) ? null : maxVal;
            }
          }
        }
      }
      
      // Crear objeto en formato iChroma
      const ichromaData = {
        messageType: 'MSH',
        deviceId: '^~\\&',
        patientIdIchroma2: patientIdIchroma2,
        patientNameIchroma2: patientNameIchroma2,
        patientAgeIchroma2: patientAgeIchroma2,
        patientSexIchroma2: patientSexIchroma2,
        testType: testType,
        testName: testName,
        result: result,
        unit: unit,
        referenceMin: referenceMin,
        referenceMax: referenceMax,
        cartridgeSerial: '',
        cartridgeLot: '',
        humidity: null,
        sampleBarcode: '',
        testDate: new Date().toISOString(),
        rawMessage: rawMessage
      };
      
      this.logger.log('✅ HL7 convertido a formato iChroma:', JSON.stringify(ichromaData, null, 2));
      
      return ichromaData;
      
    } catch (error) {
      this.logger.error('❌ Error parseando HL7 a formato iChroma:', error);
      throw new Error(`Error parseando HL7: ${error.message}`);
    }
  }

  // Método para cerrar el servidor
  async close(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.logger.log('🔌 Servidor TCP iChroma II cerrado');
          resolve();
        });
      });
    }
  }

  // Obtener información del servidor
  getServerInfo(): { port: number; isRunning: boolean } {
    return {
      port: this.port,
      isRunning: this.server?.listening || false,
    };
  }
}