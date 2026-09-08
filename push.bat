@echo off
git add .
set /p msg="Enter commit message (or press Enter for default): "
if "%msg%"=="" set msg=Update
git commit -m "%msg%"
git push origin main
pause
