# Push local changes to GitHub, then run the production deploy script on the VPS.
# Usage (from PowerShell on your PC):
#   cd C:\Users\Len\Desktop\pro\harsh321
#   .\deploy\update-production.ps1
#   .\deploy\update-production.ps1 -Branch main -SkipPush
param(
  [string]$Branch = "main",
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Server = "root@187.127.156.125"

Set-Location $RepoRoot

if (-not $SkipPush) {
  Write-Host "==> Pushing to origin/$Branch ..."
  git push origin $Branch
}

Write-Host "==> Uploading deploy scripts to VPS ..."
scp "$PSScriptRoot\update-production.sh" "${Server}:/root/deploy/update-production.sh"
scp "$PSScriptRoot\frontend.env.production" "${Server}:/root/deploy/frontend.env.production"
scp "$PSScriptRoot\nginx-harshtoletservices.conf" "${Server}:/root/deploy/nginx-harshtoletservices.conf"

Write-Host "==> Running deploy on VPS ..."
ssh $Server "sed -i 's/\r$//' /root/deploy/update-production.sh && chmod +x /root/deploy/update-production.sh && bash /root/deploy/update-production.sh $Branch"
