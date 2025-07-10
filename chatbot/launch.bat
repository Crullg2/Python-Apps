@echo off
echo ================================================
echo VA Healthcare AI Chatbot - Quick Launch
echo ================================================
echo.
echo This script will open all the key interfaces:
echo.
echo 1. Main Chatbot Demo (context-demo.html)
echo 2. Training Portal (training.html) 
echo 3. Integration Test Suite (integration-test.html)
echo.
pause

echo Opening Main Chatbot Demo...
start "" "context-demo.html"

timeout /t 2 >nul

echo Opening Training Portal...
start "" "training.html"

timeout /t 2 >nul

echo Opening Integration Test Suite...
start "" "integration-test.html"

echo.
echo ================================================
echo All interfaces launched!
echo ================================================
echo.
echo To test the integration:
echo 1. Use the Training Portal to upload documents
echo 2. Try the Main Chatbot Demo for conversations
echo 3. Run the Integration Test Suite to validate
echo.
echo The chatbot now supports:
echo - Learning from uploaded documents
echo - Context-aware follow-up questions
echo - Simple language explanations
echo - Real-time training data sync
echo.
pause
