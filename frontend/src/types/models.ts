export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface DecodedToken {
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: number;
  username: string;
  rol: 'ADMINISTRADOR' | 'ENFERMERA' | 'MATRONA' | 'SUPERVISOR' | 'TI';
}

export interface Madre {
  id?: number;
  rut: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  comuna: string;
  cesfam?: string | null;
  nacionalidad: string;
  es_migrante: boolean;
  pueblo_originario: boolean;
  direccion?: string;
  telefono?: string;
  partos?: Parto[];
}

export interface Parto {
  id?: number;
  madre: number;
  fecha: string;
  hora: string;
  tipo_parto: string;
  edad_gestacional: number;
  profesional_acargo: string;
  observaciones?: string;
  recien_nacidos?: RecienNacido[];
}

export interface RecienNacido {
  id?: number;
  parto?: number;
  sexo: string;
  peso_gramos: number;
  talla_cm: number;
  circunferencia_craneal?: number;
  apgar_1: number;
  apgar_5: number;
  vacuna_bcg: boolean;
  vacuna_hepatitis_b: boolean;
  screening_auditivo: boolean;
  profilaxis_ocular?: boolean;
  observaciones?: string;
}