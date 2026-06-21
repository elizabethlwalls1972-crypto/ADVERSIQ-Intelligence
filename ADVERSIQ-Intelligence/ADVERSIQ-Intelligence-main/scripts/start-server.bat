@echo off
cd /d "c:\Users\brayd\Downloads\bw-nexus-ai-final-11"
echo Starting BWGA Intelligence AI Backend Server...
echo Loading environment from: %CD%\.env
npx tsx server/index.ts
pause
