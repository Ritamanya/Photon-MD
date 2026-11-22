let activeLine = document.getElementById("div[active='true']");
let cursor = document.querySelector("#cursor");
let dlop = false;

const ime = document.createElement('textarea');
let isComposing = false;
Object.assign(ime.style, {
    position: 'fixed',
    opacity: '0',
    width: '1px',
    height: '1px',
    pointerEvents: 'none'
});
document.body.appendChild(ime);
ime.focus();
window.addEventListener('click', (e) => {
    if (hasActiveSelection()) return;
    if (e.target.closest('input, textarea, button, #sidebar, .tc')) return;
    if (!e.target.closest('.tc')) ime.focus();
});

ime.addEventListener('compositionstart', () => { isComposing = true; });

ime.addEventListener('compositionend', (e) => {
    isComposing = false;
    if (e.data) inserttextatcursor(e.data);
    ime.value = '';
});

ime.addEventListener('input', (e) => {
    if (isComposing) return;
    if (e.inputType === 'deleteContentBackward') { backspace(); ime.value = ''; return; }
    if (ime.value) {
        inserttextatcursor(ime.value);
        ime.value = '';
    }
});



function newcursorold(){
    const nwcursor = document.createElement("div");
    nwcursor.id="cursor";
    let prevline = currntline();
    cursor.remove();
    cursor = nwcursor;
    /*lineprchecker(cursor.parentElement);*/
    return cursor;
}
function newcursor() {
    const prevLine = cursor?.parentElement?.classList.contains('line')
        ? cursor.parentElement
        : null;

    if (cursor) cursor.remove();

    const nwcur = document.createElement('div');
    nwcur.id = 'cursor';
    cursor = nwcur;

    if (prevLine) {
        queueMicrotask(() => {
            const activeLine = currntline();
            if (activeLine && activeLine.classList.contains('line')) {
                activeLine.setAttribute('active', 'true');
            }
            if (prevLine.isConnected && prevLine !== activeLine) {
                prevLine.setAttribute('active', 'false');
                linescanner(prevLine);
                lineprchecker(prevLine);
                if (typeof helperlcpacker === 'function') {
                    helperlcpacker(prevLine);
                }
            }
        });
    }

    return nwcur;
}
function findkeyfarr(arry){
    if(arry[0].innerText === "$" && arry[1].innerText ==="$"){
        return "$$";
    }else return "$";
}function parsethingstotext(elar,key){
    let text = "";
    for(let i = 0;i<elar.length;i++){
        text+=elar.innerText;
    }
    if (key === "$$" || key === "$") text+=key;
}
function newhc(lcar) {
    let text = "";
    for (let i = 0; i < lcar.length; i++) {
        text += lcar[i].innerText;
    }
    let nwhc = document.createElement('div');
    nwhc.className = 'hc'; // html container
    nwhc.setAttribute('rwmd', text);
    nwhc.innerHTML = text; // Renders actual HTML instead of plain text!
    nwhc.addEventListener('click', () => {
        let prevline = currntline();
        nwhc.after(newcursor());
        arrowleft();
        if (prevline !== currntline()) {
            linescanner(prevline);
            htmlscanner(prevline);
        }
    });
    return nwhc;
}
function newmc(lcar){
    let text = "";
    for(let i=0;i<lcar.length;i++) text += lcar[i].innerText;
    let nwmc = document.createElement('div');
    nwmc.className='mc';
    nwmc.setAttribute('rwmd',text);
    nwmc.innerText=text;
    if (text.startsWith('$$') && text.endsWith('$$')) {
        nwmc.setAttribute('data-display', 'true');
    }
    nwmc.addEventListener('click', () => {
        nwmc.after(newcursor());
        arrowleft();
    });
    MathJax.typesetClear([nwmc]);
    MathJax.typesetPromise([nwmc]);
    nwmc.style.userSelect = 'text';
    return nwmc;
}
function rwinnertextcomputerfordoublecnts(lcar){
    let rw = lcartotext(lcar);
    let innertext = "";
    for(let i = 1;i<rw.length-1;i++){
        innertext+=rw[i];
    }
    return [rw, innertext];
}
function newic(lcar){
    let [rw, innertext] = rwinnertextcomputerfordoublecnts(lcar);
    let nwic = document.createElement('div');
    nwic.className='ic';
    nwic.setAttribute('rwmd',rw);
    nwic.innerText=innertext;
    nwic.addEventListener('click',()=>{
        nwic.after(newcursor());
        exploder(nwic);
    })
    return nwic;
}
function newlinecc(lcar){
    let [rw, innertext] = rwinnertextcomputerfordoublecnts(lcar);
    let nwic = document.createElement('div');
    nwic.className='linecc';
    nwic.setAttribute('rwmd',rw);
    nwic.innerText=innertext;
    return nwic;
}
let containers = ['bc','hc','mc','ic','bltc', 'linecc', 'upc']; // More to be added!!
function newlc(char){
    let nwlc = document.createElement('div');
    nwlc.className='lc';
    nwlc.innerText=char;
    nwlc.addEventListener('click',()=>{
        let prevline = currntline();
        nwlc.after(newcursor());
        let curentline = currntline();
        if(prevline!==curentline) linescanner(prevline);
        lineprchecker(currntline());
    })
    return nwlc;
}
function removeallelsfarr(lcar){
    for (let i = 0; i < lcar.length; i++) lcar[i].remove();
}

