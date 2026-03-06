import mysql from 'mysql2/promise';

// Tipamos el objeto global de forma más robusta para Next.js
const globalForMysql = global as unknown as {
  pool: mysql.Pool | undefined;
};

// Si ya existe el pool (en desarrollo), lo usamos; si no, lo creamos
export const pool: mysql.Pool =
  globalForMysql.pool ??
  mysql.createPool(process.env.DATABASE_URL as string);

if (process.env.NODE_ENV !== 'production') {
  globalForMysql.pool = pool;
}

// Exportamos por defecto para que tus otros archivos no fallen
export default pool;