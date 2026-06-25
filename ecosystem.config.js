// Configuração do PM2 para rodar o fatoz junto dos seus outros apps no VPS.
// Use uma PORTA livre (diferente dos outros 2 apps). Verifique as portas em uso:
//   sudo ss -ltnp        (ou: sudo lsof -i -P -n | grep LISTEN)
// Inicie com:  pm2 start ecosystem.config.js   e depois:  pm2 save

module.exports = {
  apps: [
    {
      name: "fatoz",
      script: "server.js",
      // Ajuste para o caminho real onde você clonou/enviou o projeto:
      cwd: "/var/www/fatoz",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        // PORTA dedicada do fatoz (troque se 3002 já estiver em uso):
        PORT: 3002,
      },
    },
  ],
};
