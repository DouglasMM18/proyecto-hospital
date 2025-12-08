// Tipos basados en los modelos Django del backend

export interface Madre {
  id: number;
  rut: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  comuna: string;
  cesfam: string | null;
  nacionalidad: string;
  es_migrante: boolean;
  pueblo_originario: boolean;
  partos?: Parto[];
}

export interface Parto {
  id: number;
  madre: number;
  fecha: string;
  hora: string;
  tipo_parto: 'EUTOCICO' | 'CESAREA URGENCIA' | 'CESAREA ELECTIVA' | 'FORCEPS' | 'VACUUM';
  edad_gestacional: number;
  profesional_acargo: string;
  created_at: string;
  updated_at: string;
  recien_nacidos?: RecienNacido[];
}

export interface RecienNacido {
  id: number;
  parto: number;
  sexo: 'FEMENINO' | 'MASCULINO' | 'INDETERMINADO';
  peso_gramos: number;
  talla_cm: number;
  circunferencia_craneal: number;
  apgar_1: number;
  apgar_5: number;
  vacuna_bcg: boolean;
  vacuna_hepatitis_b: boolean;
  screening_auditivo: boolean;
  observaciones: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}