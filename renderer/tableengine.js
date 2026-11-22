// Renders **bold**, *italic*, and `code` inside table cells
function formatCellInline(text) {
    return (text || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, '<span class="bc">$1</span>')
        .replace(/\*(.+?)\*/g, '<span class="ic">$1</span>')
        .replace(/`(.+?)`/g, '<span class="linecc">$1</span>');
}

// Syncs all cells back into the table's rwmd attribute for saving/copying
function syncTableToMarkdown(nwtc) {
    let table = nwtc.querySelector('table');
    if (!table) return;
    let mdRows = [];

    let ths = Array.from(table.querySelectorAll('thead th'));
    if (ths.length) {
        mdRows.push('| ' + ths.map(th => (th.getAttribute('data-raw') ?? th.innerText).replace(/\n/g, ' ').trim()).join(' | ') + ' |');
        mdRows.push('| ' + ths.map(th => {
            let align = th.style.textAlign;
            if (align === 'center') return ':---:';
            if (align === 'right') return '---:';
            return ':---';
        }).join(' | ') + ' |');
    }

    let trs = Array.from(table.querySelectorAll('tbody tr'));
    trs.forEach(tr => {
        let tds = Array.from(tr.querySelectorAll('td'));
        mdRows.push('| ' + tds.map(td => (td.getAttribute('data-raw') ?? td.innerText).replace(/\n/g, ' ').trim()).join(' | ') + ' |');
    });

    nwtc.setAttribute('rwmd', mdRows.join('\n'));
}

// Makes any <th> or <td> directly editable without exploding the table
function makeCellEditable(cell, nwtc, initialRaw = "") {
    cell.setAttribute('contenteditable', 'true');
    cell.setAttribute('data-raw', initialRaw);
    cell.innerHTML = formatCellInline(initialRaw);

    cell.addEventListener('focus', () => {
        cursor.remove(); // Hide main document cursor while typing inside the table
        nwtc._activeCell = cell;

        let tr = cell.parentElement;
        let colIdx = Array.from(tr.children).indexOf(cell);
        let isHeader = tr.parentElement.tagName === 'THEAD';
        let rowIdx = isHeader ? -1 : Array.from(tr.parentElement.children).indexOf(tr);

        nwtc._activeCol = colIdx;
        nwtc._activeRow = rowIdx;

        // Update the temporary toolbar badge so you see which Row/Col will be modified
        let badge = nwtc.querySelector('.tc-pos-badge');
        if (badge) {
            badge.innerText = isHeader
                ? `Header • Col ${colIdx + 1}`
                : `Row ${rowIdx + 1} • Col ${colIdx + 1}`;
        }

        // Unpack raw markdown in this cell for editing
        cell.innerText = cell.getAttribute('data-raw') || '';
    });

    cell.addEventListener('blur', () => {
        let raw = cell.innerText.replace(/\n/g, ' ').trim();
        cell.setAttribute('data-raw', raw);
        cell.innerHTML = formatCellInline(raw);
        syncTableToMarkdown(nwtc);
        pushHistory(true);
    });

    cell.addEventListener('input', () => {
        cell.setAttribute('data-raw', cell.innerText.replace(/\n/g, ' '));
        syncTableToMarkdown(nwtc);
        pushHistory(false);
    });

    cell.addEventListener('click', (e) => e.stopPropagation());

    cell.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            cell.blur(); // Hides the temporary table buttons automatically!
            let nextEl = nwtc.nextElementSibling;
            if (!nextEl || !nextEl.classList.contains('line')) {
                nextEl = newline();
                nextEl.append(newnc());
                nwtc.after(nextEl);
            }
            nextEl.prepend(newcursor());
        }
    });
}

