@echo off
setlocal
set PROJECT=%~dp0FlluxLoginApp\FlluxLoginApp.csproj
if not exist "%PROJECT%" (
  echo لم يتم العثور على مشروع FlluxLoginApp في %PROJECT%.
  pause
  exit /b 1
)
dotnet build "%PROJECT%" -c Release
if errorlevel 1 (
  echo فشل البناء. تأكد من تثبيت .NET SDK 8 و WebView2 Runtime.
  pause
  exit /b 1
)
set EXE=%~dp0FlluxLoginApp\bin\Release\net8.0-windows\FlluxLoginApp.exe
if not exist "%EXE%" (
  echo لم يتم العثور على الملف التنفيذي: %EXE%.
  pause
  exit /b 1
)
start "" "%EXE%"
exit /b 0
