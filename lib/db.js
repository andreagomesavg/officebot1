import mysql from 'mysql2/promise';

// Creamos una variable para el pool
let pool;

if (!pool) {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("Falta la variable DATABASE_URL en el archivo .env.local");
  }

  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 5, // Importante para no saturar JawsDB
    queueLimit: 0,
    // Esto ayuda a evitar errores de timeout en entornos serverless
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

export default pool;