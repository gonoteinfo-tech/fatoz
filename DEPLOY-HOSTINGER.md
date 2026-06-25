# 🚀 Deploy do fatoz na Hostinger (Hospedagem Node.js)

Guia para publicar em **fatoz.com.br** usando o recurso **"Configurar aplicativo Node.js"** do hPanel (não é VPS).

> Requer um plano de hospedagem que tenha a opção **"Node.js"** no hPanel (geralmente Premium/Business). A hospedagem só-PHP não roda este app.

---

## 1. Enviar os arquivos
Suba a pasta do projeto para o servidor (Gerenciador de Arquivos ou SFTP), **sem**:
- `node_modules`
- `.next`
- `.env`

Coloque numa pasta dedicada, ex.: `/home/usuario/fatoz` ou `domains/fatoz.com.br/app`.

---

## 2. Criar o app Node.js no hPanel
No hPanel: **Avançado → Node.js → Criar aplicativo**, e preencha:

| Campo | Valor |
|---|---|
| **Versão do Node.js** | 18 ou superior |
| **Raiz do aplicativo** | a pasta onde você subiu o projeto |
| **URL do aplicativo** | fatoz.com.br |
| **Arquivo de inicialização** | `server.js` |

> O **`server.js`** já está incluído no projeto — é o ponto de entrada que o Passenger da Hostinger executa.

---

## 3. Variáveis de ambiente
Ainda na tela do app Node.js, adicione as **variáveis de ambiente** (ou crie um arquivo `.env` na raiz):

```
NEXT_PUBLIC_SITE_URL = https://fatoz.com.br
DATABASE_URL         = file:./prod.db
ADMIN_EMAIL          = seu-email@fatoz.com.br
ADMIN_PASSWORD       = LrtQylyofj!Fz9
AUTH_SECRET          = 67f1a45d6752cd10b80152fa540434a48ed1b86dab2d6d4a569cbb25127377ff
CRON_SECRET          = 14151a084bef558cb5107fb141995950
```

(Valores já gerados de forma segura — troque o e-mail e, se quiser, a senha.)

---

## 4. Instalar dependências e compilar
Na tela do app Node.js há botões/terminal para rodar comandos:

1. **Executar npm install** (instala as dependências)
2. **Rodar o build** — no terminal NodeJS do hPanel:
   ```bash
   npm run build
   ```
   Isso gera o Prisma, cria o banco `prod.db` e compila o Next (pasta `.next`).
3. **Reiniciar o aplicativo** (botão "Restart").

> 💡 **Se o build falhar por falta de memória** no servidor: rode `npm run build` **na sua máquina** e suba a pasta `.next` já pronta junto com o projeto (e rode só o `npm install` no servidor).

---

## 5. Banco de dados (SQLite)
- O build cria um `prod.db` **vazio** — depois é só configurar tudo pelo `/admin`.
- Para **trazer suas configurações atuais** (logo, feeds, categorias, SEO): suba o `dev.db` da sua máquina para a raiz do projeto no servidor **renomeado para `prod.db`**.

> Na hospedagem Node.js da Hostinger o disco é persistente, então o `prod.db` se mantém entre reinícios.

---

## 6. Acessar e configurar
1. Abra **https://fatoz.com.br** e **https://fatoz.com.br/admin**
2. Login com `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. **Configurações:** cole a chave de IA (OpenAI/Gemini/Claude) e a **API-Football**
4. **Aparência → SEO:** confirme a URL, suba a imagem Open Graph e cole o código do Google Search Console
5. **Feeds:** revise os feeds RSS

---

## 7. Publicação automática (Cron)
No hPanel: **Avançado → Cron Jobs**, crie um trabalho a cada 30 min:

```
*/30 * * * *   curl -s "https://fatoz.com.br/api/cron?secret=14151a084bef558cb5107fb141995950" >/dev/null 2>&1
```

(Use o mesmo `CRON_SECRET` definido nas variáveis.)

---

## 8. SEO pós-deploy
Envie os sitemaps no **Google Search Console**:
- `https://fatoz.com.br/sitemap.xml`
- `https://fatoz.com.br/news-sitemap.xml`

`robots.txt` e `manifest.webmanifest` são gerados automaticamente.

---

## ✅ Checklist
- [ ] Arquivos enviados (sem node_modules/.next/.env)
- [ ] App Node.js criado com **arquivo de inicialização = `server.js`**
- [ ] Variáveis de ambiente definidas
- [ ] `npm install` + `npm run build` executados
- [ ] App reiniciado e abrindo em https://fatoz.com.br
- [ ] HTTPS/SSL ativo no domínio
- [ ] Login no `/admin` ok
- [ ] Chaves de IA e API-Football configuradas
- [ ] Cron job criado
- [ ] Sitemaps enviados ao Search Console

---

### Observações importantes
- **Não é VPS:** não precisa de PM2 nem Nginx — o Passenger da Hostinger gerencia o processo a partir do `server.js`.
- **Sempre que mudar variáveis ou código:** clique em **Restart** no app Node.js do hPanel.
- **Memória limitada:** se o site ficar lento sob carga, considere subir de plano ou migrar o banco para MySQL (posso converter).
