#!/usr/bin/env bash
# Atualiza o fatoz no VPS: git pull -> install -> build -> restart (PM2).
# Uso:  ./deploy.sh
# Requer: o projeto já configurado (.env, PM2 com o app "fatoz").

set -euo pipefail

APP_NAME="fatoz"
# Caminho do projeto no servidor (ajuste se necessário):
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$APP_DIR"
echo "==> fatoz: deploy iniciado em $APP_DIR"

# 1. Atualiza o código (se for repositório git)
if [ -d .git ]; then
  echo "==> git pull..."
  git pull --ff-only
else
  echo "==> sem .git — pulando git pull (envie os arquivos manualmente)."
fi

# 2. Dependências (instala TUDO, inclusive devDeps — o build precisa delas)
echo "==> instalando dependências..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# 3. Build de produção (Prisma generate + db push + next build)
echo "==> build de produção..."
npm run build

# 4. Reinicia (ou inicia) o app no PM2 sem derrubar os outros
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "==> reiniciando $APP_NAME no PM2..."
  pm2 restart "$APP_NAME" --update-env
else
  echo "==> primeira vez: iniciando via ecosystem.config.js..."
  pm2 start ecosystem.config.js
fi
pm2 save

echo "==> concluído. Status:"
pm2 describe "$APP_NAME" | grep -E "status|name|restarts" || true
echo "==> dica: 'pm2 logs $APP_NAME' para acompanhar os logs."
