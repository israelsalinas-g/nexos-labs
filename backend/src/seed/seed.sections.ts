import { Injectable } from '@nestjs/common';
import { TestSectionsService } from '../features/test-sections/test-sections.service';

@Injectable()
export class SeedSectionsService {
  constructor(private readonly testSectionsService: TestSectionsService) {}

  async seedSections() {
    const sections = [
      {
        name: 'Química Sanguínea',
        code: 'QS',
        description: 'Pruebas para evaluar diferentes componentes químicos y metabolitos en la sangre, fundamentales para evaluar el funcionamiento de órganos como riñones, hígado y otros sistemas metabólicos.',
        color: '#4CAF50', // Verde
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Toxicología',
        code: 'TOX',
        description: 'Pruebas para la detección y cuantificación de sustancias tóxicas, drogas y sus metabolitos en diferentes matrices biológicas.',
        color: '#FF5722', // Naranja/Rojo
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Serología',
        code: 'SER',
        description: 'Pruebas para la detección de anticuerpos y antígenos en suero, fundamentales para el diagnóstico de enfermedades infecciosas y autoinmunes.',
        color: '#2196F3', // Azul
        displayOrder: 3,
        isActive: true
      }
    ];

    for (const section of sections) {
      try {
        await this.testSectionsService.create(section);
        console.log(`Sección ${section.name} creada exitosamente`);
      } catch (error) {
        console.error(`Error al crear sección ${section.name}:`, error.message);
      }
    }
  }

  async cleanSections() {
    // Opcional: Método para limpiar las secciones si es necesario
    console.log('Limpiando secciones existentes...');
    // Implementar lógica de limpieza si es necesario
  }
}

// Uso:
// const seedService = new SeedSectionsService(testSectionsService);
// await seedService.seedSections();