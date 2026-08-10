# Push Updated Landing Page to GitHub

## Prerequisites
You need to have Git installed on your system. If you don't have it:
1. Download Git from: https://git-scm.com/download/win
2. Install it with default settings
3. Restart your terminal/PowerShell

## Steps to Push to GitHub

### 1. Open Git Bash or PowerShell in the project directory
```bash
cd C:\Users\brayd\Desktop\ADVERSIQ-Intelligence\ADVERSIQ-Intelligence-main
```

### 2. Initialize Git Repository (if not already done)
```bash
git init
```

### 3. Add the GitHub Remote
```bash
git remote add origin https://github.com/elizabethlwalls1972-crypto/ADVERSIQ-Intelligence.git
```

### 4. Add All Files
```bash
git add .
```

### 5. Commit the Changes
```bash
git commit -m "Deploy new orange-themed landing page with split-screen hero design"
```

### 6. Push to GitHub
```bash
git push -u origin main
```

If the branch is named differently (like `master`), use:
```bash
git push -u origin master
```

## What Was Changed
- ✅ Replaced `public/index.html` with new orange-themed design
- ✅ Backed up original to `public/index-old-backup.html`
- ✅ New design features:
  - Split-screen hero with animated cyber visual
  - Orange (#f26522) color scheme
  - 8 component architecture cards
  - Deployment options section
  - Montserrat font family

## Troubleshooting

### If you get authentication errors:
You may need to use a Personal Access Token (PAT) instead of password:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Use the token as your password when prompted

### If the remote already exists:
```bash
git remote set-url origin https://github.com/elizabethlwalls1972-crypto/ADVERSIQ-Intelligence.git
```

### To check current remote:
```bash
git remote -v
```

### To check git status:
```bash
git status
```

## Alternative: Using GitHub Desktop
If you prefer a GUI:
1. Download GitHub Desktop: https://desktop.github.com/
2. Open the repository folder
3. Commit and push through the interface