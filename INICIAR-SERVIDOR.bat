@echo off
:: Inicia el servidor Boss Gold con privilegios de administrador
PowerShell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File ""%~dp0server.ps1""' -Verb RunAs"
