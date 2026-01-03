@echo off
echo ===================================================
echo   BellaFlow - Iniciando Sistema Completo (Windows)
echo ===================================================
echo.
echo [1/2] Iniciando Backend (API)...
start "BellaFlow Backend" cmd /k "node server.js"
echo Backend iniciado em nova janela.
echo.
echo [2/2] Iniciando Frontend (Web App)...
echo O navegador abrirá automaticamente quando pronto.
echo IMPORTANTE: Não feche esta janela ou a janela do Backend.
echo.
cmd /c "npm run dev"
pause
