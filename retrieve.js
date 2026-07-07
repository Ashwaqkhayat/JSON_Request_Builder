const el = val => document.getElementById(val);

const THEMES = {
    DARK: "dark",
    LIGHT: "light"
};
const ICONS = {
    dark: "ph ph-sun",
    light: "ph ph-moon"
};
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

// elements ==========================================================
const requestBodyTxtArea = el('requestBodyTxtArea');
const errorFooter = el('errorFooter');
const reqInput = el('reqInput');
const reqTypeInput = el('reqTypeInput');
const reqSubtypeInput = el('reqSubtypeInput');
const reqPriorityInput = el('reqPriorityInput');
const reqClaimIDInput = el('reqClaimIDInput');
const claimExtensionsUL = el('claimExtensionsUL');

// Init =============================================================
window.addEventListener('load', () => {
    init();
});

function init() {
    console.log('Request Initialized');
    errorFooter.classList.add('hidden');
}

// Extract input JSON ===============================================
let userInputJSON;
requestBodyTxtArea.addEventListener('change', () => {
    userInputJSON = requestBodyTxtArea.value.trim();
})


// Extract Data =====================================================

function showErrorFooter(msg, type) {
    console.log("Error displayed");
    errorFooter.textContent = msg;
    errorFooter.classList.remove(
        "bg-danger",
        "bg-success",
        "bg-primary",
        "bg-secondary",
        "bg-info",
        "bg-warning"
    );

    if (type == 'error') {
        errorFooter.classList.add("bg-danger");
        errorFooter.classList.add("text-white");
    } else if (type == 'warning') {
        errorFooter.classList.add("bg-warning");
        errorFooter.classList.add("text-white");
    } else {
        // Nothing
    }
    errorFooter.classList.remove('hidden');
}

requestBodyTxtArea.addEventListener('change', () => {
    const input = userInputJSON;

    if (!input || input === '') {
        // Clear all the input fields
        document.querySelectorAll('.form-control').forEach(function (input) {
            input.value = '';
        });
        showErrorFooter('Please paste JSON request.', 'warning');
        return;
    } else {
        errorFooter.classList.add('hidden');
    }

    let parsed;
    try { parsed = JSON.parse(input); } catch (e) {
        showErrorFooter('Invalid JSON: ' + e.message, 'error');
        return;
    }

    // Extract Req Category
    let extractedInfo = parsed.entry[1].resource.identifier[0];
    extractReqCat(extractedInfo);

    // Extract Claim ID
    extractClaimID(extractedInfo);

    // Extract Req Type
    extractedInfo = parsed.entry[1].resource.type.coding[0];
    extractReqType(extractedInfo);

    // Extract Req Subtype
    extractedInfo = parsed.entry[1].resource.subType.coding[0];
    extractReqSubtype(extractedInfo);

    // Extract Req Priority
    extractedInfo = parsed.entry[1].resource.priority.coding[0];
    extractReqPriority(extractedInfo);

    // Extract Req Extensions
    extractedInfo = parsed.entry[1].resource.extension;
    extractClaimExtensions(extractedInfo);

});

function extractReqCat(x) {
    if (!('system' in x)) {
        showErrorFooter(
            'Key "parsed.entry[1].resource.identifier[0].system" not found in JSON.',
            'error'
        );
        return;
    }
    const reqCategory = x.system.split('/').pop();
    if (reqCategory === 'authorization') {
        reqInput.value = 'authorization';
    } else if (reqCategory === 'claim') {
        reqInput.value = 'claim';
    } else {
        reqInput.value = '';
    }
}

function extractReqType(x) {
    if (!('code' in x)) {
        showErrorFooter(
            'Key "parsed.entry[1].resource.type.coding[0].code" not found in JSON.',
            'error'
        );
        return;
    }
    reqTypeInput.value = x.code;
}

function extractReqSubtype(x) {
    if (!('code' in x)) {
        showErrorFooter(
            'Key "parsed.entry[1].resource.subType.coding[0].code" not found in JSON.',
            'error'
        );
        return;
    }

    const reqCategory = x.code;
    if (reqCategory === 'ip') {
        reqSubtypeInput.value = 'Inpatient';
    } else if (reqCategory === 'op') {
        reqSubtypeInput.value = 'Outpatient';
    } else if (reqCategory === 'emr') {
        reqSubtypeInput.value = 'Emergency';
    } else {
        reqSubtypeInput.value = 'Unknown';
    }
}

function extractReqPriority(x) {
    if (!('code' in x)) {
        showErrorFooter(
            'Key "parsed.entry[1].resource.priority.coding[0].code" not found in JSON.',
            'error'
        );
        return;
    }

    reqPriorityInput.value = x.code;
}

function extractClaimID(x) {
    if (!('value' in x)) {
        showErrorFooter(
            'Key "parsed.entry[1].resource.identifier[0].value" not found in JSON.',
            'error'
        );
        return;
    }
    reqClaimIDInput.value = x.value;
}

