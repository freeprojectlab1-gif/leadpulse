# 🚀 LeadPulse Project Command Guide

Yeh guide aapko batayegi ki kis situation mein kaunsa command use karna hai. 

---

## 1. Local Development (Normal Run)
**Situation:** Jab aapko normal local development ke liye frontend aur backend start karna ho.

### Backend Start:
Open terminal in `backend` folder and run:
```bash
node server.js
```
*(Backend default port `5001` par chalega)*

### Frontend Start:
Open terminal in `frontend` folder and run:
```bash
npm run dev
```
*(Frontend dev server port `5173` ya `5174` par chalega)*

---

## 2. Hard Restart (Port Busy / EADDRINUSE Error)
**Situation:** Jab terminal crash ho jaye, ya `Port 5001 / 5173 is in use` ka error aaye.

### Windows / Linux common commands to free ports (Linux/Ubuntu):
Run this command in terminal to kill processes running on ports `5001` and `5173`:
```bash
fuser -k 5001/tcp && fuser -k 5173/tcp
```
Iske baad **Normal Run** wale commands se dubara start karein.

---

## 3. Fresh Rebuild (Hard Reset for Production)
**Situation:** Jab aapne design ya code frontend mein change kiya ho aur backend port `5001` par latest changes nahi dikh rahe hon.

Run this from the root folder:
```bash
# 1. Kill old processes
fuser -k 5001/tcp && fuser -k 5173/tcp

# 2. Build frontend production package
cd frontend && npm run build

# 3. Start backend again (serves the updated build)
cd ../backend && node server.js
```

---

## 4. Git Push to GitHub & GitLab (Both Branches)
**Situation:** Jab aapko local changes `master` aur `master_2` branches par commit karke GitHub aur GitLab dono par push karne hon.

```bash
# 1. Stage and Commit changes
git add .
git commit -m "feat: your commit message here"

# 2. Push master_2 to both remotes
git push origin master_2
git push gitlab master_2

# 3. Merge to master and push
git checkout master
git merge master_2
git push origin master
git push gitlab master

# 4. Switch back to master_2 for coding
git checkout master_2
```

---

## 5. Reverting to a Previous Commit (Hard Reset)
**Situation:** Jab koi latest commit se features crash ho jayein aur aapko purane safe commit par wapas jana ho.

### Step 1: Find target commit hash
Run this to see list of previous commits with their short hashes (e.g., `53f7c27`):
```bash
git log --oneline -n 10
```

### Step 2: Reset local branch
```bash
git reset --hard <COMMIT_HASH>
# Example: git reset --hard 53f7c27
```

### Step 3: Force push to update online repositories
```bash
git push origin <BRANCH_NAME> --force
git push gitlab <BRANCH_NAME> --force
# Example: git push origin master --force
```

---

## 6. Update GitLab Token / Credentials
**Situation:** Jab GitLab push error de (`Repository not found` ya `Permission denied`) naye password/token ki wajah se.

Run this command to update GitLab remote URL with the new token:
```bash
git remote set-url gitlab https://oauth2:<YOUR_NEW_TOKEN>@gitlab.com/muntazirhasan-group/bulkemail-sender.git
```
