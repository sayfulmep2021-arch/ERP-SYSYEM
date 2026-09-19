@echo off
title MEP GROUP ERP - Live Studio
cd /d "%~dp0"
echo ====================================================================
echo   MEP GROUP ERP - ENTERPRISE AUTOMATION SUITE
echo   8-Module Live Management Hub ^& Excel Automation
echo ====================================================================
echo.
echo Launching Web Dashboard on http://127.0.0.1:5000 ...
start "" http://127.0.0.1:5000
py app.py
pause
