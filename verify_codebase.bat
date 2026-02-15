@echo off
echo Running lint...
call npm run lint > lint_log.txt 2>&1
echo Lint finished with code %ERRORLEVEL%

echo Running build...
call npm run build > build_log.txt 2>&1
echo Build finished with code %ERRORLEVEL%