function extractClaimExtensions(x) {
    // x is an array of extension items!

    claimExtensionsUL.innerHTML = '';
    x.forEach((ex, index) => {
        let extensionType = ex.url.split('/').pop();
        let extensionValue;

        switch (extensionType) {
            case "extension-encounter":
                extensionValue = ex.valueReference.reference;
                break;
            case "extension-eligibility-response":
                extensionValue = ex.valueReference.identifier.value;
                break;
            case "extension-eligibility-offline-reference":
                extensionValue = ex.valueString;
                break;
            case "extension-eligibility-offline-date":
                extensionValue = ex.valueDateTime;
                break;
            case "extension-newborn":
                extensionValue = ex.valueBoolean;
                break;
            case "extension-episode":
                extensionValue = ex.valueIdentifier.value;
                break;
            default:
                extensionValue = "In Progress"
        }

        addExtensionToList(extensionType, extensionValue, index);
    });

}

function addExtensionToList(extType, extVal, index) {
    const li = document.createElement('li');
    li.className = 'list-group-item gap-5';
    li.id = `${extType}Li`;

    li.innerHTML = `
    <p class="m-0 p-0 extension-type">#${index}    ${extType}</p>
    <div class="gap-2">
        <p class="m-0 p-0 text-truncate extension-val">${extVal}</p>
        <button type="button" class="btn copy-ex-btn btn-sm" data-bs-target="${li.id}">
        <i class="ph ph-copy phicon-container"></i>
        </button>
    </div>
    `;
    claimExtensionsUL.appendChild(li);
}

// User Modifications =======================================
reqClaimIDInput.addEventListener('change', () => {
    const input = userInputJSON;
    const paths = [
        'entry[1].resource.identifier[0].value'
    ];
    changeReqValue(paths, input, reqClaimIDInput.value);
});

// reqInput.addEventListener('change', () => {
//     const input = userInputJSON;
//     const paths = [
//         'entry[1].resource.identifier[0].system'
//     ];

//     let reqT;
//     if (reqInput.value == 'preauth') {
//         reqT = 'authorization'
//     } else {
//         reqT = 'claim'
//     }

//     // I need to keep the URL and only change the last url/....
//     let newValue = JSON.parse(input).entry[1].resource.identifier[0].system;
//     changeReqValue(paths, input, );
// });

function changeReqValue(paths, reqBody, newValue) {
    console.log("entered the func: ", paths, newValue);
    if (reqBody && reqBody !== '') {
        let parsed;
        try {
            parsed = JSON.parse(reqBody);
        } catch (e) {
            showErrorFooter('Invalid JSON: ' + e.message, 'error');
            return;
        }

        try {
            paths.forEach(path => {
                setValueByPath(parsed, path, newValue);
            });
        } catch (e) {
            showErrorFooter('Failed to update value: ' + e.message, 'error');
            return;
        }

        requestBodyTxtArea.value = JSON.stringify(parsed, null, 4);
    }
}

function setValueByPath(obj, path, value) {
    const keys = path
        .replace(/\[(\d+)\]/g, '.$1') // convert [1] -> .1
        .split('.')
        .filter(k => k !== '');

    let target = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (target[key] === undefined) {
            throw new Error(`Path "${path}" is invalid: "${key}" does not exist at this level.`);
        }
        target = target[key];
    }

    const lastKey = keys[keys.length - 1];
    if (target[lastKey] === undefined) {
        throw new Error(`Path "${path}" is invalid: final key "${lastKey}" does not exist.`);
    }

    target[lastKey] = value;
}

// Copy to clipboard
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetID = btn.getAttribute('data-bs-target');
        const input = document.getElementById(targetID);
        copyToClipboard(input);
    });
});

// Copy to clipboard - Extensions only
claimExtensionsUL.addEventListener('click', (event) => {
    // Check if the clicked element (or its parent, like the <i> icon) is the button
    const btn = event.target.closest('.copy-ex-btn');

    // If the click wasn't on or inside a copy button, ignore it
    if (!btn) return;

    const targetID = btn.getAttribute('data-bs-target');

    // Use querySelector to find the list item by its id attribute
    const listItem = document.querySelector(`[id="${targetID}"]`);

    if (listItem) {
        // Find the element with the class '.extension-type' inside that list item
        const extValElement = listItem.querySelector('.extension-type');
        let parsed;
        try {
            parsed = JSON.parse(userInputJSON);
            copyToClipboardExtension(parsed.entry[1].resource.extension[extValElement.textContent[1]]);
        } catch (e) {
            showErrorFooter('Error in extension copy: ' + e.message, 'error');
            return;
        }
    }
});

function copyToClipboard(val) {
    if (!val || typeof val.value !== 'string') {
        showErrorFooter('Error: Unable to copy' + val, 'error'); return;
    }

    const text = val.value;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(val));
    } else {
        fallbackCopy(val);
    }
}
function copyToClipboardExtension(val) {
    if (!val) {
        showErrorFooter('Error: Unable to copy extension', 'error'); return;
    }

    navigator.clipboard.writeText(JSON.stringify(val, null, 4))
        .then(() => console.log("Copied extension"))
        .catch(err => console.error('Navigator copy extension failed:', err));
}

function fallbackCopy(val) {
    val.select();
    val.setSelectionRange(0, 9999);
    document.execCommand('copy');
}