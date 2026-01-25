# Packaging & Debugging Summary: TuioBridge_Final.exe

This document summarizes the technical challenges and solutions encountered during the development and packaging of the `TuioBridge_Final.exe` binary using `pkg`.

## 1. Project Restructuring for `pkg` Assets

### Challenge
The initial project structure had assets scattered across different directories (`/`, `dist-animation/`, etc.). When packaged with `pkg`, files outside the bundled directory were often missed or required complex path mapping in `package.json`.

### Solution
- **Centralized `public/` Directory:** All frontend assets (HTML, JS, CSS, and the built animation studio) were moved into a single `public/` directory.
- **`pkg` Configuration:** Simplified the `package.json` assets configuration to include everything in `public/`.
  ```json
  "pkg": {
    "assets": [
      "public/**/*"
    ]
  }
  }
  ```
- **Static Server Update:** Modified `static-server.js` to serve all files from the `public/` root, ensuring consistent pathing between development and the packaged environment.

## 2. ESM vs. CommonJS Compatibility

### Challenge
The project used ESM (`import/export`) and relied on `import.meta.url` for path resolution. `pkg` has historically had better support for CommonJS, and `import.meta.url` often fails or behaves unexpectedly in the virtual filesystem (snapshot) of a `pkg` binary.

### Solution
- **Bundling to CJS:** Used `esbuild` to bundle the backend code into a single CommonJS file (`backend.cjs`). This simplified the dependency chain and ensured compatibility with `pkg`.
- **Robust Path Resolution:** Implemented a `PROJECT_ROOT` detection block that handles both CJS (`__dirname`) and ESM environments, with a fallback for the `pkg` snapshot environment.
  ```javascript
  let PROJECT_ROOT;
  try {
      if (process.pkg) {
          PROJECT_ROOT = path.dirname(process.execPath);
          // For assets inside the snapshot
          const SNAPSHOT_ROOT = path.join(__dirname); 
      } else {
          PROJECT_ROOT = __dirname;
      }
  } catch (e) {
      // ESM Fallback
      PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));
  }
  ```

## 3. WebSocket Dynamic Host Resolution

### Challenge
Hardcoded `localhost` in client-side scripts (`app.js`, `text-display.js`) caused connectivity issues if the user accessed the server via an IP address or a different hostname.

### Solution
- **Dynamic URL Construction:** Updated client scripts to use `window.location.hostname` to automatically connect to the correct host.
  ```javascript
  const wsUrl = `ws://${window.location.hostname}:8080`;
  ```

## 4. Animation Studio Integration

### Challenge
The LED Animation Studio (a Vite-based React app) was building to a different directory, causing `404` errors when the wrapper `animation.html` tried to load it via an iframe or direct link in the packaged exe.

### Solution
- **Vite `outDir` Alignment:** Updated `animation-studio/vite.config.ts` to output directly into the `public/` directory.
  ```typescript
  build: {
    outDir: '../public/dist-animation',
    emptyOutDir: true,
    // ...
  }
  ```
- **Relative Base Path:** Set `base: './'` in Vite config to ensure asset paths within the built React app are relative and work correctly inside the nested `public/dist-animation` folder.

## 5. Port Management & "Zombie" Processes

### Challenge
During development and build cycles, ports (8001, 8080, 3333) often remained bound to previous instances of the application, leading to `EADDRINUSE` errors.

### Solution
- **Aggressive Cleanup:** Implemented a pre-build step to terminate any processes using the required ports.
  ```powershell
  # Example PowerShell command used
  Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```

## 6. Debugging Tools for `pkg`

### Challenge
Visibility into the `pkg` virtual filesystem is limited once the binary is running.

### Solution
- **Diagnostic Logging:** Added temporary `fs.readdirSync` calls to log the contents of the snapshot directory (`/snapshot/`) to the console during startup.
- **Debug Routes:** Briefly implemented a `/.ls` route in the static server to browse the virtual filesystem from the browser. *Note: These were removed in the final production build for security.*

---
**Summary created on: 2024-05-24**
