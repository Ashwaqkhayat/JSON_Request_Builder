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

// Init =============================================================
function init() {
    console.log('Request Initialized');
    errorFooter.classList.add('hidden');
}

init();

// Extract Data =====================================================

function showErrorFooter(msg, type) {
    console.log("Error displayed");
    errorFooter.textContent = msg;
    if (type == 'error') {
        errorFooter.classList.add("bg-danger");
        errorFooter.classList.add("text-white");
    } else {
        errorFooter.classList.remove("bg-danger");
        errorFooter.classList.remove("text-white");
    }
    errorFooter.classList.remove('hidden');
}

requestBodyTxtArea.addEventListener('change', () => {
    const input = requestBodyTxtArea.value.trim();

    if (!input || input === '') {
        // Clear all the input fields
        document.querySelectorAll('.form-control').forEach(function (input) {
            input.value = '';
        });
        showErrorFooter('Please paste JSON request.', 'info');
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
        reqInput.value = 'Preauth';
    } else if (reqCategory === 'claim') {
        reqInput.value = 'Claim';
    } else {
        reqInput.value = 'Unknown';
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

reqClaimIDInput.addEventListener('change', () => {
    const input = requestBodyTxtArea.value.trim();

    if (input && input !== '') {

        let parsed;
        try { 
            parsed = JSON.parse(input); 
            parsed.entry[1].resource.identifier[0].value = reqClaimIDInput.value;
            requestBodyTxtArea.value = JSON.stringify(parsed, null, 4);
        }
        catch (e) {
            showErrorFooter('Invalid JSON: ' + e.message, 'error');
            return;
        }

    }

});
