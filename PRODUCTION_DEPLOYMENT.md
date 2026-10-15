# FRAMELO Production Deployment Guide

## Overview

This guide covers deploying FRAMELO to production using modern cloud infrastructure.

## Recommended Architecture

- **Frontend**: Vercel or Netlify (static hosting)
- **Backend**: Railway, Render, or AWS/GCP/Azure
- **Database**: PostgreSQL (production) or SQLite (simple deployments)
- **Media Storage**: Cloudinary, AWS S3, or similar

## Backend Deployment

### Option 1: Railway (Recommended for simplicity)

1. **Connect GitHub repository** to Railway
2. **Set environment variables:**
   ```
   SECRET_KEY=your-production-secret-key
   DATABASE_URL=postgresql://...
   ```
3. **Deploy automatically** on git push

### Option 2: Render

1. **Create a new Web Service** on Render
2. **Connect your repository**
3. **Configure build settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Set environment variables** in Render dashboard

### Option 3: AWS/GCP/Azure

For full control, deploy to cloud providers:

1. **Containerize the application:**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Deploy to cloud platform** using their container services

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set environment variables:**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### Option 2: Netlify

1. **Connect repository** to Netlify
2. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Configure environment variables**

## Database Setup

### PostgreSQL (Production)

1. **Create PostgreSQL instance** on Railway, Render, or cloud provider
2. **Update DATABASE_URL** in environment variables
3. **Run migrations** (if using Alembic):
   ```bash
   alembic upgrade head
   ```

### Media Storage

For production, implement proper media upload:

1. **Choose a cloud storage service** (Cloudinary, AWS S3, etc.)
2. **Update backend** to upload files to cloud storage
3. **Store URLs** in database instead of local paths

## Environment Variables

### Backend
```env
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:password@host:port/database
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Frontend
```env
VITE_API_URL=https://your-backend-domain.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## Security Considerations

1. **HTTPS**: Ensure all traffic is encrypted
2. **Environment Variables**: Never commit secrets to code
3. **CORS**: Configure properly for production domain
4. **Rate Limiting**: Implement on API endpoints
5. **Input Validation**: Sanitize all user inputs
6. **Authentication**: Use strong JWT secrets

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Caching**: Implement Redis for session/data caching
3. **CDN**: Use CDN for static assets and media
4. **Compression**: Enable gzip compression
5. **Monitoring**: Set up logging and monitoring

## Monitoring & Maintenance

1. **Logs**: Monitor application logs
2. **Backups**: Regular database backups
3. **Updates**: Keep dependencies updated
4. **Scaling**: Monitor usage and scale as needed

## Domain & SSL

1. **Custom Domain**: Configure custom domain
2. **SSL Certificate**: Automatic with most platforms
3. **DNS Configuration**: Point domain to deployment

## Testing Production

1. **Test all features** in production environment
2. **Check performance** and loading times
3. **Verify security** measures
4. **Test mobile responsiveness**

## Rollback Strategy

1. **Version Control**: Use git tags for releases
2. **Staging Environment**: Test on staging before production
3. **Quick Rollback**: Ability to revert to previous version

## Cost Optimization

1. **Choose appropriate plans** based on expected usage
2. **Monitor resource usage** and adjust as needed
3. **Implement caching** to reduce database load
4. **Optimize images** and assets

## Support & Maintenance

1. **Error Monitoring**: Set up error tracking (Sentry, etc.)
2. **User Feedback**: Collect and respond to user feedback
3. **Regular Updates**: Plan for feature updates and bug fixes
4. **Documentation**: Keep deployment docs updated