function newbc(lcar){
    let text = '';
    let innertext = '';
    for (let i = 0; i < lcar.length; i++){
        text+=lcar[i].innerText;
        if(i>1 && i<lcar.length-2) innertext+=lcar[i].innerText;
    }
    let nwbc = document.createElement('div');
    nwbc.className = 'bc' //bold container
    nwbc.setAttribute('rwmd',text);
    nwbc.innerText=innertext;
    nwbc.addEventListener('click', () => {
        nwbc.after(newcursor());
        arrowleft();
    });
    return nwbc;
}
function newtc(lcar) {
    let rw = lcartotext(lcar).trimEnd();
    let rows = rw.split('\n');

    let nwtc = document.createElement('div');
    nwtc.className = 'tc';
    nwtc.setAttribute('rwmd', rw);

    let table = document.createElement('table');

    // Parse alignment from row 1 (e.g., | :--- | :---: | ---: |)
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

    // Build <thead> from row 0
    if (rows.length > 0) {
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');
        let headerCells = rows[0].trim().replace(/^\||\|$/g, '').split('|');
        headerCells.forEach((cellText, idx) => {
            let th = document.createElement('th');
            th.style.textAlign = alignments[idx] || 'left';
            th.innerHTML = formatCellInline(cellText.trim());
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
    }

    // Build <tbody> from row 2 onwards
    if (rows.length > 2) {
        let tbody = document.createElement('tbody');
        for (let r = 2; r < rows.length; r++) {
            if (!rows[r].trim()) continue;
            let tr = document.createElement('tr');
            let bodyCells = rows[r].trim().replace(/^\||\|$/g, '').split('|');
            bodyCells.forEach((cellText, idx) => {
                let td = document.createElement('td');
                td.style.textAlign = alignments[idx] || 'left';
                td.innerHTML = formatCellInline(cellText.trim());
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
    }

    nwtc.appendChild(table);

    // Click to explode back into editable lines
    nwtc.addEventListener('click', () => {
        exploder(nwtc);
    });

    return nwtc;
}
function getClickedGraphemeOffset(e, upcEl) {
    let range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!range || !upcEl.contains(range.startContainer)) return 0;

    let textBeforeClick = range.startContainer.textContent.slice(0, range.startOffset);
    let offset = toGraphemes(textBeforeClick).length;

    // Check if the click landed on the right half of the character so cursor drops after it
    let rect = range.getBoundingClientRect();
    if (rect && rect.width > 0 && (e.clientX - rect.left) > rect.width / 2) {
        offset += 1;
    }
    return offset;
}
function newupc(lcar){
    let rw = lcartotext(lcar);
    let nwupc = document.createElement('div');
    nwupc.className = 'upc';
    nwupc.innerText = rw;
    nwupc.setAttribute('rwmd',rw);
    nwupc.addEventListener('click', (e) => {
        let prevline = currntline();
        let targetLine = nwupc.parentElement;
        let prevSibling = nwupc.previousElementSibling; // Anchor right before this .upc

        // 1. Measure exact clicked character index BEFORE exploding!
        let offset = getClickedGraphemeOffset(e, nwupc);

        // 2. Explode this .upc back into individual .lc nodes
        exploder(nwupc);

        // 3. Walk 'offset' .lc nodes starting from where nwupc began
        let currentEl = prevSibling ? prevSibling.nextElementSibling : targetLine.firstElementChild;

        if (offset === 0 || !currentEl) {
            if (currentEl) currentEl.before(newcursor());
            else targetLine.prepend(newcursor());
        } else {
            let count = 1;
            while (count < offset && currentEl.nextElementSibling && currentEl.nextElementSibling.className === 'lc') {
                currentEl = currentEl.nextElementSibling;
                count++;
            }
            currentEl.after(newcursor());
        }

        // 4. Re-scan and pack the previous line we just left
        if (prevline && prevline !== targetLine && prevline.isConnected) {
            linescanner(prevline);
        }
        lineprchecker(targetLine);
    });
    return nwupc;
}
function helperlcpacker(line){
    if(line.querySelector('#cursor')) return;
    let rawLine = line.innerText.trimStart();
    if (
        rawLine.startsWith('```') ||
        rawLine.startsWith('|') ||
        rawLine.startsWith('$$')
    ) {
        return;
    }
    let temp = line.firstElementChild;
    let lcar = [];
    while (temp){
        if(temp.className==='lc') {lcar.push(temp); temp = temp.nextElementSibling;}
        else if(temp && lcar.length<2) {
            lcar = [];
            temp = temp.nextElementSibling;
        }
        else if(temp){
            lcar[0].before(newupc(lcar));
            temp = temp.nextElementSibling;
            removeallelsfarr(lcar);
            lcar = [];
        }else break; // Line ended!!
    }
    if (lcar.length>1){ // packing the last package!!
        lcar[0].before(newupc(lcar));
        removeallelsfarr(lcar);
    }
}
function linescanner(line){
    ultimateccchecker();

    if(line.innerText==='') return;
    let quads = ["$$","**","~~"];
    let doubles = ["$","*","`"];
    let quadchecker = [];
    for(let i=0;i<quads.length;i++){
        quadchecker.push((quads[i])[0]);
    }
    bulletscanner(line);
    let mtmp = line.firstElementChild;
    while(mtmp){
        if(mtmp.className==='lc'){
            if (quadchecker.includes(mtmp.innerText) && mtmp?.nextElementSibling?.innerText === mtmp.innerText) {
                //We found a quad opening!!
                const quadfd = mtmp.innerText.repeat(2);
                const quadck = mtmp.innerText;
                let gotclosing = false;
                let lcar = [];
                lcar.push(mtmp);
                lcar.push(mtmp.nextElementSibling);
                mtmp = mtmp.nextElementSibling;
                let stmp = mtmp.nextElementSibling;
                while (stmp) {
                    if(stmp.className !=='lc') break;
                    lcar.push(stmp);
                    if (stmp.innerText === quadck && stmp?.nextElementSibling?.innerText === quadck) {
                        //We found the matching closing quad!!
                        lcar.push(stmp.nextElementSibling);
                        gotclosing = true;
                        break;
                    }
                    stmp = stmp.nextElementSibling;
                }
                if (gotclosing){
                    //TODO: rendering logic goes here!!
                    if(lcar.length===4 && cursor.previousElementSibling===lcar[lcar.length-1]) lcar[2].before(newcursor());
                    else if(cursor.previousElementSibling===lcar[lcar.length-1]){
                        //do nothing!!
                    }
                    else{
                        if(quadfd === "$$"){
                            lcar[0].before(newmc(lcar))
                            mtmp = lcar[lcar.length-1].nextElementSibling;
                            removeallelsfarr(lcar);
                        }else if(quadfd==="**"){
                            lcar[0].before(newbc(lcar));
                            mtmp = lcar[lcar.length-1].nextElementSibling;
                            removeallelsfarr(lcar);
                        }
                    }
                }
            }else if(doubles.includes(mtmp.innerText)){
                //we have got a double opening!!
                const doublegot = mtmp.innerText;
                let gotclosing = false;
                let lcar = [];
                let stmp = mtmp.nextElementSibling;
                lcar.push(mtmp);
                while (stmp) {
                    if (stmp.className!=='lc') break;
                    lcar.push(stmp);
                    if (stmp.innerText === doublegot) {
                        //We found the matching closing double!!
                        gotclosing = true;
                        break;
                    }
                    stmp = stmp.nextElementSibling;
                }
                if (gotclosing){
                    //TODO: rendering logic goes here!!
                    if (lcar.length===2&&cursor.previousElementSibling===lcar[lcar.length-1] && doublegot!=='`') lcar[lcar.length-1].before(newcursor());
                    else if(cursor.previousElementSibling===lcar[lcar.length-1]){
                        //do nothing!!
                    }
                    else{
                        if(doublegot==="$"){
                            lcar[0].before(newmc(lcar));
                            mtmp = lcar[lcar.length-1].nextElementSibling;
                            removeallelsfarr(lcar);
                        }else if(doublegot==="*"){
                            lcar[0].before(newic(lcar));
                            mtmp = lcar[lcar.length-1].nextElementSibling;
                            removeallelsfarr(lcar);
                        }else if(doublegot==="`"){
                            if(lcar.length>2){
                                lcar[0].before(newlinecc(lcar));
                                mtmp = lcar[lcar.length - 1].nextElementSibling;
                                removeallelsfarr(lcar);
                            }
                        }
                    }
                }
            }
        }
        mtmp = mtmp.nextElementSibling;
    }
    //bulletscanner
    htmlscanner(line);
    bulletscanner(line);
    //ultimateccchecker();
    ultimatetchecker();
    lineprchecker(line);
}
function newbltc(lcar){
    let nwbltc = document.createElement('div');
    nwbltc.className = 'bltc';
    let rwmdtext = '';
    let innertext = '';
    for(let i = 0; i < lcar.length; i++) {
        rwmdtext += lcar[i].innerText;
        if(lcar[i].innerText === '*') {
            innertext += "•";
        } else {
            innertext += lcar[i].innerText;
        }
    }
    nwbltc.setAttribute('rwmd', rwmdtext);
    nwbltc.innerText = innertext;

    // Add click listener so clicking a bullet line places the cursor and explodes it for editing!
    nwbltc.addEventListener('click', () => {
        let prevline = currntline();
        nwbltc.after(newcursor());
        arrowleft();
        if (prevline !== currntline()) {
            linescanner(prevline);
        }
    });

    return nwbltc;
}
function bulletscanner(line){
    let mtmp = line.firstElementChild;
    const knownbullets = ['*','-','+','&'] // bullets can be easily added later
    let lcar = [];
    while(mtmp && mtmp.className==='lc' && (mtmp.innerText===' ' || knownbullets.includes(mtmp.innerText))){
        lcar.push(mtmp);
        if(knownbullets.includes(mtmp.innerText)&& mtmp.nextElementSibling.className==='lc' && mtmp.nextElementSibling.innerText===' '){
            lcar.push(mtmp.nextElementSibling);
            lcar[0].before(newbltc(lcar));
            removeallelsfarr(lcar);
        }
        mtmp = mtmp.nextElementSibling;
    }
}
function htmlscanner(line) {
    if (line.innerText === '') return;

    // Tags that don't need a closing </tag>
    const voidTags = ["hr", "br", "img", "input"];

    let mtmp = line.firstElementChild;
    while (mtmp) {
        // 1. Look for an opening '<' that is NOT followed by a space or '/'
        if (
            mtmp.className === 'lc' &&
            mtmp.innerText === '<' &&
            mtmp.nextElementSibling?.className === 'lc' &&
            mtmp.nextElementSibling.innerText !== ' ' &&
            mtmp.nextElementSibling.innerText !== '/'
        ) {
            let lcar = [mtmp];
            let stmp = mtmp.nextElementSibling;
            let openTagInside = "";
            let gotOpenTagEnd = false;

            // Phase 1: Walk until we find the '>' of the opening tag (e.g., <span style="color:red">)
            while (stmp) {
                if (stmp.className !== 'lc') break; // Stops if #cursor is still inside the opening tag!
                lcar.push(stmp);
                if (stmp.innerText === '>') {
                    gotOpenTagEnd = true;
                    break;
                }
                openTagInside += stmp.innerText;
                stmp = stmp.nextElementSibling;
            }

            if (gotOpenTagEnd && openTagInside.length > 0) {
                // Extract just the tag name: "span style='color:red'" -> "span"
                let tagName = openTagInside.trim().split(" ")[0].replace("/", "").toLowerCase();

                // Case A: It is a self-closing / void tag like <hr> or <br>
                if (voidTags.includes(tagName)) {
                    if (cursor.previousElementSibling === lcar[lcar.length - 1]) {
                        // Cursor is right at the end of <hr>| -> wait until user moves away!
                    } else {
                        lcar[0].before(newhc(lcar));
                        mtmp = lcar[lcar.length - 1].nextElementSibling;
                        removeallelsfarr(lcar);
                    }
                }
                // Case B: It is a paired tag like <u>...</u> or <mark>...</mark>
                else {
                    let closingTarget = `</${tagName}>`;
                    let collectedAfterOpen = "";
                    let gotClosingTag = false;
                    stmp = stmp.nextElementSibling; // Step onto the first character AFTER '<tag>'

                    // Phase 2: Keep walking until the collected string ends with '</tagName>'
                    while (stmp) {
                        if (stmp.className !== 'lc') break; // Stops if #cursor is inside!
                        lcar.push(stmp);
                        collectedAfterOpen += stmp.innerText;

                        if (collectedAfterOpen.toLowerCase().endsWith(closingTarget)) {
                            gotClosingTag = true;
                            break;
                        }
                        stmp = stmp.nextElementSibling;
                    }

                    if (gotClosingTag) {
                        // Auto-center cursor if user just typed empty <tag></tag>|
                        if (
                            collectedAfterOpen.length === closingTarget.length &&
                            cursor.previousElementSibling === lcar[lcar.length - 1]
                        ) {
                            let firstCloseBracketIndex = lcar.length - closingTarget.length;
                            lcar[firstCloseBracketIndex].before(newcursor());
                        } else if (cursor.previousElementSibling === lcar[lcar.length - 1]) {
                            // Cursor is still sitting right after </tag>| -> do nothing yet!
                        } else {
                            lcar[0].before(newhc(lcar));
                            mtmp = lcar[lcar.length - 1].nextElementSibling;
                            removeallelsfarr(lcar);
                        }
                    }
                }
            }
        }
        mtmp = mtmp?.nextElementSibling;
    }
}


function textgetter(element){
    //We can simply use innertext here!!
}
function exploder(element) {
    if (containers.includes(element.className)) {
        element.innerHTML = "";
        let rw = element.getAttribute('rwmd') || "";
        let graphemes = toGraphemes(rw);

        for (let i = graphemes.length - 1; i >= 0; i--) {
            if (graphemes[i] === '\n') {
                element.after(newnc());
            } else {
                element.after(newlc(graphemes[i]));
            }
        }
        element.remove();
    } else if (element.className === 'cc' || element.className === 'tc') {
        let rw = element.getAttribute('rwmd') || "";
        let prevline = currntline();
        let line = newline();
        line.append(newcursor());
        element.after(line);
        element.remove();

        if (prevline && prevline !== line && prevline.isConnected) {
            linescanner(prevline);
            lineprchecker(prevline);
        }

        // Insert raw text line-by-line WITHOUT re-triggering ultimateccchecker()
        for (let ch of toGraphemes(rw.replace(/\r\n/g, '\n'))) {
            if (ch === '\n') {
                const nwline = newline();
                cursor.parentElement.append(newnc());
                cursor.parentElement.after(nwline);
                nwline.append(newcursor());
            } else {
                cursor.before(newlc(ch));
            }
        }
    } else {
        console.error('exploder used for classname: ' + element.className);
    }
}
function exploderold(element){
    if(containers.includes(element.className)){
        element.innerHTML="";
        let rw = element.getAttribute('rwmd');
        //element.after(newcursor());
        for(let i = rw.length-1;i>=0;i--){
            if(rw[i]==='\n') element.after(newnc());
            else element.after(newlc(rw[i]));
        }element.remove();
    }else if(element.className==='cc' || element.className==='tc'){
        let rw=element.getAttribute('rwmd');
        if (element.previousElementSibling?.className==='lc'){
            element.previousElementSibling.append(newcursor());
            enter();
        }else {
            let line = newline();
            line.append(newcursor());
            element.after(line);
        }
        inserttextatcursor(rw);
        element.remove();
    }else console.error('exploder used for classname: '+element.className);
}
function lcargenfe(element){
    let lcar = [];
    if(containers.includes(element.className)){
        //element.innerHTML="";
        let rw = element.getAttribute('rwmd');
        //element.after(newcursor());
        for(let i = 0;i<rw.length;i++){
            lcar.push(newlc(rw[i]));
        }
        return lcar;
    }else console.error('exploder used for classname: '+element.className);
}
function lcartotext(lcar){
    let text = "";
    for(let i = 0;i<lcar.length;i++){
        if(lcar[i].className==='nc'){
            text+='\n';
        }else text+=lcar[i].innerText;

    }return text;
}
function dollarsearcher(key){
    let lcar = [];
    if (key === '$'){
        let betmpec = null;
        let tmpec = cursor.previousElementSibling;
        if(tmpec.previousElementSibling.innerText==="$") {
            return dollarsearcher("$$");
        }
        while(true){
            betmpec = tmpec;
            tmpec = tmpec.previousElementSibling;
            if(tmpec && tmpec.className==="lc"){
                lcar.push(tmpec);
                if (tmpec.innerText === "$"){
                    if(tmpec.previousElementSibling.innerText==="$"){
                        return null;
                    }
                    cursor.previousElementSibling.remove();
                    return lcar.reverse();
                }
            }else if(betmpec?.parentElement?.previousElementSibling?.lastElementChild?.className === "lc"){
                tmpec = betmpec.parentElement.previousElementSibling.lastElementChild;
                lcar.push(tmpec);
                if (tmpec.innerText === "$"){
                    cursor.previousElementSibling.remove();
                    return lcar.reverse();
                }
            }else return null;
        }
    }else {
        let betmpec = null;
        let tmpec = cursor.previousElementSibling.previousElementSibling;
        while(true){
            betmpec = tmpec;
            tmpec = tmpec.previousElementSibling;
            if(tmpec && tmpec.className==="lc"){
                lcar.push(tmpec);
                if (tmpec.innerText === "$" && tmpec.previousElementSibling.innerText === "$"){
                    lcar.push(tmpec.previousElementSibling);
                    cursor.previousElementSibling.remove();
                    cursor.previousElementSibling.remove();
                    return lcar.reverse();
                }
            }else if(betmpec?.parentElement?.previousElementSibling?.lastElementChild?.className === "lc"){
                tmpec = betmpec.parentElement.previousElementSibling.lastElementChild;
                lcar.push(tmpec);
                if (tmpec.innerText === "$"){
                    cursor.previousElementSibling.remove();
                    return lcar.reverse();
                }
            }else return null;
        }
    }
}
function currntlineold(){
    let curline = cursor.parentElement;
    while (!curline.classList.contains("line")){
        curline = curline.parentElement;
    }return curline;
}
function currntline() {
    let curline = cursor?.parentElement;
    while (curline && !curline.classList.contains('line')) {
        curline = curline.parentElement;
    }
    return curline || null;
}

function mdexporterold(){
    const editor = document.querySelector('#editor');
    let temp = editor.firstElementChild;
    let totalmd = "";
    while(temp){
        if(temp.className==='line'){
            let ltmp = temp.firstElementChild;
            while(ltmp){
                if(ltmp.className==='lc'){
                    totalmd+=ltmp.innerText;
                }else if(ltmp.className==='nc'){
                    totalmd+='\n';
                }else {
                    try{
                        totalmd += ltmp.getAttribute('rwmd');
                    }catch(e){
                        console.error(e);
                    }
                }
                ltmp = ltmp.nextElementSibling;
            }
        }else{
            if(totalmd[totalmd.length-1]==='\n'){totalmd+=temp+=temp.getAttribute('rwmd');}
            else totalmd+="\n"+temp.getAttribute('rwmd')+"\n";
        }
        temp = temp.nextElementSibling;
    }
    return totalmd;
}
function mdexporter() {
    const editor = document.querySelector('#editor');
    let temp = editor.firstElementChild;
    let totalmd = "";

    while (temp) {
        if (temp.classList.contains('line')) {
            if (temp.style.borderBottom === '1px solid black') {
                totalmd += "---\n";
                temp = temp.nextElementSibling;
                continue;
            }

            const prefix = temp.getAttribute('prefix');
            if (prefix) totalmd += prefix;

            let ltmp = temp.firstElementChild;
            while (ltmp) {
                if (ltmp.id === 'cursor') {
                    ltmp = ltmp.nextElementSibling;
                    continue;
                }
                if (ltmp.className === 'lc') {
                    totalmd += ltmp.innerText;
                } else if (ltmp.className === 'nc') {
                    totalmd += '\n';
                } else {
                    const rw = ltmp.getAttribute('rwmd');
                    if (rw !== null) totalmd += rw;
                }
                ltmp = ltmp.nextElementSibling;
            }
        } else {
            const rw = temp.getAttribute('rwmd') || "";
            if (totalmd.length > 0 && !totalmd.endsWith('\n')) {
                totalmd += '\n';
            }
            totalmd += rw + '\n';
        }
        temp = temp.nextElementSibling;
    }

    return totalmd;
}
function loadMarkdownIntoEditor(mdText) {
    const editor = document.getElementById('editor');
    const activeCursor = document.getElementById('cursor') || cursor;
    if (activeCursor) activeCursor.remove();

    editor.innerHTML = '';

    const firstLine = newline();
    firstLine.setAttribute('active', 'true');
    firstLine.append(activeCursor || newcursor());
    editor.append(firstLine);

    if (mdText && mdText.length > 0) {
        inserttextatcursor(mdText);
    }

    if (typeof ultimateccchecker === 'function') ultimateccchecker();
    if (typeof ultimatetchecker === 'function') ultimatetchecker();

    const liveCursor = document.getElementById('cursor');
    if (!liveCursor || !editor.contains(liveCursor)) {
        const tailLine = newline();
        tailLine.setAttribute('active', 'true');
        tailLine.append(activeCursor || newcursor());
        editor.append(tailLine);
    }
    if (!isRestoringHistory) resetHistory();
    ime.focus();
}
function lineprcheckerold(line){
    const first = line.firstElementChild;
    if (first && first.className === 'upc') {
        const txt = first.innerText;
        if (txt.startsWith('#') || txt.startsWith('---')) {
            exploder(first);
        }
    }
    if (!line || !line.classList.contains('line')) return;
    let lnnc = line.querySelector('.nc')
    if(lnnc){
        if(!(line.lastElementChild===lnnc)) lnnc.remove();
    }
    if(!line.contains(cursor)&&
        line?.firstElementChild?.className==='lc'&&
        line?.firstElementChild.innerText==='-' &&
        line?.firstElementChild?.nextElementSibling?.className==='lc'&&
        line?.firstElementChild.nextElementSibling?.innerText==='-' &&
        line?.firstElementChild?.nextElementSibling?.nextElementSibling?.className==='lc'&&
        line?.firstElementChild?.nextElementSibling?.nextElementSibling?.innerText==='-'
    ){line.style.borderBottom= '1px solid black'; line.innerHTML="";}else if(line.style.borderBottom==='1px solid black') {line.style.borderBottom = 'none'; inserttextatcursor("---");}


    let currentline = line;
    for (let i = 1; i <= 12; i++) {
        try {
            currentline.classList.remove(`h${i}`);
        } catch (e) {}
    }

    let fhc = 0;
    if (currentline?.firstElementChild?.className === 'lc' && currentline?.firstElementChild?.innerText === '#') {
        let crlc = currentline?.firstElementChild?.nextElementSibling;
        let hc = 1;
        while (crlc !== undefined && crlc !== null && crlc.className === 'lc' && crlc.innerText === '#') {
            crlc = crlc?.nextElementSibling;
            hc++;
        }
        if (crlc && crlc.innerText === " ") {
            currentline.classList.add(`h${hc}`);
            fhc = hc;
        }
    }

    const hasCursor = line.querySelector("#cursor") !== null;

    if (!hasCursor) {
        // ONLY pack into prefix if it is an actual heading (fhc > 0) and doesn't have one yet
        if (fhc > 0 && !line.getAttribute('prefix')) {
            let prefixStr = "";
            // Strip fhc hashes + 1 trailing space = fhc + 1 characters
            for (let i = 0; i < fhc + 1; i++) {
                if (line.firstElementChild) {
                    prefixStr += line.firstElementChild.innerText;
                    line.firstElementChild.remove();
                }
            }
            line.setAttribute('prefix', prefixStr);
        }
        helperlcpacker(line);
    } else {
        // Cursor is on this line: unpack the prefix if it exists!
        let prtext = line.getAttribute('prefix');
        if (prtext && prtext !== '') {
            for (let i = prtext.length - 1; i >= 0; i--) { // Fixed loop condition (i >= 0)
                if (line.firstElementChild) {
                    line.firstElementChild.before(newlc(prtext[i]));
                } else {
                    line.append(newlc(prtext[i]));
                }
            }
            line.setAttribute('prefix', '');
        }
    }
}
function lineprchecker(line) {
    if (!line || !line.classList.contains('line')) return;

    const first = line.firstElementChild;
    if (first && first.className === 'upc') {
        const txt = first.innerText;
        if (txt.startsWith('#') || txt.startsWith('---')) {
            exploder(first);
        }
    }

    let lnnc = line.querySelector('.nc');
    if (lnnc && line.lastElementChild !== lnnc) {
        lnnc.remove();
    }

    const hasCursor = line.querySelector('#cursor') !== null;

    if (
        !hasCursor &&
        line.firstElementChild?.className === 'lc' &&
        line.firstElementChild.innerText === '-' &&
        line.firstElementChild.nextElementSibling?.className === 'lc' &&
        line.firstElementChild.nextElementSibling.innerText === '-' &&
        line.firstElementChild.nextElementSibling.nextElementSibling?.className === 'lc' &&
        line.firstElementChild.nextElementSibling.nextElementSibling.innerText === '-'
    ) {
        line.style.borderBottom = '1px solid black';
        line.innerHTML = '';
        return;
    } else if (hasCursor && line.style.borderBottom === '1px solid black') {
        line.style.borderBottom = 'none';
        inserttextatcursor('---');
    }

    for (let i = 1; i <= 12; i++) {
        line.classList.remove(`h${i}`);
    }

    let fhc = 0;
    const savedPrefix = line.getAttribute('prefix') || '';

    if (line.firstElementChild?.className === 'lc' && line.firstElementChild.innerText === '#') {
        let crlc = line.firstElementChild.nextElementSibling;
        let hc = 1;
        while (crlc && crlc.className === 'lc' && crlc.innerText === '#') {
            crlc = crlc.nextElementSibling;
            hc++;
        }
        if (crlc && crlc.innerText === ' ') {
            line.classList.add(`h${hc}`);
            fhc = hc;
        }
    } else if (/^#+\s$/.test(savedPrefix)) {
        fhc = savedPrefix.trim().length;
        line.classList.add(`h${fhc}`);
    }

    if (!hasCursor) {
        if (fhc > 0 && !savedPrefix) {
            let prefixStr = '';
            for (let i = 0; i < fhc + 1; i++) {
                if (line.firstElementChild) {
                    prefixStr += line.firstElementChild.innerText;
                    line.firstElementChild.remove();
                }
            }
            line.setAttribute('prefix', prefixStr);
        }
        helperlcpacker(line);
    } else if (savedPrefix) {
        for (let i = savedPrefix.length - 1; i >= 0; i--) {
            if (line.firstElementChild) {
                line.firstElementChild.before(newlc(savedPrefix[i]));
            } else {
                line.append(newlc(savedPrefix[i]));
            }
        }
        line.setAttribute('prefix', '');
    }
}
function nextelement(element){
    if (element.nextElementSibling) return element.nextElementSibling;
    else if(element.parentElement?.nextElementSibling?.firstElementChild) return element.parentElement.nextElementSibling.firstElementChild;
    else return null;
}
function arreleaftcur(){
    let temp = cursor.nextElementSibling;
    let elar = [];
    while(temp && temp.className!=='nc'){
        elar.push(temp);
        temp = temp.nextElementSibling;
    }
    return elar;
}
function elarappender(element, elar){
    for (let i = 0; i < elar.length; i++) {
        element.append(elar[i]);
    }
}
/* function newcc(lcar){
     let rw = lcartotext(lcar);
     let innertext = "";
     let addall = false;
     for(let i = 0;i<rw.length-3;i++){
         if(!addall && rw[i]==='\n') {addall = true; continue;}
         if (addall) innertext+=rw[i];
     }
     let nwcc = document.createElement('div');
     nwcc.setAttribute('rwmd',rw);
     nwcc.innerText = innertext;
     nwcc.className='cc';
     nwcc.addEventListener('click', () => {
         exploder(nwcc);
     });
     return nwcc;

 }*/
function highlightCode(code) {
    // 1. Escape HTML entities so tags like #include <stdio.h> don't vanish!
    let escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 2. Single-pass tokenizer for comments, strings, preprocessor, keywords, types, functions, and numbers
    const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#include\s*&lt;[^&]*&gt;|#[a-zA-Z]+)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|delete|import|from|export|default|async|await|yield|pass|in|is|not|and|or|elif|def|lambda)\b|\b(int|float|double|char|void|bool|boolean|long|short|unsigned|signed|struct|union|enum|typedef|static|const|let|var|function|class|public|private|protected|final|String|System|printf|scanf|cout|cin|std|null|true|false|True|False|None)\b|\b(\d+(?:\.\d+)?)\b|\b([a-zA-Z_]\w*)(?=\s*\()/g;

    return escaped.replace(tokenRegex, (match, comment, str, kw, type, num, fn) => {
        if (comment) return `<span class="syn-comment">${comment}</span>`;
        if (str)     return `<span class="syn-string">${str}</span>`;
        if (kw)      return `<span class="syn-keyword">${kw}</span>`;
        if (type)    return `<span class="syn-type">${type}</span>`;
        if (num)     return `<span class="syn-number">${num}</span>`;
        if (fn)      return `<span class="syn-function">${fn}</span>`;
        return match;
    });
}
function newcc(lcar) {
    let rw = lcartotext(lcar);
    let lang = "";
    let innertext = "";
    let addall = false;

    // Start at i = 3 to skip the opening ```
    for (let i = 3; i < rw.length - 3; i++) {
        if (!addall) {
            if (rw[i] === '\n') {
                addall = true;
            } else {
                lang += rw[i]; // Collect language characters (e.g., "c", "java", "python")
            }
            continue;
        }
        innertext += rw[i];
    }

    // Trim trailing newline right before the closing ``` so there isn't an extra blank line at the bottom
    if (innertext.endsWith('\n')) {
        innertext = innertext.slice(0, -1);
    }

    let nwcc = document.createElement('div');
    nwcc.className = 'cc';
    nwcc.setAttribute('rwmd', rw);

    // 1. Create and append the language header bar
    let header = document.createElement('div');
    header.className = 'cc-header';
    header.innerText = lang.trim() || 'code';
    nwcc.appendChild(header);

    // 2. Create and append the highlighted code body
    let body = document.createElement('div');
    body.className = 'cc-body';
    body.innerHTML = highlightCode(innertext);
    nwcc.appendChild(body);

    // 3. Click listener to explode back into editable lines
    nwcc.addEventListener('click', () => {
        exploder(nwcc);
    });

    return nwcc;
}
function newline(){
    let nwline = document.createElement('div');
    nwline.className='line';
    return nwline;
}
function removeunnecessarylines() {
    let alllines = document.querySelectorAll('.line');
    for (let i = 0; i < alllines.length; i++) {
        if(!(alllines[i].firstElementChild)) alllines[i].remove();
    }
}
function startsWithTripleBacktick(line) {
    if (!line || line.className !== 'line') return false;
    let c1 = line.firstElementChild;
    let c2 = c1?.nextElementSibling;
    let c3 = c2?.nextElementSibling;
    return (
        c1?.className === 'lc' && c1.innerText === '`' &&
        c2?.className === 'lc' && c2.innerText === '`' &&
        c3?.className === 'lc' && c3.innerText === '`'
    );
}
function ccchecker(element){
    // element can be a line or cc
    if(element.className==='line'){
        let mtmp = element.firstElementChild;
        let openinggot = false;
        let closinggot = false;
        let lcar = [];
        while (mtmp && mtmp.id!=='cursor'){
            lcar.push(mtmp);
            if(mtmp.className === 'lc' && mtmp.innerText === '`' &&
                mtmp.nextElementSibling?.className === 'lc' && mtmp.nextElementSibling.innerText === '`' &&
                mtmp.nextElementSibling?.nextElementSibling?.className === 'lc' && mtmp.nextElementSibling?.nextElementSibling?.innerText === '`'){
                lcar.push(mtmp.nextElementSibling);
                lcar.push(mtmp.nextElementSibling.nextElementSibling);
                mtmp = mtmp.nextElementSibling.nextElementSibling;
                if(openinggot) closinggot = true;
                else openinggot = true;
            }if (closinggot) {
                lcar[0].parentElement.before(newcc(lcar));
                removeallelsfarr(lcar);
                removeunnecessarylines();//written to specifically remove lines vacated by this process!!
                return true;
                //break;
            }
            mtmp = nextelement(mtmp);
        }
    }
}

function ultimateccchecker(){
    let alllines = document.querySelectorAll('.line');
    for(let i = 0; i< alllines.length;i++){
        if(!startsWithTripleBacktick(alllines[i])) continue;
        if (ccchecker(alllines[i])) alllines = document.querySelectorAll('.line');
    }
}
/*async function exportpdf() {
    let active = currntline();
    let prevEl = cursor.previousElementSibling;

    // 1. Remove cursor so linescanner renders any open math/bold & hides '# ' prefix
    cursor.remove();
    linescanner(active);

    // 2. Wait for MathJax to finish rendering formulas
    if (window.MathJax && MathJax.typesetPromise) {
        await MathJax.typesetPromise();
    }

    // 3. Temporarily clear document.title to remove the filename header from the PDF
    let oldTitle = document.title;
    document.title = "";

    // 4. Trigger vector PDF print
    window.print();

    // 5. Restore original page title
    document.title = oldTitle;

    // 6. Safely restore cursor (checks if prevEl still exists, otherwise safely appends to line)
    if (prevEl && prevEl.isConnected) {
        prevEl.after(cursor);
    } else if (active) {
        active.append(cursor);
    }

    lineprchecker(active);
}*/

window.addEventListener('copy', (e) => {
    const sl = window.getSelection();
    if (!sl || sl.isCollapsed || sl.rangeCount === 0) return;

    const editor = document.querySelector('#editor');
    const range = sl.getRangeAt(0);
    if (!editor || !editor.contains(range.commonAncestorContainer)) return;

    e.preventDefault();
    let text = '';

    for (const block of editor.children) {
        if (!range.intersectsNode(block)) continue;
        if (block.contains(range.endContainer) && range.endOffset === 0 && !block.contains(range.startContainer)) continue;

        if (block.classList.contains('cc') || block.classList.contains('tc')) {
            if (text.length > 0 && !text.endsWith('\n')) text += '\n';
            text += (block.getAttribute('rwmd') || '') + '\n';
            continue;
        }

        if (block.classList.contains('line')) {
            if (block.style.borderBottom === '1px solid black') {
                text += '---\n';
                continue;
            }

            const prefix = block.getAttribute('prefix');
            if (prefix && (!block.contains(range.startContainer) || range.startContainer === block || block.firstElementChild?.contains(range.startContainer))) {
                text += prefix;
            }

            for (const node of block.children) {
                if (node.id === 'cursor') continue;
                if (!range.intersectsNode(node)) continue;
                if (node.contains(range.endContainer) && range.endOffset === 0 && !node.contains(range.startContainer)) continue;

                if (node.className === 'upc') {
                    const raw = node.innerText;
                    const start = node.contains(range.startContainer) ? range.startOffset : 0;
                    const end = node.contains(range.endContainer) ? range.endOffset : raw.length;
                    text += raw.slice(start, end);
                } else if (node.className === 'lc') {
                    text += node.innerText;
                } else if (node.className === 'nc') {
                    text += '\n';
                } else if (containers.includes(node.className)) {
                    text += node.getAttribute('rwmd') || '';
                }
            }
        }
    }

    e.clipboardData.setData('text/plain', text);
});
function extractSelectedMarkdown(range) {
    const editor = document.querySelector('#editor');
    let text = '';

    for (const block of editor.children) {
        if (!range.intersectsNode(block)) continue;
        if (block.contains(range.endContainer) && range.endOffset === 0 && !block.contains(range.startContainer)) continue;

        if (block.classList.contains('cc') || block.classList.contains('tc')) {
            if (text.length > 0 && !text.endsWith('\n')) text += '\n';
            text += (block.getAttribute('rwmd') || '') + '\n';
            continue;
        }

        if (block.classList.contains('line')) {
            if (block.style.borderBottom === '1px solid black') {
                text += '---\n';
                continue;
            }

            const prefix = block.getAttribute('prefix');
            if (prefix && (!block.contains(range.startContainer) || range.startContainer === block || block.firstElementChild?.contains(range.startContainer))) {
                text += prefix;
            }

            for (const node of block.children) {
                if (node.id === 'cursor') continue;
                if (!range.intersectsNode(node)) continue;
                if (node.contains(range.endContainer) && range.endOffset === 0 && !node.contains(range.startContainer)) continue;

                if (node.className === 'upc') {
                    const raw = node.innerText;
                    const start = node.contains(range.startContainer) ? range.startOffset : 0;
                    const end = node.contains(range.endContainer) ? range.endOffset : raw.length;
                    text += raw.slice(start, end);
                } else if (node.className === 'lc') {
                    text += node.innerText;
                } else if (node.className === 'nc') {
                    text += '\n';
                } else if (containers.includes(node.className)) {
                    text += node.getAttribute('rwmd') || '';
                }
            }
        }
    }

    return text;
}

function deleteSelectedRange(range) {
    pushHistory(true);
    const editor = document.querySelector('#editor');
    const blocks = Array.from(editor.children).filter(block => {
        if (!range.intersectsNode(block)) return false;
        if (block.contains(range.endContainer) && range.endOffset === 0 && !block.contains(range.startContainer)) return false;
        return true;
    });

    if (blocks.length === 0) return;

    let firstLine = null;
    let lastLine = null;
    let insertBeforeNode = null;

    blocks.forEach((block, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === blocks.length - 1;

        if (block.classList.contains('cc') || block.classList.contains('tc')) {
            if (isFirst) {
                firstLine = newline();
                block.before(firstLine);
            }
            block.remove();
            return;
        }

        if (block.classList.contains('line')) {
            if (!isFirst && !isLast) {
                block.remove();
                return;
            }

            if (isFirst) firstLine = block;
            if (isLast) lastLine = block;

            if (block.style.borderBottom === '1px solid black') {
                block.style.borderBottom = 'none';
                block.innerHTML = '';
                return;
            }

            if (isFirst) {
                const prefix = block.getAttribute('prefix');
                if (prefix && (!block.contains(range.startContainer) || range.startContainer === block || block.firstElementChild?.contains(range.startContainer))) {
                    block.setAttribute('prefix', '');
                }
            }

            const children = Array.from(block.children);
            for (const node of children) {
                if (node.id === 'cursor') continue;
                if (!range.intersectsNode(node)) continue;
                if (node.contains(range.endContainer) && range.endOffset === 0 && !node.contains(range.startContainer)) continue;

                if (node.className === 'upc') {
                    const raw = node.innerText;
                    const start = node.contains(range.startContainer) ? range.startOffset : 0;
                    const end = node.contains(range.endContainer) ? range.endOffset : raw.length;
                    const beforeText = raw.slice(0, start);
                    const afterText = raw.slice(end);

                    for (const ch of toGraphemes(beforeText)) {
                        node.before(newlc(ch));
                    }

                    let firstAfterNode = null;
                    for (const ch of toGraphemes(afterText)) {
                        const lc = newlc(ch);
                        if (!firstAfterNode) firstAfterNode = lc;
                        node.before(lc);
                    }

                    if (isFirst && !insertBeforeNode) {
                        insertBeforeNode = firstAfterNode || node.nextElementSibling;
                    }
                    node.remove();
                } else {
                    if (isFirst && !insertBeforeNode) {
                        insertBeforeNode = node.nextElementSibling;
                    }
                    node.remove();
                }
            }
        }
    });

    if (!firstLine) {
        firstLine = newline();
        editor.prepend(firstLine);
    }

    if (lastLine && lastLine !== firstLine) {
        const firstNc = firstLine.querySelector('.nc');
        if (firstNc) firstNc.remove();

        const trailingNodes = Array.from(lastLine.children).filter(n => n.id !== 'cursor');
        if (!insertBeforeNode || !firstLine.contains(insertBeforeNode)) {
            insertBeforeNode = trailingNodes[0] || null;
        }
        trailingNodes.forEach(n => firstLine.append(n));
        lastLine.remove();
    }

    if (insertBeforeNode && firstLine.contains(insertBeforeNode)) {
        insertBeforeNode.before(newcursor());
    } else {
        const nc = firstLine.querySelector('.nc');
        if (nc) nc.before(newcursor());
        else firstLine.append(newcursor());
    }

    if (editor.children.length === 0) {
        const freshLine = newline();
        freshLine.setAttribute('active', 'true');
        freshLine.append(newcursor());
        editor.append(freshLine);
    }

    linescanner(firstLine);
    lineprchecker(firstLine);
    pushHistory(true);
    ime.focus();
}
window.addEventListener('cut', (e) => {
    const sl = window.getSelection();
    if (!sl || sl.isCollapsed || sl.rangeCount === 0) return;

    const editor = document.querySelector('#editor');
    const range = sl.getRangeAt(0);
    if (!editor || !editor.contains(range.commonAncestorContainer)) return;

    e.preventDefault();
    e.clipboardData.setData('text/plain', extractSelectedMarkdown(range));
    deleteSelectedRange(range);
    sl.removeAllRanges();
});

function newnc() {
    let nwnc = document.createElement('div');
    nwnc.className='nc';
    nwnc.style.visibility = 'invisible';
    nwnc.style.userSelect = 'none';
    return nwnc;
}
function arrowright(){
    let ae = cursor.nextElementSibling;
    if (!ae) return;

    if(ae.className==='upc'){
        exploder(ae); arrowright();
    }else if (containers.includes(ae.className)) {
        exploder(ae);
    }else if(ae.classList.contains('nc')) ae.after(newcursor());
    else {
        if(ae===cursor) {
            if(ae.parentElement.previousElementSibling) ae.parentElement.previousElementSibling.append(newcursor());
            return;
        }
        ae.after(newcursor());
        linescanner(currntline());
    }
}

function arrowleft(){
    let pe = cursor.previousElementSibling;
    if (!pe) return; // Safely stop at the start of the line

    if(pe.className==='upc'){
        exploder(pe); arrowleft();
    }else if (containers.includes(pe.className)) {
        exploder(pe);
    }else if(pe.classList.contains('nc')) {
        lineprchecker(currntline());
        pe.before(newcursor())
    }
    else if (pe.previousElementSibling) {
        pe.previousElementSibling.after(newcursor());
        linescanner(currntline());
    } else {
        if(pe===cursor) {
            if(pe.parentElement.previousElementSibling) pe.parentElement.previousElementSibling.append(newcursor());
            return;
        }
        pe.before(newcursor());
        linescanner(currntline());
    }
}

function enter(){
    const nwline = document.createElement("div");
    nwline.className = "line";
    nwline.setAttribute('active','true');
    cursor.parentElement.after(nwline);
    cursor.parentElement.setAttribute('active','false');
    let prevline = currntline();
    let arrtomove = arreleaftcur();
    if(!(prevline.querySelector('.nc'))) {
        prevline.append(newnc());
    }
    lineprchecker(prevline);
    nwline.append(newcursor());
    elarappender(nwline,arrtomove);
    let prevbltc = prevline.querySelector('.bltc');

    if(prevbltc!==null){
        if(prevbltc.nextElementSibling.nextSibling) {
            inserttextatcursor(lcartotext(lcargenfe(prevbltc)));
            bulletscanner(nwline);
        }
        else {
            prevline.remove();
        }
        linescanner(currntline());

    }


    linescanner(prevline);
    helperlcpacker(prevline);
}

const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
const toGraphemes = (str) => Array.from(segmenter.segment(str), s => s.segment);

function inserttextatcursorold(text) {
    for (let ch of toGraphemes(text.replace(/\r\n/g, '\n'))) {
        if (ch === '\n') {
            enter();
        } else {
            let prev = cursor.previousElementSibling;
            // Ask Intl.Segmenter: "If I join prev + ch, are they still 1 single grapheme?"
            if (prev && prev.className === 'lc' && toGraphemes(prev.innerText + ch).length === 1) {
                prev.innerText += ch;
            } else {
                cursor.before(newlc(ch));
            }
        }
    }
    linescanner(currntline());
}
function inserttextatcursor(text) {
    pushHistory(text === ' ' || text.includes('\n'));
    const sl = window.getSelection();
    if (sl && !sl.isCollapsed && sl.rangeCount > 0) {
        const range = sl.getRangeAt(0);
        if (document.querySelector('#editor')?.contains(range.commonAncestorContainer)) {
            deleteSelectedRange(range);
            sl.removeAllRanges();
        }
    }

    for (let ch of toGraphemes(text.replace(/\r\n/g, '\n'))) {
        if (ch === '\n') {
            enter();
        } else {
            let prev = cursor.previousElementSibling;
            if (prev && prev.className === 'lc' && toGraphemes(prev.innerText + ch).length === 1) {
                prev.innerText += ch;
            } else {
                cursor.before(newlc(ch));
            }
        }
    }
    linescanner(currntline());
    pushHistory(false);
}

function inserttttextatcursor(text){
    for (let i = 0; i < text.length; i++) {
        let currentchar = text[i];
        if (currentchar==='\r') continue;
        if (currentchar!==`\n`){
            cursor.before(newlc(currentchar));
        }else {
            enter();
            /*let nwline = document.createElement('div');
            nwline.className='lc';
            cursor.parentElement.after(nwline);
            nwline.append(newcursor());*/
        }
    }
}

function backspace(){
    const sl = window.getSelection();
    if (sl && !sl.isCollapsed && sl.rangeCount > 0) {
        const range = sl.getRangeAt(0);
        if (document.querySelector('#editor')?.contains(range.commonAncestorContainer)) {
            deleteSelectedRange(range);
            sl.removeAllRanges();
            return;
        }
    }
    const prevChar = cursor.previousElementSibling;
    console.log(prevChar);
    if (prevChar && prevChar.classList.contains("lc")) {
        prevChar.remove();
        lineprchecker(currntline());
    }else if (prevChar && prevChar.classList.contains("mc")) {
        const rawFormula = prevChar.getAttribute('rwmd') || "";

        // 1. Remove the rendered math block
        prevChar.remove();

        // 2. Explode the raw string back into interactive .lc character divs
        for (let i = 0; i < rawFormula.length; i++) {
            const charDiv = document.createElement("div");
            charDiv.className = "lc";
            charDiv.textContent = rawFormula[i];

            // Attach the same click listener used during normal typing
            charDiv.addEventListener("click", () => {
                cursor.parentElement.setAttribute('active', 'false');
                charDiv.after(cursor);
                cursor.parentElement.setAttribute('active', 'true');
            });

            cursor.before(charDiv);
        }

        // 3. Optional: Delete the trailing '$' immediately so they are inside the formula
        const trailingDollar = cursor.previousElementSibling;
        if (trailingDollar && trailingDollar.innerText === "$") {
            trailingDollar.remove();
        }
    } else if(prevChar && prevChar.className==='nc') {
        arrowleft(); backspace();
    } else if(prevChar && containers.includes(prevChar.className)) exploder(prevChar);
    else{
        let pel = cursor.parentElement;
        let prevps = pel.previousElementSibling;
        if(prevps && prevps.classList.contains('line')){
            if(pel.innerText ==="") {pel.remove(); prevps.append(newcursor()); console.log('1st if from backspace');}
            else {
                console.log('2nd if from backspace');
                let arrtomov = arreleaftcur();
                try {prevps.querySelector('.nc').remove();}catch (e){}
                prevps.append(newcursor());
                elarappender(prevps,arrtomov);
                pel.remove();
            }

            //prevps.append(newcursor());
            prevps.setAttribute('active','true');
        }else if(prevps.className==='cc' || prevps.className==='tc'){
            exploder(prevps); removeunnecessarylines();
        }else{
            console.log("Nothing to do!!");
        }
    }
    pushHistory(false);
}
window.addEventListener('paste',(e)=>{
    e.preventDefault(); // Stop the browser from dumping raw text into a div!

    // Grab the plain text string from the system clipboard
    const pastedText = (e.clipboardData || window.clipboardData).getData("text/plain");
    if (!pastedText) return;

    // Feed the string into your character-by-character typing engine!
    inserttextatcursor(pastedText);
})
window.addEventListener("keydown", (e) => {
    console.log(e.key);
    // Ignore system hotkeys like Ctrl+R, Alt, Meta
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        window.print();
        return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    /*if (e.key === "Enter") {

        enter();
        lineprchecker(currntline());

    }*/
    if (e.key === "ArrowLeft") {
        arrowleft();
    }
    if (e.key === "ArrowRight") {
        arrowright();
    }

        // 1. Handle regular typed characters
        /*if (e.key.length === 1) {
            e.preventDefault();

            cursor.before(newlc(e.key));
            linescanner(currntline());
            /!*if(e.key===" ") lineprchecker();*!/
        }*/

    // 2. Handle Backspace (Delete previous character)
    else if (e.key === "Backspace") {
        backspace();
        lineprchecker(currntline());
    }
});
function hasActiveSelection() {
    const sl = window.getSelection();
    return Boolean(sl && !sl.isCollapsed && sl.toString().length > 0);
}

// Functions for toolbar--
// 1. Wrap highlighted text or insert empty markers with cursor centered
function wrapSelection(prefix, suffix) {
    const sl = window.getSelection();
    const editor = document.querySelector('#editor');

    if (sl && !sl.isCollapsed && sl.rangeCount > 0 && editor?.contains(sl.getRangeAt(0).commonAncestorContainer)) {
        const range = sl.getRangeAt(0);
        const startEl = range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement
            : range.startContainer;
        const targetLine = startEl?.closest('.line');
        if (!targetLine) return;

        // 1. Collect all selected nodes on targetLine
        const selectedNodes = Array.from(targetLine.children).filter(node => {
            if (node.id === 'cursor' || node.className === 'nc') return false;
            if (!range.intersectsNode(node)) return false;
            if (node.contains(range.endContainer) && range.endOffset === 0 && !node.contains(range.startContainer)) return false;
            return true;
        });

        if (selectedNodes.length === 0) return;

        let firstEl = null;
        let lastEl = null;

        // 2. Explode any collapsed containers & pinpoint exact firstEl and lastEl
        selectedNodes.forEach((node, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === selectedNodes.length - 1;

            if (node.className === 'upc') {
                const raw = node.innerText;
                const startChar = node.contains(range.startContainer) ? range.startOffset : 0;
                const endChar = node.contains(range.endContainer) ? range.endOffset : raw.length;

                const beforeCount = toGraphemes(raw.slice(0, startChar)).length;
                const selectedCount = toGraphemes(raw.slice(startChar, endChar)).length;

                const prevSib = node.previousElementSibling;
                exploder(node);

                let cur = prevSib ? prevSib.nextElementSibling : targetLine.firstElementChild;
                for (let i = 0; i < beforeCount && cur; i++) cur = cur.nextElementSibling;
                if (isFirst) firstEl = cur;

                for (let i = 1; i < selectedCount && cur; i++) cur = cur.nextElementSibling;
                if (isLast) lastEl = cur;
            } else if (containers.includes(node.className)) {
                const prevSib = node.previousElementSibling;
                const nextSib = node.nextElementSibling;
                exploder(node);

                if (isFirst) firstEl = prevSib ? prevSib.nextElementSibling : targetLine.firstElementChild;
                if (isLast) lastEl = nextSib ? nextSib.previousElementSibling : targetLine.lastElementChild;
            } else {
                if (isFirst) firstEl = node;
                if (isLast) lastEl = node;
            }
        });

        if (!firstEl || !lastEl) return;

        // 3. Insert prefix .lc nodes before firstEl
        for (const ch of toGraphemes(prefix)) {
            firstEl.before(newlc(ch));
        }

        // 4. Insert suffix .lc nodes after lastEl
        let anchor = lastEl;
        for (const ch of toGraphemes(suffix)) {
            const lc = newlc(ch);
            anchor.after(lc);
            anchor = lc;
        }

        // 5. Render immediately with linescanner, then place #cursor right after the wrapped element
        sl.removeAllRanges();
        const afterWrapped = anchor.nextElementSibling;
        const prevCursorLine = currntline();
        cursor.remove();

        linescanner(targetLine);

        if (afterWrapped && targetLine.contains(afterWrapped)) {
            afterWrapped.before(cursor);
        } else {
            const nc = targetLine.querySelector('.nc');
            if (nc) nc.before(cursor);
            else targetLine.append(cursor);
        }

        if (prevCursorLine && prevCursorLine !== targetLine && prevCursorLine.isConnected) {
            lineprchecker(prevCursorLine);
        }
        lineprchecker(targetLine);
        ime.focus();
        return;
    }

    // No selection: insert empty markers at cursor
    inserttextatcursor(prefix + suffix);
    if (prefix === '`' && suffix === '`') arrowleft();
    ime.focus();
}

// 2. Toggle H1 / H2 / H3 on the current line
function toggleHeading(level) {
    const line = currntline();
    if (!line) return;
    lineprchecker(line);

    let existingLevel = 0;
    let temp = line.firstElementChild;
    while (temp && temp.className === 'lc' && temp.innerText === '#') {
        existingLevel++;
        temp = temp.nextElementSibling;
    }

    // Remove existing heading hashes + trailing space
    if (existingLevel > 0 && temp && temp.className === 'lc' && temp.innerText === ' ') {
        for (let i = 0; i <= existingLevel; i++) {
            line.firstElementChild.remove();
        }
    }

    // If clicking the same level again, just toggle it off; otherwise apply new level
    if (existingLevel !== level) {
        const prefix = '#'.repeat(level) + ' ';
        for (let i = prefix.length - 1; i >= 0; i--) {
            line.prepend(newlc(prefix[i]));
        }
    }

    lineprchecker(line);
    ime.focus();
}

// 3. Toggle bullet list on the current line
function toggleBullet() {
    const line = currntline();
    if (!line) return;

    const existingBullet = line.querySelector('.bltc');
    if (existingBullet) {
        existingBullet.remove();
    } else {
        line.prepend(newlc(' '));
        line.prepend(newlc('*'));
        bulletscanner(line);
    }
    ime.focus();
}

// 4. Insert a horizontal divider (---)
function insertHR() {
    const line = currntline();
    if (line && line.innerText.trim().length > 0) enter();
    inserttextatcursor('---');
    enter();
    ime.focus();
}

// 5. Insert a fenced code block and place cursor inside the code area
function insertCodeBlock() {
    const line = currntline();
    if (line && line.innerText.trim().length > 0) enter();
    inserttextatcursor('```js\n\n```');
    // Move cursor up onto the blank line inside the fence
    const closingLine = currntline();
    const codeLine = closingLine.previousElementSibling;
    if (codeLine && codeLine.classList.contains('line')) {
        codeLine.prepend(newcursor());
    }
    ime.focus();
}

// 6. Insert /graph{...} or /chart{...} widget template
function insertWidget(template) {
    const line = currntline();
    if (line && line.innerText.trim().length > 0) enter();
    inserttextatcursor(template);
    enter();
    ime.focus();
}

// 7. Interactive 6x6 Table Picker & Markdown Table Generator
function initTablePicker() {
    const grid = document.getElementById('table-picker-grid');
    const label = document.getElementById('table-picker-label');
    if (!grid) return;

    for (let r = 1; r <= 6; r++) {
        for (let c = 1; c <= 6; c++) {
            const cell = document.createElement('div');
            cell.className = 'tp-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;

            cell.addEventListener('mouseenter', () => {
                label.innerText = `${r} × ${c} Table`;
                grid.querySelectorAll('.tp-cell').forEach(el => {
                    const er = Number(el.dataset.r);
                    const ec = Number(el.dataset.c);
                    el.classList.toggle('active', er <= r && ec <= c);
                });
            });

            cell.addEventListener('mousedown', (e) => {
                e.preventDefault();
                insertTable(r, c);
                document.getElementById('table-picker').classList.remove('open');
            });

            grid.appendChild(cell);
        }
    }
}

function toggleTablePicker() {
    const picker = document.getElementById('table-picker');
    if (picker) picker.classList.toggle('open');
}

function insertTable(rows, cols) {
    pushHistory(true);
    const header = '| ' + Array.from({ length: cols }, (_, i) => `Col ${i + 1}`).join(' | ') + ' |';
    const sep = '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |';
    const bodyRows = Array.from({ length: rows }, () =>
        '| ' + Array.from({ length: cols }, () => 'Cell').join(' | ') + ' |'
    );

    const tableMd = [header, sep, ...bodyRows].join('\n');
    const tcEl = newtc([{ className: 'lc', innerText: tableMd }]);

    const line = currntline();
    const afterLine = newline();
    afterLine.setAttribute('active', 'true');

    if (line && line.innerText.trim().length === 0) {
        line.before(tcEl);
        line.after(afterLine);
        afterLine.append(newcursor());
        line.remove();
    } else if (line) {
        line.setAttribute('active', 'false');
        line.after(tcEl);
        tcEl.after(afterLine);
        afterLine.append(newcursor());
        linescanner(line);
        lineprchecker(line);
    } else {
        const editor = document.querySelector('#editor');
        editor.append(tcEl, afterLine);
        afterLine.append(newcursor());
    }
    pushHistory(true);
    ime.focus();
}

// Close table picker if clicking outside
document.addEventListener('click', (e) => {
    const picker = document.getElementById('table-picker');
    if (picker && !e.target.closest('.tb-dropdown')) {
        picker.classList.remove('open');
    }
});

// 8. File Actions (Save & Export PDF)
async function saveCurrentNote() {
    if (!window.photonAPI) return;
    const saved = await window.photonAPI.saveFile(
        typeof currentFilePath !== 'undefined' ? currentFilePath : null,
        mdexporter(),
        typeof currentVaultPath !== 'undefined' ? currentVaultPath : null
    );
    if (saved && saved.filePath) {
        currentFilePath = saved.filePath;
    }
}

async function exportCurrentPdf() {
    if (window.photonAPI) {
        await window.photonAPI.exportPdf('PhotonMD-Note');
    } else {
        window.print();
    }
}

// 9. Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+S)
window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
        e.preventDefault();
        wrapSelection('**', '**');
    } else if (key === 'i') {
        e.preventDefault();
        wrapSelection('*', '*');
    } else if (key === 's') {
        e.preventDefault();
        saveCurrentNote();
    }else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
    }
});

