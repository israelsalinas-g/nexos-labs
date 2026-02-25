-- Limpiar la tabla
TRUNCATE TABLE ichroma_results RESTART IDENTITY CASCADE;

-- Insertar registros
INSERT INTO public.ichroma_results (
  id, message_type, device_id, patient_id, patient_name, 
  patient_age, patient_sex, test_type, test_name, result, 
  unit, reference_min, reference_max, cartridge_serial, 
  cartridge_lot, humidity, sample_barcode, test_date, 
  raw_message, raw_data, instrument_id, processing_status, 
  technical_notes, assignment_status, assigned_at, 
  assigned_by, assignment_notes, created_at, updated_at
) VALUES 
(1, 'MSH', NULL, 'amygenesispinedatillet', 'amy genesis pineda tillet', 14, 'F', 'INSULIN', 'Insulin', '300.00', 'uIU/ml', NULL, NULL, '123456', 'LOT001', NULL, 'INS001', '2025-10-02 11:36:27.031', NULL, NULL, 'ICHROMA', 'processed', NULL, 'unassigned', NULL, NULL, NULL, '2025-10-02 11:36:27.031', '2025-10-02 11:36:27.031'),
(2, 'MSH', NULL, 'ehimyyanitzariveraalarcon', 'Ehimy yanitza Rivera alarcon', 23, 'F', 'INSULIN', 'Insulin', '280.15', 'uIU/ml', NULL, NULL, '123457', 'LOT001', NULL, 'INS002', '2025-10-02 11:36:27.031', NULL, NULL, 'ICHROMA', 'processed', NULL, 'unassigned', NULL, NULL, NULL, '2025-10-02 11:36:27.031', '2025-10-02 11:36:27.031'),
(3, 'MSH', NULL, 'dilcializzethhernadezlopez', 'Dilcia lizzeth Hernadez lopez', 39, 'F', 'INSULIN', 'Insulin', '156.78', 'uIU/ml', NULL, NULL, '123458', 'LOT001', NULL, 'INS003', '2025-10-02 11:36:27.031', NULL, NULL, 'ICHROMA', 'processed', NULL, 'unassigned', NULL, NULL, NULL, '2025-10-02 11:36:27.031', '2025-10-02 11:36:27.031');
