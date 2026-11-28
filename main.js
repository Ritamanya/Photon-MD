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
    mainWindow.webContents.once('did-finish-load', () => {
        const initialFile = getMdFileFromArgs(process.argv);
        if (initialFile) sendFileToRenderer(initialFile);
    });
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
ipcMain.handle('save-note-dialog', async (event, { content, suggestedName }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Markdown Note',
        defaultPath: suggestedName || 'Untitled.md',
        filters: [{ name: 'Markdown Files', extensions: ['md'] }]
    });

    if (canceled || !filePath) {
        return { canceled: true };
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return { canceled: false, filePath };
});

ipcMain.handle('rename-file', async (event, oldPath, rawNewName) => {
    try {
        if (!oldPath || !fs.existsSync(oldPath)) {
            return { success: false, error: 'Original file not found.' };
        }

        const cleanName = rawNewName.trim().replace(/[<>:"/\\|?*]/g, '');
        if (!cleanName) {
            return { success: false, error: 'Invalid file name.' };
        }

        const finalName = cleanName.endsWith('.md') ? cleanName : `${cleanName}.md`;
        const dir = path.dirname(oldPath);
        const newPath = path.join(dir, finalName);

        if (newPath.toLowerCase() === oldPath.toLowerCase()) {
            return { success: true, newPath: oldPath, fileName: path.basename(oldPath, '.md') };
        }

        if (fs.existsSync(newPath)) {
            return { success: false, error: 'A note with that name already exists.' };
        }

        fs.renameSync(oldPath, newPath);
        return { success: true, newPath, fileName: path.basename(newPath, '.md') };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('check-path-exists', async (event, targetPath) => {
    return Boolean(targetPath && fs.existsSync(targetPath));
});

function sendExternalFileToRenderer(win, filePath) {
    if (!win || !filePath || !fs.existsSync(filePath)) return;
    const vaultPath = path.dirname(filePath);
    win.webContents.send('open-external-file', { filePath, vaultPath });
}

ipcMain.handle('ask-unsaved-changes', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { response } = await dialog.showMessageBox(win, {
        type: 'warning',
        buttons: ['Save', "Don't Save", 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        title: 'Unsaved Note',
        message: 'Do you want to save your changes before closing?',
        detail: 'Your note has not been saved yet.'
    });

    if (response === 0) return 'save';
    if (response === 1) return 'discard';
    return 'cancel';
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function getMdFileFromArgs(argv) {
    return argv.find(arg => /\.(md|markdown)$/i.test(arg) && fs.existsSync(arg)) || null;
}

function sendFileToRenderer(filePath) {
    if (!filePath || !mainWindow) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('open-external-file', { filePath, content });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (_event, argv) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            const filePath = getMdFileFromArgs(argv);
            if (filePath) sendFileToRenderer(filePath);
        }
    });
}