initTablePicker();

let _printState = null;

async function prepareForPrint() {
    const activeLine = currntline();
    if (!activeLine) return;

    _printState = {
        line: activeLine,
        prevEl: cursor.previousElementSibling
    };

    cursor.remove();
    linescanner(activeLine);
    lineprchecker(activeLine);

    if (window.MathJax?.typesetPromise) {
        await MathJax.typesetPromise();
    }
}

function restoreAfterPrint() {
    if (!_printState) return;
    const { line, prevEl } = _printState;
    _printState = null;

    if (prevEl && prevEl.isConnected) {
        prevEl.after(cursor);
    } else if (line && line.isConnected) {
        const nc = line.querySelector('.nc');
        if (nc) nc.before(cursor);
        else line.append(cursor);
    }

    if (line && line.isConnected) {
        lineprchecker(line);
    }
    ime.focus();
}

const MAX_HISTORY = 100;
let undoStack = [];
let redoStack = [];
let historyTimer = null;
let isRestoringHistory = false;

function getCursorState() {
    const editor = document.getElementById('editor');
    const line = currntline();
    if (!editor || !line) return { blockIndex: 0, charOffset: 0 };

    const blocks = Array.from(editor.children);
    const blockIndex = Math.max(0, blocks.indexOf(line));

    let charOffset = (line.getAttribute('prefix') || '').length;
    let node = line.firstElementChild;
    while (node && node.id !== 'cursor') {
        if (node.className === 'lc' || node.className === 'upc') {
            charOffset += toGraphemes(node.innerText).length;
        } else if (containers.includes(node.className)) {
            charOffset += toGraphemes(node.getAttribute('rwmd') || '').length;
        }
        node = node.nextElementSibling;
    }

    return { blockIndex, charOffset };
}

