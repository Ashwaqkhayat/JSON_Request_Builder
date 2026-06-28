const ENVIRONMENTS = {
    "uat": {
        "label": "UAT",
        "URL": "www.uatENV.com",
        "userID": "wfjskfjsefsefsef",
        "secretID": "sfsokfopsjefpsef"
    },
    "pp": {
        "label": "PreProd",
        "URL": "www.pp.com",
        "userID": "sdfsegsegse",
        "secretID": "rthshtrtjtjrtj"
    }
}

const THEMES = {
    DARK: "dark",
    LIGHT: "light"
};

const ICONS = {
    dark: "ph ph-sun",
    light: "ph ph-moon"
};

// Get Elements
const el = val => document.getElementById(val);
const bundleIDField = el('bundleid-input');
const refreshBundleIDBtn = el('refresh-bundleid');
const timestampField = el('timestampField');
const addItemBtn = el('addItemBtn');


// INIT ============================================================
function init() {
    console.log("App initialized!");
    bundleIDField.value = generateRandomAlphanumeric();
    updateTimestamp();
}

init();

// Refresh timestamp ===============================================
function updateTimestamp() {
    const now = new Date(); // Get current date and time
    const newTimestamp = now.toISOString(); // Get Unix timestamp (milliseconds since 1970)
    timestampField.value = newTimestamp;
}

// Update theme ====================================================
const themeSwitchBtn = el("switchTheme");
const body = document.body;

const applyTheme = (theme) => {
    body.setAttribute("data-bs-theme", theme);
    themeSwitchBtn.setAttribute("class", ICONS[theme]);
    localStorage.setItem("theme", theme);
};

// Load saved theme or fall back to OS preference
const savedTheme = localStorage.getItem("theme")
    ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? THEMES.DARK : THEMES.LIGHT);

applyTheme(savedTheme);