function newtc(lcar) {
    let rw = typeof lcar === 'string' ? lcar : lcartotext(lcar).trimEnd();
    let rows = rw.split('\n');

    let nwtc = document.createElement('div');
    nwtc.className = 'tc';
    nwtc.setAttribute('rwmd', rw);
    nwtc._activeCell = null;
    nwtc._activeRow = -1;
    nwtc._activeCol = 0;

    // Temporary Floating Toolbar (only appears on cell focus)
    let toolbar = document.createElement('div');
    toolbar.className = 'tc-toolbar no-print';

    let badge = document.createElement('span');
    badge.className = 'tc-pos-badge';
    badge.innerText = 'Cell';
    toolbar.appendChild(badge);

    const makeBtn = (label, cls, onClick) => {
        let btn = document.createElement('button');
        btn.className = 'tc-btn ' + (cls || '');
        btn.innerText = label;
        // e.preventDefault() on mousedown is critical: it keeps the cursor inside the active cell when you click the button!
        btn.addEventListener('mousedown', (e) => e.preventDefault());
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
            syncTableToMarkdown(nwtc);
            pushHistory(true);
        });
        return btn;
    };

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    let alignments = [];
    if (rows.length >= 2) {
        let sepCells = rows[1].trim().replace(/^\||\|$/g, '').split('|');
        alignments = sepCells.map(c => {
            let s = c.trim();
            if (s.startsWith(':') && s.endsWith(':')) return 'center';
            if (s.endsWith(':')) return 'right';
            return 'left';
        });
    }

    let headerCells = (rows[0] || '| Header 1 | Header 2 |').trim().replace(/^\||\|$/g, '').split('|');
    let colCount = headerCells.length;
    let headTr = document.createElement('tr');
    headerCells.forEach((cellText, idx) => {
        let th = document.createElement('th');
        th.style.textAlign = alignments[idx] || 'left';
        makeCellEditable(th, nwtc, cellText.trim());
        headTr.appendChild(th);
    });
    thead.appendChild(headTr);
    table.appendChild(thead);

    for (let r = 2; r < rows.length; r++) {
        if (!rows[r].trim()) continue;
        let tr = document.createElement('tr');
        let bodyCells = rows[r].trim().replace(/^\||\|$/g, '').split('|');
        for (let c = 0; c < colCount; c++) {
            let td = document.createElement('td');
            td.style.textAlign = alignments[c] || 'left';
            makeCellEditable(td, nwtc, (bodyCells[c] || '').trim());
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    // Helper to build a blank row with current column count
    const createBlankRow = () => {
        let cols = headTr.children.length;
        let tr = document.createElement('tr');
        for (let c = 0; c < cols; c++) {
            let td = document.createElement('td');
            td.style.textAlign = headTr.children[c]?.style.textAlign || 'left';
            makeCellEditable(td, nwtc, '');
            tr.appendChild(td);
        }
        return tr;
    };

    // 1. Add Row Above Cursor
    toolbar.appendChild(makeBtn('↑ +Row', '', () => {
        let tr = createBlankRow();
        let activeTr = nwtc._activeCell?.parentElement;
        if (activeTr && activeTr.parentElement === tbody) {
            activeTr.before(tr);
        } else {
            tbody.prepend(tr);
        }
        tr.children[nwtc._activeCol || 0]?.focus();
    }));

    // 2. Add Row Below Cursor
    toolbar.appendChild(makeBtn('↓ +Row', '', () => {
        let tr = createBlankRow();
        let activeTr = nwtc._activeCell?.parentElement;
        if (activeTr && activeTr.parentElement === tbody) {
            activeTr.after(tr);
        } else {
            tbody.appendChild(tr);
        }
        tr.children[nwtc._activeCol || 0]?.focus();
    }));

    // 3. Delete Current Cursor Row
    toolbar.appendChild(makeBtn('✕ Row', 'danger', () => {
        let activeTr = nwtc._activeCell?.parentElement;
        if (!activeTr || activeTr.parentElement !== tbody) return; // Don't delete header row
        let bodyRows = tbody.querySelectorAll('tr');
        if (bodyRows.length <= 1) return; // Keep at least 1 row
        let nextFocusTr = activeTr.nextElementSibling || activeTr.previousElementSibling;
        let colToFocus = nwtc._activeCol || 0;
        activeTr.remove();
        nextFocusTr?.children[colToFocus]?.focus();
    }));

    // 4. Add Column Left of Cursor
    toolbar.appendChild(makeBtn('← +Col', '', () => {
        let colIdx = nwtc._activeCol >= 0 ? nwtc._activeCol : 0;
        let th = document.createElement('th');
        makeCellEditable(th, nwtc, 'Header');
        headTr.children[colIdx].before(th);

        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            let td = document.createElement('td');
            makeCellEditable(td, nwtc, '');
            tr.children[colIdx].before(td);
        });
        th.focus();
    }));

    // 5. Add Column Right of Cursor
    toolbar.appendChild(makeBtn('→ +Col', '', () => {
        let colIdx = nwtc._activeCol >= 0 ? nwtc._activeCol : headTr.children.length - 1;
        let th = document.createElement('th');
        makeCellEditable(th, nwtc, 'Header');
        headTr.children[colIdx].after(th);

        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            let td = document.createElement('td');
            makeCellEditable(td, nwtc, '');
            tr.children[colIdx].after(td);
        });
        th.focus();
    }));

    // 6. Delete Current Cursor Column
    toolbar.appendChild(makeBtn('✕ Col', 'danger', () => {
        let totalCols = headTr.children.length;
        if (totalCols <= 1) return; // Keep at least 1 column
        let colIdx = nwtc._activeCol >= 0 ? nwtc._activeCol : totalCols - 1;
        let activeTr = nwtc._activeCell?.parentElement || headTr;

        headTr.children[colIdx]?.remove();
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            tr.children[colIdx]?.remove();
        });

        let nextColIdx = Math.min(colIdx, headTr.children.length - 1);
        activeTr.children[nextColIdx]?.focus();
    }));

    // 7. Delete Entire Table
    toolbar.appendChild(makeBtn('🗑 Table', 'danger', () => {
        let nextEl = nwtc.nextElementSibling;
        if (!nextEl || !nextEl.classList.contains('line')) {
            nextEl = newline();
            nextEl.append(newnc());
            nwtc.after(nextEl);
        }
        nextEl.prepend(newcursor());
        nwtc.remove();
    }));

    nwtc.appendChild(toolbar);
    nwtc.appendChild(table);
    return nwtc;
}
function isTableLine(line) {
    if (!line || line.className !== 'line') return false;
    if (line.querySelector('#cursor')) return false;
    return line.innerText.trim().startsWith('|');
}

