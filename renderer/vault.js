/*
let currentVaultPath = null;
let currentFilePath = null;

const docTitleInput = document.getElementById('doc-title-input');

function setHeaderFileName(filePath) {
    if (!docTitleInput) return;

    if (!filePath) {
        docTitleInput.value = '';
        document.title = 'Photon MD';
        return;
    }

    const base = filePath.split(/[/\\]/).pop().replace(/\.md$/i, '');
    docTitleInput.value = base;
    document.title = `${base} — Photon MD`;
}
const LAST_VAULT_KEY = 'photon_last_vault';
let openedFromExplorer = false;

function saveLastVault(vaultPath) {
    if (vaultPath) {
        localStorage.setItem(LAST_VAULT_KEY, vaultPath);
    }
}

const titleInput = document.getElementById('doc-title-input');

titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        titleInput.blur();
    } else if (e.key === 'Escape') {
        if (currentFilePath) {
            const oldBase = currentFilePath.split(/[\\/]/).pop().replace(/\.md$/i, '');
            titleInput.value = oldBase;
        }
        titleInput.blur();
    }
});

titleInput.addEventListener('blur', async () => {
    if (!currentFilePath) return;

    const oldBase = currentFilePath.split(/[\\/]/).pop().replace(/\.md$/i, '');
    const newBase = titleInput.value.trim();

    if (!newBase || newBase === oldBase) {
        titleInput.value = oldBase;
        return;
    }

    const res = await window.PhotonAPI.renameFile(currentFilePath, newBase);
    if (res.success) {
        currentFilePath = res.newPath;
        titleInput.value = res.fileName;
        if (currentVaultPath) {
            await loadVaultTree(currentVaultPath);
            highlightActiveNote(currentFilePath);
        }
    } else {
        titleInput.value = oldBase;
        alert(res.error || 'Could not rename file.');
    }
});

window.PhotonAPI.onOpenExternalFile(async ({ filePath, vaultPath }) => {
    openedFromExplorer = true;
    currentVaultPath = vaultPath;
    saveLastVault(vaultPath);
    await loadVaultTree(vaultPath);
    await openNote(filePath);
});

window.addEventListener('DOMContentLoaded', async () => {
    setTimeout(async () => {
        if (openedFromExplorer) return;
        const lastVault = localStorage.getItem(LAST_VAULT_KEY);
        if (lastVault && await window.PhotonAPI.checkPathExists(lastVault)) {
            currentVaultPath = lastVault;
            await loadVaultTree(lastVault);
        }
    }, 120);
});

function getHeaderFileName() {
    const raw = docTitleInput ? docTitleInput.value.trim() : '';
    const clean = (raw || 'Untitled').replace(/[<>:"/\\|?*]/g, '');
    return clean.endsWith('.md') ? clean : `${clean}.md`;
}

if (docTitleInput) {
    docTitleInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            docTitleInput.blur();
            document.getElementById('editor')?.focus();
        }
    });
}

async function openVaultFolder() {
    const vault = await window.photonAPI.openVault();
    if (!vault) return;
    currentVaultPath = vault.folderPath;
    document.getElementById('vault-title').innerText = vault.folderName;
    renderFileTree(vault.tree, document.getElementById('file-tree'));
}

function renderFileTree(nodes, containerEl) {
    containerEl.innerHTML = '';
    for (const node of nodes) {
        if (node.type === 'folder') {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'tree-folder';
            folderDiv.innerText = '📁 ' + node.name;
            const childBox = document.createElement('div');
            childBox.style.paddingLeft = '14px';
            renderFileTree(node.children, childBox);
            folderDiv.onclick = () => {
                childBox.style.display = childBox.style.display === 'none' ? 'block' : 'none';
            };
            containerEl.append(folderDiv, childBox);
        } else {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'tree-file';
            fileDiv.innerText = '📄 ' + node.name;

            fileDiv.onclick = async (e) => {
                e.stopPropagation();
                try {
                    if (node.path === currentFilePath) return;
                    await autoSaveCurrentNote();
                    const content = await window.photonAPI.readFile(node.path);
                    currentFilePath = node.path;
                    setHeaderFileName(node.path);

                    document.querySelectorAll('.tree-file').forEach(el => el.classList.remove('active-note'));
                    fileDiv.classList.add('active-note');

                    loadMarkdownIntoEditor(content);
                    updateFooterStatus(`Opened: ${node.name}`);
                } catch (err) {
                    console.error('Error opening file:', err);
                    updateFooterStatus(`Error: ${err.message}`);
                }
            };
            containerEl.appendChild(fileDiv);
        }
    }
}

async function createNewNote() {
    if (!currentVaultPath) return openVaultFolder();
    await autoSaveCurrentNote();
    const input = document.getElementById('new-note-input');
    input.style.display = 'block';
    input.value = '';
    input.focus();

    input.onkeydown = async (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
            input.style.display = 'none';
        } else if (e.key === 'Enter') {
            const name = input.value.trim();
            input.style.display = 'none';
            if (!name) return;

            const created = await window.photonAPI.createFile(currentVaultPath, name);
            currentFilePath = created.filePath;
            setHeaderFileName(created.filePath);
            loadMarkdownIntoEditor('');
            const tree = await window.photonAPI.refreshVault(currentVaultPath);
            renderFileTree(tree, document.getElementById('file-tree'));
            updateFooterStatus(`Created ${created.fileName}`);
        }
    };
}

function updateFooterStatus(msg) {
    const footer = document.getElementById('footer');
    if (footer) {
        footer.style.alignItems = 'center';
        footer.style.padding = '0 14px';
        footer.style.fontSize = '13px';
        footer.innerText = msg;
    }
}

async function saveCurrentNote() {
    if (!window.photonAPI) return updateFooterStatus('Run inside Electron to save files.');
    const content = mdexporter();

    if (!currentFilePath) {
        const suggestedName = getHeaderFileName();
        const result = await window.photonAPI.saveNoteDialog(content, suggestedName);

        if (result && !result.canceled && result.filePath) {
            currentFilePath = result.filePath;
            setHeaderFileName(currentFilePath);
            const fileName = currentFilePath.split(/[/\\]/).pop();
            updateFooterStatus(`Saved: ${fileName}`);

            if (currentVaultPath) {
                const tree = await window.photonAPI.refreshVault(currentVaultPath);
                renderFileTree(tree, document.getElementById('file-tree'));
            }
        }
        return;
    }

    const saved = await window.photonAPI.saveFile(currentFilePath, content, currentVaultPath);
    if (saved && saved.filePath) {
        currentFilePath = saved.filePath;
        setHeaderFileName(currentFilePath);
        updateFooterStatus(`Saved: ${saved.fileName}`);
    }
}

async function exportCurrentPdf() {
    if (!window.photonAPI) return window.print();
    const baseName = currentFilePath
        ? currentFilePath.split(/[\\/]/).pop().replace(/\.md$/i, '')
        : getHeaderFileName().replace(/\.md$/i, '');
    const pdfPath = await window.photonAPI.exportPdf(baseName);
    if (pdfPath) updateFooterStatus(`Exported PDF: ${pdfPath}`);
}
if (window.photonAPI?.onOpenExternalFile) {
    window.photonAPI.onOpenExternalFile(async ({filePath, content}) => {
        await autoSaveCurrentNote();
        currentFilePath = filePath;
        setHeaderFileName(filePath);
        loadMarkdownIntoEditor(content);
        const fileName = filePath.split(/[/\\]/).pop();
        updateFooterStatus(`Opened: ${fileName}`);
    });
}

async function autoSaveCurrentNote() {
    if (!window.photonAPI || !currentFilePath) return;
    await window.photonAPI.saveFile(currentFilePath, mdexporter(), currentVaultPath);
}

if (window.photonAPI?.onAppClosing) {
    window.photonAPI.onAppClosing(async () => {
        await autoSaveCurrentNote();
        window.photonAPI.confirmClose();
    });
}*/

