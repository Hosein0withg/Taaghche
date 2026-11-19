# Taaghche E-Book Store

A web-based Application simulating the Taaghche e-book store, built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript**. This project requires **no external dependencies**, third-party libraries, or package installations to run.

---

## Project Entry Path
The main entry point of the application is located in the root directory:
- `index.html`

---

## How to Run
The application is completely static and runs without installing any dependencies. You can launch it using either of the following methods:

1. **Direct Browser Execution:** Double-click `index.html` to open it directly in your default web browser.
2. **Local Development Server (Recommended):**
   - **VS Code:** Right-click `index.html` and select **Open with Live Server** (using the Live Server extension).
   - **Python:** Run `python -m http.server 8000` in the project root directory and navigate to `http://localhost:8000` in your browser.

---

## Tested Browsers
The UI, `localStorage` persistence, and responsive layouts (at `360px`, `768px`, and `1440px` viewport widths) have been tested and verified on:
- **Google Chrome**
- **Microsoft Edge**

---

## How to Clear Saved State
User accounts, favorites, purchased/downloaded library books, and reader preferences (font size and light/dark theme) are persisted in the browser's `localStorage`. To reset and clear all saved state, use one of the following methods:

### Method 1: Via Browser Console
1. Press `F12` (or `Ctrl + Shift + I` / `Cmd + Option + I` on macOS) to open Developer Tools.
2. Switch to the **Console** tab.
3. Run either of the following commands and press `Enter`:
   ```javascript
   Storage.clear()
   ```
   or:
   ```javascript
   localStorage.clear()
   ```
4. Refresh the page (`F5`).

### Method 2: Via Application Storage Panel
1. Open Developer Tools (`F12`) and go to the **Application** tab.
2. In the left sidebar, expand **Storage** -> **Local Storage** and select the site origin.
3. Select and delete the stored keys (`user`, `users`, `settings`, `library_09...`, and `favorites_09...`), then reload the page.

---

## Folder Structure
```text
project-root/
├── index.html                  # Main HTML entry point and application views (Home, Search, Details, Library, Reader)
├── README.md                   # Project documentation and setup instructions
├── css/
│   └── style.css               # Stylesheet, CSS variables, local font declarations, and responsive media queries
├── js/
│   ├── book.js                 # Static dataset (BOOKS_DATA) containing book metadata, samples, and full texts
│   ├── storage.js              # Safe localStorage wrapper with JSON parsing error handling (try/catch)
│   ├── ui.js                   # Dynamic and XSS-safe DOM rendering helpers using textContent
│   └── app.js                  # Core application state, URL routing, combined filtering, auth, and e-reader logic
└── assets/
    ├── fonts/
    │   ├── DUBAI-REGULAR.TTF   # Local Dubai font (Regular)
    │   └── DUBAI-BOLD.TTF      # Local Dubai font (Bold)
    └── images/
        ├── cover1.jpg          # Cover image for book 1
        ├── ...
        └── cover12.jpg         # Cover image for book 12
```
