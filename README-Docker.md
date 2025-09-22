# Docker Setup for MyMixes Website

This document explains how to run the MyMixes website using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone and navigate to the project directory:**
   ```bash
   cd /Users/georget/Desktop/Personal\ Projects/mymixes-website
   ```

2. **Copy the environment file:**
   ```bash
   cp env.example .env
   ```

3. **Update the environment variables in `.env`:**
   - Change `JWT_SECRET` to a secure random string
   - Generate `ADMIN_PASSWORD_HASH` using the provided script
   - Adjust other settings as needed

4. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

5. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:4000

## Services

The Docker setup includes two services (using external Neon database):

### 1. External Database
- **Provider:** Neon (PostgreSQL)
- **Connection:** External cloud database
- **SSL:** Required and configured

### 2. Backend Server (`server`)
- **Port:** 4000
- **Framework:** Node.js + Express
- **Database:** Prisma ORM with Neon PostgreSQL
- **Features:** 
  - Automatic database migrations
  - Database seeding
  - JWT authentication

### 3. Frontend Client (`client`)
- **Port:** 80
- **Framework:** React + Vite
- **Web Server:** Nginx
- **Features:**
  - Client-side routing support
  - Static asset caching
  - Security headers

## Environment Configuration

Your environment is already configured with:
- **Neon Database:** External PostgreSQL with SSL
- **Admin Password:** Already hashed and configured
- **JWT Secret:** Already set for session management
- **Port:** Server runs on port 4000

## Development Commands

### Start services in background:
```bash
docker-compose up -d
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres
```

### Stop services:
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ This will delete all data):
```bash
docker-compose down -v
```

### Rebuild specific service:
```bash
docker-compose up --build server
```

## Database Management

### Access PostgreSQL directly:
```bash
docker-compose exec postgres psql -U postgres -d mymixes
```

### Run Prisma commands:
```bash
# Generate Prisma client
docker-compose exec server npx prisma generate

# Run migrations
docker-compose exec server npx prisma migrate deploy

# Seed database
docker-compose exec server npx prisma db seed

# Open Prisma Studio
docker-compose exec server npx prisma studio
```

## Troubleshooting

### Port conflicts:
If you have services running on ports 80, 3000, or 5432, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change client port
  - "3001:3000"  # Change server port
  - "5433:5432"  # Change database port
```

### Database connection issues:
1. Ensure PostgreSQL container is healthy: `docker-compose ps`
2. Check database logs: `docker-compose logs postgres`
3. Verify DATABASE_URL in environment variables

### Build issues:
1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`

## Production Considerations

For production deployment:

1. **Security:**
   - Change default passwords
   - Use strong JWT secrets
   - Enable HTTPS
   - Review security headers

2. **Performance:**
   - Use production-optimized images
   - Configure resource limits
   - Set up monitoring

3. **Data:**
   - Use external database
   - Set up regular backups
   - Configure persistent volumes

4. **Environment:**
   - Use environment-specific configs
   - Set up proper logging
   - Configure health checks
