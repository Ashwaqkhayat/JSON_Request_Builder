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


const userInput = el('jsonInput');
const errorDiv = el('error');
const resultDiv = el('result');


userInput.addEventListener('change', () => {
    const input = userInput.value.trim();
    errorDiv.textContent = '';
    resultDiv.textContent = '';

    if (!input) {
        errorDiv.textContent = 'Please enter the JSON request.';
        return;
    }

    let parsed;
    try { parsed = JSON.parse(input); } catch (e) {
        errorDiv.textContent = 'Invalid JSON: ' + e.message;
        return;
    }

    const extractedInfo = parsed.entry[1].resource.identifier[0];
    if (!('value' in extractedInfo)) {
        errorDiv.textContent = 'Key "parsed.entry[1].resource.identifier[0].value" not found in JSON.';
        return;
    }

    resultDiv.textContent = 'Claim ID: ' + extractedInfo.value;
});