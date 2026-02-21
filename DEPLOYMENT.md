# Deployment Guide - Free Hosting

## 🌐 Deploy Your UCSD Course Roadmap for Free

### Option 1: Vercel + Neon (Recommended)

**Why**: Best free tier, made for Next.js, professional domain

#### Step 1: Set up Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project → Name it "ucsd-roadmap"
4. Copy the connection string (starts with `postgresql://`)
5. Keep this handy!

#### Step 2: Prepare Your Code

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
# Go to github.com → New repository → "ucsdcourseroadmap"
git remote add origin https://github.com/YOUR_USERNAME/ucsdcourseroadmap.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. **Import** your `ucsdcourseroadmap` repo
5. Configure:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Environment Variables** → Add:
   ```
   DATABASE_URL = your-neon-connection-string
   ```
7. Click **Deploy** 🚀

#### Step 4: Initialize Database

After deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
npm run db:push

# Seed database
npm run db:seed
```

Or use Vercel's terminal in dashboard.

#### Step 5: Done! 🎉

Your site will be live at: `https://ucsdcourseroadmap.vercel.app`

Custom domain? Add it in Vercel settings (free for `.vercel.app`, or connect your own)

---

## Option 2: Railway (All-in-One)

**Why**: Simpler setup, includes database, $5/month free credit

### Steps:

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select your repo
5. Add **PostgreSQL** service
6. Railway auto-detects DATABASE_URL
7. Add build command: `npm run db:push && npm run db:seed && npm run build`
8. Deploy!

Free tier: 500 hours/month, should be enough for portfolio projects.

---

## Option 3: Render

**Why**: Generous free tier, simple setup

### Steps:

1. Go to [render.com](https://render.com)
2. Sign up
3. **New PostgreSQL** database → Free tier
4. Copy connection string (Internal Database URL)
5. **New Web Service** → Connect GitHub repo
6. Configure:
   - Build Command: `npm install && npm run db:push && npm run db:seed && npm run build`
   - Start Command: `npm start`
   - Environment: Add `DATABASE_URL`
7. Deploy

**Note**: Free tier has cold starts (30s delay if inactive)

---

## Environment Variables You Need

For all platforms, add these:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
```

---

## Post-Deployment Checklist

- [ ] Database is created and accessible
- [ ] Schema is pushed (`npm run db:push`)
- [ ] Database is seeded (`npm run db:seed`)
- [ ] App builds successfully
- [ ] Homepage loads
- [ ] Course search works
- [ ] Prerequisite graph renders

---

## Troubleshooting

### "Can't connect to database"
- Check DATABASE_URL format
- Ensure database is in same region (lower latency)
- Verify database is not paused (Neon free tier pauses after inactivity)

### "Build failed"
- Check build logs in deployment platform
- Common issue: Missing environment variables
- Try: `npm run build` locally first

### "Prisma Client not found"
- Add to `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

### "Database empty"
- Run seed: `npm run db:seed`
- Or use Prisma Studio in production: `npx prisma studio --browser none`

---

## Recommended: Vercel + Neon

**Pros**:
- ✅ Free forever (generous limits)
- ✅ Fast global CDN
- ✅ Automatic HTTPS
- ✅ GitHub integration (auto-deploys on push)
- ✅ Professional URLs
- ✅ 0.5GB database free (enough for thousands of courses)

**Limits**:
- 100GB bandwidth/month
- 6,000 serverless function executions/day
- More than enough for a portfolio project!

---

## Share Your Project

Once deployed, share:
- **Live URL**: `https://your-app.vercel.app`
- **GitHub**: `https://github.com/your-username/ucsdcourseroadmap`
- **Portfolio**: Add to resume/LinkedIn

Add a nice README with screenshots! 📸

---

## Optional: Custom Domain

Free `.vercel.app` subdomain included, or:
1. Buy domain (~$12/year from Namecheap/Google Domains)
2. Add to Vercel/Railway settings
3. Update DNS records
4. Get free SSL automatically

---

## Cost Breakdown

| Platform | App Hosting | Database | Total |
|----------|-------------|----------|-------|
| Vercel + Neon | Free | Free (0.5GB) | **$0** |
| Railway | $5 credit/mo | Included | **$0** (with credit) |
| Render | Free | Free (pauses after inactivity) | **$0** |

**All are production-ready and perfect for portfolio projects!**
