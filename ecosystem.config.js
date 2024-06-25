module.exports = {
  apps : [{
    name: 'jacochef-next',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances : "max",
    exec_mode : "cluster",
    ignore_watch: ["node_modules", "./**/*.log", "*.log"],
    env_local: {
      APP_ENV: 'local' // APP_ENV=local
    },
    env_development: {
      APP_ENV: 'dev' // APP_ENV=dev
    },
    env_production: {
      APP_ENV: 'prod' // APP_ENV=prod
    },
    "watch_options": {
      "usePolling": true,
      "useFsEvents": false,
      "atomic": false,
      "followSymLinks": false
    },
  }],

  deploy : {
    production : {
      user : 'root',
      host : '95.163.243.157',
      ref  : 'origin/main',
      repo : 'git@github.com:vito3315/jacochef-next.git',
      path : '/root/jacochef-next',
      key: '~/.ssh/id_rsa.pub',
      'pre-deploy-local': '',
      'post-deploy' : 'npm run deploy:dev && pm2 reload all',
      'pre-setup': ''
    }
  }
};