function restoreCursorState(blockIndex, charOffset) {
    const editor = document.getElementById('editor');
    const blocks = Array.from(editor.children);
    if (blocks.length === 0) return;

    const safeIndex = Number.isFinite(blockIndex)
        ? Math.max(0, Math.min(blockIndex, blocks.length - 1))
        : blocks.length - 1;

    let targetLine = blocks[safeIndex];
    if (!targetLine || !targetLine.classList.contains('line')) {
        targetLine = blocks.slice(safeIndex).find(b => b.classList.contains('line'))
            || blocks.slice(0, safeIndex).reverse().find(b => b.classList.contains('line'));
    }
    if (!targetLine) {
        targetLine = newline();
        editor.append(targetLine);
    }

    targetLine.setAttribute('active', 'true');

    const savedPrefix = targetLine.getAttribute('prefix') || '';
    if (savedPrefix) {
        for (let i = savedPrefix.length - 1; i >= 0; i--) {
            targetLine.prepend(newlc(savedPrefix[i]));
        }
        targetLine.setAttribute('prefix', '');
    }

    Array.from(targetLine.children).forEach(child => {
        if (child.className === 'upc') exploder(child);
    });

    let remaining = Number.isFinite(charOffset) ? charOffset : Infinity;
    let node = targetLine.firstElementChild;
    let placed = false;

    while (node && node.className !== 'nc') {
        if (node.id === 'cursor') {
            node = node.nextElementSibling;
            continue;
        }
        const len = node.className === 'lc'
            ? 1
            : toGraphemes(node.getAttribute('rwmd') || node.innerText).length;

        if (remaining <= 0) {
            node.before(newcursor());
            placed = true;
            break;
        }
        remaining -= len;
        node = node.nextElementSibling;
    }

    if (!placed) {
        const nc = targetLine.querySelector('.nc');
        if (nc) nc.before(newcursor());
        else targetLine.append(newcursor());
    }

    lineprchecker(targetLine);
    ime.focus();
}

