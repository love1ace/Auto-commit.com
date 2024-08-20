module.exports = {
  apps: [
    {
      name: "frontend",
      script: "pnpm",
      args: "start",
      cwd: "/home/ubuntu/aucom-dev/FE",
      env: {
        "NODE_ENV": "development",
        "PORT": 3000 // 필요한 경우 포트 설정
      },
      env_production: {
        "NODE_ENV": "production"
      }
    }
  ]
};