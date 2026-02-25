import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { Parameter } from '../models/lab-result.interface';

Chart.register(...registerables);

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  // Gráfico Serie Blanca (WBC - Leucocitos)
  createWBCChart(parameters: Parameter[]): ChartConfiguration {
    const wbcParams = this.getWBCParameters(parameters);
    
    return {
      type: 'line' as ChartType,
      data: {
        labels: wbcParams.map(p => this.getShortName(p.name)),
        datasets: [{
          label: 'Serie Blanca',
          data: wbcParams.map(p => parseFloat(p.result) || 0),
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: '#2563eb',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: wbcParams.map(p => this.getPointColor(p.status)),
          pointBorderColor: '#2563eb',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            // text: 'WBC - Serie Blanca (Leucocitos)',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valores'
            }
          }
        }
      }
    };
  }

  // Gráfico Serie Roja (RBC - Eritrocitos)
  createRBCChart(parameters: Parameter[]): ChartConfiguration {
    const rbcParams = this.getRBCParameters(parameters);
    
    return {
      type: 'line' as ChartType,
      data: {
        labels: rbcParams.map(p => this.getShortName(p.name)),
        datasets: [{
          label: 'Serie Roja',
          data: rbcParams.map(p => parseFloat(p.result) || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: rbcParams.map(p => this.getPointColor(p.status)),
          pointBorderColor: '#ef4444',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            // text: 'RBC - Serie Roja (Eritrocitos)',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Valores'
            }
          }
        }
      }
    };
  }

  // Gráfico Plaquetas (PLT)
  createPLTChart(parameters: Parameter[]): ChartConfiguration {
    const pltParams = this.getPLTParameters(parameters);
    
    return {
      type: 'line' as ChartType,
      data: {
        labels: pltParams.map(p => this.getShortName(p.name)),
        datasets: [{
          label: 'Plaquetas',
          data: pltParams.map(p => parseFloat(p.result) || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: pltParams.map(p => this.getPointColor(p.status)),
          pointBorderColor: '#10b981',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            // text: 'PLT - Plaquetas',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Valores'
            }
          }
        }
      }
    };
  }

  // Métodos para filtrar parámetros por series
  private getWBCParameters(parameters: Parameter[]): Parameter[] {
    return parameters.filter(p => {
      const name = p.name.toLowerCase();
      return name.includes('wbc') || 
             name.includes('lym') || 
             name.includes('gra') || 
             name.includes('mid') ||
             name.includes('leucocitos') ||
             name.includes('linfocitos') ||
             name.includes('granulocitos') ||
             name.includes('monocitos');
    });
  }

  private getRBCParameters(parameters: Parameter[]): Parameter[] {
    return parameters.filter(p => {
      const name = p.name.toLowerCase();
      return name.includes('rbc') || 
             name.includes('hgb') || 
             name.includes('hct') || 
             name.includes('mcv') ||
             name.includes('mch') ||
             name.includes('mchc') ||
             name.includes('rdw') ||
             name.includes('eritrocitos') ||
             name.includes('hemoglobina') ||
             name.includes('hematocrito');
    });
  }

  private getPLTParameters(parameters: Parameter[]): Parameter[] {
    return parameters.filter(p => {
      const name = p.name.toLowerCase();
      return name.includes('plt') || 
             name.includes('mpv') || 
             name.includes('pdw') || 
             name.includes('pct') ||
             name.includes('p-lcr') ||
             name.includes('p-lcc') ||
             name.includes('plaquetas');
    });
  }

  // Métodos auxiliares
  private getShortName(name: string): string {
    if (!name) return 'N/A';
    const parts = name.split('^');
    // Devolver el nombre corto (primer parte) o el nombre completo si es corto
    const shortName = parts[0] || name;
    return shortName.length > 8 ? shortName.substring(0, 8) : shortName;
  }

  private getBarColor(status: string): string {
    if (!status) return '#10b981'; // Verde normal
    if (status.includes('H')) return '#ef4444'; // Rojo alto
    if (status.includes('L')) return '#f59e0b'; // Amarillo bajo
    return '#10b981'; // Verde normal
  }

  private getPointColor(status: string): string {
    if (!status) return '#10b981'; // Verde normal
    if (status.includes('H')) return '#ef4444'; // Rojo alto
    if (status.includes('L')) return '#f59e0b'; // Amarillo bajo
    return '#10b981'; // Verde normal
  }

  // Método para generar imagen del gráfico para PDF
  generateChartImage(chartConfig: ChartConfiguration, width: number = 400, height: number = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Crear un canvas temporal
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Obtener el contexto y configurarlo
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Limpiar el canvas con fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Configuración optimizada para PDF (sin animaciones)
        const pdfConfig: ChartConfiguration = {
          ...chartConfig,
          options: {
            ...chartConfig.options,
            responsive: false,
            maintainAspectRatio: false,
            animation: false, // Importante: sin animaciones
            plugins: {
              ...chartConfig.options?.plugins,
              legend: {
                ...chartConfig.options?.plugins?.legend,
                display: true
              }
            }
          }
        };
        
        // Crear el gráfico
        const chart = new Chart(ctx, pdfConfig);
        
        // Tiempo mínimo ya que no hay animaciones
        setTimeout(() => {
          try {
            // Generar la imagen inmediatamente
            const imageData = canvas.toDataURL('image/png', 1.0);
            
            // Destruir el gráfico
            chart.destroy();
            
            // Validar imagen con método más simple
            if (imageData && 
                imageData.includes('data:image/png;base64,') && 
                imageData.length > 500) {
              resolve(imageData);
            } else {
              resolve(this.createFallbackImage(width, height));
            }
          } catch (error) {
            chart.destroy();
            resolve(this.createFallbackImage(width, height));
          }
        }, 200); // Tiempo reducido
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Verificar si hay datos suficientes para cada serie
  hasWBCData(parameters: Parameter[]): boolean {
    return this.getWBCParameters(parameters).length > 0;
  }

  hasRBCData(parameters: Parameter[]): boolean {
    return this.getRBCParameters(parameters).length > 0;
  }

  hasPLTData(parameters: Parameter[]): boolean {
    return this.getPLTParameters(parameters).length > 0;
  }

  // Método para crear imagen de respaldo
  private createFallbackImage(width: number, height: number): string {
    try {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      const fallbackCtx = fallbackCanvas.getContext('2d');
      
      if (fallbackCtx) {
        // Fondo blanco
        fallbackCtx.fillStyle = '#ffffff';
        fallbackCtx.fillRect(0, 0, width, height);
        
        // Borde gris
        fallbackCtx.strokeStyle = '#d1d5db';
        fallbackCtx.lineWidth = 2;
        fallbackCtx.strokeRect(2, 2, width - 4, height - 4);
        
        // Título
        fallbackCtx.fillStyle = '#374151';
        fallbackCtx.font = 'bold 18px Arial';
        fallbackCtx.textAlign = 'center';
        fallbackCtx.textBaseline = 'middle';
        fallbackCtx.fillText('Gráfico de Laboratorio', width/2, height/2 - 20);
        
        // Subtítulo
        fallbackCtx.fillStyle = '#6b7280';
        fallbackCtx.font = '14px Arial';
        fallbackCtx.fillText('Datos disponibles en tabla', width/2, height/2 + 10);
        
        // Icono simple de gráfico
        fallbackCtx.strokeStyle = '#9ca3af';
        fallbackCtx.lineWidth = 3;
        fallbackCtx.beginPath();
        fallbackCtx.moveTo(width/2 - 30, height/2 + 40);
        fallbackCtx.lineTo(width/2 - 10, height/2 + 30);
        fallbackCtx.lineTo(width/2 + 10, height/2 + 45);
        fallbackCtx.lineTo(width/2 + 30, height/2 + 25);
        fallbackCtx.stroke();
      }
      
      return fallbackCanvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error creating fallback image:', error);
      // Crear imagen mínima pero válida
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = width;
      miniCanvas.height = height;
      const miniCtx = miniCanvas.getContext('2d');
      if (miniCtx) {
        miniCtx.fillStyle = '#ffffff';
        miniCtx.fillRect(0, 0, width, height);
        miniCtx.fillStyle = '#999999';
        miniCtx.font = '16px Arial';
        miniCtx.textAlign = 'center';
        miniCtx.fillText('N/A', width/2, height/2);
      }
      return miniCanvas.toDataURL('image/png', 1.0);
    }
  }
}