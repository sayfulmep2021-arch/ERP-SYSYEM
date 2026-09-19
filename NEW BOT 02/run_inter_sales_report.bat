@echo off
title MEP GROUP ERP - Inter Sales Chalan Report Collector
cd /d "%~dp0"
echo ====================================================================
echo   MEP GROUP ERP - INTER SALES CHALAN REPORT COLLECTOR
echo   Warehouse Module -^> Inter Sales -^> Inter Sales Chalan Report
echo   Company: Printing and Packaging ^| To: MEP, Fan, MEP Light
echo ====================================================================
echo.
echo Starting date-wise extraction from 1st of month to today...
py inter_sales_collector.py
echo.
echo ====================================================================
echo   Collection Complete! File saved: Inter_Sales_Chalan_Report_Sep2026.xlsx
echo ====================================================================
pause