themeSwitchBtn.addEventListener("click", () => {
    const current = body.getAttribute("data-bs-theme");
    applyTheme(current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
});

// Select ENV =======================================================
const selectEnv = el("selectEnv");
const displayedEnvURL = el("endpointUrl");
selectEnv.addEventListener('change', (e) => {
    console.log(e.target.value);
    if (e.target.value === "uat") {
        displayedEnvURL.value = ENVIRONMENTS.uat.URL;
    } else {
        displayedEnvURL.value = ENVIRONMENTS.pp.URL;
    }
});


// Refresh bundle button ============================================
function generateRandomAlphanumeric() {
    return crypto.randomUUID();
}

refreshBundleIDBtn.addEventListener('click', () => {
    bundleIDField.value = generateRandomAlphanumeric();
    updateTimestamp(); //Update the timestamp with each bundle refresh
});


// Copy buttons ============================================
const copyReqButton = document.getElementById('copy-request-btn');
const copyResButton = document.getElementById('copy-response-btn');

copyReqButton.addEventListener('click', () => {
    const text = document.getElementById('request-body-text').innerText; // Get the text from the <p>
    copyReqButton.style.opacity = '0';

    // Use Clipboard API
    navigator.clipboard.writeText(text)
        .then(() => {

            setTimeout(() => {
                copyReqButton.innerHTML = '<i class="ph ph-check"></i>';
                copyReqButton.style.opacity = '1'; // Fade in
            }, 100); // Wait for fade-out duration

            // After a short delay, revert to original text with smooth fade
            setTimeout(() => {
                copyReqButton.style.opacity = '0'; // Fade out again
                setTimeout(() => {
                    copyReqButton.innerHTML = "Copy";
                    copyReqButton.style.opacity = '1'; // Fade in original text
                }, 100);
            }, 600); // How long the check icon stays visible

        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
});

copyResButton.addEventListener('click', () => {
    const text = document.getElementById('response-body-text').innerText; // Get the text from the <p>
    copyResButton.style.opacity = '0';

    // Use Clipboard API
    navigator.clipboard.writeText(text)
        .then(() => {

            setTimeout(() => {
                copyResButton.innerHTML = '<i class="ph ph-check"></i>';
                copyResButton.style.opacity = '1'; // Fade in
            }, 100); // Wait for fade-out duration

            // After a short delay, revert to original text with smooth fade
            setTimeout(() => {
                copyResButton.style.opacity = '0'; // Fade out again
                setTimeout(() => {
                    copyResButton.innerHTML = "Copy";
                    copyResButton.style.opacity = '1'; // Fade in original text
                }, 100);
            }, 600); // How long the check icon stays visible

        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
});

// Add provider modal ===========================================
const selectProvider = document.getElementById('Provider');
const newProvModal = document.getElementById('newProviderModal');
const modal = new bootstrap.Modal(newProvModal);
const saveProviderBtn = document.getElementById('SaveProviderBtn');

selectProvider.addEventListener('change', function () {
    if (this.value === 'addProvider') {
        modal.show(); // open modal
    }
});

// Example: add new item dynamically
saveProviderBtn.addEventListener('click', function () {
    const newProvNameValue = document.getElementById('NewProviderName').value.trim();
    if (newProvNameValue) {
        const option = new Option(newProvNameValue, newProvNameValue);
        selectProvider.add(option, selectProvider.options.length - 1); // add before "Add new"
        selectProvider.value = newProvNameValue; // select the new item
        modal.hide();
        document.getElementById('NewProviderName').value = '';
        document.getElementById('NewProviderNHIC').value = '';
    }
});

// Optional: reset select if modal is closed without saving
newProvModal.addEventListener('hidden.bs.modal', () => {
    document.getElementById('NewProviderName').value = '';
    document.getElementById('NewProviderNHIC').value = '';
    if (selectProvider.value === 'addProvider') selectProvider.value = '';
});


// Add line items
let lineItemCount = 1; // Start after your existing rows

addItemBtn.addEventListener('click', function () {
    lineItemCount++;

    const tbody = document.querySelector('table tbody');

    const newItem = document.createElement('tr');
    newItem.innerHTML = `
    <th class="text-secondary fw-normal" scope="row">${lineItemCount}</th>
    <td>
        <select class="form-select">
            <option selected>Select...</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
        </select>
    </td>
    <td><input class="form-control" placeholder="Nphies Code"></td>
    <td><input class="form-control" placeholder="Service Code"></td>
    <td><input class="form-control" placeholder="Service Name"></td>
    <td><input class="form-control" type="date"></td>
    <td><input class="form-control" placeholder="QTY"></td>
    <td><input class="form-control" placeholder="Unit Price"></td>
    <td><input class="form-control" placeholder="Net Price"></td>
    <td>
        <div class="d-flex align-items-stretch h-100">
            <button type="button" class="btn btn-outline-danger w-100 h-100 remove-row">X</button>
        </div>
    </td>
    `;

    tbody.appendChild(newItem);
});

document.querySelector('table tbody').addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-row')) {
        e.target.closest('tr').remove();
        reNumberItems();
    }
});

function reNumberItems() {
    document.querySelectorAll('table tbody tr').forEach((row, index) => {
        row.querySelector('th').textContent = index + 1;
    });
    lineItemCount = document.querySelectorAll('table tbody tr').length;
}

function delAllRows() {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = `
    <th class="text-secondary fw-normal" scope="row">${lineItemCount}</th>
    <td>
        <select class="form-select">
            <option selected>Select...</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
        </select>
    </td>
    <td><input class="form-control" placeholder="Nphies Code"></td>
    <td><input class="form-control" placeholder="Service Code"></td>
    <td><input class="form-control" placeholder="Service Name"></td>
    <td><input class="form-control" type="date"></td>
    <td><input class="form-control" placeholder="QTY"></td>
    <td><input class="form-control" placeholder="Unit Price"></td>
    <td><input class="form-control" placeholder="Net Price"></td>
    <td>
        <div class="d-flex align-items-stretch h-100">
            <button type="button" class="btn btn-outline-danger w-100 h-100 remove-row">X</button>
        </div>
    </td>
    `;
    lineItemCount = 1;
}

// Tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))