# Vercel Environment Variables Setup

To make the frontend work properly with the backend API, you need to set environment variables in Vercel:

## Steps:

1. Go to https://vercel.com/dashboard
2. Select your CourseAI frontend project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:

### Variable: `VITE_API_BASE_URL`

- **Value**: `https://letscode-gmv0.onrender.com/api` (replace with your actual Render backend URL)
- **Environments**: Production, Preview, Development

> Note: This MUST be set for the frontend to properly communicate with the backend API in production.

After adding the variable:

- Go to **Deployments** and redeploy the latest commit
- The environment variable will be injected at build time into `import.meta.env.VITE_API_BASE_URL`

## Why?

- Vite requires environment variables to be prefixed with `VITE_`
- These are embedded at build time, not runtime
- Without this, the frontend defaults to `/api` (relative path) which doesn't work when deployed
