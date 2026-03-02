const input = document.getElementById('input');
const preview = document.getElementById('preview');
const presetsList = document.getElementById('presets-list');

const mcColors = {
    '0': '#000',
    '1': '#00A',
    '2': '#0A0',
    '3': '#0AA',
    '4': '#A00',
    '5': '#A0A',
    '6': '#FA0',
    '7': '#AAA',
    '8': '#555',
    '9': '#55F',
    'a': '#5F5',
    'b': '#5FF',
    'c': '#F55',
    'd': '#F5F',
    'e': '#FF5',
    'f': '#FFF'
};

const grid = document.getElementById('color-grid');

Object.keys(mcColors).forEach(c => {
    const b = document.createElement('button');
    b.className = 'c-btn';
    b.style.background = mcColors[c];
    b.onclick = () => add('&' + c);
    grid.appendChild(b);
});

function add(code) {
    const s = input.selectionStart;
    
    input.value = input.value.substring(0, s) + code + input.value.substring(input.selectionEnd);
    
    input.focus();
    input.setSelectionRange(s + code.length, s + code.length);
    
    update();
}

function update() {
    let html = "";
    
    let style = {
        color: '#ffffff',
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        magic: false
    };
    
    const parts = input.value.split(/&(?=[0-9a-fk-or])/g);
    
    if (parts[0]) {
        html += `<span>${parts[0]}</span>`;
    }

    for (let i = 1; i < parts.length; i++) {
        const code = parts[i][0];
        const content = parts[i].substring(1);
        
        if (mcColors[code]) { 
            style.color = mcColors[code]; 
            style.bold = false;
            style.italic = false;
            style.underline = false;
            style.strike = false;
            style.magic = false; 
        } else if (code === 'l') {
            style.bold = true;
        } else if (code === 'o') {
            style.italic = true;
        } else if (code === 'n') {
            style.underline = true;
        } else if (code === 'm') {
            style.strike = true;
        } else if (code === 'k') {
            style.magic = true;
        } else if (code === 'r') { 
            style.color = '#ffffff'; 
            style.bold = false;
            style.italic = false;
            style.underline = false;
            style.strike = false;
            style.magic = false; 
        }
        
        let renderColor = style.color;
        
        if (renderColor === '#000') {
            renderColor = '#222';
        }

        const classes = [
            style.bold ? 'mc-bold' : '',
            style.italic ? 'mc-italic' : '',
            style.underline ? 'mc-underline' : '',
            style.strike ? 'mc-strike' : '',
            style.magic ? 'mc-magic' : ''
        ].join(' ');

        let finalContent = content;
        
        if (style.magic) {
            finalContent = content.replace(/./g, () => String.fromCharCode(33 + Math.random() * 94));
        }

        html += `<span style="color:${renderColor}" class="${classes}">${finalContent}</span>`;
    }
    
    preview.innerHTML = html || "<span style='opacity:0.4'>Type something...</span>";
}

let myPresets = JSON.parse(localStorage.getItem('bilong_v5')) || [];

function saveNew() {
    const name = document.getElementById('preset-name').value.trim();
    
    if (!name || !input.value) {
        return alert("Enter name and text!");
    }
    
    myPresets.push({
        id: Date.now(),
        name,
        content: input.value
    });
    
    finishAction();
}

function render() {
    presetsList.innerHTML = '';
    
    myPresets.forEach(p => {
        const div = document.createElement('div');
        div.className = 'preset-pill';
        
        div.innerHTML = `
            <button class="preset-load" onclick="loadP(${p.id})">${p.name}</button>
            <div class="dots-btn" onclick="toggleM(event, ${p.id})">⋮</div>
            <div id="m-${p.id}" class="menu">
                <button onclick="updateP(${p.id})">💾 Overwrite</button>
                <button onclick="renameP(${p.id})">✏️ Rename</button>
                <button style="color:#be5858" onclick="deleteP(${p.id})">🗑 Delete</button>
            </div>
        `;
        
        presetsList.appendChild(div);
    });
}

function loadP(id) {
    const p = myPresets.find(x => x.id == id);
    input.value = p.content;
    
    update();
}

function updateP(id) {
    const p = myPresets.find(x => x.id == id);
    
    if (confirm(`Update "${p.name}"?`)) {
        p.content = input.value;
        finishAction();
    }
}

function deleteP(id) {
    if (confirm("Delete preset?")) {
        myPresets = myPresets.filter(x => x.id != id);
        finishAction();
    }
}

function renameP(id) {
    const p = myPresets.find(x => x.id == id);
    const n = prompt("New name:", p.name);
    
    if (n) {
        p.name = n;
        finishAction();
    }
}

function finishAction() {
    localStorage.setItem('bilong_v5', JSON.stringify(myPresets));
    document.getElementById('preset-name').value = '';
    render();
}

function toggleM(e, id) {
    e.stopPropagation();
    
    document.querySelectorAll('.menu').forEach(m => {
        if (m.id !== 'm-' + id) {
            m.style.display = 'none';
        }
    });
    
    const m = document.getElementById('m-' + id);
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

document.onclick = () => {
    document.querySelectorAll('.menu').forEach(m => {
        m.style.display = 'none';
    });
};

async function copyText() {
    await navigator.clipboard.writeText(input.value);
    
    const b = document.querySelector('.copy-main');
    b.innerText = "✅ COPIED TO CLIPBOARD!";
    
    setTimeout(() => {
        b.innerText = "📋 COPY TO CLIPBOARD";
    }, 2000);
}

setInterval(() => {
    if (input.value.includes('&k')) {
        update();
    }
}, 100);

input.oninput = update;
render();
update();
