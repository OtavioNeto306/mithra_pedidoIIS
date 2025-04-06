import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar o dotenv para carregar o arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const router = express.Router();

// Conexão com MySQL (apenas para pedidos)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

// Conexão com SQLite (para autenticação)
let db;
(async () => {
  db = await open({
    filename: join(__dirname, '..', 'usuarios.db3'),
    driver: sqlite3.Database
  });
})();

// Rota de registro
router.post('/register', async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    // Validações
    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    if (senha.length > 20) {
      return res.status(400).json({ error: 'A senha deve ter no máximo 20 caracteres' });
    }

    // Verificar se o usuário já existe
    const existingUser = await db.get('SELECT USUARIO FROM USERCC WHERE USUARIO = ?', [usuario]);

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir novo usuário
    await db.run(
      'INSERT INTO USERCC (USUARIO, PASSWORD, NOME, USERNAME, UACESSO, BLOQUEADO) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario, hashedPassword, usuario, usuario, 'U', 0]
    );

    // Buscar os dados do usuário recém-criado
    const newUser = await db.get('SELECT * FROM USERCC WHERE USUARIO = ?', [usuario]);
    const { PASSWORD, ...userData } = newUser;

    res.status(201).json(userData);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao registrar usuário. Por favor, tente novamente.' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  console.log('Tentativa de login para usuário:', usuario);

  try {
    // Validações
    if (!usuario || !senha) {
      console.log('Campos obrigatórios não preenchidos');
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Buscar usuário
    const user = await db.get('SELECT * FROM USERCC WHERE USUARIO = ?', [usuario]);
    console.log('Resultado da busca:', user ? 'Usuário encontrado' : 'Usuário não encontrado');

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    // Verificar se o usuário está bloqueado
    if (user.BLOQUEADO === 1) {
      return res.status(401).json({ error: 'Usuário bloqueado. Entre em contato com o administrador.' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.PASSWORD);
    console.log('Senha válida:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    // Retornar dados do usuário (exceto a senha)
    const { PASSWORD, ...userData } = user;
    console.log('Dados do usuário a serem enviados:', userData);

    // Garantir que todos os campos necessários existem
    const responseData = {
      USUARIO: userData.USUARIO,
      NOME: userData.NOME || userData.USUARIO,
      GRAU: userData.UACESSO || 'U',
      LOJAS: 'N',
      MODULO: 'N',
      BANCOS: 'N',
      LIMICP: 'N',
      CCUSTO: 'N',
      ARMAZEN: 'N',
      COMISSAO: 0
    };

    console.log('Dados finais a serem enviados:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login. Por favor, tente novamente.' });
  }
});

// Rota para buscar pedidos (mantida com MySQL)
router.get('/pedidos', async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT 
        numero,
        cliente,
        emissao,
        status,
        valor
      FROM cabpdv
      ORDER BY emissao DESC
      LIMIT 50
    `);

    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos. Por favor, tente novamente.' });
  }
});

// Rota para buscar usuários
router.get('/users', async (req, res) => {
  try {
    const users = await db.all(`
      SELECT 
        USUARIO,
        NOME,
        UACESSO as GRAU
      FROM USERCC
      ORDER BY NOME
    `);
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rota para atualizar permissões de um usuário
router.put('/users/:usuario/permissions', async (req, res) => {
  const { usuario } = req.params;
  const { permissoes } = req.body;

  try {
    // Verifica se o usuário existe
    const userExists = await db.get('SELECT USUARIO FROM USERCC WHERE USUARIO = ?', [usuario]);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualiza o acesso do usuário baseado na permissão de sistema completo
    const uacesso = permissoes.sistema_completo ? 'S' : 'V'; // S = Administrador, V = Vendedor

    // Atualiza as permissões do usuário
    await db.run(`
      UPDATE USERCC 
      SET UACESSO = ?
      WHERE USUARIO = ?
    `, [uacesso, usuario]);

    res.json({ message: 'Permissões atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro ao atualizar permissões' });
  }
});

// Rota para atualizar comissão de um usuário
router.put('/users/:usuario/comissao', async (req, res) => {
  const { usuario } = req.params;
  const { comissao } = req.body;

  try {
    // Validação da comissão
    if (typeof comissao !== 'number') {
      return res.status(400).json({ error: 'A comissão deve ser um número' });
    }

    if (comissao < 0 || comissao > 100) {
      return res.status(400).json({ error: 'A comissão deve estar entre 0 e 100' });
    }

    // Verifica se o usuário existe
    const userExists = await db.get('SELECT USUARIO FROM USERCC WHERE USUARIO = ?', [usuario]);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualiza a comissão do usuário (mantida no MySQL para compatibilidade)
    await pool.query(`
      UPDATE senhas 
      SET COMISSAO = ?
      WHERE USUARIO = ?
    `, [comissao, usuario]);

    res.json({ message: 'Comissão atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar comissão:', error);
    res.status(500).json({ error: 'Erro ao atualizar comissão' });
  }
});

export default router;