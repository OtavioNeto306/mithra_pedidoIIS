# 📚 Documentação da API

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
4. [Erros Comuns](#erros-comuns)
5. [Guia de Uso](#guia-de-uso)
6. [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
7. [Exemplos Práticos](#exemplos-práticos)

## 🌐 Visão Geral

Base URL: `http://localhost:3000/api`

### Versão da API
- Versão atual: v1
- Data da última atualização: 14/03/2024

### Formatos
- Todas as requisições devem usar JSON
- Encode: UTF-8
- Content-Type: application/json
- Timezone: UTC

### Ambientes
```
Desenvolvimento: http://localhost:3000/api
Homologação: http://hml-api.seudominio.com/api
Produção: http://api.seudominio.com/api
```

## 🔐 Autenticação

### Headers Necessários
```http
Authorization: Bearer {seu-token}
Content-Type: application/json
Accept: application/json
```

### Fluxo de Autenticação

1. **Registro**
2. **Login** (recebe token)
3. **Usar token** nas requisições subsequentes

## 📍 Endpoints

### 👤 Autenticação

#### Registro de Usuário

```http
POST /auth/register
```

##### Request Body
```json
{
  "usuario": "joao.silva",
  "senha": "Senha@123",
  "nome": "João Silva"  // opcional
}
```

##### Regras de Validação
| Campo    | Tipo   | Regras                                    |
|----------|--------|-------------------------------------------|
| usuario  | string | - Obrigatório                             |
|          |        | - Único no sistema                        |
|          |        | - 3-16 caracteres                         |
|          |        | - Apenas letras, números e ponto          |
| senha    | string | - Obrigatório                             |
|          |        | - 6-20 caracteres                         |
|          |        | - Ao menos 1 número                       |
|          |        | - Ao menos 1 caractere especial           |
| nome     | string | - Opcional                                |
|          |        | - 3-50 caracteres                         |

##### Exemplo de Sucesso
`201 Created`
```json
{
  "USUARIO": "joao.silva",
  "NOME": "João Silva",
  "UACESSO": "U",
  "BLOQUEADO": 0
}
```

##### Exemplos de Erro

`400 Bad Request` - Usuário já existe
```json
{
  "error": "Usuário já cadastrado",
  "code": "USER_EXISTS"
}
```

`400 Bad Request` - Senha inválida
```json
{
  "error": "A senha deve conter ao menos 6 caracteres",
  "code": "INVALID_PASSWORD"
}
```

#### Login

```http
POST /auth/login
```

##### Request Body
```json
{
  "usuario": "joao.silva",
  "senha": "Senha@123"
}
```

##### Exemplo de Sucesso
`200 OK`
```json
{
  "USUARIO": "joao.silva",
  "NOME": "João Silva",
  "GRAU": "V",
  "LOJAS": "S",
  "MODULO": "N",
  "BANCOS": "N",
  "LIMICP": "N",
  "CCUSTO": "N",
  "ARMAZEN": "N",
  "COMISSAO": 5,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 👥 Gerenciamento de Usuários

#### Listar Usuários

```http
GET /auth/users
```

##### Parâmetros de Query
| Parâmetro | Tipo    | Descrição                    |
|-----------|---------|------------------------------|
| page      | number  | Página atual (default: 1)    |
| limit     | number  | Itens por página (max: 50)   |
| search    | string  | Busca por nome ou usuário    |
| grau      | string  | Filtro por nível de acesso   |

##### Exemplo de Sucesso
`200 OK`
```json
{
  "users": [
    {
      "USUARIO": "joao.silva",
      "NOME": "João Silva",
      "GRAU": "V"
    }
  ],
  "pagination": {
    "total": 50,
    "pages": 5,
    "current_page": 1,
    "per_page": 10
  }
}
```

#### Atualizar Permissões

```http
PUT /auth/users/:usuario/permissions
```

##### Request Body
```json
{
  "permissoes": {
    "sistema_completo": true,
    "motivo": "Promoção para gerente"  // opcional
  }
}
```

##### Exemplo de Sucesso
`200 OK`
```json
{
  "message": "Permissões atualizadas com sucesso",
  "user": {
    "USUARIO": "joao.silva",
    "NOME": "João Silva",
    "GRAU": "S"
  }
}
```

### 📦 Sistema de Pedidos

#### Listar Pedidos

```http
GET /auth/pedidos
```

##### Parâmetros de Query
| Parâmetro    | Tipo    | Descrição                          |
|--------------|---------|-----------------------------------|
| start_date   | string  | Data inicial (YYYY-MM-DD)         |
| end_date     | string  | Data final (YYYY-MM-DD)          |
| status       | string  | Filtro por status                 |
| cliente      | string  | Busca por nome do cliente         |
| page         | number  | Página atual                      |
| limit        | number  | Itens por página (max: 50)        |

##### Exemplo de Sucesso
`200 OK`
```json
{
  "pedidos": [
    {
      "numero": "PED001",
      "cliente": "Empresa ABC",
      "emissao": "2024-03-14T10:30:00Z",
      "status": "APROVADO",
      "valor": 1500.50,
      "itens": 5
    }
  ],
  "totais": {
    "quantidade": 50,
    "valor_total": 75000.00
  },
  "pagination": {
    "total": 50,
    "pages": 5,
    "current_page": 1,
    "per_page": 10
  }
}
```

## ❌ Erros Comuns

### Códigos de Status HTTP

| Código | Descrição                  | Quando Ocorre                                      |
|--------|----------------------------|---------------------------------------------------|
| 200    | OK                        | Requisição bem-sucedida                           |
| 201    | Created                   | Recurso criado com sucesso                        |
| 400    | Bad Request               | Dados inválidos ou faltando                       |
| 401    | Unauthorized              | Token ausente ou inválido                         |
| 403    | Forbidden                 | Sem permissão para o recurso                      |
| 404    | Not Found                 | Recurso não encontrado                            |
| 429    | Too Many Requests         | Limite de requisições excedido                    |
| 500    | Internal Server Error     | Erro interno no servidor                          |

### Estrutura de Erro
```json
{
  "error": "Mensagem de erro",
  "code": "CODIGO_ERRO",
  "details": {
    "campo": ["descrição do erro"]
  }
}
```

## 📝 Notas Importantes

### Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1500000000
```

### Paginação
```http
Link: <https://api.exemplo.com/users?page=2>; rel="next",
      <https://api.exemplo.com/users?page=5>; rel="last"
X-Total-Count: 50
```

### Cache
```http
Cache-Control: private, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

## 🚀 Exemplos Práticos

### cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "joao.silva",
    "senha": "Senha@123"
  }'
```

#### Listar Pedidos com Filtros
```bash
curl -X GET 'http://localhost:3000/api/auth/pedidos?start_date=2024-03-01&status=APROVADO' \
  -H "Authorization: Bearer seu-token"
```

### JavaScript (Fetch)
```javascript
// Login
async function login(usuario, senha) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ usuario, senha })
  });
  
  const data = await response.json();
  return data;
}

// Listar Pedidos
async function getPedidos(token) {
  const response = await fetch('http://localhost:3000/api/auth/pedidos', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
}
```

## 🛠️ Ambiente de Desenvolvimento

### Requisitos
- Node.js 18+
- npm ou yarn
- SQLite 3
- MySQL 8+

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-projeto.git

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env

# Inicie o servidor
npm run dev
```

### Variáveis de Ambiente (.env)
```env
# Banco de dados
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=seu_banco

# API
PORT=3000
NODE_ENV=development
RATE_LIMIT=100
JWT_SECRET=seu_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testes

### Executar Todos os Testes
```bash
npm test
```

### Testes Específicos
```bash
# Testes de autenticação
npm test -- --grep "Auth"

# Testes de pedidos
npm test -- --grep "Pedidos"
```

### Coverage
```bash
npm run test:coverage
``` 