@echo off
echo Starting BWGA Intelligence AI Backend Server...
cd /d "%~dp0"
npx tsx server/index.ts
pause
