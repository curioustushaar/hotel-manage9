@echo off
(
  echo Staging changes...
  git add .
  echo.
  echo Committing changes...
  git commit -m "Implement Role Based Access Control"
  echo.
  echo Pushing to remote...
  git push -u origin feature/RoleBasedAccess
) > git_push_output.txt 2>&1