let currentVaultPath = null;
let currentFilePath = null;
let openedFromExplorer = false;

const LAST_VAULT_KEY = 'photon_last_vault';
const docTitleInput = document.getElementById('doc-title-input');

function saveLastVault(vaultPath) {
    if (vaultPath) {
        localStorage.setItem(LAST_VAULT_KEY, vaultPath);
    }
}

function getParentDir(filePath) {
    if (!filePath) return null;
    const parts = filePath.split(/[/\\]/);
    parts.pop();
    return parts.join('\\') || null;
}

function getFolderName(folderPath) {
    if (!folderPath) return '';
    return folderPath.split(/[/\\]/).filter(Boolean).pop() || folderPath;
}

function setHeaderFileName(filePath) {
    if (!docTitleInput) return;

    if (!filePath) {
        docTitleInput.value = '';
        document.title = 'Photon MD';
        return;
    }

    const base = filePath.split(/[/\\]/).pop().replace(/\.md$/i, '');
    docTitleInput.value = base;
    document.title = `${base} — Photon MD`;
}

function getHeaderFileName() {
    const raw = docTitleInput ? docTitleInput.value.trim() : '';
    const clean = (raw || 'Untitled').replace(/[<>:"/\\|?*]/g, '');
    return clean.endsWith('.md') ? clean : `${clean}.md`;
}

function highlightActiveNote(filePath) {
    document.querySelectorAll('.tree-file').forEach(el => {
        el.classList.toggle('active-note', el.dataset.path === filePath);
    });
}

async function loadVaultTree(vaultPath) {
    if (!window.photonAPI || !vaultPath) return;
    currentVaultPath = vaultPath;
    saveLastVault(vaultPath);
    document.getElementById('vault-title').innerText = getFolderName(vaultPath);
    const tree = await window.photonAPI.refreshVault(vaultPath);
    renderFileTree(tree, document.getElementById('file-tree'));
    if (currentFilePath) {
        highlightActiveNote(currentFilePath);
    }
}

async function openNote(filePath, prefetchedContent = null) {
    if (!window.photonAPI || !filePath) return;
    try {
        if (currentFilePath && currentFilePath !== filePath) {
            await autoSaveCurrentNote();
        }
        const content = prefetchedContent !== null
            ? prefetchedContent
            : await window.photonAPI.readFile(filePath);

        currentFilePath = filePath;
        setHeaderFileName(filePath);
        highlightActiveNote(filePath);
        loadMarkdownIntoEditor(content);

        const fileName = filePath.split(/[/\\]/).pop();
        updateFooterStatus(`Opened: ${fileName}`);
    } catch (err) {
        console.error('Error opening file:', err);
        updateFooterStatus(`Error: ${err.message}`);
    }
}

if (docTitleInput) {
    docTitleInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            docTitleInput.blur();
            document.getElementById('editor')?.focus();
        } else if (e.key === 'Escape') {
            if (currentFilePath) {
                const oldBase = currentFilePath.split(/[/\\]/).pop().replace(/\.md$/i, '');
                docTitleInput.value = oldBase;
            }
            docTitleInput.blur();
            document.getElementById('editor')?.focus();
        }
    });

    docTitleInput.addEventListener('blur', async () => {
        if (!currentFilePath || !window.photonAPI?.renameFile) return;

        const oldBase = currentFilePath.split(/[/\\]/).pop().replace(/\.md$/i, '');
        const newBase = docTitleInput.value.trim();

        if (!newBase || newBase === oldBase) {
            docTitleInput.value = oldBase;
            return;
        }

        const res = await window.photonAPI.renameFile(currentFilePath, newBase);
        if (res.success) {
            currentFilePath = res.newPath;
            setHeaderFileName(res.newPath);
            updateFooterStatus(`Renamed to: ${res.fileName}.md`);
            if (currentVaultPath) {
                await loadVaultTree(currentVaultPath);
            }
        } else {
            docTitleInput.value = oldBase;
            alert(res.error || 'Could not rename file.');
        }
    });
}

