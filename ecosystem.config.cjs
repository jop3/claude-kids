// PM2 ecosystem config — claude-kids server
// Usage:
//   pm2 start ecosystem.config.cjs        Start server
//   pm2 restart claude-kids               Restart
//   pm2 logs claude-kids                  View logs
//   pm2 save                              Persist across reboots

const path = require('path');
const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'claude-kids',
      cwd: root,
      script: 'node',
      args: 'server.js',
      interpreter: 'none',
      env: {
        WORKSPACE: path.join(root, 'workspace'),
      },
      autorestart: true,
      max_restarts: 20,
      min_uptime: '5s',
      restart_delay: 2000,
      kill_timeout: 5000,
      max_memory_restart: '300M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_size: '10M',
      retain: 3,
    },
  ],
};
