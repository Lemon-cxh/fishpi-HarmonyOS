# 清理 console 日志的脚本
$files = Get-ChildItem -Path "E:\Project\finshpi\entry\src\main\ets" -Recurse -Filter "*.ets"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # 移除 console.info 行
    $content = $content -replace "[\r\n]+\s*console\.info\([^)]*\);", ""
    # 移除 console.error 行
    $content = $content -replace "[\r\n]+\s*console\.error\([^)]*\);", ""
    # 移除 console.warn 行
    $content = $content -replace "[\r\n]+\s*console\.warn\([^)]*\);", ""
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Cleaned: $($file.Name)"
    }
}

Write-Host "Done!"
