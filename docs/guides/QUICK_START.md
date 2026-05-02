# 🚀 Quick Start Guide - Java PATH Issue Fix

## The Problem
You have Java installed, but your system can't find it because it's not in your PATH environment variable.

## ✅ Quick Solutions

### Option 1: Use the Startup Script (Easiest)

Just double-click one of these files in your project folder:

- **`start-server.bat`** (Windows Command Prompt)
- **`start-server-with-java.ps1`** (PowerShell)

These scripts automatically add Java to PATH and start your server.

### Option 2: Manual Command (Each Time)

Every time you open a new terminal, run this first:

```powershell
$env:Path += ";C:\Program Files\Java\jdk-26.0.1\bin"
```

Then start your server normally:
```bash
cd server
npm start
```

### Option 3: Permanent Fix (Recommended)

Add Java to your System PATH once, and never worry about it again:

#### Step-by-Step Instructions:

1. **Open System Properties**
   - Press `Win + X` on your keyboard
   - Click **"System"**

2. **Open Environment Variables**
   - Click **"Advanced system settings"** (right side)
   - Click **"Environment Variables"** button (bottom)

3. **Edit PATH Variable**
   - In the **"System variables"** section (bottom half)
   - Find and select **"Path"**
   - Click **"Edit"**

4. **Add Java Path**
   - Click **"New"**
   - Type: `C:\Program Files\Java\jdk-26.0.1\bin`
   - Click **"OK"**

5. **Apply Changes**
   - Click **"OK"** on all windows
   - **Close ALL terminals and VS Code**
   - Reopen everything

6. **Verify It Works**
   - Open a new terminal
   - Run: `javac -version`
   - You should see: `javac 26.0.1`

## 🧪 Testing

After fixing the PATH, test if Java works:

```bash
javac -version
```

Expected output:
```
javac 26.0.1
```

If you see this, you're all set! Start your server:

```bash
cd server
npm start
```

Then try the Java compilation feature in Code Arena.

## 🆘 Still Not Working?

### Check Your Java Installation Path

Run this in PowerShell:
```powershell
Get-ChildItem "C:\Program Files\Java" | Select-Object Name
```

If you see a different version number, update the path in the scripts.

### Restart Your Computer

Sometimes Windows needs a full restart for PATH changes to take effect.

### Check for Typos

Make sure the path is exactly:
```
C:\Program Files\Java\jdk-26.0.1\bin
```

No extra spaces, correct slashes, and correct version number.

## 📝 Why This Happens

When you install Java, the installer sometimes doesn't automatically add it to your system PATH. The PATH is a list of folders where Windows looks for executable programs. Without Java in the PATH, Windows can't find `javac` (the Java compiler).

## 🎯 What Each File Does

- **`start-server.bat`**: Batch script that adds Java to PATH and starts server (double-click to run)
- **`start-server-with-java.ps1`**: PowerShell script that does the same thing
- **`add-java-to-path.ps1`**: Just adds Java to PATH without starting server
- **`JAVA_SETUP.md`**: Detailed Java installation and troubleshooting guide

## ✨ After Fixing

Once Java is in your PATH:
- The "Compilation Error" will disappear
- Java Master module in Code Arena will work
- You can compile and run Java code directly in the platform

---

**Need more help?** Check [JAVA_SETUP.md](./JAVA_SETUP.md) for detailed troubleshooting.
