@echo off
setlocal

set MSYS2=C:\msys64\mingw64
if defined MSYSTEM_PREFIX set MSYS2=%MSYSTEM_PREFIX%

set SRC=src\main.c src\server\server.c src\server\utils.c
set OUT=build\main.exe
set FLAGS=-O2 -Wall -Wextra
set INC=-Iinclude -I%MSYS2%\include
set LIBS=-L%MSYS2%\lib -lmicrohttpd

if not exist build mkdir build

gcc %FLAGS% %INC% %SRC% -o %OUT% %LIBS%
if %errorlevel% neq 0 (
    echo [ERRO] Falha na compilacao.
    exit /b 1
)

echo [OK] Compilacao bem-sucedida. Executando...
%OUT%
