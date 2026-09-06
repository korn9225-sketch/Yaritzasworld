@echo off
setlocal
cd /d "%~dp0"
start "Queen Project Server" /min cmd /c "python -m http.server 8000"
timeout /t 1 /nobreak >nul
start "Queen Project" "http://localhost:8000/"
