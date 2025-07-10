#!/usr/bin/env pwsh

# VA Healthcare AI Chatbot - Package Builder
# PowerShell script to create distribution package

Write-Host "🏗️  VA Healthcare AI Chatbot - Distribution Package Builder" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "chatbot.js")) {
    Write-Host "❌ Error: chatbot.js not found. Please run this script from the chatbot directory." -ForegroundColor Red
    exit 1
}

# Create distribution directory structure
$distDir = ".\dist"
$dirs = @(
    ".\dist",
    ".\dist\core",
    ".\dist\demos", 
    ".\dist\docs",
    ".\dist\tests",
    ".\dist\types",
    ".\dist\examples"
)

Write-Host "📁 Creating distribution directory structure..." -ForegroundColor Yellow
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  📁 Exists: $dir" -ForegroundColor Blue
    }
}

# File mapping for distribution
$filesToCopy = @(
    # Core files
    @{ src = "chatbot.js"; dest = "core\va-chatbot.js" },
    @{ src = "training.js"; dest = "core\va-training.js" },
    @{ src = "index.html"; dest = "core\index.html" },
    @{ src = "training.html"; dest = "core\training.html" }
)

# Copy core files
Write-Host ""
Write-Host "📋 Copying core files..." -ForegroundColor Yellow
foreach ($file in $filesToCopy) {
    $srcPath = $file.src
    $destPath = Join-Path $distDir $file.dest
    
    if (Test-Path $srcPath) {
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item $srcPath $destPath -Force
        Write-Host "  ✅ $($file.src) → $($file.dest)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  File not found: $($file.src)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Distribution package created successfully!" -ForegroundColor Green
Write-Host "📦 Package location: $(Resolve-Path $distDir)" -ForegroundColor Blue
