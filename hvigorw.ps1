$HOS_SDK_HOME = $env:HOS_SDK_HOME
if (-not $HOS_SDK_HOME) {
    Write-Host "HOS_SDK_HOME environment variable is not set."
    exit 1
}
$hvigorPath = Join-Path $HOS_SDK_HOME "hvigor\bin\hvigor.ps1"
if (Test-Path $hvigorPath) {
    & $hvigorPath $args
} else {
    Write-Host "hvigor not found at $hvigorPath"
    exit 1
}
