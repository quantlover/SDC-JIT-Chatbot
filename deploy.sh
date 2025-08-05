#!/bin/bash

# JustInTimeMedicine Chatbot Deployment Script
# This script helps deploy the chatbot to various platforms

echo "🏥 JustInTimeMedicine Chatbot Deployment Helper"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "1. ✅ Project files present"

# Check for required files
required_files=("client/src/components/ChatWidget.tsx" "server/index.ts" "shared/schema.ts")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file found"
    else
        echo "   ❌ $file missing"
        exit 1
    fi
done

echo ""
echo "🔧 Deployment Options:"
echo "1. Replit Deployment (Recommended)"
echo "2. Build for Self-Hosting"
echo "3. Generate Integration Code"

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Replit Deployment Instructions:"
        echo "1. Go to your Replit workspace"
        echo "2. Click the 'Deploy' button in the top right"
        echo "3. Choose 'Autoscale Deployment'"
        echo "4. Set your OpenAI API key in environment variables"
        echo "5. Your chatbot will be live at: https://your-repl-name.your-username.repl.co"
        echo ""
        echo "📝 Don't forget to:"
        echo "   - Add OPENAI_API_KEY to environment variables"
        echo "   - Configure custom domain if needed"
        echo "   - Test the deployment after going live"
        ;;
    2)
        echo ""
        echo "🏗️  Building for self-hosting..."
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing dependencies..."
            npm install
        fi
        
        # Build the project
        echo "🔨 Building project..."
        npm run build
        
        echo "✅ Build complete! Files ready for deployment:"
        echo "   - dist/ folder contains the built application"
        echo "   - server/ folder contains the backend code"
        echo "   - Deploy to your hosting platform of choice"
        echo ""
        echo "📝 Environment variables needed:"
        echo "   - OPENAI_API_KEY=your_api_key_here"
        echo "   - NODE_ENV=production"
        echo "   - DATABASE_URL=your_db_url (optional, uses in-memory storage otherwise)"
        ;;
    3)
        echo ""
        echo "🔗 Integration Code Generator"
        echo ""
        
        read -p "Enter your deployed chatbot URL (e.g., https://your-domain.com): " chatbot_url
        
        if [ -z "$chatbot_url" ]; then
            echo "❌ URL is required"
            exit 1
        fi
        
        # Generate integration HTML
        cat > integration.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>CHM Chatbot Integration Example</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .integration-code { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        code { background: #e9ecef; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>CHM AI Chatbot Integration</h1>
    
    <h2>Option 1: Iframe Embed (Recommended)</h2>
    <div class="integration-code">
        <code>
&lt;!-- Add this to your JustInTimeMedicine.com website --&gt;<br>
&lt;iframe<br>
&nbsp;&nbsp;src="${chatbot_url}"<br>
&nbsp;&nbsp;width="400"<br>
&nbsp;&nbsp;height="600"<br>
&nbsp;&nbsp;frameborder="0"<br>
&nbsp;&nbsp;style="border: 1px solid #ccc; border-radius: 12px;"<br>
&nbsp;&nbsp;title="CHM AI Assistant"&gt;<br>
&lt;/iframe&gt;
        </code>
    </div>
    
    <h2>Option 2: Floating Widget</h2>
    <div class="integration-code">
        <code>
&lt;!-- Add this before closing &lt;/body&gt; tag --&gt;<br>
&lt;div id="chm-chatbot-container"&gt;&lt;/div&gt;<br>
&lt;script&gt;<br>
&nbsp;&nbsp;// Load chatbot in floating widget<br>
&nbsp;&nbsp;const iframe = document.createElement('iframe');<br>
&nbsp;&nbsp;iframe.src = '${chatbot_url}';<br>
&nbsp;&nbsp;iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 1000;';<br>
&nbsp;&nbsp;document.body.appendChild(iframe);<br>
&lt;/script&gt;
        </code>
    </div>
    
    <h2>Live Preview</h2>
    <iframe src="${chatbot_url}" width="400" height="600" frameborder="0" style="border: 1px solid #ccc; border-radius: 12px;"></iframe>
</body>
</html>
EOF
        
        echo "✅ Integration code generated!"
        echo "📄 Check 'integration.html' for copy-paste code examples"
        echo "🔗 Your chatbot URL: $chatbot_url"
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "📚 Additional Resources:"
echo "   - TRANSFER_GUIDE.md: Complete handoff documentation"
echo "   - replit.md: Project architecture overview"
echo "   - integration.html: Copy-paste integration code (if generated)"
echo ""
echo "✨ Your CHM AI chatbot is ready for the Just In Time team!"