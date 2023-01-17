const ENCRYPTION_MARKER = '[-!_0_!-]';
const ENCRYPTION_KEY = ':_.NaN0';
const editorContainer = document.getElementById("editorContainer");
const editor = new JSONEditor(editorContainer, {
    mode: 'tree',
    history: true,
});

const inputFile = document.querySelector('#inputFile');
inputFile.addEventListener('change', loadFile);
const exportButton = document.querySelector('#exportButton');

const decryptButton = document.getElementById("decryptButton");
const sourceTextArea = document.getElementById("sourceTextArea");
const targetTextArea = document.getElementById("targetTextArea");


function loadFile() {
	var file = document.getElementById("inputFile").files[0];
	var reader = new FileReader();

    reader.onload = function(progressEvent) {
		const savedGames = JSON.parse(progressEvent.target.result);
        const decryptedGames = decryptSavedGames(savedGames)
        editor.set(decryptedGames);
	};

    reader.readAsText(file);

    editorContainer.style.display = 'block';
    exportButton.removeAttribute('disabled');
}


function isEncrypted(data) {
	return typeof data === 'string' && data.startsWith(ENCRYPTION_MARKER);
}


function decryptSavedGames(savedGames) {
    let globals = savedGames.globals;
    let autoSlot = savedGames.autoSlot;
    let slots = savedGames.slots;
    let result = { ...savedGames};

    if (isEncrypted(result.globals)) {
        result.globals = JSON.parse(decryptBase64(globals));
    }

    if (isEncrypted(result.autoSlot)) {
        result.autoSlot = JSON.parse(decryptBase64(autoSlot));
    }

    result.slots = slots;

    for (slot in result.slots) {
        slotBase64 = result.slots[slot];

        if (isEncrypted(slotBase64)) {
            result.slots[slot] = JSON.parse(decryptBase64(slotBase64));
        }
    }

    return result;
}


function decryptBase64(base64) {
    if (base64.startsWith(ENCRYPTION_MARKER))
    {
        // Trim the marker from the beginning
        base64 = base64.substr(9);
    }

    let data = CryptoJS.AES.decrypt(base64, ENCRYPTION_KEY);
    let plainText = data.toString(CryptoJS.enc.Utf8);

    return plainText;
}


function exportSavedGames() {
    var data = JSON.stringify(editor.get(), null, 4);
    var blob = new Blob([data], {
        type: 'application/octet-stream'
    });

    url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cc.save');

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
}


function decryptSource() {
    var source = sourceTextArea.value;

    if (source.startsWith(ENCRYPTION_MARKER))
    {
        // Trim the marker from the beginning
        source = source.substr(9);
    }

    var target = CryptoJS.AES.decrypt(source, ENCRYPTION_KEY);
    target = target.toString(CryptoJS.enc.Utf8);

    target = JSON.stringify(JSON.parse(target), null, 4);

    targetTextArea.value = target;
}