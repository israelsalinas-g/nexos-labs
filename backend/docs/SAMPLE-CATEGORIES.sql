-- Insertar categorías de exámenes de ejemplo
INSERT INTO exam_categories (
    id,
    name,
    code,
    description,
    color,
    display_order,  -- Nombre de columna en snake_case como está en PostgreSQL
    is_active,
    created_at,
    updated_at
) VALUES 
-- Química Sanguínea
(
    1, -- id secuencial
    'Química Sanguínea',
    'QS',
    'Pruebas para evaluar diferentes componentes químicos y metabolitos en la sangre, fundamentales para evaluar el funcionamiento de órganos como riñones, hígado y otros sistemas metabólicos.',
    '#4CAF50', -- Verde
    1,
    true,
    NOW(),
    NOW()
),

-- Toxicología
(
    2,
    'Toxicología',
    'TOX',
    'Pruebas para la detección y cuantificación de sustancias tóxicas, drogas y sus metabolitos en diferentes matrices biológicas.',
    '#FF5722', -- Naranja/Rojo
    2,
    true,
    NOW(),
    NOW()
),

-- Serología
(
    3,
    'Serología',
    'SER',
    'Pruebas para la detección de anticuerpos y antígenos en suero, fundamentales para el diagnóstico de enfermedades infecciosas y autoinmunes.',
    '#2196F3', -- Azul
    3,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verificar la inserción
SELECT * FROM exam_categories ORDER BY display_order;