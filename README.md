# Neon Auth Backend (Prisma + Postgres)

API de autenticação simples (registro, login e perfil) usando Prisma e Postgres (Neon), pronta para deploy no Render.

## Requisitos
- Node.js 18+ (recomendado 20+ se usar Prisma 7)
- Conta no [Neon](https://neon.tech/) para Postgres
- Conta no [Render](https://render.com/) para deploy

## Configuração Local
- Clone o projeto ou use a pasta `neon-auth-backend`
- Instale dependências:
  - `npm install`
- Configure variáveis de ambiente:
  - Copie `/.env.example` para `/.env`
  - Preencha `DATABASE_URL` com a string do Neon (inclua `sslmode=require`)
  - Defina `JWT_SECRET` (chave forte) e `PORT` (opcional)
- Gere o Prisma Client:
  - `npx prisma generate`
- Crie as tabelas no banco:
  - `npx prisma db push`
- Inicie em desenvolvimento:
  - `npm run dev`
- Teste saúde da API:
  - `GET http://localhost:3001/health`

## Endpoints
- `POST /api/auth/register`
  - Body: `{ "name": "Nome", "email": "email@dominio.com", "password": "segredo123" }`
  - Retorna: `{ user: { id, name, email, createdAt }, token }`
- `POST /api/auth/login`
  - Body: `{ "email": "email@dominio.com", "password": "segredo123" }`
  - Retorna: `{ user: { id, name, email }, token }`
- `GET /api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Retorna: `{ user: { id, name, email, createdAt } }`

## Exemplo de Consumo (JavaScript)
- Registro:
  ```js
  await fetch('https://SEU-SERVICO.onrender.com/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Guilherme', email: 'guilherme@example.com', password: 'segredo123' })
  });
  ```
- Login:
  ```js
  const res = await fetch('https://SEU-SERVICO.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'guilherme@example.com', password: 'segredo123' })
  });
  const { token } = await res.json();
  ```
- Perfil:
  ```js
  await fetch('https://SEU-SERVICO.onrender.com/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  ```

## Deploy no Render
- Crie um Web Service apontando para `neon-auth-backend`
- Define Environment Variables:
  - `DATABASE_URL` (Neon, com `sslmode=require`)
  - `JWT_SECRET` (chave forte)
  - `PORT` (opcional, Render pode definir)
- Comandos:
  - Build: `npm install && npx prisma generate`
  - Start: `npm run db:push && npm start`
- Após o deploy, teste `GET https://SEU-SERVICO.onrender.com/health`

## Observações
- Senhas são armazenadas com `bcrypt` (hash) e nunca em texto puro
- Tokens são JWT; mantenha `JWT_SECRET` seguro
- Se usar Prisma 7, atualize Node para 20.19+ conforme exigência do Prisma

## Integração com outro projeto
- Para usar o backend atual com este serviço, configure a origem das rotas via proxy externo:
  - Defina `DATA_SERVICE_BASE_URL=https://SEU-SERVICO.onrender.com/api`
  - Faça as requisições para o backend local que repassa para o novo serviço
