export interface Persona {
  id: number;
  nombre: string;
  telegram_id: string;
  almuerzo: string; 
  limpieza: string;
  veces_almuerzo: number;
  veces_limpieza: number;
  ultimo_almuerzo: string | null;
  ultima_limpieza: string | null;
  updated_at: string;
  rebotes: number;
}

export interface ResultadoSorteo {
  almuerzo: Persona[];
  limpieza: Persona;
}