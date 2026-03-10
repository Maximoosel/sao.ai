import { app, BrowserWindow, ipcMain, dialog, shell, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

let mainWin = null;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = display.workAreaSize;

  const win = new BrowserWindow({
    width: 420,
    height: 600,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWin = win;

  // In dev, load vite dev server; in production, load built files
  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  ipcMain.on('resize-window', (event, width, height) => {
    win.setSize(width, height, true);
  });

  // Minimize → fullscreen transparent overlay so character walks entire screen
  ipcMain.on('enter-overlay-mode', () => {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    win.setPosition(0, display.workArea.y);
    win.setSize(width, height, false);
    win.setIgnoreMouseEvents(true, { forward: true });
    win.setAlwaysOnTop(true, 'screen-saver');
  });

  // Restore from overlay → normal app window
  ipcMain.on('exit-overlay-mode', () => {
    win.setIgnoreMouseEvents(false);
    win.setAlwaysOnTop(true, 'floating');
    const display = screen.getPrimaryDisplay();
    const { width: sw, height: sh } = display.workAreaSize;
    const [ww, wh] = [420, 600];
    win.setPosition(Math.round((sw - ww) / 2), Math.round((sh - wh) / 2));
    win.setSize(ww, wh, true);
  });

  ipcMain.handle('get-screen-size', () => {
    const d = screen.getPrimaryDisplay();
    return { width: d.workAreaSize.width, height: d.workAreaSize.height, scaleFactor: d.scaleFactor };
  });
  
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    return result.filePaths[0] || null;
  });

  ipcMain.handle('trash-file', async (event, filePath) => {
    try {
      await shell.trashItem(filePath);
      return true;
    } catch (e) {
      console.error('Failed to trash file:', e);
      return false;
    }
  });

  ipcMain.handle('open-trash', async () => {
    try {
      await shell.openPath(`${process.env.HOME}/.Trash`);
      return true;
    } catch (e) {
      console.error('Failed to open Trash:', e);
      return false;
    }
  });

  ipcMain.handle('get-window-positions', async () => {
    if (process.platform !== 'darwin') {
      return { windows: [], screenWidth: screenW, screenHeight: screenH };
    }

    try {
      const pythonScript = `
import Quartz, json
wl = Quartz.CGWindowListCopyWindowInfo(
    Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements,
    Quartz.kCGNullWindowID
)
out = []
for w in wl:
    b = w.get('kCGWindowBounds', {})
    layer = int(w.get('kCGWindowLayer', 0))
    alpha = float(w.get('kCGWindowAlpha', 1))
    owner = str(w.get('kCGWindowOwnerName', ''))
    title = str(w.get('kCGWindowName', ''))
    ww = int(b.get('Width', 0))
    hh = int(b.get('Height', 0))
    if ww < 100 or hh < 50 or layer != 0 or alpha < 0.5:
        continue
    if owner in ('Window Server', 'Dock', 'SystemUIServer', 'Control Center'):
        continue
    out.append({
        'name': owner,
        'title': title,
        'x': int(b.get('X', 0)),
        'y': int(b.get('Y', 0)),
        'width': ww,
        'height': hh
    })
print(json.dumps(out))
`.trim();

      const result = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        timeout: 2000,
        encoding: 'utf-8'
      });

      const windows = JSON.parse(result.trim());
      
      const ownBounds = mainWin ? mainWin.getBounds() : null;
      const filtered = windows.filter(w => {
        if (ownBounds) {
          if (Math.abs(w.x - ownBounds.x) < 5 && Math.abs(w.y - ownBounds.y) < 5) {
            return false;
          }
        }
        return true;
      });

      return { windows: filtered, screenWidth: screenW, screenHeight: screenH };
    } catch (e) {
      console.error('Failed to get window positions:', e.message);
      return { windows: [], screenWidth: screenW, screenHeight: screenH };
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
