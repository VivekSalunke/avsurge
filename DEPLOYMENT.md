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
- Settings → **Secrets and variables** → **Actions** → **New repository secret**

**Important**: Make sure you select the **Actions** scope (not Codespaces, Agents, or Dependabot)

Add these secrets:

| Secret Name | Value | Where to Find |
|---|---|---|
| `VERCEL_TOKEN` | Your Vercel API token | **Vercel Dashboard** → Settings (gear icon, top right) → **Tokens** → Click "Create" → Copy the token |
| `VERCEL_ORG_ID` | Your Vercel Organization ID | **Vercel Dashboard** → Settings (gear icon) → **General** → Look for "Team ID" under "Organization" section → Copy it |
| `VERCEL_PROJECT_ID` | Your Vercel Project ID | **Vercel Dashboard** → Select your **avsurge** project → Go to **Settings** tab → Copy "Project ID" from the top section |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | **Supabase Dashboard** → Your project → **Settings** (gear icon) → **API** → Copy "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | **Supabase Dashboard** → Your project → **Settings** → **API** → Copy "anon public" key |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | Your hCaptcha site key | **hCaptcha Dashboard** → Your site → Copy "Site Key" |

## Detailed Steps to Get Each Secret

### VERCEL_TOKEN
1. Go to https://vercel.com/dashboard
2. Click your profile icon (top right) → **Settings**
3. Left sidebar → **Tokens**
4. Click **Create** button
5. Name it (e.g., "GitHub Actions")
6. Copy the token immediately (you won't see it again)
7. Paste into GitHub as `VERCEL_TOKEN`

### VERCEL_ORG_ID (Team ID)
1. Go to https://vercel.com/dashboard
2. Click profile icon (top right) → **Settings**
3. Left sidebar → **General**
4. Find section labeled **"Organization"** or **"Team"**
5. Copy the ID shown (looks like: `team_xxxxx` or similar)
6. Paste into GitHub as `VERCEL_ORG_ID`

### VERCEL_PROJECT_ID
1. Go to https://vercel.com/dashboard
2. Click on your **avsurge** project
3. Click **Settings** tab
4. Look for **"Project ID"** near the top
5. Copy it
6. Paste into GitHub as `VERCEL_PROJECT_ID`

### Supabase Secrets
1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy **"Project URL"** → Paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **"anon public"** key → Paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### hCaptcha Secret
1. Go to your hCaptcha dashboard
2. Find your site
3. Copy the **"Site Key"**
4. Paste into GitHub as `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`

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
