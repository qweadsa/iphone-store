# Push to GitHub, then run deploy/server-update.sh on teumu.online
# Usage: powershell -ExecutionPolicy Bypass -File deploy/push-and-deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$hostName = if ($env:DEPLOY_HOST) { $env:DEPLOY_HOST } else { "160.30.4.98" }
$user = if ($env:DEPLOY_USER) { $env:DEPLOY_USER } else { "root" }
$key = if ($env:DEPLOY_KEY) { $env:DEPLOY_KEY } else { "$env:USERPROFILE\.ssh\iphone-store-deploy" }

Write-Host "==> git push origin main"
git push origin main

if (-not (Test-Path $key)) {
  Write-Error "Deploy SSH key not found: $key`nRun once: ssh-keygen -t ed25519 -f `"$key`" -N `"`"`""
}

Write-Host "==> deploy on $user@$hostName"
ssh -i $key -o BatchMode=yes -o StrictHostKeyChecking=accept-new "${user}@${hostName}" `
  "cd /var/www/iphone-store && sudo bash deploy/server-update.sh"

Write-Host "==> done"
