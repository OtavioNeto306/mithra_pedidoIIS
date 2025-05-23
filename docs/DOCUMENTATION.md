# Documentação do Sistema de Autenticação e Pedidos

## 🏗️ Arquitetura do Sistema

O sistema utiliza uma arquitetura híbrida com dois bancos de dados:
- **SQLite** (usuarios.db3): Gerenciamento de usuários e autenticação
- **MySQL**: Gerenciamento de pedidos e dados do negócio

### Estrutura do Banco SQLite (Autenticação)

```sql
CREATE TABLE USERCC (
  USUARIO    TEXT PRIMARY KEY,
  NOME       TEXT,
  USERNAME   TEXT,
  PASSWORD   TEXT,
  UACESSO    TEXT,
  BLOQUEADO  INTEGER
);
```

### Níveis de Acesso (UACESSO)
- `S`: Administrador (Sistema Completo)
- `V`: Vendedor
- `U`: Usuário Básico (Padrão no registro)

## 🔐 Sistema de Autenticação

### Registro de Usuário
- **Endpoint**: POST `/api/auth/register`
- **Payload**:
```json
{
  "usuario": "string",
  "senha": "string"
}
```
- **Validações**:
  - Campos obrigatórios
  - Senha: 6-20 caracteres
  - Usuário único no sistema
- **Processo**:
  1. Validação dos dados
  2. Hash da senha com bcrypt
  3. Criação do usuário com nível 'U'

### Login
- **Endpoint**: POST `/api/auth/login`
- **Payload**:
```json
{
  "usuario": "string",
  "senha": "string"
}
```
- **Validações**:
  - Campos obrigatórios
  - Usuário existe
  - Senha correta
  - Usuário não bloqueado
- **Resposta**:
```json
{
  "USUARIO": "string",
  "NOME": "string",
  "GRAU": "string",
  "LOJAS": "string",
  "MODULO": "string",
  "BANCOS": "string",
  "LIMICP": "string",
  "CCUSTO": "string",
  "ARMAZEN": "string",
  "COMISSAO": number
}
```

## 👥 Gerenciamento de Usuários

### Listar Usuários
- **Endpoint**: GET `/api/auth/users`
- **Resposta**: Lista de usuários com USUARIO, NOME e GRAU

### Atualizar Permissões
- **Endpoint**: PUT `/api/auth/users/:usuario/permissions`
- **Payload**:
```json
{
  "permissoes": {
    "sistema_completo": boolean
  }
}
```

### Atualizar Comissão
- **Endpoint**: PUT `/api/auth/users/:usuario/comissao`
- **Payload**:
```json
{
  "comissao": number
}
```
- **Validações**: Valor entre 0 e 100

## 📦 Sistema de Pedidos

### Listar Pedidos
- **Endpoint**: GET `/api/auth/pedidos`
- **Resposta**: Lista dos 50 pedidos mais recentes com:
  - numero
  - cliente
  - emissao
  - status
  - valor

## 🛠️ Configuração do Ambiente

### Dependências Principais
```json
{
  "express": "^4.x.x",
  "sqlite3": "^5.x.x",
  "sqlite": "^4.x.x",
  "mysql2": "^2.x.x",
  "bcrypt": "^5.x.x"
}
```

### Variáveis de Ambiente (.env)
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

## 🤖 Prompts Sugeridos para IA

### 1. Criação Inicial do Projeto
```
Crie um sistema de autenticação com as seguintes características:
- Usar SQLite para autenticação (usuarios.db3)
- Usar MySQL para dados de negócio
- Implementar registro e login de usuários
- Níveis de acesso: Administrador (S), Vendedor (V) e Usuário (U)
- Usar bcrypt para senhas
- Validações de campos
- Estrutura de arquivos organizada
```

### 2. Implementação de Novas Funcionalidades
```
Adicione ao sistema de autenticação:
- Rota para listar usuários
- Rota para atualizar permissões
- Rota para gerenciar comissões
- Integração com sistema de pedidos
- Logs de ações
```

### 3. Segurança e Validações
```
Implemente medidas de segurança:
- Validação de campos
- Proteção contra SQL Injection
- Rate limiting
- Sanitização de inputs
- Logs de tentativas de login
```

### 4. Frontend Integration
```
Crie um frontend React com:
- Páginas de login e registro
- Dashboard administrativo
- Gerenciamento de usuários
- Visualização de pedidos
- Proteção de rotas
```

### 5. Testes e Documentação
```
Desenvolva:
- Testes unitários para autenticação
- Testes de integração
- Documentação da API
- Guia de deployment
```

## 📝 Boas Práticas

1. **Segurança**
   - Sempre use hash para senhas
   - Implemente rate limiting
   - Valide todos os inputs
   - Use prepared statements

2. **Organização**
   - Separe rotas em arquivos
   - Use middlewares para validação
   - Mantenha logs detalhados
   - Documente todas as rotas

3. **Performance**
   - Use conexões pooling
   - Implemente cache quando possível
   - Limite resultados de queries
   - Monitore tempos de resposta

4. **Manutenção**
   - Mantenha versionamento do banco
   - Documente mudanças
   - Use padrões de código
   - Faça backup regular

## 🔄 Fluxo de Desenvolvimento

1. Clone o repositório
2. Instale dependências
3. Configure variáveis de ambiente
4. Inicie o servidor de desenvolvimento
5. Execute testes
6. Faça deploy

## 🚀 Deploy

1. Configure variáveis de ambiente de produção
2. Execute migrations do banco
3. Build da aplicação
4. Configure servidor web
5. Configure SSL/TLS
6. Monitore logs e performance