async function openVaultFolder() {
    if (!window.photonAPI) return;
    const vault = await window.photonAPI.openVault();
    if (!vault) return;
    currentVaultPath = vault.folderPath;
    saveLastVault(vault.folderPath);
    document.getElementById('vault-title').innerText = vault.folderName;
    renderFileTree(vault.tree, document.getElementById('file-tree'));
    if (currentFilePath) {
        highlightActiveNote(currentFilePath);
    }
}

function renderFileTree(nodes, containerEl) {
    containerEl.innerHTML = '';
    for (const node of nodes) {
        if (node.type === 'folder') {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'tree-folder';
            folderDiv.innerText = '📁 ' + node.name;
            const childBox = document.createElement('div');
            childBox.style.paddingLeft = '14px';
            renderFileTree(node.children, childBox);
            folderDiv.onclick = () => {
                childBox.style.display = childBox.style.display === 'none' ? 'block' : 'none';
            };
            containerEl.append(folderDiv, childBox);
        } else {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'tree-file';
            fileDiv.dataset.path = node.path;
            fileDiv.innerText = '📄 ' + node.name;

            if (node.path === currentFilePath) {
                fileDiv.classList.add('active-note');
            }

            fileDiv.onclick = async (e) => {
                e.stopPropagation();
                if (node.path === currentFilePath) return;
                await openNote(node.path);
            };
            containerEl.appendChild(fileDiv);
        }
    }
}