function serializeEditorBlocks() {
    const editor = document.getElementById('editor');
    const blocks = [];

    for (const el of editor.children) {
        if (el.classList.contains('tc')) {
            blocks.push({ type: 'tc', rwmd: el.getAttribute('rwmd') || '' });
        } else if (el.classList.contains('cc')) {
            blocks.push({ type: 'cc', rwmd: el.getAttribute('rwmd') || '' });
        } else if (el.classList.contains('line')) {
            if (el.style.borderBottom === '1px solid black') {
                blocks.push({ type: 'hr' });
                continue;
            }
            let text = el.getAttribute('prefix') || '';
            for (const node of el.children) {
                if (node.id === 'cursor' || node.className === 'nc') continue;
                if (node.className === 'lc') text += node.innerText;
                else {
                    const rw = node.getAttribute('rwmd');
                    if (rw !== null) text += rw;
                }
            }
            blocks.push({ type: 'line', text });
        }
    }
    return blocks;
}

function createSnapshot() {
    const { blockIndex, charOffset } = getCursorState();
    return {
        blocks: serializeEditorBlocks(),
        blockIndex,
        charOffset
    };
}
function isSameSnapshot(a, b) {
    return JSON.stringify(a.blocks) === JSON.stringify(b.blocks);
}

function pushHistoryold(immediate = false) {
    if (isRestoringHistory) return;

    const commit = () => {
        const snap = createSnapshot();
        const last = undoStack[undoStack.length - 1];
        if (last && last.lines.join('\n') === snap.lines.join('\n')) return;

        undoStack.push(snap);
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        redoStack = [];
    };

    clearTimeout(historyTimer);
    if (immediate) {
        commit();
    } else {
        historyTimer = setTimeout(commit, 350);
    }
}
function pushHistory(immediate = false) {
    if (isRestoringHistory) return;

    const commit = () => {
        const snap = createSnapshot();
        const last = undoStack[undoStack.length - 1];
        if (last && isSameSnapshot(last, snap)) return;

        undoStack.push(snap);
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        redoStack = [];
    };

    clearTimeout(historyTimer);
    if (immediate) {
        commit();
    } else {
        historyTimer = setTimeout(commit, 250);
    }
}

