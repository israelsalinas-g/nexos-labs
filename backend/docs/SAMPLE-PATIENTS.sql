-- Insertar pacientes de ejemplo
INSERT INTO patients (
    name,
    age,
    sex,
    reference_group,
    dni,
    phone,
    email,
    birth_date,
    address,
    blood_type,
    allergies,
    medical_history,
    current_medications,
    is_active,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    created_at,
    updated_at
) VALUES 
-- Paciente 1
(
    'María Isabel Rodríguez López',
    35,
    'FEMALE',
    'Adulto',
    '0801199001234',
    '+50498765432',
    'maria.rodriguez@email.com',
    '1990-03-15',
    'Colonia Kennedy, Calle Principal, Casa #123',
    'O_POSITIVE',
    'Alérgica a penicilina',
    'Hipertensión arterial controlada',
    'Enalapril 20mg cada 24 horas',
    true,
    'Carlos López',
    'Esposo',
    '+50496789012',
    NOW(),
    NOW()
),

-- Paciente 2
(
    'Juan Carlos Martínez Pérez',
    42,
    'MALE',
    'Adulto',
    '0801198345678',
    '+50499887766',
    'juan.martinez@email.com',
    '1983-07-22',
    'Residencial Plaza, Bloque 5, Casa #45',
    'A_POSITIVE',
    'Ninguna conocida',
    'Diabetes tipo 2',
    'Metformina 850mg cada 12 horas',
    true,
    'Ana Pérez',
    'Hermana',
    '+50495556677',
    NOW(),
    NOW()
),

-- Paciente 3
(
    'Ana Patricia Mejía Castro',
    28,
    'FEMALE',
    'Adulto',
    '0801199789012',
    '+50497654321',
    'ana.mejia@email.com',
    '1997-11-30',
    'Colonia Miraflores, Calle 3, Casa #78',
    'B_NEGATIVE',
    'Alergia a sulfas',
    'Asma leve',
    'Salbutamol inhalador PRN',
    true,
    'Rosa Castro',
    'Madre',
    '+50498765001',
    NOW(),
    NOW()
),

-- Paciente 4
(
    'Luis Fernando Santos Mendoza',
    55,
    'MALE',
    'Adulto Mayor',
    '0801197012345',
    '+50491234567',
    'luis.santos@email.com',
    '1970-05-10',
    'Barrio El Centro, Avenida República, Casa #234',
    'AB_POSITIVE',
    'Alergia a mariscos',
    'Artritis reumatoide, Hipertensión',
    'Prednisona 5mg diario, Losartán 50mg cada 12 horas',
    true,
    'Carmen Mendoza',
    'Esposa',
    '+50492223344',
    NOW(),
    NOW()
),

-- Paciente 5
(
    'Sofia Alejandra Paz Rivera',
    19,
    'FEMALE',
    'Adolescente',
    '0801200678901',
    '+50493456789',
    'sofia.paz@email.com',
    '2006-09-25',
    'Colonia Las Mercedes, Calle Principal, Casa #56',
    'O_NEGATIVE',
    'Ninguna',
    'Ninguna relevante',
    'Ninguno',
    true,
    'Roberto Paz',
    'Padre',
    '+50494445555',
    NOW(),
    NOW()
);

-- Verificar la inserción
SELECT * FROM patients ORDER BY name;