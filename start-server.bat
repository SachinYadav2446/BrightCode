@echo off
echo Starting BrightCode Server with Java Support
echo ============================================
echo.

REM Add Java to PATH for this session
set "PATH=%PATH%;C:\Program Files\Java\jdk-26.0.1\bin"

REM Verify Java is accessible
echo Checking Java installation...
javac -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not found!
    echo Please check your Java installation path.
    pause
    exit /b 1
)

echo.
echo Java is ready!
echo Starting server...
echo.

REM Start the server
cd server
npm start
