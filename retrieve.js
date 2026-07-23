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
const EXTENSION_CATEGORIES = {
    "Claim": "claim",
    "Beneficiary": "beneficiary"
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

const reqMembershipInput = el('reqMembershipInput');
const reqMemNameInput = el('reqMemNameInput');
const reqIDTypeInput = el('reqIDTypeInput');
const reqIDNumInput = el('reqIDNumInput');
const reqPhoneNumInput = el('reqPhoneNumInput');
const reqBDateInput = el('reqBDateInput');
const reqGenderInput = el('reqGenderInput');
const benefitiaryExtensionsUL = el('benefitiaryExtensionsUL');
const ICDtableList = el('ICDtableList');
const supportingInfoUL = el('supportingInfoUL');

// for copy func
let benefEntry = null;

// Init =============================================================
window.addEventListener('load', () => {
    init();
});

function init() {
    console.log('Request Initialized');
    errorFooter.classList.add('hidden');
    displayedEnvURL.value = ENVIRONMENTS.uat.URL;
}

// Extract input JSON ===============================================
let userInputJSON;
requestBodyTxtArea.addEventListener('change', () => {
    userInputJSON = requestBodyTxtArea.value.trim();
})


// Extract Data =====================================================

requestBodyTxtArea.addEventListener('paste', function (e) {
    const scrollTop = this.scrollTop;
    // Stop from auto-scrolling the view to the end
    setTimeout(() => {
        this.scrollTop = scrollTop;
    }, 0);
});

requestBodyTxtArea.addEventListener('change', () => {
    const input = userInputJSON;

    if (!input || input === '') {
        // Clear all the input fields
        document.querySelectorAll('.form-control').forEach(function (input) {
            input.value = '';
        });
        clearExtensionLists(claimExtensionsUL);
        clearExtensionLists(benefitiaryExtensionsUL);
        clearICDList();
        clearSuppInfoLists();
        showToast('Please paste JSON request.', 'warning');
        return;
    } else {
        errorFooter.classList.add('hidden');
    }

    let parsed;
    try { parsed = JSON.parse(input); } catch (e) {
        showToast('Invalid JSON: ' + e.message, 'danger');
        return;
    }

    let extractedInfo;
    let entryOfInfo;

    // Extract data for Claim resource type ==============================
    entryOfInfo = findResource(parsed.entry, 'Claim', null);
    // Extract Req Category
    extractedInfo = entryOfInfo?.resource.identifier[0] ?? null;
    extractReqCat(extractedInfo);

    // Extract Claim ID
    extractClaimID(extractedInfo);

    // Extract Req Type
    extractedInfo = entryOfInfo?.resource.type.coding[0] ?? null;
    extractReqType(extractedInfo);

    // Extract Req Subtype
    extractedInfo = entryOfInfo?.resource.subType.coding[0] ?? null;
    extractReqSubtype(extractedInfo);

    // Extract Req Priority
    extractedInfo = entryOfInfo?.resource.priority.coding[0] ?? null;
    extractReqPriority(extractedInfo);

    // Extract Req Extensions
    extractedInfo = entryOfInfo?.resource.extension ?? null;
    extractClaimExtensions(extractedInfo, claimExtensionsUL, EXTENSION_CATEGORIES.Claim);

    // Extract ICD codes
    extractedInfo = entryOfInfo?.resource.diagnosis
    extractICDCodes(extractedInfo);

    // Extract Supporting info
    extractedInfo = entryOfInfo?.resource.supportingInfo ?? null;
    extractSupportingInfo(extractedInfo);

    // Extract data for Coverage resource type ==========================
    // Extract Req Membership
    entryOfInfo = findResource(parsed.entry, 'Coverage', null);
    extractedInfo = entryOfInfo?.resource.identifier[0] ?? null;
    extracReqMembership(extractedInfo);

    // Extract data for Patient (benefitiary) resource type ============
    // Extract Req Member Name
    let beneficiaryResource = entryOfInfo?.resource.beneficiary.reference ?? null;
    let extractedTypeVal = splitString(beneficiaryResource);
    // extractedTypeVal = Array of [resourceType, resourceVal]
    benefEntry = findResource(parsed.entry, extractedTypeVal[0], extractedTypeVal[1]);
    extractedInfo = benefEntry?.resource.name[0] ?? null;
    extractMemberName(extractedInfo);

    // Extract Req Id type
    extractedInfo = benefEntry?.resource.identifier[0] ?? null;
    extractBenifitiaryIdType(extractedInfo);

    // Extract Req ID Number
    extractBenifitiaryId(extractedInfo);

    // Extract Phone number
    extractedInfo = benefEntry?.resource.telecom[0] ?? null;
    extractBenifitiaryPhoneNum(extractedInfo);

    // Extract Birthdate
    extractedInfo = benefEntry?.resource.birthDate ?? null;
    extractBenifitiaryBD(extractedInfo);

    // Extract Gender
    extractedInfo = benefEntry?.resource.gender ?? null;
    extractBenifitiaryGender(extractedInfo);

    // Extract Benefitiary Extensions
    extractedInfo = benefEntry?.resource.extension ?? null;
    extractClaimExtensions(extractedInfo, benefitiaryExtensionsUL, EXTENSION_CATEGORIES.Beneficiary);

});

function splitString(str) {
    if (str && str !== '') {
        return str.split("/");
    } else {
        showToast(`Error: Could not split ${str}.`, 'danger');
        return null;
    }
}

function findResource(entriesList, resourceName, resourceVal) {
    // recourceVal = the number after resourceName

    let entURL;
    let segment;
    console.log("Resource Here ", resourceName);
    if (entriesList == undefined || entriesList == null || entriesList.length == 0) {
        showToast('Error: Could not find the Entries list to extract the resource.', 'danger');
    } else {
        for (let index = 0; index < entriesList.length; index++) {
            const entry = entriesList[index];
            const entURL = entry.fullUrl;
            if (!entURL || entURL === '') {
                showToast(`Error in findResource: Unable to find the entry [${resourceName}]`, 'danger');
                continue;
            }

            const splittedURL = new URL(entURL).pathname.split("/");
            // length-1 = the value, length-2 = the resource type
            const segment = [splittedURL[splittedURL.length - 2], splittedURL[splittedURL.length - 1]];
            if (resourceVal && resourceVal !== '') {
                if (segment[0] == resourceName && segment[1] == resourceVal) {
                    return entriesList[index];
                }
            } else {
                if (segment[0] == resourceName) {
                    return entriesList[index];
                }
            }
        }
    }
    // If the recource is not found
    return null;
}

function extractReqCat(x) {
    try {
        if (!('system' in x)) {
            showToast(
                // parsed.entry[1].resource.identifier[0].system
                'Request category not found in JSON.',
                'danger'
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
    } catch (e) {
        showToast(`Error: Could not extract the request category. (${e.message})`, 'danger');
    }
}

function extractReqType(x) {
    if (!('code' in x)) {
        showToast(
            // parsed.entry[1].resource.type.coding[0].code
            'Request type not found in JSON.',
            'danger'
        );
        return;
    }
    reqTypeInput.value = x.code;
}

function extractReqSubtype(x) {
    if (!('code' in x)) {
        showToast(
            // Key "parsed.entry[1].resource.subType.coding[0].code" 
            'Request subtype not found in JSON.',
            'danger'
        );
        console.log('teettete');
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
        showToast(
            'Key "parsed.entry[1].resource.priority.coding[0].code" not found in JSON.',
            'danger'
        );
        return;
    }

    reqPriorityInput.value = x.code;
}

function extractClaimID(x) {
    if (!('value' in x)) {
        showToast(
            'Key "parsed.entry[1].resource.identifier[0].value" not found in JSON.',
            'danger'
        );
        return;
    }
    reqClaimIDInput.value = x.value;
}

// {
//     "preauth-extensions": {
//         "extension-encounter": "valueReference"."reference",
//         "extension-eligibility-response": "valueReference"."identifier"."value",
//         "extension-eligibility-offline-reference": "valueString",
//         "extension-eligibility-offline-date": "valueDateTime",
//         "extension-newborn": "valueBoolean",
//         "extension-episode": "valueIdentifier"."value",
//         "extension-priorauthresponse": "valueIdentifier"."identifier"."value",
//         "extension-transfer": "valueBoolean",
//         "extension-maternity": "valueBoolean",
//         "extension-package": "valueBoolean",
//         ""
//     },
//     "claim-extensions": {
//         "extension-batch-identifier": "valueIdentifier"."value",
//         "extension-batch-number": "valuePositiveInt",
//         "extension-batch-period": "valuePeriod"."start" &."end",
//         "extension-authorization-offline-date": "valueDateTime",
//         "extension-episode": "valueIdentifier"."value",
//     }
// }


function extractClaimExtensions(x, el, extensionOf) {
    // x is an array of extension items!
    if (!x || x.length == 0) {
        clearExtensionLists(el);
    } else {
        el.innerHTML = '';
        x.forEach((ex, index) => {
            let extensionType = ex.url.split('/').pop();
            let extensionValue;

            // extensionOf = 'claim' / 'benefitiary' / ... other resources in progress
            if (extensionOf == 'claim') {
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
            } else { // extensionOf == 'benefitiary'
                switch (extensionType) {
                    case "extension-patient-religion":
                        let religNum = ex.valueCodeableConcept.coding[0].code;
                        switch (religNum) {
                            case "1":
                                extensionValue = "Muslim";
                                break;
                            case "2":
                                extensionValue = "Christian";
                                break;
                            case "3":
                                extensionValue = "Judaism";
                                break;
                            case "4":
                                extensionValue = "Buddhism";
                                break;
                            case "5":
                                extensionValue = "Zoroastrian";
                                break;
                            case "9":
                                extensionValue = "Without";
                                break;
                            case "98":
                                extensionValue = "Not available";
                                break;
                            case "0":
                                extensionValue = "Other";
                                break;
                            case "99":
                                extensionValue = "Not Mentioned";
                                break;
                            case "7":
                                extensionValue = "Hinduism";
                                break;
                            case "8":
                                extensionValue = "Sikh";
                                break;
                            default:
                                extensionValue = "-";
                        }
                        break;
                    case "extension-occupation":
                        extensionValue = ex.valueCodeableConcept.coding[0].code;
                        break;
                    default:
                        extensionValue = "Not Found"
                }
            }
            addExtensionToList(el, extensionType, extensionValue, index);
        });
    }
}
function addExtensionToList(el, extType, extVal, index) {
    const li = document.createElement('li');
    let formattedType = extType.slice("extension-".length);
    formattedType = formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
    li.className = 'list-group-item list-group-item-ex gap-5';
    li.id = `${formattedType}Li`;

    li.innerHTML = `
    <p class="m-0 p-0 extension-type text-nowrap">#${index + 1}    ${formattedType}</p>
    <div class="gap-2">
        <p class="m-0 p-0 text-truncate extension-val">${extVal}</p>
        <button type="button" class="btn copy-ex-btn btn-sm" data-bs-target="${li.id}">
        <i class="ph ph-copy phicon-container"></i>
        </button>
    </div>
    `;
    el.appendChild(li);
}
function clearExtensionLists(el) {
    el.innerHTML = `
        <li class="list-group-item-ex gap-5 h-100 d-flex">
            <div class="align-items-center justify-content-center h-100 w-100 fs-6">No Extensions</div>
        </li>
    `;
}

function extractSupportingInfo(x) {
    // X is the list of SupportingInfo
    if (!x || x.length == 0) {
        clearSuppInfoLists();
    } else {
        supportingInfoUL.innerHTML = '';
        let supp = Object.values(x);


        let extractedCateg;
        let extractedVal;
        let extractedSecVal;
        x.forEach((info, index) => {
            // Map each key and its value
            let suppInf = Object.entries(info).map(([key, val]) => ({
                key, val
            }));
            console.log("suppInf ", suppInf);

            // 0 below is random, not important here
            extractedCateg = findSuppKey(suppInf, 0, "category");
            let infoType = extractedCateg.val.coding[0].code;
            let noOfData = suppInf.length;
            console.log("noOfData: ", noOfData);

            let mainValue;
            let thirdValue;
            if (noOfData == 4) {
                extractedVal = findSuppKey(suppInf, noOfData, "valueQuantity");
                extractedSecVal = findSuppKey(suppInf, noOfData, "timingPeriod");
                mainValue = extractedVal.val.value + " " + extractedVal.val.code;
                thirdValue = extractedSecVal.val.start + " → " + extractedSecVal.val.end;
                console.log("mainValue 4: ", mainValue);
                console.log("thirdValue: ", thirdValue);
            } else if (noOfData == 3) {
                let possibleKeys = ["valueQuantity", "valueString", "code"];
                let keyTypeIndex = 0;

                for (let i = 0; i < possibleKeys.length; i++) {
                    extractedVal = findSuppKey(suppInf, noOfData, possibleKeys[i]);
                    if (extractedVal != null) {
                        keyTypeIndex = i;
                        break;
                    }
                }

                switch (keyTypeIndex) {
                    case 0: //valueQuantity
                        mainValue = extractedVal.val.value + " " + extractedVal.val.code;
                        break;
                    case 1: //valueString
                        mainValue = extractedVal.val;
                        break;
                    case 2: //code
                        mainValue = extractedVal.val.coding[0].code;
                        let isDisplay = extractedVal.val.coding[0].display;
                        if (isDisplay) { mainValue = mainValue + " | " + isDisplay; }
                        break;
                    default:
                        mainValue = "Not Found.";
                }
                console.log("mainValue 3: ", mainValue);
            } else {
                mainValue = "Undefined";
                thirdValue = "Undefined";
            }

            addSuppInfoToList(index, noOfData, infoType, mainValue, thirdValue);
        });
    }
}

function findSuppKey(suppInfo, noOfVals, keyName) {
    const found = suppInfo.find(inf => inf.key == keyName);
    if (found) {
        return found;
    } else {
        return null;
    }
}
function addSuppInfoToList(index, noOfParams, catTitle, mainValue, thirdInfo) {

    const newEl = document.createElement('li');
    newEl.className = 'info-item';
    newEl.id = `${catTitle}Li-${index}`;

    newEl.innerHTML = `
    <div class="info-content">
    <div class="d-flex flex-row w-100">
        <div class="info-index">#${index + 1}</div>
        <div class="d-flex flex-column flex-grow-1">
            <div class="d-flex flex-grow-1 flex-row justify-content-between">
                <div class="info-label">${catTitle.replaceAll("-", " ")}</div>
                <div class="info-value">${mainValue}</div>
            </div>
            <div class="d-flex flex-grow-1 flex-row justify-content-between">
                <div class="info-label second-info text-secondary-emphasis opacity-50">${noOfParams == 3 ? "No Other Data" : "Timing Period"}</div>
                <div class="info-value second-info text-secondary-emphasis opacity-${noOfParams == 4 ? "50" : "0"}">${thirdInfo}</div>
            </div>
        </div>
    </div>
    </div>
    <button class="btn btn-outline-secondary info-copy-btn" type="button">
    <i class="ph ph-copy phicon-container"></i>
    </button>
    `;
    supportingInfoUL.appendChild(newEl);
}
function clearSuppInfoLists() {
    supportingInfoUL.innerHTML = `
    <li class="info-item d-flex w-100 h-100">
        <div class="info-content justify-content-center align-items-center">Empty</div>
    </li>
    `;
}

function extractICDCodes(x) {
    // x is an array of icd items!
    if (!x || x.length == 0) {
        clearICDList();
    } else {
        ICDtableList.innerHTML = '';
        x.forEach((icd, index) => {
            let icdCode = icd.diagnosisCodeableConcept.coding[0].code ?? null;
            let icdType = icd.type[0].coding[0].code ?? null;

            const newICDRow = document.createElement('tr');

            newICDRow.innerHTML = `
            <th class="text-secondary fw-normal align-middle" scope="row">${index + 1}</th>
            <td><input class="form-control" value="${icdCode}"></td>
            <td style="width: 55%;"><input class="form-control" value="${icdType}"></td>
            `;
            ICDtableList.appendChild(newICDRow);
        });
    }
}
function clearICDList() {
    ICDtableList.innerHTML = `
    <tr>
        <th class="text-secondary fw-normal align-middle" scope="row">1</th>
        <td><input class="form-control"></td>
        <td style="width: 55%;"><input class="form-control"></td>
    </tr>
    `;
}

function extracReqMembership(x) {
    if (!x || !('value' in x)) {
        showToast(
            // Key "entry[Coverage].resource.identifier[0].value" not found in JSON.
            'Membership No. not found in JSON.',
            'danger'
        );
        return;
    }
    reqMembershipInput.value = x.value;
}

function extractMemberName(x) {
    // reqMemNameInput
    if (!x || !('text' in x)) {
        showToast(
            // Key "entry[..].resource.name[0].text" not found in JSON.
            'Member Name not found in JSON.',
            'danger'
        );
        return;
    }
    reqMemNameInput.value = x.text;
}

function extractBenifitiaryIdType(x) {
    if (!x || !('system' in x)) {
        showToast(
            // Key "entry[..].resource.identifier[0].system" not found in JSON.
            'Patient ID Type not found in JSON.',
            'danger'
        );
        return;
    }
    const extractedIDType = splitString(x.system);
    reqIDTypeInput.value = extractedIDType[extractedIDType.length - 1];
}

function extractBenifitiaryId(x) {
    if (!x || !('value' in x)) {
        showToast(
            // Key "entry[..].resource.identifier[0].value" not found in JSON.
            'Patient ID not found in JSON.',
            'danger'
        );
        return;
    }
    reqIDNumInput.value = x.value;
}

function extractBenifitiaryPhoneNum(x) {
    if (!x || !('value' in x)) {
        showToast(
            // Key "entry[..].resource.telecom[0].value" not found in JSON.
            'Beneficiary phone number not found in JSON.',
            'danger'
        );
        return;
    }
    reqPhoneNumInput.value = x.value;
}

function extractBenifitiaryBD(x) {
    if (!x) {
        showToast(
            // Key "entry[..].resource.birthDate" not found in JSON.
            'Beneficiary birthdate not found in JSON.',
            'danger'
        );
        return;
    }
    reqBDateInput.value = x;
}

function extractBenifitiaryGender(x) {
    if (!x) {
        showToast(
            // Key "entry[..].resource.gender" not found in JSON.
            'Beneficiary gender not found in JSON.',
            'danger'
        );
        return;
    }
    reqGenderInput.value = x;
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
            showToast('Invalid JSON: ' + e.message, 'danger');
            return;
        }

        try {
            paths.forEach(path => {
                setValueByPath(parsed, path, newValue);
            });
        } catch (e) {
            showToast('Failed to update value: ' + e.message, 'danger');
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

// Copy to clipboard ========================================
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
            showToast('Error in extension copy: ' + e.message, 'danger');
            return;
        }
    }
});


