import mysql from 'mysql2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar o dotenv para carregar o arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    console.log('Configurações:', {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE
    });

    const [result] = await pool.query('SELECT 1');
    console.log('Conexão bem sucedida!', result);
    return true;
  } catch (error) {
    console.error('Erro ao conectar:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

testConnection(); 