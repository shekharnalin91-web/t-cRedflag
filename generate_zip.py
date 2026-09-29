import os
import zipfile

project_root = r"C:\Users\NALIN SHEKHAR\.gemini\antigravity\scratch\tc-red-flag-scanner"
website_dir = os.path.join(project_root, "website")
zip_path = os.path.join(website_dir, "tc_red_flag_guard_v2.4.0_windows.zip")

# Create Batch helper files to include in zip
bat_desktop_path = os.path.join(project_root, "Launch_Desktop_App.bat")
with open(bat_desktop_path, "w", encoding="utf-8") as f:
    f.write('@echo off\nstart "" "%~dp0desktop\\index.html"\n')

bat_scanner_path = os.path.join(project_root, "Launch_Web_Scanner.bat")
with open(bat_scanner_path, "w", encoding="utf-8") as f:
    f.write('@echo off\nstart "" "%~dp0frontend\\index.html"\n')

readme_path = os.path.join(project_root, "README_INSTALLATION.txt")
with open(readme_path, "w", encoding="utf-8") as f:
    f.write("""========================================================================
🛡️ T&C RED FLAG GUARD v2.4.0 — WINDOWS SECURITY PACKAGE
========================================================================

Thank you for downloading T&C Red Flag Guard!

PACKAGE CONTENTS:
-----------------
1. extension/            - Manifest V3 Browser Extension (Chrome, Edge, Brave)
2. desktop/              - Desktop Companion Security Center Dashboard
3. frontend/             - Interactive Web Scanner Engine
4. demo/                 - Target Demo Site (NovaCloud Services)
5. Launch_Desktop_App.bat - Double-click to launch Desktop Security Center
6. Launch_Web_Scanner.bat - Double-click to launch Web Scanner Engine


QUICK START GUIDE:
------------------
A. BROWSER EXTENSION INSTALLATION (Chrome / Edge / Brave):
   1. Open your browser and go to:
      - Chrome: chrome://extensions
      - Edge:   edge://extensions
   2. Turn ON "Developer mode" in the top-right corner.
   3. Click "Load unpacked".
   4. Select the "extension" folder from this extracted zip.
   5. You are protected! The extension will now automatically detect consent
      checkboxes and pop up antivirus-style legal warning overlays.

B. DESKTOP COMPANION APP:
   1. Double-click "Launch_Desktop_App.bat" or open "desktop/index.html".
   2. Inspect real-time intercept history, threat metrics, and export CSV logs.

C. DEMO SITE TESTING:
   1. Open "demo/index.html" in your browser to test agreement warnings
      on a simulated sign-up portal (NovaCloud Services).

For support & documentation, visit: https://tc-red-flag-guard.org
========================================================================
""")

folders_to_include = ["extension", "desktop", "frontend", "demo"]
files_to_include = ["README_INSTALLATION.txt", "Launch_Desktop_App.bat", "Launch_Web_Scanner.bat", "README.md"]

print(f"Creating zip file at: {zip_path}")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for filename in files_to_include:
        filepath = os.path.join(project_root, filename)
        if os.path.exists(filepath):
            zipf.write(filepath, filename)

    for folder in folders_to_include:
        folder_path = os.path.join(project_root, folder)
        if os.path.exists(folder_path):
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    if "__pycache__" in root or ".git" in root:
                        continue
                    abs_path = os.path.join(root, file)
                    rel_path = os.path.relpath(abs_path, project_root)
                    zipf.write(abs_path, rel_path)

print(f"Zip created successfully! Size: {os.path.getsize(zip_path)} bytes")
