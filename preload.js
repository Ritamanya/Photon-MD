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
    exportPdf: (defaultName) => ipcRenderer.invoke('file:exportPdf', defaultName)
});

