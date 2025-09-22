# Development Setup

## Local Development

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Configuration

### Local Development
- **No setup needed** - automatically uses `http://localhost:4000`
- **Optional**: Create `client/.env.local` with:
  ```
  VITE_API_URL=http://localhost:4000
  ```

### Production
- **Vercel**: Automatically uses Railway URL via environment variables
- **Railway**: Automatically uses Vercel URL via environment variables

## How It Works

The app automatically detects the environment:
- **Development** (`npm run dev`): Uses `localhost:4000`
- **Production** (Vercel): Uses Railway URL from environment variables

No manual configuration needed! 🎉