function resetHistory() {
    clearTimeout(historyTimer);
    undoStack = [createSnapshot()];
    redoStack = [];
}

function applySnapshotold(snap) {
    isRestoringHistory = true;
    try {
        loadMarkdownIntoEditor(snap.lines.join('\n'));
        restoreCursorState(snap.lineIndex, snap.charOffset);
    } finally {
        isRestoringHistory = false;
    }
}
function applySnapshot(snap) {
    isRestoringHistory = true;
    try {
        const editor = document.getElementById('editor');
        if (cursor) cursor.remove();
        editor.innerHTML = '';

        snap.blocks.forEach((block, idx) => {
            if (block.type === 'tc') {
                editor.append(newtc([{ className: 'lc', innerText: block.rwmd }]));
            } else if (block.type === 'cc') {
                editor.append(newcc([{ className: 'lc', innerText: block.rwmd }]));
            } else if (block.type === 'hr') {
                const hrLine = newline();
                hrLine.style.borderBottom = '1px solid black';
                editor.append(hrLine);
            } else {
                const line = newline();
                for (const ch of toGraphemes(block.text)) {
                    line.append(newlc(ch));
                }
                if (idx < snap.blocks.length - 1) line.append(newnc());
                editor.append(line);
                linescanner(line);
                lineprchecker(line);
            }
        });

        if (editor.children.length === 0) {
            const fresh = newline();
            editor.append(fresh);
        }

        restoreCursorState(snap.blockIndex, snap.charOffset);
    } finally {
        isRestoringHistory = false;
    }
}

