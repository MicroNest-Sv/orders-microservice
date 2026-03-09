# Docker Compose Moderno (2026) - Apuntes

---

## 1. Sintaxis obsoleta vs moderna

### `version` — Ya no se usa

Docker Compose V2 lo ignora por completo. No ponerlo.

```yaml
# MAL
version: "3.8"
services:
  app:
    image: node:20

# BIEN
services:
  app:
    image: node:20
```

### Nombre del archivo

```
docker-compose.yml   → obsoleto
compose.yml          → moderno (nombre preferido)
```

### Comando

```bash
docker-compose up    # obsoleto (binario separado)
docker compose up    # moderno (subcomando de docker)
```

### `links` — Obsoleto

Los servicios se resuelven por nombre automáticamente dentro de la red interna.

```yaml
# MAL
services:
  app:
    links:
      - db

# BIEN — app ya puede conectarse a "db" por nombre sin configurar nada
services:
  app:
    image: node:20
  db:
    image: postgres:17-alpine
```

### `expose` — Innecesario

Los puertos entre servicios ya están expuestos en la red interna. Solo usar `ports` para exponer al host.

```yaml
# INNECESARIO
expose:
  - '5432'

# SOLO ESTO si necesitas acceder desde tu maquina
ports:
  - '5433:5432'
```

### `container_name` — Generalmente innecesario

Docker Compose genera nombres automáticos. Solo usarlo si realmente se necesita un nombre fijo.

### `networks` manuales — Generalmente innecesarias

La red default conecta todos los servicios automáticamente. Solo crear networks explícitas si necesitas aislamiento entre grupos de servicios.

```yaml
# INNECESARIO en la mayoria de casos
networks:
  my-network:
    driver: bridge

# BIEN — todos los servicios se ven entre si sin configurar nada
services:
  app:
    image: node:20
  db:
    image: postgres:17-alpine
```

---

## 2. Extension del archivo: `.yml` vs `.yaml`

Ambas funcionan igual. La recomendada es **`.yml`**:

- Docker usa `.yml` en toda su documentacion
- La comunidad prefiere `.yml` por ser mas corto
- YAML como especificacion recomienda `.yaml`, pero `.yml` domina en la practica

**Usar `.yml` y listo.**

---

## 3. Versiones de PostgreSQL estables (2026)

| Version | Estado               | Soporte hasta |
| ------- | -------------------- | ------------- |
| **17**  | Estable, recomendada | ~Nov 2029     |
| **16**  | Estable, madura      | ~Nov 2028     |
| **15**  | Estable              | ~Nov 2027     |
| **14**  | En mantenimiento     | ~Nov 2026     |
| **13**  | Fin de vida (EOL)    | Nov 2025      |

**Usar PostgreSQL 17** — es la mas moderna con soporte a largo plazo.

---

## 4. Alpine Linux en imagenes Docker

Cuando ves `postgres:17-alpine` vs `postgres:17`, la diferencia es la imagen base:

|                    | `postgres:17` | `postgres:17-alpine` |
| ------------------ | ------------- | -------------------- |
| Base               | Debian/Ubuntu | Alpine Linux         |
| Tamano imagen      | ~400MB        | ~80MB                |
| Paquetes incluidos | Muchos        | Solo lo esencial     |
| Velocidad descarga | Lenta         | Rapida               |

Es la misma base de datos PostgreSQL, pero empaquetada en una imagen mucho mas pequena. Funciona igual para el 99% de los casos.

**Usar `-alpine` siempre que se pueda**, especialmente en desarrollo.

---

## 5. Volumes — Persistencia de datos

Sin volumes, cuando el contenedor se elimina, **todos los datos se pierden**. Los volumes guardan datos fuera del contenedor.

```yaml
volumes:
  - ./postgres:/var/lib/postgresql/data
```

Esto mapea:

- `./postgres` (carpeta en tu maquina) ← → `/var/lib/postgresql/data` (dentro del contenedor)

```
# Sin volume:
docker compose down  →  datos borrados
docker compose up    →  base de datos vacia

# Con volume:
docker compose down  →  datos siguen en ./postgres/
docker compose up    →  base de datos intacta
```

Es como conectar un disco externo al contenedor. El contenedor puede morir, pero el disco queda.

---

## 6. Funcionalidades modernas

### `restart` — Politica de reinicio

```yaml
restart: unless-stopped  # recomendado: reinicia siempre, excepto si lo paraste manualmente
restart: always          # reinicia siempre, incluso si lo paraste a mano
restart: on-failure      # solo reinicia si fallo
restart: "no"            # nunca reinicia (default)
```

### `healthcheck` — Verificar que el servicio esta listo

Permite verificar que un servicio esta realmente funcionando, no solo que el contenedor inicio.

```yaml
services:
  db:
    image: postgres:17-alpine
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s # cada cuanto verificar
      timeout: 5s # tiempo maximo de espera
      retries: 5 # intentos antes de marcarlo como unhealthy
```

### `depends_on` con condiciones

Espera a que la dependencia este realmente lista (no solo iniciada).

```yaml
services:
  app:
    build: .
    depends_on:
      db:
        condition: service_healthy # espera al healthcheck
        restart: true # reinicia si la dependencia se reinicia
```

### `develop.watch` — Hot reload nativo

Reemplaza bind mounts manuales para desarrollo. Sincroniza cambios automaticamente.

```yaml
services:
  app:
    build: .
    develop:
      watch:
        - action: sync # sincroniza archivos al contenedor
          path: ./src
          target: /app/src
        - action: rebuild # hace rebuild si cambia este archivo
          path: ./package.json
```

### `include` — Modularizar compose files

Dividir un compose grande en archivos mas pequenos y reutilizables.

```yaml
include:
  - ./db/compose.yml
  - ./monitoring/compose.yml

services:
  app:
    build: .
```

### `profiles` — Servicios opcionales

Agrupar servicios que solo se levantan cuando se piden explicitamente.

```yaml
services:
  app:
    build: .

  pgadmin:
    image: dpage/pgadmin4
    profiles:
      - tools

  debug-tools:
    image: busybox
    profiles:
      - debug
```

```bash
docker compose up                      # solo app
docker compose --profile tools up      # app + pgadmin
docker compose --profile debug up      # app + debug-tools
```

---

## 7. Ejemplo completo moderno

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/orders_db
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    volumes:
      - ./postgres:/var/lib/postgresql/data
    ports:
      - '5433:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: orders_db
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5
```

---

## 8. Resumen rapido

| Antes (obsoleto)            | Ahora (moderno)                    |
| --------------------------- | ---------------------------------- |
| `version: "3.8"`            | No va                              |
| `docker-compose.yml`        | `compose.yml`                      |
| `docker-compose up`         | `docker compose up`                |
| `links:`                    | `depends_on:` con condiciones      |
| `expose:`                   | No hace falta                      |
| `container_name:`           | Nombres automaticos                |
| `networks:` manuales        | Red default automatica             |
| `restart: always`           | `restart: unless-stopped`          |
| `postgres:16.2`             | `postgres:17-alpine`               |
| Bind mounts para dev        | `develop.watch`                    |
| Un solo archivo gigante     | `include` para modularizar         |
| Todos los servicios siempre | `profiles` para agrupar opcionales |
