# Preview Mode Guide

## Overview
The Preview Mode allows you to see live output of your HTML, CSS, and JavaScript code in real-time, similar to CodePen or JSFiddle.

## Features

### ✅ Supported Languages
- **HTML** (.html, .htm) - Full HTML5 support
- **CSS** (.css, .scss) - Styling with CSS3
- **JavaScript** (.js, .jsx) - Client-side JavaScript

### 🎨 How It Works

1. **Automatic Detection**: The preview automatically detects and combines:
   - All HTML files in your workspace
   - All CSS files (injected into `<style>` tags)
   - All JavaScript files (injected into `<script>` tags)

2. **Live Updates**: Preview refreshes automatically when you:
   - Edit any HTML, CSS, or JS file
   - Switch to Preview mode
   - Create or delete files

3. **Manual Refresh**: Click the refresh button in the preview toolbar to force reload

### 📋 Usage

#### Basic Web Page
1. Create an `index.html` file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <div id="app"></div>
</body>
</html>
```

2. Create a `style.css` file:
```css
body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
}

h1 {
    text-align: center;
}
```

3. Create a `script.js` file:
```javascript
document.getElementById('app').innerHTML = '<p>JavaScript is working!</p>';
```

4. Click the **Preview** button in the navbar
5. See your page rendered in real-time!

### 🔄 Auto-Injection

If you don't create an HTML file, the preview automatically creates a basic structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <!-- Your CSS is injected here -->
</head>
<body>
    <div id="root"></div>
    <!-- Your JavaScript is injected here -->
</body>
</html>
```

### 🎯 Use Cases

1. **Static Websites**: Build and preview HTML/CSS/JS websites
2. **Landing Pages**: Design responsive landing pages
3. **UI Components**: Test individual components
4. **Animations**: Preview CSS animations and transitions
5. **DOM Manipulation**: Test JavaScript DOM operations
6. **API Integration**: Test fetch calls and async operations

### 🛡️ Security

The preview iframe uses sandbox attributes for security:
- `allow-scripts` - Allows JavaScript execution
- `allow-same-origin` - Allows same-origin requests
- `allow-forms` - Allows form submission
- `allow-modals` - Allows alerts and modals

### ⚡ Performance

- **Instant Updates**: Changes reflect immediately
- **Isolated Environment**: Preview runs in a sandboxed iframe
- **No Server Required**: Everything runs client-side

### 🚀 Advanced Features

#### Multiple Files
The preview combines all files of each type:
- Multiple HTML files are concatenated
- Multiple CSS files are combined into one `<style>` tag
- Multiple JS files are combined into one `<script>` tag

#### Console Output
JavaScript console logs appear in your browser's DevTools console.

#### Responsive Design
The preview fills the entire viewport, perfect for testing responsive designs.

### 💡 Tips

1. **Use Semantic HTML**: Structure your HTML properly for best results
2. **Organize Files**: Keep HTML, CSS, and JS in separate files
3. **Test Responsively**: Resize the preview to test different screen sizes
4. **Use DevTools**: Open browser DevTools to debug JavaScript
5. **Refresh When Needed**: Use the refresh button if preview doesn't update

### 🔮 Future Enhancements

Coming soon:
- TypeScript compilation support
- React/JSX rendering
- SCSS/SASS compilation
- Multiple preview modes (mobile, tablet, desktop)
- Console output panel
- Error highlighting

### 📝 Example Projects

#### Simple Counter
**index.html**:
```html
<!DOCTYPE html>
<html>
<body>
    <h1>Counter: <span id="count">0</span></h1>
    <button onclick="increment()">+</button>
    <button onclick="decrement()">-</button>
</body>
</html>
```

**script.js**:
```javascript
let count = 0;

function increment() {
    count++;
    document.getElementById('count').textContent = count;
}

function decrement() {
    count--;
    document.getElementById('count').textContent = count;
}
```

**style.css**:
```css
body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: Arial, sans-serif;
}

button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 18px;
    cursor: pointer;
}
```

## Troubleshooting

**Preview is blank?**
- Make sure you have at least one HTML, CSS, or JS file
- Check browser console for JavaScript errors
- Click the refresh button

**Changes not showing?**
- The preview auto-updates, but you can manually refresh
- Make sure you're in Preview mode
- Check if the file was saved

**JavaScript not working?**
- Check browser console for errors
- Make sure your script runs after DOM is loaded
- Use `DOMContentLoaded` event if needed

## Keyboard Shortcuts

- Switch to Preview: Click "Preview" button in navbar
- Refresh Preview: Click refresh icon in preview toolbar
- Back to Editor: Click "IDE" button in navbar
