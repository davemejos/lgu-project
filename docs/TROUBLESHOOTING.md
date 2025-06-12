# Troubleshooting Guide

## Common Next.js Development Issues

### 1. Cache-Related Errors (EINVAL, readlink errors)

**Symptoms:**
- `Error: EINVAL: invalid argument, readlink` errors
- Build failures after adding new components
- Stale code being served

**Solution:**
```powershell
# Stop the development server (Ctrl+C)
# Clear Next.js cache
Remove-Item -Recurse -Force .next
# Clear npm cache (optional)
npm cache clean --force
# Restart development server
npm run dev
```

### 2. Port Already in Use

**Symptoms:**
- `Port 3000 is in use, using available port 3001 instead`
- Cannot access the expected URL

**Solution:**
- Check which port Next.js is actually using in the terminal output
- Use the correct port number in your browser
- Or kill the process using the port:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### 3. Environment Variables Not Loading

**Symptoms:**
- API calls failing with authentication errors
- `process.env.VARIABLE_NAME` returning undefined

**Solution:**
- Ensure `.env.local` file exists in project root
- Restart development server after adding new environment variables
- Check for typos in variable names
- Verify no extra spaces around the `=` sign

### 4. TypeScript Compilation Errors

**Symptoms:**
- Red underlines in VS Code
- Build failures with type errors

**Solution:**
```powershell
# Check for TypeScript errors
npx tsc --noEmit
# Install missing type definitions
npm install --save-dev @types/node @types/react @types/react-dom
```

### 5. Module Not Found Errors

**Symptoms:**
- `Module not found: Can't resolve '@/components/...'`
- Import path errors

**Solution:**
- Check `tsconfig.json` for correct path mapping
- Verify file paths and extensions
- Ensure files are saved properly

### 6. Chatbot Not Appearing

**Symptoms:**
- Chat bubble not visible on pages
- Console errors related to chatbot components

**Solution:**
1. Check browser console for JavaScript errors
2. Verify `ChatBot` component is imported in `layout.tsx`
3. Ensure Google AI API key is set in `.env.local`
4. Check network tab for failed API requests

### 7. API Route Errors

**Symptoms:**
- 500 errors when sending chat messages
- "Method not allowed" errors
- "Service temporarily unavailable" errors
- "Model not found" errors

**Solution:**
1. Verify API route file is in correct location: `src/app/api/chat/route.ts`
2. Check environment variables are loaded
3. Verify Google AI API key is valid
4. Check API quota limits in Google AI Studio
5. **Model Name Issue**: Ensure you're using current model names:
   - ✅ Use: `gemini-1.5-flash` (recommended)
   - ✅ Use: `gemini-1.5-pro` (for complex tasks)
   - ❌ Don't use: `gemini-pro` (deprecated)
6. Visit `/verify-chatbot` page to run automated diagnostics

## Quick Fixes

### Reset Development Environment
```powershell
# Complete reset (use with caution)
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Check Server Status
```powershell
# Check if server is running
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

### Verify Environment Variables
```powershell
# In your project directory, check if .env.local exists
Get-Content .env.local
```

## Browser-Specific Issues

### Chrome/Edge
- Clear browser cache and cookies
- Disable browser extensions temporarily
- Check Developer Tools console for errors

### Mobile Testing
- Use browser developer tools device emulation
- Test on actual mobile devices
- Check responsive design breakpoints

## Getting Help

If issues persist:
1. Check the browser console for detailed error messages
2. Review the terminal output for server-side errors
3. Verify all files are saved and in correct locations
4. Test with a fresh browser session (incognito/private mode)

## Chatbot-Specific Troubleshooting

### Chat Interface Not Opening
- Check if chat bubble is clickable
- Verify no CSS z-index conflicts
- Test click event handlers

### Messages Not Sending
- Check network requests in browser DevTools
- Verify API endpoint is responding
- Check Google AI API key and quotas

### Mobile Responsiveness Issues
- Test different screen sizes in browser DevTools
- Verify Tailwind CSS classes are applied correctly
- Check for CSS conflicts with existing styles
