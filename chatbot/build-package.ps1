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
    @{ src = "training.html"; dest = "core\training.html" },
    
    # Demo files
    @{ src = "live-demo.html"; dest = "demos\live-demo.html" },
    @{ src = "integration-test.html"; dest = "demos\integration-test.html" },
    @{ src = "context-demo.html"; dest = "demos\context-demo.html" },
    @{ src = "quick-test.html"; dest = "demos\quick-test.html" },
    @{ src = "integration-example.html"; dest = "examples\minimal-integration.html" },
    
    # Documentation
    @{ src = "README.md"; dest = "docs\README.md" },
    @{ src = "INTEGRATION_SUMMARY.md"; dest = "docs\INTEGRATION_SUMMARY.md" },
    @{ src = "MISSION_COMPLETE.md"; dest = "docs\MISSION_COMPLETE.md" },
    @{ src = "BUG_FIX_COMPLETE.md"; dest = "docs\BUG_FIX_COMPLETE.md" },
    @{ src = "DISTRIBUTION_README.md"; dest = "README.md" },
    
    # Package files
    @{ src = "package-dist.json"; dest = "package.json" },
    
    # Types
    @{ src = "types\index.d.ts"; dest = "types\index.d.ts" },
    
    # Tests
    @{ src = "test\test-chatbot.js"; dest = "tests\test-chatbot.js" }
)

# Copy files to distribution
Write-Host ""
Write-Host "📋 Copying files to distribution..." -ForegroundColor Yellow
$successCount = 0
$totalCount = $filesToCopy.Count

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
        $successCount++
    } else {
        Write-Host "  ⚠️  File not found: $($file.src)" -ForegroundColor Yellow
    }
}

# Create additional package files
Write-Host ""
Write-Host "📝 Creating additional package files..." -ForegroundColor Yellow

# Create .gitignore
$gitignoreContent = @"
node_modules/
*.log
.DS_Store
Thumbs.db
.env
.env.local
.env.production
temp/
"@
$gitignoreContent | Out-File -FilePath "$distDir\.gitignore" -Encoding UTF8
Write-Host "  ✅ Created .gitignore" -ForegroundColor Green

# Create simple deployment script
$deployScript = @"
#!/usr/bin/env pwsh
# Simple deployment script for VA Healthcare AI Chatbot

Write-Host "🚀 Deploying VA Healthcare AI Chatbot..." -ForegroundColor Cyan

# Start local server for testing
Write-Host "Starting local server on http://localhost:3000" -ForegroundColor Green
Write-Host "Open demos/live-demo.html to test the chatbot" -ForegroundColor Yellow

if (Get-Command python -ErrorAction SilentlyContinue) {
    Set-Location core
    python -m http.server 3000
} else {
    Write-Host "❌ Python not found. Please install Python or use a different web server." -ForegroundColor Red
}
"@
$deployScript | Out-File -FilePath "$distDir\deploy.ps1" -Encoding UTF8
Write-Host "  ✅ Created deploy.ps1" -ForegroundColor Green

# Create NPM scripts helper
$npmHelper = @"
#!/usr/bin/env pwsh
# NPM Helper for VA Healthcare AI Chatbot

Write-Host "📦 VA Healthcare AI Chatbot - NPM Helper" -ForegroundColor Cyan
Write-Host ""

Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  npm start      - Start demo server" -ForegroundColor Green
Write-Host "  npm test       - Run test suite" -ForegroundColor Green  
Write-Host "  npm run demo   - Open live demo" -ForegroundColor Green
Write-Host "  npm run docs   - Open documentation" -ForegroundColor Green
Write-Host ""

# Check if npm is available
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✅ NPM is available" -ForegroundColor Green
    Write-Host "Run 'npm install' if you plan to use build tools" -ForegroundColor Blue
} else {
    Write-Host "⚠️  NPM not found. You can still use the chatbot without NPM." -ForegroundColor Yellow
    Write-Host "Use deploy.ps1 for simple deployment" -ForegroundColor Blue
}
"@
$npmHelper | Out-File -FilePath "$distDir\npm-helper.ps1" -Encoding UTF8
Write-Host "  ✅ Created npm-helper.ps1" -ForegroundColor Green

# Package summary
Write-Host ""
Write-Host "📊 Package Summary:" -ForegroundColor Cyan
Write-Host "  Files copied: $successCount / $totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host "  Total size: $(Get-ChildItem $distDir -Recurse | Measure-Object -Property Length -Sum | ForEach-Object { [math]::Round($_.Sum / 1MB, 2) }) MB" -ForegroundColor Blue

Write-Host ""
Write-Host "🎉 Distribution package created successfully!" -ForegroundColor Green
Write-Host "📦 Package location: $(Resolve-Path $distDir)" -ForegroundColor Blue
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Navigate to the dist folder" -ForegroundColor White
Write-Host "  2. Run '.\deploy.ps1' to start local server" -ForegroundColor White  
Write-Host "  3. Open demos\live-demo.html to test" -ForegroundColor White
Write-Host "  4. Read README.md for integration instructions" -ForegroundColor White
Write-Host ""

# Open dist folder in explorer
if ($env:OS -eq "Windows_NT") {
    Write-Host "🔍 Opening dist folder in Explorer..." -ForegroundColor Blue
    Invoke-Item $distDir
}
