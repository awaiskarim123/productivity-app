# Vercel Deployment Guide for SvelteKit Monorepo

## Critical Configuration Steps

### 1. Vercel Dashboard Settings (REQUIRED)

You **MUST** configure these settings in your Vercel project dashboard:

1. Go to **Project Settings** → **General**
2. Set **Root Directory** to: `frontend`
3. Go to **Build & Development Settings**
4. **Framework Preset**: Leave blank or set to "SvelteKit" (Vercel will auto-detect from Build Output API)
5. **Output Directory**: Leave blank (adapter-vercel handles this automatically)
6. **Node.js Version**: Should auto-detect from `.nvmrc` or `package.json` engines (Node 20.x)

### 2. How It Works

- **Root Directory = `frontend`**: Vercel changes to the `frontend` directory before running commands
- **Build Command**: Runs `npm run build` from `frontend/` directory
- **Output**: `@sveltejs/adapter-vercel` creates `.vercel/output` in `frontend/.vercel/output`
- **Detection**: Vercel automatically detects the Build Output API format from `.vercel/output/config.json`

### 3. Project Structure

```
productivity-app/
├── frontend/              ← Root Directory in Vercel
│   ├── .vercel/
│   │   └── output/        ← Created by adapter-vercel (Build Output API)
│   ├── src/
│   ├── package.json
│   └── svelte.config.js
├── backend/
└── vercel.json
```

### 4. Troubleshooting

**Error: "No Output Directory named 'public' found"**
- ✅ **Solution**: Set Root Directory to `frontend` in Vercel dashboard
- The adapter creates `.vercel/output`, not `public`
- Vercel must look in the `frontend` directory to find it

**Build fails with "vite: command not found"**
- ✅ **Solution**: Root Directory must be set to `frontend`
- Commands run from `frontend/` where `node_modules` and `vite` are located

**Node.js version errors**
- ✅ **Solution**: `.nvmrc` file specifies Node 20
- `package.json` engines field also specifies Node >=18.0.0
- Adapter config specifies `runtime: 'nodejs20.x'`

## Files Configuration

### vercel.json
```json
{
	"buildCommand": "npm run build",
	"installCommand": "npm install"
}
```
- Commands are relative to Root Directory (`frontend/`)
- No `cd frontend` needed because Root Directory is set

### frontend/svelte.config.js
```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x'
		})
	}
};
```
- Uses `@sveltejs/adapter-vercel` which creates Build Output API format
- Specifies Node.js 20.x runtime for serverless functions

### frontend/package.json
- Has `engines.node` field for Node version specification
- Includes `@sveltejs/adapter-vercel` as devDependency

## Verification

After setting Root Directory to `frontend`:
1. Push your code
2. Vercel will detect the Build Output API automatically
3. No "public" directory error should occur
4. Deployment should succeed