benefitiaryExtensionsUL.addEventListener('click', (event) => {
    // Check if the clicked element (or its parent, like the <i> icon) is the button
    const btn = event.target.closest('.copy-ex-btn');

    // If the click wasn't on or inside a copy button, ignore it
    if (!btn) return;

    const targetID = btn.getAttribute('data-bs-target');

    // Use querySelector to find the list item by its id attribute
    const listItem = document.querySelector(`[id="${targetID}"]`);

    if (listItem && benefEntry !== null) {
        // Find the element with the class '.extension-type' inside that list item
        const extValElement = listItem.querySelector('.extension-type');
        let parsed;
        try {
            parsed = JSON.parse(userInputJSON);
            copyToClipboardExtension(benefEntry.resource.extension[extValElement.textContent[1]]);
        } catch (e) {
            showToast('Error in extension copy: ' + e.message, 'danger');
            return;
        }
    }
});

function copyToClipboard(val) {
    if (!val || typeof val.value !== 'string') {
        showToast('Error: Unable to copy' + val, 'danger'); return;
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
        showToast('Error: Unable to copy extension', 'danger'); return;
    }

    navigator.clipboard.writeText(JSON.stringify(val, null, 4))
        .then(() => console.log("Copied extension"))
        .catch(err => console.danger('Navigator copy extension failed:', err));
}
function fallbackCopy(val) {
    val.select();
    val.setSelectionRange(0, 9999);
    document.execCommand('copy');
}

// Error Handling ===========================================
function showErrorFooter(msg, type) {
    console.log("Error displayed");
    errorFooter.textContent = msg;
    errorFooter.classList.remove(
        "bg-danger",
        "bg-success",
        "bg-primary",
        "bg-secondary",
        "bg-info",
        "bg-warning",
        "text-black",
        "text-white"
    );

    if (type == 'danger') {
        errorFooter.classList.add("bg-danger");
        errorFooter.classList.add("text-white");
    } else if (type == 'warning') {
        errorFooter.classList.add("bg-warning");
        errorFooter.classList.add("text-black");
    } else {
        // Nothing
    }
    errorFooter.classList.remove('hidden');
}

// Show Toast
function showToast(message, variant = "danger") {
    const toastStack = document.getElementById("toastStack");

    const toastEl = document.createElement("div");
    toastEl.className = `toast text-bg-${variant} bg-opacity-75`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastStack.appendChild(toastEl);

    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();

    // Clean up the DOM node once it's done hiding
    toastEl.addEventListener("hidden.bs.toast", () => {
        toastEl.remove();
    });
}