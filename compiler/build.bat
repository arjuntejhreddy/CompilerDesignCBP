@echo off
setlocal enabledelayedexpansion

set ROOT_DIR=%~dp0
set SRC_DIR=%ROOT_DIR%src
set BUILD_DIR=%ROOT_DIR%build
set WINFLEXBISON_DIR=C:\Users\ADMIN\AppData\Local\Microsoft\WinGet\Packages\WinFlexBison.win_flex_bison_Microsoft.Winget.Source_8wekyb3d8bbwe
set BISON=%WINFLEXBISON_DIR%\win_bison.exe
set FLEX=%WINFLEXBISON_DIR%\win_flex.exe

if not exist "%BISON%" (
    set BISON=win_bison.exe
)
if not exist "%FLEX%" (
    set FLEX=win_flex.exe
)

echo [1/3] Running Bison on parser.y...
pushd "%SRC_DIR%"
"%BISON%" -d -v -o parser.tab.c parser.y
if errorlevel 1 (
    echo Error: Bison failed.
    popd
    exit /b 1
)

echo [2/3] Running Flex on lexer.l...
"%FLEX%" -o lex.yy.c lexer.l
if errorlevel 1 (
    echo Error: Flex failed.
    popd
    exit /b 1
)
popd

echo [3/3] Flex and Bison generated parser.tab.c, parser.tab.h, and lex.yy.c successfully!

where gcc >nul 2>nul
if %errorlevel% equ 0 (
    echo Compiling with gcc to build\flowcode_compiler.exe...
    gcc -Wall -O2 -I"%SRC_DIR%" "%SRC_DIR%\parser.tab.c" "%SRC_DIR%\lex.yy.c" "%SRC_DIR%\ast.c" "%SRC_DIR%\tac.c" "%SRC_DIR%\codegen.c" "%SRC_DIR%\cfg.c" "%SRC_DIR%\main.c" -o "%BUILD_DIR%\flowcode_compiler.exe"
    if errorlevel 1 (
        echo Warning: gcc compilation had errors.
    ) else (
        echo Built %BUILD_DIR%\flowcode_compiler.exe successfully!
    )
) else (
    echo gcc not currently in PATH. Generated C source files are ready for native compilation.
)
