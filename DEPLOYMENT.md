# AIQ Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Prepare Your Repository**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial AIQ application"
   
   # Create GitHub repository and push
   git remote add origin https://github.com/yourusername/aiq-app.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: ./
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Add Environment Variables**
   - In the import screen, expand "Environment Variables"
   - Add variable:
     - **Name**: `NEXT_PUBLIC_GEMINI_API_KEY`
     - **Value**: Your Gemini API key from https://makersuite.google.com/app/apikey
     - **Environment**: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd aiq-app
   vercel
   ```

4. **Follow Prompts**
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N
   - Project name: aiq-app (or your choice)
   - Directory: ./ (press Enter)
   - Override settings: N

5. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_GEMINI_API_KEY
   ```
   - Select environment: Production
   - Paste your Gemini API key
   - Repeat for Preview and Development if needed

6. **Redeploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

### 1. Enable HTTPS
Vercel automatically provides HTTPS. Ensure you access your app via `https://` for camera access to work.

### 2. Test Camera Access
- Visit your deployed URL on mobile and desktop
- Grant camera and location permissions
- Verify particle simulation appears

### 3. Custom Domain (Optional)
1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. SSL certificate is automatic

## Environment Configuration

### Required Environment Variables

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | https://makersuite.google.com/app/apikey | `AIzaSyA...` |

### Setting Environment Variables in Vercel

**Via Dashboard:**
1. Project → Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)
4. Redeploy to apply changes

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_GEMINI_API_KEY preview
vercel env add NEXT_PUBLIC_GEMINI_API_KEY development
```

## Troubleshooting Deployment

### Build Fails
- Check that all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variable name matches exactly (case-sensitive)
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables

### Camera Access Denied
- Verify app is accessed via HTTPS
- Check browser console for errors
- Test on different browsers/devices

### API Routes Failing
- Check function logs in Vercel dashboard
- Verify API keys are set correctly
- Check for CORS issues (shouldn't occur with Next.js API routes)

## Monitoring

### View Logs
- Vercel Dashboard → Your Project → Deployments → Click deployment → Runtime Logs
- Or use CLI: `vercel logs`

### Analytics
- Enable Vercel Analytics for real-time visitor data
- Monitor API route performance
- Track Web Vitals

## Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys on every push to `main` branch (production)
- Creates preview deployments for pull requests
- Runs build checks

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Always use Vercel environment variables

2. **Rotate API Keys**
   - Periodically update Gemini API key
   - Update in Vercel environment variables
   - Redeploy

## Rollback Deployment

If something goes wrong:

1. **Via Dashboard**
   - Project → Deployments
   - Find previous working deployment
   - Click "..." → Promote to Production

2. **Via CLI**
   ```bash
   vercel rollback
   ```

---

Your AIQ app should now be live and accessible worldwide! 🌍✨
