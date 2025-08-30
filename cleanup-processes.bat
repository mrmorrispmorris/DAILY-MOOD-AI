@echo off
echo Cleaning up Node.js and Cursor processes...

REM Kill all Node processes
taskkill /f /im node.exe 2>nul
if %errorlevel% == 0 (
    echo Node processes terminated successfully
) else (
    echo No Node processes found to terminate
)

REM Kill any remaining development server processes
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a 2>nul  
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3003') do taskkill /f /pid %%a 2>nul

echo Port cleanup completed
echo You can now run: npm run dev
pause


