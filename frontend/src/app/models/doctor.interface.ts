export interface Doctor {
  id?: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  institution?: string;
  isStaff?: boolean;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorRequest {
  firstName: string;
  lastName: string;
  specialty?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  institution?: string;
  isStaff?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateDoctorRequest extends Partial<Omit<CreateDoctorRequest, 'id'>> {
  // No incluimos el id aquí porque va en la URL
}

export interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}
