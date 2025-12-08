
-- CREACIÓN DE LA BASE DE DATOS Y USO
-- ******************************************************
CREATE DATABASE IF NOT EXISTS sistema_trazabilidad_partos;
USE sistema_trazabilidad_partos;

-- ******************************************************
-- DEFINICIÓN DE TABLAS
***************************************


-- Tabla de Usuarios (clase base)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rut VARCHAR(12) NOT NULL UNIQUE,
    usuario_sistema VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('Medico', 'Enfermera', 'Supervisor', 'TI') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Pacientes
CREATE TABLE pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    run VARCHAR(12) NOT NULL UNIQUE, -- Se mantiene 'run' por consistencia con el código original
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_nacimiento DATE NOT NULL,
    edad INT,
    nacionalidad VARCHAR(50),
    pueblo_originario BOOLEAN DEFAULT FALSE,
    inmigrante BOOLEAN DEFAULT FALSE,
    discapacidad BOOLEAN DEFAULT FALSE,
    privada_de_libertad BOOLEAN DEFAULT FALSE,
    trans_masculino BOOLEAN DEFAULT FALSE,
    IMC DECIMAL(5,2),
    paridad INT,
    control_prenatal BOOLEAN DEFAULT FALSE,
    consultorio_origen VARCHAR(100),
    tipo_de_paciente ENUM('Institucional', 'Prehospitalario', 'Fuera de la Red Asistencial', 'Domicilio con Atención Profesional', 'Domicilio sin Atención Profesional'),
    origen_ingreso VARCHAR(50),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tablas de Roles (Herencia por Estrategia One-to-One)
