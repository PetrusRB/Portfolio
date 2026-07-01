@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Portfolio - Build
echo ========================================
echo.

:: ============================================
::  CLEANUP
:: ============================================
echo [1/4] Limpando build anterior...

if exist build (
    rmdir /s /q build
    echo       Removida pasta build/
)

if exist www\dist (
    del /q /f www\dist\*.js 2>nul
    del /q /f www\dist\*.js.map 2>nul
    del /q /f www\dist\*.d.ts 2>nul
    echo       Removidos arquivos TypeScript
)

echo       Clean concluido
echo.

:: ============================================
::  TYPESCRIPT
:: ============================================
echo [2/4] Compilando TypeScript...

cd www
if not exist node_modules (
    echo       Instalando dependencias...
    call pnpm install --silent 2>nul
)

call pnpm tsc 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Erro ao compilar TypeScript
    cd ..
    exit /b 1
)
cd ..

echo       TypeScript OK
echo.

:: ============================================
::  CMAKE CONFIGURE + BUILD
:: ============================================
echo [3/4] Buildando backend (CMake)...

cmake -B build -G "MinGW Makefiles" 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Erro no cmake configure
    exit /b 1
)

cmake --build build 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Erro no cmake build
    exit /b 1
)

echo       C OK
echo.

:: ============================================
::  RUN
:: ============================================
echo [4/4] Executando servidor...
echo ========================================
echo   Servidor ligado >:3
echo   Ctrl+C para parar
echo ========================================
echo.

build\server.exe
