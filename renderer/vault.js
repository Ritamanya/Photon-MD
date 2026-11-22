let currentVaultPath = null;
let currentFilePath = null;

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
            /*fileDiv.onclick = async () => {
                const content = await window.photonAPI.readFile(node.path);
                currentFilePath = node.path;
                loadMarkdownIntoEditor(content);
            };*/
            fileDiv.onclick = async (e) => {
                e.stopPropagation();
                try {
                    const content = await window.photonAPI.readFile(node.path);
                    currentFilePath = node.path;

                    document.querySelectorAll('.tree-file').forEach(el => el.classList.remove('active-note'));
                    fileDiv.classList.add('active-note');

                    loadMarkdownIntoEditor(content);
                    if (typeof updateFooterStatus === 'function') {
                        updateFooterStatus(`Opened: ${node.name}`);
                    }
                } catch (err) {
                    console.error('Error opening file:', err);
                    if (typeof updateFooterStatus === 'function') {
                        updateFooterStatus(`Error: ${err.message}`);
                    }
                }
            };
            containerEl.appendChild(fileDiv);
        }
    }
}

function createNewNote() {
    if (!currentVaultPath) return openVaultFolder();
    const input = document.getElementById('new-note-input');
    input.style.display = 'block';
    input.value = '';
    input.focus();

    input.onkeydown = async (e) => {
        if (e.key === 'Escape') {
            input.style.display = 'none';
        } else if (e.key === 'Enter') {
            const name = input.value.trim();
            input.style.display = 'none';
            if (!name) return;

            const created = await window.photonAPI.createFile(currentVaultPath, name);
            currentFilePath = created.filePath;
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
    if (!window.photonAPI) return updateFooterStatus('Run inside Electron (pnpm start) to save files.');
    const saved = await window.photonAPI.saveFile(
        typeof currentFilePath !== 'undefined' ? currentFilePath : null,
        mdexporter(),
        typeof currentVaultPath !== 'undefined' ? currentVaultPath : null
    );
    if (saved && saved.filePath) {
        currentFilePath = saved.filePath;
        updateFooterStatus(`Saved: ${saved.fileName}`);
        if (typeof currentVaultPath !== 'undefined' && currentVaultPath) {
            const tree = await window.photonAPI.refreshVault(currentVaultPath);
            renderFileTree(tree, document.getElementById('file-tree'));
        }
    }
}

async function exportCurrentPdf() {
    if (!window.photonAPI) return window.print();
    const baseName = currentFilePath
        ? currentFilePath.split(/[\\/]/).pop().replace(/\.md$/i, '')
        : 'PhotonMD-Note';
    const pdfPath = await window.photonAPI.exportPdf(baseName);
    if (pdfPath) updateFooterStatus(`Exported PDF: ${pdfPath}`);
}

