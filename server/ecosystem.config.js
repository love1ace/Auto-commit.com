module.exports = {
  apps: [
    {
      name: 'backend',
      script: './app.js',
      cwd: '/home/ubuntu/aucom-dev/server',
      env_production: {
        NODE_ENV: 'production',
        PORT: ,
        SESSION_SECRET: '',
      },
    },
  ],
};