async function createNewNote() {
    if (!currentVaultPath) return openVaultFolder();
    await autoSaveCurrentNote();
    const input = document.getElementById('new-note-input');
    input.style.display = 'block';
    input.value = '';
    input.focus();

    input.onkeydown = async (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
            input.style.display = 'none';
        } else if (e.key === 'Enter') {
            const name = input.value.trim();
            input.style.display = 'none';
            if (!name) return;

            const created = await window.photonAPI.createFile(currentVaultPath, name);
            currentFilePath = created.filePath;
            setHeaderFileName(created.filePath);
            loadMarkdownIntoEditor('');
            await loadVaultTree(currentVaultPath);
            updateFooterStatus(`Created ${created.fileName}`);
        }
    };
}

function updateFooterStatus(msg) {
    const footer = document.getElementById('footer');
    if (footer) {
        footer.style.alignItems = 'center';
        footer.style.padding = '0 14px';
        footer.style.fontSize = '13px';
        footer.innerText = msg;
    }
}

async function saveCurrentNote() {
    if (!window.photonAPI) return updateFooterStatus('Run inside Electron to save files.');
    const content = mdexporter();

    if (!currentFilePath) {
        const suggestedName = getHeaderFileName();
        const result = await window.photonAPI.saveNoteDialog(content, suggestedName);

        if (result && !result.canceled && result.filePath) {
            currentFilePath = result.filePath;
            setHeaderFileName(currentFilePath);
            const fileName = currentFilePath.split(/[/\\]/).pop();
            updateFooterStatus(`Saved: ${fileName}`);

            if (currentVaultPath) {
                await loadVaultTree(currentVaultPath);
            }
        }
        return;
    }

    const saved = await window.photonAPI.saveFile(currentFilePath, content, currentVaultPath);
    if (saved && saved.filePath) {
        currentFilePath = saved.filePath;
        setHeaderFileName(currentFilePath);
        updateFooterStatus(`Saved: ${saved.fileName}`);
    }
}

async function exportCurrentPdf() {
    if (!window.photonAPI) return window.print();
    const baseName = currentFilePath
        ? currentFilePath.split(/[/\\]/).pop().replace(/\.md$/i, '')
        : getHeaderFileName().replace(/\.md$/i, '');
    const pdfPath = await window.photonAPI.exportPdf(baseName);
    if (pdfPath) updateFooterStatus(`Exported PDF: ${pdfPath}`);
}

async function autoSaveCurrentNote() {
    if (!window.photonAPI || !currentFilePath) return;
    await window.photonAPI.saveFile(currentFilePath, mdexporter(), currentVaultPath);
}

if (window.photonAPI?.onOpenExternalFile) {
    window.photonAPI.onOpenExternalFile(async ({ filePath, content = null, vaultPath = null }) => {
        openedFromExplorer = true;
        const targetVault = vaultPath || getParentDir(filePath);
        if (targetVault) {
            await loadVaultTree(targetVault);
        }
        await openNote(filePath, content);
    });
}

if (window.photonAPI?.onAppClosing) {
    window.photonAPI.onAppClosing(async () => {
        await autoSaveCurrentNote();
        window.photonAPI.confirmClose();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (openedFromExplorer || !window.photonAPI?.checkPathExists) return;
        const lastVault = localStorage.getItem(LAST_VAULT_KEY);
        if (lastVault && await window.photonAPI.checkPathExists(lastVault)) {
            await loadVaultTree(lastVault);
        }
    }, 120);
});

