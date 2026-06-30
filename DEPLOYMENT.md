# GitHub Actions Auto-Deployment Setup

Your repository now has a CI/CD pipeline configured in `.github/workflows/deploy.yml`. This workflow automatically builds and deploys your app when you push to `main`.

## What the Workflow Does

✅ **On every push to main and PRs:**
- Checks out your code
- Sets up Node.js 18
- Installs dependencies
- Runs ESLint
- Builds the Next.js app

✅ **On successful builds to main (production):**
- Deploys to Vercel automatically

## Setup Instructions

### 1. Connect Repository to Vercel (if not already done)

Visit [vercel.com](https://vercel.com) and connect your GitHub repository to Vercel:
- Go to Dashboard → Add New → Project
- Select your GitHub repository
- Vercel will auto-detect Next.js and configure settings

### 2. Add Required Secrets to GitHub

Go to your repository settings:
- Settings → Secrets and Variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value | Where to Find |
|---|---|---|
| `VERCEL_TOKEN` | Your Vercel API token | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Your Vercel Organization ID | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Your Vercel Project ID | Vercel Project Settings → General |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | Your hCaptcha site key | hCaptcha Dashboard |

### 3. Test the Workflow

To test auto-deployment:

```bash
# Push your fix commits
git push origin main
```

Then go to your repository → **Actions** tab to watch the workflow run in real-time.

## Deployment Flow

```
Your local commits
        ↓
   git push origin main
        ↓
   GitHub receives push
        ↓
   GitHub Actions starts
        ↓
   Build & Lint ✓
        ↓
   Deploy to Vercel ✓
        ↓
   Live on avsurge.com
```

## Monitoring Deployments

- **GitHub**: Watch real-time builds at `github.com/VivekSalunke/avsurge/actions`
- **Vercel**: Monitor deployments at `vercel.com/dashboard`

## If Build Fails

1. Check the Actions log for error details
2. Fix the issue locally
3. Commit and push again - the workflow will retry automatically

---

**Your fixes are ready to deploy!** Current commits pending deployment:
- `a4be5d4` - Fix: Add laptops to navigation and fix admin loading state  
- `423654b` - Add GitHub Actions CI/CD workflow for auto-deployment
