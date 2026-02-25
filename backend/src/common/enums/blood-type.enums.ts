import { ApiProperty } from '@nestjs/swagger';

export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
    UNKNOWN = 'UNKNOWN'
}

// Helper para la documentación Swagger
export const BloodTypeExample = {
    description: 'Tipo de sangre del paciente',
    enum: BloodType,
    example: BloodType.O_POSITIVE,
    default: BloodType.UNKNOWN
};

// Helper para mostrar en español
export const BloodTypeLabels = {
    [BloodType.A_POSITIVE]: 'A positivo',
    [BloodType.A_NEGATIVE]: 'A negativo',
    [BloodType.B_POSITIVE]: 'B positivo',
    [BloodType.B_NEGATIVE]: 'B negativo',
    [BloodType.AB_POSITIVE]: 'AB positivo',
    [BloodType.AB_NEGATIVE]: 'AB negativo',
    [BloodType.O_POSITIVE]: 'O positivo',
    [BloodType.O_NEGATIVE]: 'O negativo',
    [BloodType.UNKNOWN]: 'Desconocido'
};