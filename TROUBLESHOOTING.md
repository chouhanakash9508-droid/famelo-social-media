# Troubleshooting Blank Page Issue

## Quick Fix Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Check Browser Console
- Open browser developer tools (F12)
- Look for any error messages in the Console tab
- Common errors and solutions:

#### Error: "Cannot resolve module"
**Solution:** Install missing dependencies
```bash
npm install react react-dom react-router-dom framer-motion lucide-react react-hot-toast
```

#### Error: "Tailwind CSS not working"
**Solution:** Make sure Tailwind is properly configured
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Error: "Module not found"
**Solution:** Check file paths and imports

### 4. Verify File Structure
Make sure these files exist:
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/index.css`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Login.jsx`

### 5. Test Simple Version
If still blank, try this minimal App.jsx:

```jsx
import React from 'react';

function App() {
  return (
    <div style={{ background: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>Framelo - Instagram Clone</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
}

export default App;
```

### 6. Check Network Tab
- Open browser developer tools
- Go to Network tab
- Refresh page
- Look for failed requests (red entries)

### 7. Common Solutions

#### Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

#### Check Port
- Make sure nothing else is running on port 5173
- Try different port: `npm run dev -- --port 3000`

#### Node Version
- Make sure you have Node.js 18+ installed
- Check version: `node --version`

### 8. If Still Not Working

1. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Vite config:**
   Make sure `vite.config.js` exists and is properly configured

3. **Try different browser:**
   Test in Chrome, Firefox, or Edge

4. **Check firewall/antivirus:**
   Some security software blocks local development servers

## Working Test URLs

Once the server is running, test these URLs:
- http://localhost:5173/ (should show Home page)
- http://localhost:5173/login (should show Login page)

## Expected Behavior

When working correctly, you should see:
- Black background
- White text
- "Framelo" header
- Instagram-like interface
- Mock posts and stories
- Bottom navigation

## Get Help

If none of these solutions work:
1. Check the browser console for specific error messages
2. Share the exact error message
3. Verify all dependencies are installed
4. Make sure you're in the correct directory (`frontend/`)