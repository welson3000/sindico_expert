# 🏢 Síndico Expert — Plataforma de Gestão e Cotações para Condomínios

O **Síndico Expert** é um SaaS completo projetado para simplificar a gestão de manutenção predial, elaboração de dossiês técnicos com registros fotográficos, planilha de quantitativos (BOQ), cotações de fornecedores com **Blind Bidding** (sigilo concorrencial) e geração de mapas comparativos de preços automatizados.

---

## 🛠️ Arquitetura e Tecnologias

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) com Server Components e Server Actions
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4 & Shadcn UI
- **Autenticação:** [NextAuth.js v5 (Beta)](https://next-auth.js.org/) com JWT e controle de papéis (`ADMIN_SINDICO`, `ADMIN_ADM`, `FORNECEDOR`)
- **Banco de Dados:** [Neon PostgreSQL Serverless](https://neon.tech/) (banco de dados `sindico_expert`)
- **ORM & Migrações:** [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
- **Validação de Dados:** Zod

---

## 🚀 Instalação e Execução Local

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie o arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://neondb_owner:[SUA_SENHA]@[SEU_ENDPOINT].neon.tech/sindico_expert?sslmode=require"
NEXTAUTH_SECRET="sua-chave-secreta-de-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Sincronizar o Banco de Dados no Neon (`sindico_expert`)
Execute o push do schema Drizzle diretamente para o seu banco de dados Neon:
```bash
npm run db:push
```

### 4. Popular o Banco com Dados Iniciais (Seed)
```bash
npm run db:seed
```
*Credenciais de teste geradas:*
- **Síndico:** `sindico@master.com` / Senha: `123456`
- **Fornecedor:** `contato@xyz.com` / Senha: `123456`

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🗄️ Guia de Migrações e Neon Database

1. **Schema do Banco de Dados:** Definido em `src/db/schema/index.ts`.
2. **Gerar arquivos SQL de migração (opcional):**
   ```bash
   npm run db:generate
   ```
3. **Aplicar alterações diretamente no Neon:**
   ```bash
   npm run db:push
   ```
4. **Visualização no Neon Console:**
   - Ao acessar a aba *Tables* ou *SQL Editor* no painel do Neon (`console.neon.tech`), certifique-se de selecionar o banco de dados **`sindico_expert`** no menu suspenso do topo (por padrão o Neon exibe `neondb`).

---

## ☁️ Checklist de Deploy em Produção (Vercel)

### 1. Conectar Repositório
No painel da [Vercel](https://vercel.com/), importe o repositório GitHub do projeto.

### 2. Configurar Variáveis de Ambiente na Vercel
Adicione as seguintes variáveis no painel da Vercel (*Settings -> Environment Variables*):

| Variável | Valor Recomendado |
| :--- | :--- |
| `DATABASE_URL` | String de conexão do Neon apontando para `/sindico_expert` |
| `NEXTAUTH_SECRET` | String aleatória de no mínimo 32 caracteres |
| `NEXTAUTH_URL` | URL de produção da Vercel (ex: `https://sindico-expert.vercel.app`) |

### 3. Build & Deploy
- **Build Command:** `npm run build`
- **Output Directory:** Default Next.js (`.next`)

---

## 🔒 Auditoria de Segurança & Blind Bidding

- **Isolamento Multi-tenant:** Todas as consultas no backend são filtradas rigorosamente pela organização vinculada ao usuário autenticado.
- **Sigilo Concorrencial (Blind Bidding):** O endpoint e server action de cotação do fornecedor consultam **exclusivamente** a proposta do *próprio* usuário logado. Propostas e valores de fornecedores concorrentes jamais são expostos no bundle de cliente ou respostas de API.
- **Trava de Limite:** Máximo de 5 fornecedores por solicitação de cotação, garantindo igualdade no processo licitatório.

---

## 📄 Licença
Projeto desenvolvido para a plataforma SaaS **Síndico Expert**. Todos os direitos reservados.
