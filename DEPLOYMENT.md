# Deployment Guide

## Environment Configuration for Production

### Backend Deployment

1. **Environment Variables**

   - Copy `backend/.env.example` to `backend/.env`
   - Update the following variables for production:

   ```
   DBURL=your_production_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   SESSION_SECRET=your_strong_session_secret
   ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
   ```

2. **CORS Configuration**
   - The backend now automatically reads `ALLOWED_ORIGINS` from environment variables
   - For production, set this to your actual frontend domain(s)
   - Multiple origins can be comma-separated

### Frontend Deployment

1. **Environment Variables**

   - Copy `frontend/.env.example` to `frontend/.env.production`
   - Update the API URL:

   ```
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

2. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

### Common Deployment Platforms

#### Heroku

- Frontend: Can be deployed directly with build process
- Backend: Set environment variables in Heroku dashboard
- Use `ALLOWED_ORIGINS` environment variable for CORS

#### Vercel (Frontend) + Railway/Render (Backend)

- Frontend: Deploy to Vercel, set `REACT_APP_API_URL` in environment variables
- Backend: Deploy to Railway/Render, set all backend environment variables

#### DigitalOcean/AWS

- Set environment variables through the platform's environment configuration
- Ensure domains are properly configured in `ALLOWED_ORIGINS`

### Local Development

- Use `.env.local` files (already gitignored)
- Frontend: `REACT_APP_API_URL=http://localhost:3030/api`
- Backend: `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001`

### Security Notes

- Never commit `.env` files to git (already protected by .gitignore)
- Use strong, random session secrets
- Always use HTTPS in production
- Regularly rotate API keys and secrets
