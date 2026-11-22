const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

if (process.platform === 'win32') {
    app.setAppUserModelId('com.photonmd.app');
}

function createWindow() {
    const iconPath = path.join(__dirname, 'renderer', 'logo.png'); // or 'icon.ico' if genuinely converted
    const appIcon = nativeImage.createFromPath(iconPath);

    if (appIcon.isEmpty()) {
        console.error('Icon failed to load or invalid format at:', iconPath);
    }

    mainWindow = new BrowserWindow({
        width: 1360,
        height: 860,
        minWidth: 800,
        minHeight: 600,
        title: 'Photon MD',
        icon: appIcon,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'base.html'));
    mainWindow.setMenuBarVisibility(false);
}
// Helper: Recursively scan a vault directory for .md files and subfolders
function scanVaultTree(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = [];

    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // Skip hidden folders like .git or .obsidian
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            result.push({
                type: 'folder',
                name: entry.name,
                path: fullPath,
                children: scanVaultTree(fullPath)
            });
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
            result.push({
                type: 'file',
                name: entry.name,
                path: fullPath
            });
        }
    }

    // Folders first, then alphabetical
    return result.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

// 1. Open a Vault folder
ipcMain.handle('vault:open', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
        title: 'Select PhotonMD Vault Folder',
        properties: ['openDirectory', 'createDirectory']
    });
    if (res.canceled || !res.filePaths.length) return null;

    const folderPath = res.filePaths[0];
    return {
        folderPath,
        folderName: path.basename(folderPath),
        tree: scanVaultTree(folderPath)
    };
});

// 2. Refresh an already-open Vault folder
ipcMain.handle('vault:refresh', async (_, folderPath) => {
    if (!folderPath || !fs.existsSync(folderPath)) return null;
    return scanVaultTree(folderPath);
});

// 3. Read a Markdown file
ipcMain.handle('file:read', async (_, filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
});

// 4. Save a Markdown file (writes directly if filePath exists, or opens Save dialog)
ipcMain.handle('file:save', async (_, { filePath, content, defaultDir }) => {
    let targetPath = filePath;
    if (!targetPath) {
        const res = await dialog.showSaveDialog(mainWindow, {
            title: 'Save Note',
            defaultPath: path.join(defaultDir || app.getPath('documents'), 'Untitled.md'),
            filters: [{ name: 'Markdown Files', extensions: ['md'] }]
        });
        if (res.canceled || !res.filePath) return null;
        targetPath = res.filePath;
    }
    fs.writeFileSync(targetPath, content, 'utf-8');
    return {
        filePath: targetPath,
        fileName: path.basename(targetPath)
    };
});

// 5. Create a new note directly inside the active Vault folder
ipcMain.handle('file:create', async (_, { folderPath, fileName }) => {
    const safeName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    const targetPath = path.join(folderPath, safeName);
    if (!fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, '', 'utf-8');
    }
    return {
        filePath: targetPath,
        fileName: safeName
    };
});

// 6. Delete a Markdown file
ipcMain.handle('file:delete', async (_, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
});

// 7. Export current view directly to a crisp vector PDF file
ipcMain.handle('file:exportPdf', async (_, defaultName) => {
    const res = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Note as PDF',
        defaultPath: path.join(app.getPath('documents'), `${defaultName || 'PhotonMD-Note'}.pdf`),
        filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
    });
    if (res.canceled || !res.filePath) return null;

    const pdfData = await mainWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
    });
    fs.writeFileSync(res.filePath, pdfData);
    return res.filePath;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});