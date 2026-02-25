-- Insertar médicos de ejemplo
INSERT INTO doctors (
    id,
    first_name,
    last_name,
    specialty,
    license_number,
    phone,
    email,
    address,
    institution,
    is_staff,
    is_active,
    notes,
    created_at,
    updated_at
) VALUES 
-- Médico 1: Internista del staff
(
    gen_random_uuid(),
    'Carlos Alberto',
    'Martínez López',
    'Medicina Interna',
    'CMH-4521',
    '+50499123456',
    'dr.martinez@clinica.com',
    'Consultorio 301, Edificio Médico Plaza',
    'Hospital del Valle',
    true, -- is_staff
    true, -- is_active
    'Médico internista del staff con amplia experiencia en enfermedades metabólicas',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Médico 2: Ginecóloga del staff
(
    gen_random_uuid(),
    'María José',
    'Sánchez Reyes',
    'Ginecología y Obstetricia',
    'CMH-5632',
    '+50498567432',
    'dra.sanchez@clinica.com',
    'Consultorio 205, Torre Médica Central',
    'Hospital Viera',
    true, -- is_staff
    true, -- is_active
    'Especialista en ginecología con subespecialidad en infertilidad',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Médico 3: Pediatra externo
(
    gen_random_uuid(),
    'Juan Diego',
    'Ramírez Castro',
    'Pediatría',
    'CMH-3245',
    '+50496789012',
    'dr.ramirez@gmail.com',
    'Clínica Pediátrica Ramírez, Col. Palmira',
    'Hospital Escuela',
    false, -- is_staff
    true, -- is_active
    'Pediatra con especialidad en neurodesarrollo infantil',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Médico 4: Dermatóloga externa
(
    gen_random_uuid(),
    'Ana Patricia',
    'González Mejía',
    'Dermatología',
    'CMH-7890',
    '+50495432167',
    'dra.gonzalez@dermacenter.hn',
    'DermaCenter, Mall Multiplaza',
    'Clínica DermaCenter',
    false, -- is_staff
    true, -- is_active
    'Especialista en dermatología clínica y estética',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Médico 5: Cardiólogo del staff
(
    gen_random_uuid(),
    'Roberto José',
    'Mendoza Flores',
    'Cardiología',
    'CMH-6543',
    '+50497654321',
    'dr.mendoza@clinica.com',
    'Consultorio 401, Edificio Médico Plaza',
    'Instituto Cardiopulmonar',
    true, -- is_staff
    true, -- is_active
    'Cardiólogo intervencionista con especialidad en arritmias',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verificar la inserción
SELECT * FROM doctors ORDER BY created_at DESC LIMIT 5;