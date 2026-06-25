# 🚀 Deploy do fatoz no seu VPS Linux (Nginx + PM2)

Você já tem 2 apps rodando — o fatoz entra como um **3º app**, numa **porta própria**, sem mexer nos outros.

---

## 1. Escolher uma porta livre
Veja quais portas já estão em uso pelos seus apps:
```bash
sudo ss -ltnp
```
Se os outros usam 3000 e 3001, o fatoz usa **3002** (já configurado no `ecosystem.config.js`).
Se 3002 estiver ocupada, troque o `PORT` no `ecosystem.config.js`.

---

## 2. Enviar e preparar o projeto
```bash
# Exemplo de pasta — ajuste como preferir
cd /var/www
git clone SEU_REPO fatoz        # ou envie por SFTP/rsync
cd fatoz

# Crie o .env de produção
cp .env.production.example .env
nano .env
```
No `.env`, confirme `NEXT_PUBLIC_SITE_URL="https://fatoz.com.br"` e `DATABASE_URL="file:./prod.db"`.
**Não defina `PORT` no `.env`** — quem define a porta é o PM2 (ecosystem).

```bash
npm install
npm run build          # gera o Prisma (engine Linux), cria o prod.db e compila
```

> A porta `cwd` no `ecosystem.config.js` deve apontar para esta pasta (ex.: `/var/www/fatoz`).

---

## 3. Banco de dados
- O `npm run build` cria um `prisma/prod.db` **vazio** → configure tudo depois no `/admin`; **ou**
- Para **manter suas configs atuais** (logo, feeds, tema, SEO), envie o seu `prisma/dev.db` local para o servidor como `prisma/prod.db`:
  ```bash
  # no seu PC (exemplo com scp):
  scp prisma/dev.db usuario@SEU_VPS:/var/www/fatoz/prisma/prod.db
  ```

---

## 4. Subir com o PM2 (junto dos outros apps)
```bash
cd /var/www/fatoz
pm2 start ecosystem.config.js
pm2 save                 # persiste a lista (seus 2 apps + fatoz)
pm2 list                 # confirme o "fatoz" como "online"
pm2 logs fatoz           # veja os logs (Ctrl+C para sair)
```
Se ainda não tiver o PM2 no boot: `pm2 startup` (rode o comando que ele imprimir).

---

## 5. Nginx — apontar o domínio para a porta
```bash
sudo cp deploy/nginx-fatoz.conf /etc/nginx/sites-available/fatoz.com.br
sudo ln -s /etc/nginx/sites-available/fatoz.com.br /etc/nginx/sites-enabled/
sudo nginx -t            # testa a configuração
sudo systemctl reload nginx
```
O arquivo já faz proxy de **fatoz.com.br → 127.0.0.1:3002**. Seus outros server blocks não são afetados.

> Antes, garanta que o DNS de **fatoz.com.br** (registro A) aponta para o IP do VPS.

---

## 6. HTTPS (SSL grátis)
```bash
sudo certbot --nginx -d fatoz.com.br -d www.fatoz.com.br
```
O certbot adiciona o bloco HTTPS (443) e a renovação automática.

---

## 7. Configurar o site
1. Acesse **https://fatoz.com.br/admin** e faça login (credenciais do `.env`)
2. **Configurações:** chave de IA (OpenAI/Gemini/Claude) e **API-Football**
3. **Aparência → SEO:** confirme a URL, suba a imagem Open Graph, cole o código do Search Console
4. **Feeds:** revise os feeds RSS

---

## 8. Publicação automática (cron do sistema)
```bash
crontab -e
```
Adicione (a cada 30 min):
```
*/30 * * * * curl -s "https://fatoz.com.br/api/cron?secret=14151a084bef558cb5107fb141995950" >/dev/null 2>&1
```

---

## Atualizações futuras
```bash
cd /var/www/fatoz
git pull                 # ou reenvie os arquivos
npm install
npm run build
pm2 restart fatoz
```

---

## ✅ Checklist
- [ ] Porta 3002 livre (ou ajustada no ecosystem)
- [ ] `.env` criado, **sem** PORT
- [ ] `npm install` + `npm run build` ok
- [ ] `prod.db` com tabelas (build) ou copiado do dev.db
- [ ] `pm2 start ecosystem.config.js` + `pm2 save` → fatoz "online"
- [ ] Nginx: server block ativo + `nginx -t` ok + reload
- [ ] DNS de fatoz.com.br apontando para o VPS
- [ ] `certbot` rodado (HTTPS ativo)
- [ ] Login no /admin + chaves configuradas
- [ ] Cron criado

> Memória: o fatoz reinicia sozinho se passar de 600 MB (`max_memory_restart`). Ajuste no ecosystem conforme a RAM do seu VPS.