function isSeparatorLine(line) {
    if (!isTableLine(line)) return false;
    let t = line.innerText.trim();
    return /^\|[\s\-:|]+\|?$/.test(t) && t.includes('-');
}

function tchecker(startLine) {
    let secondLine = startLine.nextElementSibling;
    if (!isSeparatorLine(secondLine)) return false;

    let tableLines = [startLine, secondLine];
    let next = secondLine.nextElementSibling;
    while (next && isTableLine(next)) {
        tableLines.push(next);
        next = next.nextElementSibling;
    }

    // Must have Header + Separator + at least 1 Body Row
    if (tableLines.length < 3) return false;

    // Wait if #cursor is on the line right below the table (so pasting or typing more rows doesn't collapse early!)
    if (next && next.querySelector('#cursor')) return false;

    let lcar = [];
    for (let i = 0; i < tableLines.length; i++) {
        let ln = tableLines[i];
        let child = ln.firstElementChild;
        while (child) {
            let nextChild = child.nextElementSibling;
            if (containers.includes(child.className)) {
                exploder(child);
            }
            child = nextChild;
        }
        let el = ln.firstElementChild;
        while (el) {
            if (i === tableLines.length - 1 && el.className === 'nc') break;
            lcar.push(el);
            el = el.nextElementSibling;
        }
    }

    startLine.before(newtc(lcar));
    removeallelsfarr(lcar);
    for (let i = 0; i < tableLines.length; i++) {
        tableLines[i].remove();
    }
    return true;
}

function ultimatetchecker() {
    let alllines = document.querySelectorAll('.line');
    for (let i = 0; i < alllines.length; i++) {
        if (!isTableLine(alllines[i])) continue;
        if (tchecker(alllines[i])) {
            alllines = document.querySelectorAll('.line');
            i--;
        }
    }
}

document.getElementById('editor')?.addEventListener('input', (e) => {
    if (e.target.closest('td, th, .tc')) {
        setTimeout(() => pushHistory(false), 0);
    }
});

document.getElementById('editor')?.addEventListener('focusout', (e) => {
    if (e.target.closest('td, th, .tc')) {
        setTimeout(() => pushHistory(true), 0);
    }
});