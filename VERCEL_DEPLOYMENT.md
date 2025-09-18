# 🚀 Vercel Deployment Guide

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier available)
- Domain name (optional, for custom domain)

## Step-by-Step Deployment

### 1. Connect to Vercel

1. **Visit Vercel Dashboard**
   - Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your repository from the list
   - Click "Import"

### 2. Configure Project Settings

1. **Project Name**
   - Set project name: `bloom-chain-secure`
   - Framework Preset: `Vite`
   - Root Directory: `./` (default)

2. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add the following environment variables in the Vercel dashboard:

   ```
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID
   NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_API_KEY
   ```

### 3. Deploy the Application

1. **Start Deployment**
   - Click "Deploy" button
   - Wait for the build process to complete (usually 2-3 minutes)
   - Monitor the build logs for any errors

2. **Verify Deployment**
   - Once deployment is complete, you'll get a URL
   - Click the URL to verify the application is working

### 4. Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your custom domain
   - Follow the DNS configuration instructions

2. **DNS Configuration**
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add an A record pointing to Vercel's IP addresses
   - Wait for DNS propagation (up to 24 hours)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure all dependencies are in `package.json`
   - Verify `package-lock.json` is committed

2. **Environment Variables**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Verify variables are set in Vercel dashboard

3. **Wallet Connection Issues**
   - Verify WalletConnect project ID is correct
   - Ensure project ID is whitelisted for your domain

## Performance Optimization

### Bundle Size Optimization
- Use dynamic imports for large libraries
- Implement code splitting
- Optimize images and assets

### Caching Strategy
- Configure appropriate cache headers
- Use Vercel's edge caching
- Implement service worker for offline support

## Security Considerations

### Environment Variables
- Never commit sensitive keys to repository
- Use Vercel's environment variable encryption
- Rotate keys regularly

### CORS Configuration
- Configure proper CORS headers
- Restrict access to specific domains
- Implement rate limiting

## Monitoring and Analytics

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Track Core Web Vitals
- Monitor user experience metrics

### Error Tracking
- Integrate error tracking services
- Monitor application errors
- Set up alerting for critical issues

## Support

For any issues or questions, refer to the troubleshooting section or contact the development team.