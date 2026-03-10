# Orders Microservice

Microservicio de órdenes construido con [NestJS](https://nestjs.com/), Prisma y Postgres (levanta la BD con Docker).

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Generar cliente de Prisma y ejecutar migraciones
pnpm exec prisma generate
pnpm exec prisma migrate dev

# 3. Ejecutar en desarrollo
pnpm run start:dev
```

La app usa el puerto `3002` por defecto (configurable en `.env`).

> La base de datos se espera en Postgres; puedes levantarla con `docker compose up -d`.
