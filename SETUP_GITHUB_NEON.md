# Step-by-Step: GitHub + Neon Setup

## Part 1: Push to GitHub (5 minutes)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** button (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `ucsdcourseroadmap`
   - **Description**: "UCSD Course Roadmap - Course planning with SQL & algorithms"
   - **Public** or **Private** (your choice)
   - ❌ **DON'T** check "Add a README" (we already have one)
4. Click **"Create repository"**

### Step 2: Push Your Code

Open your terminal in the project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit - UCSD Course Roadmap"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ucsdcourseroadmap.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If it asks for credentials:**
- Username: your GitHub username
- Password: use a **Personal Access Token** (not your password)
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - Give it "repo" permission
  - Copy the token and use it as password

### Step 3: Verify

Go to `https://github.com/YOUR_USERNAME/ucsdcourseroadmap` - you should see your code! ✅

---

## Part 2: Set Up Neon Database (10 minutes)

### Step 1: Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign up"**
3. Sign up with **GitHub** (easiest - uses your GitHub account)
4. Verify your email if needed

### Step 2: Create Database Project

1. Click **"Create a project"** or **"New Project"**
2. Fill in:
   - **Project name**: `ucsd-roadmap`
   - **Postgres version**: 16 (latest)
   - **Region**: Choose closest to you (e.g., US East for East Coast)
3. Click **"Create project"**

### Step 3: Get Connection String

After creating, you'll see:

```
Connection string
postgres://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!** You'll need it in the next step.

### Step 4: Update Local Environment

In your project, update `.env`:

```bash
# Replace the entire DATABASE_URL line with your Neon connection string
DATABASE_URL="postgres://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Important**: Make sure `.env` is in your `.gitignore` so you don't commit your password!

### Step 5: Initialize Neon Database

Run these commands:

```bash
# Push schema to Neon
npm run db:push

# Seed with courses
npm run db:seed
```

You should see:
```
✅ Created major: Mathematics
✅ Created 30 courses
✅ Created 40+ prerequisite edges
🎉 Seed completed successfully!
```

### Step 6: Verify Database

1. Go back to Neon dashboard
2. Click **"Tables"** in the sidebar
3. You should see:
   - ✅ courses (30 rows)
   - ✅ course_prereq_edges (40+ rows)
   - ✅ majors (1 row)
   - ✅ major_requirements (30 rows)

---

## Part 3: Deploy to Vercel (5 minutes)

Now that you have GitHub + Neon set up:

### Step 1: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your `ucsdcourseroadmap` repository
3. Click **"Import"**

### Step 3: Configure Environment Variables

Before deploying:

1. Scroll to **"Environment Variables"**
2. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string (the one from earlier)
3. Click **"Add"**

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes...
3. 🎉 **Success!** You'll get a URL like `https://ucsdcourseroadmap.vercel.app`

### Step 5: Test Your Live Site

1. Click the URL
2. Search for "MATH 180A"
3. View the prerequisite graph
4. Generate a plan

**It should work exactly like localhost!** ✨

---

## Quick Reference Commands

### When You Make Changes

```bash
# Save changes to GitHub
git add .
git commit -m "Description of changes"
git push

# Vercel will auto-deploy! (takes ~2 minutes)
```

### Update Database Schema

```bash
# Locally
npm run db:push

# The same DATABASE_URL in .env and Vercel means both use Neon!
```

---

## Common Issues & Solutions

### "Permission denied (publickey)" when pushing to GitHub

**Solution**: Use HTTPS instead of SSH
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/ucsdcourseroadmap.git
```

### "Can't connect to database" after deploying

**Solutions**:
1. Check DATABASE_URL in Vercel matches Neon exactly
2. Make sure it includes `?sslmode=require` at the end
3. Neon free tier pauses after 5 min inactivity - just visit your app to wake it

### Database is empty on production

**Solution**: Run seed on production
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run seed (this runs on Vercel/Neon)
vercel run npm run db:seed
```

Or use Neon's SQL Editor:
1. Go to Neon dashboard
2. Click "SQL Editor"
3. Run seed script manually

---

## Your URLs After Setup

✅ **GitHub Repo**: `https://github.com/YOUR_USERNAME/ucsdcourseroadmap`  
✅ **Live Site**: `https://ucsdcourseroadmap.vercel.app` (or custom)  
✅ **Neon Dashboard**: `https://console.neon.tech`  
✅ **Vercel Dashboard**: `https://vercel.com/dashboard`

---

## Next Steps

- [ ] Share your live URL on LinkedIn/resume
- [ ] Add screenshots to GitHub README
- [ ] Customize domain (optional, ~$12/year)
- [ ] Add more courses/majors
- [ ] Show off to friends! 🚀

---

## Cost Breakdown

| Service | Cost | Limits |
|---------|------|--------|
| **GitHub** | $0 | Unlimited public repos |
| **Neon** | $0 | 0.5GB storage, 1 project |
| **Vercel** | $0 | 100GB bandwidth/month |
| **TOTAL** | **$0/month** | Perfect for portfolio! |

All production-ready and professional! 🎉
