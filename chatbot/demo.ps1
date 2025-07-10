# VA Healthcare AI Chatbot - Integration Demo Script
# PowerShell script to demonstrate the complete integration

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "VA Healthcare AI Chatbot Integration Demo" -ForegroundColor Cyan
Write-Host "Training System & Context Awareness" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if (-not (Test-Path "chatbot.js")) {
    Write-Host "❌ Error: chatbot.js not found. Please run this script from the chatbot directory." -ForegroundColor Red
    Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
    Write-Host "Expected directory: [...]PowerBI\chatbot\" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found chatbot files in: $currentDir" -ForegroundColor Green
Write-Host ""

# List available demo files
Write-Host "📁 Available Demo Files:" -ForegroundColor Yellow
$demoFiles = @(
    @{File="live-demo.html"; Description="Interactive demo with live scenarios"},
    @{File="context-demo.html"; Description="Context awareness demonstration"},
    @{File="integration-test.html"; Description="Comprehensive test suite"},
    @{File="training.html"; Description="Document upload and training portal"}
)

foreach ($demo in $demoFiles) {
    if (Test-Path $demo.File) {
        Write-Host "  ✅ $($demo.File) - $($demo.Description)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($demo.File) - Missing" -ForegroundColor Red
    }
}

Write-Host ""

# Check core files
Write-Host "🔧 Core Integration Files:" -ForegroundColor Yellow
$coreFiles = @(
    @{File="chatbot.js"; Description="Main chatbot with context awareness"},
    @{File="training.js"; Description="Training system with auto-sync"},
    @{File="README.md"; Description="Documentation"},
    @{File="INTEGRATION_SUMMARY.md"; Description="Integration summary"}
)

foreach ($file in $coreFiles) {
    if (Test-Path $file.File) {
        $size = (Get-Item $file.File).Length
        Write-Host "  ✅ $($file.File) ($([math]::Round($size/1KB, 1)) KB) - $($file.Description)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($file.File) - Missing" -ForegroundColor Red
    }
}

Write-Host ""

# Show integration features
Write-Host "🚀 Integration Features Implemented:" -ForegroundColor Cyan
$features = @(
    "✅ Training System Integration - Learn from uploaded documents",
    "✅ Context Awareness - Remember conversation history and topics",
    "✅ Follow-up Question Detection - Recognize 'How is it done?' style questions",
    "✅ Simple Language Processing - Explain medical terms automatically",
    "✅ Real-time Sync - Training portal updates immediately available",
    "✅ Comprehensive Testing - Full test suite for validation"
)

foreach ($feature in $features) {
    Write-Host "  $feature" -ForegroundColor Green
}

Write-Host ""

# Offer to launch demos
Write-Host "🌐 Demo Options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Live Interactive Demo (Recommended)" -ForegroundColor White
Write-Host "   - Shows all features in action" -ForegroundColor Gray
Write-Host "   - Multiple scenarios to test" -ForegroundColor Gray
Write-Host "   - Real-time status monitoring" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Integration Test Suite" -ForegroundColor White
Write-Host "   - Validates all functionality" -ForegroundColor Gray
Write-Host "   - 6 comprehensive tests" -ForegroundColor Gray
Write-Host "   - Technical validation" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Training Portal" -ForegroundColor White
Write-Host "   - Upload documents" -ForegroundColor Gray
Write-Host "   - Manage training data" -ForegroundColor Gray
Write-Host "   - Test real-time sync" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Launch All Demos" -ForegroundColor White
Write-Host "   - Opens all interfaces" -ForegroundColor Gray
Write-Host "   - Complete testing environment" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (1-4) or 'q' to quit"

switch ($choice) {
    "1" {
        Write-Host "🚀 Launching Live Interactive Demo..." -ForegroundColor Green
        Start-Process "live-demo.html"
    }
    "2" {
        Write-Host "🧪 Launching Integration Test Suite..." -ForegroundColor Green
        Start-Process "integration-test.html"
    }
    "3" {
        Write-Host "📚 Launching Training Portal..." -ForegroundColor Green
        Start-Process "training.html"
    }
    "4" {
        Write-Host "🚀 Launching All Demos..." -ForegroundColor Green
        Write-Host "Opening Live Demo..." -ForegroundColor Yellow
        Start-Process "live-demo.html"
        Start-Sleep -Seconds 2
        
        Write-Host "Opening Test Suite..." -ForegroundColor Yellow
        Start-Process "integration-test.html"
        Start-Sleep -Seconds 2
        
        Write-Host "Opening Training Portal..." -ForegroundColor Yellow
        Start-Process "training.html"
        Start-Sleep -Seconds 2
        
        Write-Host "Opening Context Demo..." -ForegroundColor Yellow
        Start-Process "context-demo.html"
    }
    "q" {
        Write-Host "👋 Goodbye!" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Demo Launched Successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 How to Test the Integration:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Context Awareness:" -ForegroundColor White
Write-Host "   • Ask: 'What is knee replacement surgery?'" -ForegroundColor Gray
Write-Host "   • Then ask: 'How is it done?'" -ForegroundColor Gray
Write-Host "   • Notice how it remembers the context!" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Training Integration:" -ForegroundColor White
Write-Host "   • Use the training portal to upload documents" -ForegroundColor Gray
Write-Host "   • Watch the chatbot learn new information" -ForegroundColor Gray
Write-Host "   • Test real-time synchronization" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Simple Language:" -ForegroundColor White
Write-Host "   • Notice medical terms explained in parentheses" -ForegroundColor Gray
Write-Host "   • Example: 'inflammation (swelling)'" -ForegroundColor Gray
Write-Host "   • Follow-up suggestions provided" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Follow-up Questions:" -ForegroundColor White
Write-Host "   • Try: 'Tell me more about that'" -ForegroundColor Gray
Write-Host "   • Try: 'What does that involve?'" -ForegroundColor Gray
Write-Host "   • Try: 'Can you explain that better?'" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Pro Tip: Run the Integration Test Suite first to validate everything is working!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 For more information, see:" -ForegroundColor Yellow
Write-Host "   • README.md - Complete documentation" -ForegroundColor Gray
Write-Host "   • INTEGRATION_SUMMARY.md - Technical details" -ForegroundColor Gray
Write-Host ""

# Keep the window open
Read-Host "Press Enter to exit"
