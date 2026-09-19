@echo off
title MEP GROUP ERP - Fan Inter Sales Chalan Report
cd /d "%~dp0"
echo ====================================================================
echo   MEP GROUP ERP - FAN INTER SALES CHALAN REPORT STUDIO
echo   Company: Printing and Packaging ^| To: Fan ONLY
echo   Order: Today (14 Sep) -^> Month Start (01 Sep) [Reverse Chronological]
echo ====================================================================
echo.
echo Launching Web Studio on http://127.0.0.1:5000 ...
start "" http://127.0.0.1:5000
py app.py
pause
