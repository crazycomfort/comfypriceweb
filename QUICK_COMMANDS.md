# Quick Commands Cheat Sheet
## Copy & Paste These Commands

---

## 🖥️ Test Your App Locally

```bash
npm run dev
```

**What it does:** Starts your website on your computer  
**Then:** Open http://localhost:3000 in your browser  
**To stop:** Press `Ctrl + C` in the terminal

---

## 🔨 Build Your App (Check for Errors)

```bash
npm run build
```

**What it does:** Checks if your code has any errors  
**If it works:** You're ready to deploy!  
**If it breaks:** Fix the errors it shows you

---

## 📦 Install Dependencies (If Needed)

```bash
npm install
```

**When to use:** If someone else's computer, or if you get "module not found" errors

---

## 🚀 Deploy to Vercel (After GitHub Setup)

```bash
npm i -g vercel
vercel
```

**What it does:** Puts your website online  
**First time:** It will ask you to log in  
**Then:** Follow the prompts

---

## 📝 Git Commands (For GitHub)

### First Time Setup:
```bash
git init
git add .
git commit -m "First commit"
```

### Push to GitHub:
```bash
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### Update GitHub:
```bash
git add .
git commit -m "Updated code"
git push
```

---

## 🧹 Clean Up (If Things Break)

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📊 Check What's Running

```bash
# See what's using port 3000
lsof -i :3000

# Kill a process (if needed)
kill -9 PROCESS_ID
```

---

## 💡 Pro Tips

- **Always test locally first** before deploying
- **Commit often** to GitHub (saves your work)
- **Read error messages** - they tell you what's wrong
- **Google error messages** - someone else had the same problem

---

**That's it!** These are the only commands you need to know. 🎉

