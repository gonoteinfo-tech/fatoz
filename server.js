// Servidor de produção para a Hospedagem Node.js da Hostinger (Passenger).
// Defina este arquivo como "Arquivo de inicialização do aplicativo" no hPanel.
// Requer que o build já tenha sido feito (npm run build), gerando a pasta .next.

const { createServer } = require("http");
const fs = require("fs");
const path = require("path");

// A Hostinger/Passenger injeta a porta (ou um socket) em PORT. Não fixe a porta.
const port = process.env.PORT || 3000;

// Verificação amigável: o app não inicia sem o build do Next (.next/BUILD_ID).
const buildId = path.join(__dirname, ".next", "BUILD_ID");
if (!fs.existsSync(buildId)) {
  console.error(
    "\n[fatoz] Build do Next não encontrado (.next ausente).\n" +
      "Rode 'npm install' e 'npm run build' no servidor e reinicie o app.\n"
  );
  process.exit(1);
}

const next = require("next");
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`[fatoz] em produção, ouvindo em ${port}`);
    });
  })
  .catch((err) => {
    console.error("[fatoz] Falha ao iniciar o Next.js:", err);
    process.exit(1);
  });

// Loga erros não tratados para aparecerem no log do Passenger.
process.on("uncaughtException", (e) => console.error("[fatoz] uncaughtException:", e));
process.on("unhandledRejection", (e) => console.error("[fatoz] unhandledRejection:", e));