function undoold() {
    clearTimeout(historyTimer);
    if (undoStack.length <= 1) return;

    const current = undoStack.pop();
    redoStack.push(current);

    const previous = undoStack[undoStack.length - 1];
    applySnapshot(previous);
}
function undoold() {
    clearTimeout(historyTimer);
    if (undoStack.length === 0) return;

    const currentSnap = createSnapshot();
    const topSnap = undoStack[undoStack.length - 1];

    // If there are uncommitted edits (e.g. from debounced typing/backspace),
    // save them to redoStack and restore the top of undoStack directly
    if (topSnap && topSnap.lines.join('\n') !== currentSnap.lines.join('\n')) {
        redoStack.push(currentSnap);
        applySnapshot(topSnap);
        return;
    }

    if (undoStack.length <= 1) return;

    const popped = undoStack.pop();
    redoStack.push(popped);

    const previous = undoStack[undoStack.length - 1];
    applySnapshot(previous);
}

function redoold() {
    clearTimeout(historyTimer);
    if (redoStack.length === 0) return;

    const next = redoStack.pop();
    undoStack.push(next);
    applySnapshot(next);
}

function undo() {
    clearTimeout(historyTimer);
    if (undoStack.length === 0) return;

    const currentSnap = createSnapshot();
    const topSnap = undoStack[undoStack.length - 1];

    if (topSnap && !isSameSnapshot(topSnap, currentSnap)) {
        redoStack.push(currentSnap);
        applySnapshot(topSnap);
        return;
    }

    if (undoStack.length <= 1) return;

    const popped = undoStack.pop();
    redoStack.push(popped);
    applySnapshot(undoStack[undoStack.length - 1]);
}

function redo() {
    clearTimeout(historyTimer);
    if (redoStack.length === 0) return;

    const next = redoStack.pop();
    undoStack.push(next);
    applySnapshot(next);
}

window.addEventListener('beforeprint', () => { prepareForPrint(); });
window.addEventListener('afterprint', () => { restoreAfterPrint(); });

resetHistory();