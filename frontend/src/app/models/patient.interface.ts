import { BloodType } from "../enums/blood-type.enums";
import { Genres } from "../enums/genres.enums";

export interface Patient {
  id?: string;
  name: string;
  age: number;
  sex: Genres;
  referenceGroup?: string;
  dni?: string;
  phone: string;
  email?: string;
  birthDate: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
  isActive?: boolean;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  name: string;
  age: number;
  sex: Genres;
  referenceGroup?: string;
  dni?: string;
  phone: string;
  email?: string;
  birthDate: string;
  address?: string;
  bloodType?: BloodType;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
  isActive?: boolean;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
}

export interface UpdatePatientRequest extends Partial<Omit<CreatePatientRequest, 'id'>> {
  // No incluimos el id aquí porque va en la URL
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientInfo {
  id: string;
  name: string;
  age?: number;  // Necesario para mostrar en la UI
  sex: string;
  dni?: string;
  phone: string;
  email?: string;
  birthDate: string;
}
