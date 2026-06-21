@echo off
echo ========================================
echo ADVERSIQ Intelligence - Push to GitHub
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo Git found! Proceeding with push...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check if .git exists
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Check if remote exists
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Adding GitHub remote...
    git remote add origin https://github.com/elizabethlwalls1972-crypto/ADVERSIQ-Intelligence.git
    echo.
) else (
    echo Remote already exists, updating URL...
    git remote set-url origin https://github.com/elizabethlwalls1972-crypto/ADVERSIQ-Intelligence.git
    echo.
)

REM Add all files
echo Adding files to git...
git add .
echo.

REM Commit changes
echo Committing changes...
git commit -m "Deploy new orange-themed landing page with split-screen hero design"
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Push to 'main' failed, trying 'master' branch...
    git push -u origin master
)

echo.
echo ========================================
echo Push completed!
echo ========================================
echo.
echo Your changes are now on GitHub at:
echo https://github.com/elizabethlwalls1972-crypto/ADVERSIQ-Intelligence
echo.
pause

@REM Made with Bob
