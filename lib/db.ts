import mysql from 'mysql2/promise';

// Definimos el tipo para que TS sepa qué es 'pool'
let pool: mysql.Pool;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta la variable DATABASE_URL");
}

// Usamos el patrón global para evitar múltiples conexiones en desarrollo
const globalForMysql = global as unknown as { pool: mysql.Pool };

if (!globalForMysql.pool) {
  globalForMysql.pool = mysql.createPool(connectionString);
}

pool = globalForMysql.pool;

export default pool;