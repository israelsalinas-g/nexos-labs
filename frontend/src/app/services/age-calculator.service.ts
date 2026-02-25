import { Injectable } from '@angular/core';

/**
 * Servicio para calcular la edad de una persona basada en su fecha de nacimiento
 */
@Injectable({
  providedIn: 'root'
})
export class AgeCalculatorService {

  constructor() { }

  /**
   * Calcula la edad en años basándose en la fecha de nacimiento
   * Utiliza la fecha actual del sistema
   * 
   * @param birthDate - Fecha de nacimiento en formato YYYY-MM-DD o cualquier formato válido para Date
   * @returns Edad en años (mínimo 0)
   * 
   * @example
   * const age = this.ageCalculator.calculateAge('1990-05-15'); // Si hoy es 2025, retorna 34 o 35
   */
  calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;

    try {
      const today = new Date();
      const birth = new Date(birthDate);

      // Validar que la fecha de nacimiento sea válida
      if (isNaN(birth.getTime())) {
        console.warn('Fecha de nacimiento inválida:', birthDate);
        return 0;
      }

      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      // Si aún no ha pasado el cumpleaños este año, restar 1
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      // Asegurar que la edad no sea negativa
      return Math.max(0, age);
    } catch (error) {
      console.error('Error calculando la edad:', error);
      return 0;
    }
  }

  /**
   * Valida si una fecha de nacimiento es válida
   * (no es en el futuro y hace al menos 0 años)
   * 
   * @param birthDate - Fecha de nacimiento a validar
   * @returns true si la fecha es válida, false en caso contrario
   */
  isValidBirthDate(birthDate: string | Date): boolean {
    try {
      const birth = new Date(birthDate);
      const today = new Date();

      if (isNaN(birth.getTime())) {
        return false;
      }

      // No puede ser en el futuro
      return birth <= today;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene la edad y categoría de edad
   * Útil para clasificar pacientes por rango etario
   * 
   * @param birthDate - Fecha de nacimiento
   * @returns Objeto con edad y categoría (niño, adolescente, adulto, adulto mayor)
   */
  getAgeWithCategory(birthDate: string | Date): { age: number; category: string } {
    const age = this.calculateAge(birthDate);

    let category: string;
    if (age < 13) {
      category = 'Niño';
    } else if (age < 18) {
      category = 'Adolescente';
    } else if (age < 60) {
      category = 'Adulto';
    } else {
      category = 'Adulto Mayor';
    }

    return { age, category };
  }
}