CREATE TABLE medicos (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    especialidad VARCHAR(100) NOT NULL,
    profesional_responsable BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE enfermeras (
    id_enfermera INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE supervisores (
    id_supervisor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE encargados_ti (
    id_ti INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de Registros de Pacientes (Episodios o Ficha Clínica Principal)
CREATE TABLE registros (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_supervisor INT,
    id_medico INT,
    id_enfermera INT,
    grupo_sanguineo VARCHAR(10),
    fecha_estimada_parto DATE,
    alergias_conocidas TEXT,
    antecedentes_medicos TEXT,
    historial_embarazos TEXT,
    estado_paciente VARCHAR(50),
    N_ARO VARCHAR(20),
    preeclampsia_severa BOOLEAN DEFAULT FALSE,
    eclampsia BOOLEAN DEFAULT FALSE,
    sepsis_infeccion_sistemica BOOLEAN DEFAULT FALSE,
    infeccion_ovular BOOLEAN DEFAULT FALSE,
    otra_patologia BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_supervisor) REFERENCES supervisores(id_supervisor) ON DELETE SET NULL,
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Controles (Registro de la atención)
CREATE TABLE controles (
    id_control INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NOT NULL,
    id_medico INT,
    id_enfermera INT,
    fecha DATE NOT NULL,
    peso DECIMAL(5,2),
    presion_arterial VARCHAR(20),
    altura_uterina DECIMAL(5,2),
    latido_fetal VARCHAR(20),
    sintomas_reportados TEXT,
    recomendaciones_medicas TEXT,
    sem_obst_semanas INT,
    sem_obst_dias INT,
    monitor BOOLEAN DEFAULT FALSE,
    TTC BOOLEAN DEFAULT FALSE,
    induccion BOOLEAN DEFAULT FALSE,
    aceleracion_correccion BOOLEAN DEFAULT FALSE,
    N_TV VARCHAR(20),
    rotura_membrana ENUM('IOP', 'RAM'),
    tiempo_membranas_rotas TIME,
    tiempo_dilatacion TIME,
    tiempo_expulsivo TIME,
    libertad_movimiento BOOLEAN DEFAULT FALSE,
    tipo_regimen_trabajo_parto ENUM('CERO', 'LIQUIDO', 'COMÚN', 'RAM'),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_registro) REFERENCES registros(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Partos
CREATE TABLE partos (
    id_parto INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NOT NULL,
    id_medico INT,
    id_enfermera INT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_parto ENUM('EUTOCICO', 'DISTOCICO', 'CES. URGENCIA', 'CES.ELECTIVA', 'OTRO'),
    alumbramiento_dirigido BOOLEAN DEFAULT FALSE,
    clasificacion_robson ENUM('Grupo 1', 'Grupo 2.A', 'Grupo 2.B', 'Grupo 3', 'Grupo 4', 'Grupo 5.1', 'Grupo 5.2', 'Grupo 6', 'Grupo 7', 'Grupo 8', 'Grupo 9', 'Grupo 10'),
    posicion_materna_parto ENUM('SEMISENTADA', 'SENTADA', 'LITOTOMIA', 'D. DORSAL', 'D. LATERAL', 'DE PIE', 'CUADRÚPEDA', 'CUCLILLAS', 'OTRO'),
    ofrecimiento_posiciones_alternativas BOOLEAN DEFAULT FALSE, -- Corrección ortográfica: frecimiento -> ofrecimiento
    estado_perineo ENUM('INDEMNE', 'DESGARRO G1', 'DESGARRO G2', 'DESGARRO G3 A', 'DESGARRO G3 B', 'DESGARRO G3 C', 'DESGARRO G4', 'FISURA', 'EPISIOTOMIA'),
    esterilizacion BOOLEAN DEFAULT FALSE,
    revision BOOLEAN DEFAULT FALSE,
    inercia_uterina BOOLEAN DEFAULT FALSE,
    restos_placentarios BOOLEAN DEFAULT FALSE,
    trauma BOOLEAN DEFAULT FALSE,
    alteracion_coagulacion BOOLEAN DEFAULT FALSE,
    manejo_quirurgico_inercia_uterina BOOLEAN DEFAULT FALSE,
    histerectomia_obstetrica BOOLEAN DEFAULT FALSE,
    transfusion_sanguinea BOOLEAN DEFAULT FALSE,
    causa_cesarea TEXT,
    observaciones TEXT,
    uso_sala_saip BOOLEAN DEFAULT FALSE,
    cuales_recuerdos TEXT,
    retira_placenta BOOLEAN DEFAULT FALSE,
    estampado_placenta BOOLEAN DEFAULT FALSE,
    folio_valido VARCHAR(20),
    folio_nulo VARCHAR(20),
    manejo_dolor_no_farmacologico TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_registro) REFERENCES registros(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Recién Nacidos
CREATE TABLE recien_nacidos (
    id_rn INT AUTO_INCREMENT PRIMARY KEY,
    id_parto INT NOT NULL,
    sexo ENUM('MASCULINO', 'FEMENINO'),
    peso DECIMAL(5,2),
    talla DECIMAL(5,2),
    ligadura_tardia_cordon BOOLEAN DEFAULT FALSE,
    apgar_minuto INT,
    apgar_5_min INT,
    tiempo_apego TIME,
    apego_canguro BOOLEAN DEFAULT FALSE,
    acompanamiento_preparto BOOLEAN DEFAULT FALSE,
    acompanamiento_parto BOOLEAN DEFAULT FALSE,
    acompan_rn BOOLEAN DEFAULT FALSE,
    motivo_parto_no_acompanado ENUM('NO DESEA', 'NO LLEGA', 'RURALIDAD', 'SIN PASE DE MOVILIDAD', 'NADIE', 'OTRO', 'OBSERVACIONES'),
    persona_acompanante ENUM('PAREJA', 'MADRE', 'HERMANA', 'AMIGA', 'OTRO'),
    acompanante_secciona_cordon BOOLEAN DEFAULT FALSE,
    destino_rn VARCHAR(100),
    interno BOOLEAN DEFAULT FALSE,
    malformacion_congenita BOOLEAN DEFAULT FALSE,
    descripcion_malformacion TEXT,
    alojamiento_conjunto_puerperio_inmediato BOOLEAN DEFAULT FALSE,
    profilaxis_ocular BOOLEAN DEFAULT FALSE,
    vacuna_hepatitis_B BOOLEAN DEFAULT FALSE,
    profesional_vacuna_VHB VARCHAR(100),
    reanimacion_basica BOOLEAN DEFAULT FALSE,
    reanimacion_avanzada BOOLEAN DEFAULT FALSE,
    gases_cordon BOOLEAN DEFAULT FALSE,
    apego_tunel BOOLEAN DEFAULT FALSE,
    clampeo_tardio BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_parto) REFERENCES partos(id_parto) ON DELETE CASCADE
);

-- Tabla de Exámenes de Pacientes
CREATE TABLE examenes (
    id_examen INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NOT NULL,
    id_medico INT,
    id_enfermera INT,
    nombre_examen VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    resultado TEXT,
    tipo_examen VARCHAR(50),
    pesquisa ENUM('POSITIVO', 'NEGATIVO'),
    tratamiento_atb BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_registro) REFERENCES registros(id_registro) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Exámenes de Recién Nacidos
CREATE TABLE examenes_rn (
    id_examen_rn INT AUTO_INCREMENT PRIMARY KEY,
    id_rn INT NOT NULL,
    id_medico INT,
    id_enfermera INT,
    nombre_examen VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    resultado TEXT,
    tipo_examen VARCHAR(50),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rn) REFERENCES recien_nacidos(id_rn) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Anestesia/Analgesia
CREATE TABLE anestesia (
    id_anestesia INT AUTO_INCREMENT PRIMARY KEY,
    id_parto INT NOT NULL,
    id_medico INT,
    id_enfermera INT,
    anestesia_neuroaxial BOOLEAN DEFAULT FALSE,
    oxido_nitroso BOOLEAN DEFAULT FALSE,
    analgesia_endovenosa BOOLEAN DEFAULT FALSE,
    general BOOLEAN DEFAULT FALSE,
    local BOOLEAN DEFAULT FALSE,
    analgesia_no_farmac BOOLEAN DEFAULT FALSE,
    balon_kinesico BOOLEAN DEFAULT FALSE,
    lenteja_parto BOOLEAN DEFAULT FALSE,
    rebozo BOOLEAN DEFAULT FALSE,
    aromaterapia BOOLEAN DEFAULT FALSE,
    anestesia_peridural_solicitada_paciente BOOLEAN DEFAULT FALSE,
    anestesia_peridural_indicada_medico BOOLEAN DEFAULT FALSE,
    anestesia_peridural_administrada BOOLEAN DEFAULT FALSE,
    tiempo_espera_indicacion_administracion TIME,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_parto) REFERENCES partos(id_parto) ON DELETE CASCADE,
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Placenta
CREATE TABLE placenta (
    id_placenta INT AUTO_INCREMENT PRIMARY KEY,
    id_parto INT NOT NULL,
    estado VARCHAR(100),
    entrega_solicitud BOOLEAN DEFAULT FALSE,
    retira_placenta BOOLEAN DEFAULT FALSE,
    estampado_placenta BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_parto) REFERENCES partos(id_parto) ON DELETE CASCADE
);

-- Tabla de Vacunas
CREATE TABLE vacunas (
    id_vacuna INT AUTO_INCREMENT PRIMARY KEY,
    id_rn INT NOT NULL,
    id_enfermera INT,
    tipo_vacuna VARCHAR(50),
    fecha_administracion DATE,
    profesional_administra VARCHAR(100),
    reaccion_adversa TEXT,
    dosis VARCHAR(20),
    numero_cama VARCHAR(20),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rn) REFERENCES recien_nacidos(id_rn) ON DELETE CASCADE,
    FOREIGN KEY (id_enfermera) REFERENCES enfermeras(id_enfermera) ON DELETE SET NULL
);

-- Tabla de Informes
CREATE TABLE informes (
    id_informe INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_genera INT NOT NULL,
    tipo_informe ENUM('REM BS22', 'URNI', 'Mensual', 'Anual'),
    fecha_generacion DATE NOT NULL,
    periodo_informe VARCHAR(50),
    contenido_informe TEXT,
    estado_informe ENUM('Pendiente', 'Generado', 'Enviado') DEFAULT 'Pendiente',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_genera) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de Estadísticas de Partos
CREATE TABLE estadisticas (
    id_estadistica INT AUTO_INCREMENT PRIMARY KEY,
    periodo VARCHAR(20) NOT NULL,
    mes INT,
    anio INT,
    total_partos INT DEFAULT 0,
    partos_vaginales INT DEFAULT 0,
    partos_instrumentales INT DEFAULT 0,
    cesareas_electivas INT DEFAULT 0,
    cesareas_urgencia INT DEFAULT 0,
    partos_prematuros_menos_24_sem INT DEFAULT 0,
    partos_prematuros_24_28_sem INT DEFAULT 0,
    partos_prematuros_29_32_sem INT DEFAULT 0,
    partos_prematuros_33_36_sem INT DEFAULT 0,
    partos_segun_edad_madre JSON,
    uso_oxitocina_perfilactica INT DEFAULT 0,
    anestesia_analgesia_parto INT DEFAULT 0,
    ligadura_tardia_cordon INT DEFAULT 0,
    contacto_piel_piel INT DEFAULT 0,
    lactancia_primeros_60_min INT DEFAULT 0,
    alojamiento_conjunto INT DEFAULT 0,
    atencion_pertinencia_cultural INT DEFAULT 0,
    pueblos_originarios INT DEFAULT 0,
    migrantes INT DEFAULT 0,
    discapacidad INT DEFAULT 0,
    privada_libertad INT DEFAULT 0,
    `trans` INT DEFAULT 0, -- Se usa `trans` entre comillas invertidas por ser una palabra reservada
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY periodo_mes_anio (periodo, mes, anio)
);

-- Tabla de Auditoría (para registrar acciones críticas)
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    id_registro_afectado INT,
    detalles TEXT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de Sesiones (para gestión de sesiones activas)
CREATE TABLE sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_sesion VARCHAR(255) NOT NULL UNIQUE,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actividad DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_cierre DATETIME,
    ip_address VARCHAR(45),
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ******************************************************
-- CREACIÓN DE ÍNDICES
-- ******************************************************
CREATE INDEX idx_pacientes_run ON pacientes(run);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre, apellido);
CREATE INDEX idx_registros_paciente ON registros(id_paciente);
CREATE INDEX idx_controles_registro ON controles(id_registro);
CREATE INDEX idx_controles_fecha ON controles(fecha);
CREATE INDEX idx_partos_registro ON partos(id_registro);
CREATE INDEX idx_partos_fecha ON partos(fecha);
CREATE INDEX idx_recien_nacidos_parto ON recien_nacidos(id_parto);
CREATE INDEX idx_examenes_registro ON examenes(id_registro);
CREATE INDEX idx_examenes_fecha ON examenes(fecha);
CREATE INDEX idx_examenes_rn_rn ON examenes_rn(id_rn);
CREATE INDEX idx_informes_tipo_fecha ON informes(tipo_informe, fecha_generacion);
CREATE INDEX idx_auditoria_usuario_fecha ON auditoria(id_usuario, fecha_hora);
CREATE INDEX idx_sesiones_usuario ON sesiones(id_usuario);
CREATE INDEX idx_sesiones_token ON sesiones(token_sesion);
CREATE INDEX idx_vacunas_rn ON vacunas(id_rn);

-- ******************************************************
-- CREACIÓN DE VISTAS
-- ******************************************************

-- Crear vista para información completa de pacientes
CREATE VIEW vista_pacientes_completa AS
SELECT 
    p.id_paciente,
    p.run,
    p.nombre,
    p.apellido,
    p.fecha_nacimiento,
    p.edad,
    p.telefono,
    p.email,
    r.fecha_estimada_parto,
    r.estado_paciente,
    COUNT(DISTINCT co.id_control) AS total_controles,
    COUNT(DISTINCT pa.id_parto) AS total_partos,
    MAX(pa.fecha) AS fecha_ultimo_parto
FROM 
    pacientes p
LEFT JOIN 
    registros r ON p.id_paciente = r.id_paciente
LEFT JOIN 
    controles co ON r.id_registro = co.id_registro
LEFT JOIN 
    partos pa ON r.id_registro = pa.id_registro
GROUP BY 
    p.id_paciente, p.run, p.nombre, p.apellido, p.fecha_nacimiento, 
    p.edad, p.telefono, p.email, r.fecha_estimada_parto, r.estado_paciente;

-- Crear vista para información de partos con recién nacidos
CREATE VIEW vista_partos_completa AS
SELECT 
    pa.id_parto,
    pa.fecha,
    pa.hora,
    pa.tipo_parto,
    p.nombre AS nombre_paciente,
    p.apellido AS apellido_paciente,
    p.run AS run_paciente,
    COUNT(rn.id_rn) AS cantidad_recien_nacidos,
    -- GROUP_CONCAT(CONCAT(rn.sexo, ' - ', rn.peso, 'kg') SEPARATOR ', ') AS datos_recien_nacidos -- Uso de COALESCE para evitar error si no hay RN
    GROUP_CONCAT(CONCAT(rn.sexo, ' - ', COALESCE(rn.peso, 'N/A'), 'kg') SEPARATOR ', ') AS datos_recien_nacidos 
FROM 
    partos pa
JOIN 
    registros r ON pa.id_registro = r.id_registro
JOIN 
    pacientes p ON r.id_paciente = p.id_paciente
LEFT JOIN 
    recien_nacidos rn ON pa.id_parto = rn.id_parto
GROUP BY 
    pa.id_parto, pa.fecha, pa.hora, pa.tipo_parto, 
    p.nombre, p.apellido, p.run;

-- ******************************************************
-- INSERCIÓN DE DATOS INICIALES
-- ******************************************************

-- Insertar usuarios iniciales (contraseñas hasheadas con bcrypt o similar)
INSERT INTO usuarios (nombre, apellido, rut, usuario_sistema, contrasena, tipo_usuario) VALUES
('Douglas', 'Meza', '13456789-0', 'dmeza', '$2a$10$placeholder_hash', 'TI'),
('Víctor', 'Torres', '14567890-1', 'vtorres', '$2a$10$placeholder_hash', 'Medico'),
('Andrés', 'Zurita', '15678901-2', 'azurita', '$2a$10$placeholder_hash', 'Enfermera'),
('Eric', 'Gutiérrez', '16789012-3', 'egutierrez', '$2a$10$placeholder_hash', 'Supervisor');

-- Insertar registros especializados para los usuarios
INSERT INTO encargados_ti (id_usuario) VALUES (1);
INSERT INTO medicos (id_usuario, especialidad) VALUES (2, 'Obstetricia');
INSERT INTO enfermeras (id_usuario, especialidad) VALUES (3, 'Materno-Infantil');
INSERT INTO supervisores (id_usuario) VALUES (4);

-- ******************************************************
-- CREACIÓN DE TRIGGERS
-- ******************************************************

-- Nota sobre Auditoría: Se usa id_usuario = 1 ('Sistema') por defecto.
-- En una aplicación real, se usaría un valor de sesión/contexto para el id_usuario real.

DELIMITER //

CREATE TRIGGER auditoria_pacientes_insert
AFTER INSERT ON pacientes
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (id_usuario, tipo_usuario, accion, tabla_afectada, id_registro_afectado, detalles)
    VALUES (1, 'Sistema', 'INSERT', 'pacientes', NEW.id_paciente, CONCAT('Nuevo paciente: ', NEW.nombre, ' ', NEW.apellido));
END//

CREATE TRIGGER auditoria_pacientes_update
AFTER UPDATE ON pacientes
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (id_usuario, tipo_usuario, accion, tabla_afectada, id_registro_afectado, detalles)
    VALUES (1, 'Sistema', 'UPDATE', 'pacientes', NEW.id_paciente, CONCAT('Actualización paciente: ', NEW.nombre, ' ', NEW.apellido));
END//

CREATE TRIGGER auditoria_pacientes_delete
AFTER DELETE ON pacientes
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (id_usuario, tipo_usuario, accion, tabla_afectada, id_registro_afectado, detalles)
    VALUES (1, 'Sistema', 'DELETE', 'pacientes', OLD.id_paciente, CONCAT('Eliminación paciente: ', OLD.nombre, ' ', OLD.apellido));
END//

-- ******************************************************
-- CREACIÓN DE PROCEDIMIENTOS ALMACENADOS
-- ******************************************************

-- Crear procedimiento almacenado para generar informe REM BS22
CREATE PROCEDURE generar_rem_bs22(IN p_periodo VARCHAR(20))
BEGIN
    DECLARE v_total_partos INT DEFAULT 0;
    DECLARE v_partos_vaginales INT DEFAULT 0;
    DECLARE v_cesareas_electivas INT DEFAULT 0;
    DECLARE v_cesareas_urgencia INT DEFAULT 0;
    
    SELECT 
        total_partos, 
        partos_vaginales, 
        cesareas_electivas, 
        cesareas_urgencia 
    INTO 
        v_total_partos, 
        v_partos_vaginales, 
        v_cesareas_electivas, 
        v_cesareas_urgencia
    FROM estadisticas
    WHERE periodo = p_periodo
    LIMIT 1;
    
    INSERT INTO informes (id_usuario_genera, tipo_informe, fecha_generacion, periodo_informe, contenido_informe, estado_informe)
    VALUES (
        1, -- Asume que el usuario 1 es el generador por defecto o el 'Sistema'
        'REM BS22', 
        CURRENT_DATE(), 
        p_periodo, 
        CONCAT(
            'Total de partos: ', COALESCE(v_total_partos, 0), '\n',
            'Partos vaginales: ', COALESCE(v_partos_vaginales, 0), '\n',
            'Cesáreas electivas: ', COALESCE(v_cesareas_electivas, 0), '\n',
            'Cesáreas de urgencia: ', COALESCE(v_cesareas_urgencia, 0)
        ), 
        'Generado'
    );
END//

DELIMITER ;