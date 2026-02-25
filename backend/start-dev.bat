@echo off
echo Iniciando servidor LIS Dymind...
echo.
echo Configuracion:
echo - API REST: http://localhost:3000
echo - Swagger: http://localhost:3000/api
echo - Servidor LIS TCP: Puerto 5600
echo.
node_modules\.bin\nest.cmd start --watch
