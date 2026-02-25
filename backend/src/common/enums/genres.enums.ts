import { ApiProperty } from '@nestjs/swagger';

export enum Genres {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

// Helper para la documentación Swagger
export const GenresExample = {
    description: 'Género',
    enum: Genres,
    example: Genres.MALE,
    default: Genres.FEMALE
};

// Helper para mostrar en español
export const GenresLabels = {
    [Genres.MALE]: 'Masculino',
    [Genres.FEMALE]: 'Femenino',
    [Genres.OTHER]: 'Otro'
};