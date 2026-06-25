# LabNews System

Plataforma de automação de conteúdo inspirada no labnews.pro — monitora feeds RSS, reescreve as notícias com IA de forma original e otimizada para SEO, e publica num site de notícias próprio (com opção de espelhar no WordPress).

## ✨ Funcionalidades

- **Feeds RSS**: cadastre quantos feeds quiser, organizados por categoria.
- **Reescrita por IA multi-provedor**: escolha entre **Google Gemini**, **Claude (Anthropic)** ou **OpenAI** — configurável no painel, sem mexer no código.
- **SEO automático**: cada notícia recebe meta título, meta descrição, palavras-chave, slug, JSON-LD (NewsArticle), Open Graph e Twitter Cards.
- **Pipeline automático**: importa → reescreve → publica. Pode publicar automaticamente ou deixar como rascunho para revisão.
- **Site público de notícias**: home com destaque, páginas por categoria, página de artigo, relacionadas, contador de visualizações.
- **Painel admin**: dashboard com métricas, gestão de feeds, fila de artigos (pendentes/rascunhos/publicados/erros), editor completo de artigos e SEO.
- **Automação por cron**: endpoint protegido para rodar o pipeline em intervalos (Vercel Cron, cron-job.org, etc.).
- **Integração WordPress (opcional)**: publica os artigos via REST API usando Application Password.
- **Sitemap.xml, robots.txt e feed.xml** gerados automaticamente.

## 🚀 Como rodar localmente

```bash
npm install
cp .env.example .env   # ajuste as variáveis (no Windows: copy)
npm run db:push        # cria o banco SQLite
npm run dev
```

Acesse:
- Site público: http://localhost:3000
- Painel admin: http://localhost:3000/admin (login definido em `.env`)

### Login padrão (.env)
- E-mail: `admin@labnews.local`
- Senha: `admin123`  ← **troque em produção**

## ⚙️ Configuração

1. Entre em **/admin → Configurações**.
2. Escolha o provedor de IA e cole a chave de API. Use **Testar conexão**.
3. Em **Feeds RSS**, adicione URLs de feeds. Marque "publicar automaticamente" se quiser.
4. Clique em **Executar pipeline agora** no dashboard (ou configure o cron).

## 🔑 Onde obter as chaves de IA

- **Gemini** (tem tier gratuito): https://aistudio.google.com/apikey
- **Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys

## 🤖 Automação (cron)

Agende uma chamada GET periódica:

```
GET https://SEU-DOMINIO/api/cron?secret=SEU_CRON_SECRET
```

Na Vercel, o `vercel.json` já inclui um cron a cada 30 minutos (ajuste o secret).

## 🏗️ Stack

Next.js 14 (App Router) · TypeScript · Prisma · SQLite · Tailwind CSS.

> Para produção com mais tráfego, troque o SQLite por PostgreSQL alterando o `datasource` em `prisma/schema.prisma` e a `DATABASE_URL`.
