# MyMixes

I designed and built this full-stack cocktail recipe managment platform to showcase my own cocktail creations using React, Express, and Prisma (PostgreSQL).

# Goals

My goal with this design was to create a platform that would allow me to publicly showcase my own cocktail creations while maintaining a private, secure review system. The key innovation is that customers can only access the review functionality through private QR tokens that I generate and distribute. This ensures that only intended recipients can provide feedback, creating a controlled and secure review environment for my cocktail recipes. 


## Features

### Core Functionality
- **Recipe Management**: Create, edit, and delete cocktail recipes
- **Ingredient System**: Structured ingredient management with types and amounts
- **Image Support**: Upload and display cocktail images
- **Rating & Reviews**: Anonymous review system with 1-5 star ratings
- **QR Code Integration**: Generate QR codes for easy recipe sharing
- **Responsive Design**: Mobile-first design that works on all devices

### Authentication
- **Admin Panel**: Secure admin login for recipe management
- **Guest Access**: Browse recipes without authentication
- **JWT Authentication**: Secure token-based authentication


## Tech Stack

### Frontend
- **React 19** 
- **TypeScript** 
- **Vite**
- **Tailwind CSS** 

### Backend
- **Node.js** 
- **Express.js** 
- **TypeScript**
- **Prisma** 
- **PostgreSQL**


## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL database

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mymixes-website
   ```

2. **Set up the database**
   ```bash
   # Create a PostgreSQL database and set the DATABASE_URL
   export DATABASE_URL="postgresql://username:password@localhost:5432/mymixes"
   ```

3. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Start backend (from server directory)
   npm run dev

   # Terminal 2: Start frontend (from client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000


## Configuration

### Environment Variables

#### Server (.env)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/mymixes"
JWT_SECRET="your-jwt-secret-key"
ADMIN_PASSWORD="your-admin-password"
```

#### Client (.env.local) - Optional
```bash
VITE_API_URL=http://localhost:4000
```

### Database Setup
The application uses Prisma for database management:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# View database in Prisma Studio
npx prisma studio
```


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

