const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('photonAPI', {
    openVault: () => ipcRenderer.invoke('vault:open'),
    refreshVault: (folderPath) => ipcRenderer.invoke('vault:refresh', folderPath),
    readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
    saveFile: (filePath, content, defaultDir) =>
        ipcRenderer.invoke('file:save', { filePath, content, defaultDir }),
    createFile: (folderPath, fileName) =>
        ipcRenderer.invoke('file:create', { folderPath, fileName }),
    deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
    exportPdf: (defaultName) => ipcRenderer.invoke('file:exportPdf', defaultName),
    saveNoteDialog: (content, suggestedName) =>
        ipcRenderer.invoke('save-note-dialog', { content, suggestedName }),
    /*onOpenExternalFile: (callback) => {
        ipcRenderer.on('open-external-file', (_event, data) => callback(data));
    },*/
    renameFile: (oldPath, newName) => ipcRenderer.invoke('rename-file', oldPath, newName),
    checkPathExists: (targetPath) => ipcRenderer.invoke('check-path-exists', targetPath),
    onOpenExternalFile: (callback) => ipcRenderer.on('open-external-file', (_event, data) => callback(data)),
    askUnsavedChanges: () => ipcRenderer.invoke('ask-unsaved-changes'),
});

