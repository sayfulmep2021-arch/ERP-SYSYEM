@echo off
title MEP Portal - PWA Local Server
cd /d "%~dp0"
echo ========================================================
echo   MEP PORTAL - PROGRESSIVE WEB APP (PWA) SERVER
echo ========================================================
echo.
echo Starting local secure server at http://localhost:8080 ...
echo Browser will open automatically.
echo.
echo NOTE: In Chrome or Edge, click the 'Install App' icon (computer with down-arrow)
echo       in the URL address bar to install this app permanently on Windows!
echo.
echo Press Ctrl+C in this window anytime to stop the server.
echo ========================================================
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0server.ps1"
pause
