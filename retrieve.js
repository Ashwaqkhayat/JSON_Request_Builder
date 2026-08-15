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
    if (e.target.value === "uat") {
        displayedEnvURL.value = ENVIRONMENTS.uat.URL;
    } else {
        displayedEnvURL.value = ENVIRONMENTS.pp.URL;
    }
});

// elements ==========================================================
const requestBodyTxtArea = el('requestBodyTxtArea');
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
const totalItems = el('totalItems');
const addItemBtn = el('addItemBtn');
const insurerNameInput = el('insurerNameInput');
const insurerCityInput = el('insurerCityInput');
const insurerCountryInput = el('insurerCountryInput');
const providerNameInput = el('providerNameInput');
const providerCityInput = el('providerCityInput');
const providerContryInput = el('providerContryInput');
const providerTypeInput = el('providerTypeInput');
const careTeamTBody = el('careTeamTBody');
const itemsAccordion = el('itemsAccordion');

// Storage Arrays ====================================================
var arrayofItems = [];
var arrayofICD = [];
var arrayofCareTeam = [];
const arrayofProviderTypes = [
    ["1", "Hospital"],
    ["2", "General Medical Complex"],
    ["3", "Specialized Medical Complex"],
    ["4", "Diagnostic Center"],
    ["5", "Clinic"],
    ["6", "Pharmacy"],
    ["7", "Laboratory"],
    ["8", "Physiotherapy Center"],
    ["9", "Radiotherapy Center"],
    ["other", "other provider types"]
]


// for copy func
let benefEntry = null;

// Init ==============================================================
window.addEventListener('load', () => {
    init();
});

function init() {
    console.log('Request Initialized');
    displayedEnvURL.value = ENVIRONMENTS.uat.URL;
    addItemBtn.disabled = true;
}

// Extract input JSON ===============================================
var userInputJSON;
var parsed;
requestBodyTxtArea.addEventListener('change', () => {
    userInputJSON = requestBodyTxtArea.value.trim();

    try { parsed = JSON.parse(userInputJSON); } catch (e) {
        showToast('Error: unable to parse the input JSON.' + e.message, 'danger');
        return;
    }
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

    // Empty the arrays
    arrayofItems = [];
    arrayofICD = [];
    arrayofCareTeam = [];

    addItemBtn.disabled = true;

    if (!input || input === '') {
        // Clear all the input fields
        document.querySelectorAll('.form-control').forEach(function (input) {
            input.value = '';
        });
        clearExtensionLists(claimExtensionsUL);
        clearExtensionLists(benefitiaryExtensionsUL);
        clearICDList();
        clearSuppInfoLists();
        clearItemsLists();
        showToast('Please paste JSON request.', 'warning');
        return;
    }

    addItemBtn.disabled = false;

    let extractedInfo;
    let entryOfInfo;
    let extractedTypeVal;

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

    // Extract Line Items 
    arrayofItems = entryOfInfo?.resource.item ?? null;
    extractLineItems(arrayofItems);

    if (totalItems) {
        totalItems.innerText = "| Total: " + entryOfInfo?.resource.total.value + " " + entryOfInfo?.resource.total.currency;
    } else {
        showToast("Error: Items total is not found.", "danger");
    }

    // Extract Insurer Data
    let InsurerResource = entryOfInfo?.resource.insurer.reference ?? null;
    extractedTypeVal = splitString(InsurerResource);
    let InsurerEntry = findResource(parsed.entry, extractedTypeVal[0], extractedTypeVal[1]);
    extractedInfo = InsurerEntry?.resource ?? null;
    extractInsurerData(extractedInfo);

    // Extract Provider Data
    let providerResource = entryOfInfo?.resource.provider.reference ?? null;
    extractedTypeVal = splitString(providerResource);
    let providerEntry = findResource(parsed.entry, extractedTypeVal[0], extractedTypeVal[1]);
    extractedInfo = providerEntry?.resource ?? null;
    extractProviderData(extractedInfo);

    // Extract Care Team data
    const careTeamResource = entryOfInfo?.resource.careTeam ?? null; // Array
    extractPractitioners(parsed.entry, careTeamResource);

    // Extract data for Coverage resource type ==========================

    // Extract Req Membership
    entryOfInfo = findResource(parsed.entry, 'Coverage', null);
    extractedInfo = entryOfInfo?.resource.identifier[0] ?? null;
    extracReqMembership(extractedInfo);

    // Extract data for Patient (benefitiary) resource type ============
    // Extract Req Member Name
    let beneficiaryResource = entryOfInfo?.resource.beneficiary.reference ?? null;
    extractedTypeVal = splitString(beneficiaryResource);
    let benefEntry = findResource(parsed.entry, extractedTypeVal[0], extractedTypeVal[1]);
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

function extractLineItems(x) {
    if (!itemsAccordion) {
        showToast('Code Error: could not find the accordion container.', 'danger');
        return;
    }

    // Handle missing items data
    if (x === null || x.length == 0) {
        showToast('Items array is empty or not found.', 'danger');
        // Show empty state
        clearItemsLists();
        return;
    }

    // Map array items to HTML strings
    const accordionHTML = x.map((item, index) => {
        // Generate unique IDs for dynamic Bootstrap targeting
        const collapseId = `collapse_${index}`;
        const headingId = `heading_${index}`;
        const isFirst = index === 0;

        // Get item info
        const seqID = item.sequence;
        let findICD = arrayofICD.find(i => i[0] === item.diagnosisSequence[0]);
        const itemICD = findICD?.[1] ?? "?"; // index 1 is the ICD code
        const itemDesc = item.productOrService.coding[0].display;
        if (itemDesc === null) { itemDesc = 'Empty Description' }
        const itemQTY = item.quantity.value;
        const itemUnitPrice = item.unitPrice.value;
        const itemFactor = item.factor ?? 1;
        const itemNetPrice = item.net.value;
        const itemServdDateFrom = item.servicedPeriod?.start ?? item.servicedDate ?? null;
        const itemServdDateTo = item.servicedPeriod?.end ?? "";

        const nphiesCodeObj = item.productOrService.coding.find(code => code.system && code.system.startsWith("http://nphies.sa"));
        const itemNphiesCode = nphiesCodeObj ? nphiesCodeObj.code : null;
        const serviceCodeObj = item.productOrService.coding.find(code => code.system && !code.system.startsWith("http://nphies.sa"));
        const itemServiceCode = serviceCodeObj ? serviceCodeObj.code : "";

        const itemCareTeam = item.careTeamSequence;
        const itemInfoSeq = item.informationSequence;

        const itemExtensions = generateItemExtension(item.extension);

        return `
        <div class="accordion-item custom-item" style="border: none;">
            <h2 class="accordion-header" id="${headingId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${isFirst ? 'true' : 'false'}" aria-controls="${collapseId}">
                    <span class="row-cell">${seqID}</span>
                    <span class="row-cell">${itemICD}</span>
                    <span class="row-cell">${itemDesc}</span>
                    <span class="row-cell">${itemQTY}</span>
                    <span class="row-cell">${itemUnitPrice}</span>
                    <span class="row-cell">${itemFactor}</span>
                    <span class="row-cell">${itemNetPrice}</span>
                    <span class="row-cell">${itemServdDateFrom}</span>
                </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
                <div class="accordion-body container">
                    <div class="row row-gap-3 mb-3">
                        <div class="col px-2">
                            <label for="nphiesCode-${index}" class="form-label itemLabel">Nphies Code</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="nphiesCode-${index}" value="${itemNphiesCode}" aria-describedby="basic-addon3 basic-addon4">
                            </div>
                        </div>
                        <div class="col px-2">
                            <label for="serviceCode-${index}" class="form-label itemLabel">Service Code</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="serviceCode-${index}" value="${itemServiceCode}" aria-describedby="basic-addon3 basic-addon4">
                            </div>
                        </div>
                        <div class="col px-2">
                            <label for="careTeam-${index}" class="form-label itemLabel">Care Team</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="careTeam-${index}" value="${itemCareTeam}" aria-describedby="basic-addon3 basic-addon4">
                            </div>
                        </div>
                        <div class="col px-2">
                            <label for="servFrom-${index}" class="form-label itemLabel">Serviced From</label>
                            <div class="input-group">
                                <input type="date" class="form-control" id="servFrom-${index}" value=${itemServdDateFrom} aria-describedby="basic-addon3 basic-addon4">
                            </div>
                        </div>
                        <div class="col px-2">
                            <label for="servTo-${index}" class="form-label itemLabel">Serviced To</label>
                            <div class="input-group">
                                <input type="date" class="form-control" id="servTo-${index}" value=${itemServdDateTo} aria-describedby="basic-addon3 basic-addon4" disabled="${itemServdDateTo !== "" ? false : true}">
                            </div>
                        </div>
                        <div class="col-3 px-2">
                            <label for="info-${index}" class="form-label itemLabel">Information</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="info-${index}" value="${itemInfoSeq}" aria-describedby="basic-addon3 basic-addon4">
                            </div>
                        </div>
                    </div>
                    <div class="row row-gap-3" style="height: fit-content;">
                        <div class="col px-2 text-nowrap" style="flex-grow: 0;">
                            <p class="text-secondary mb-0">Extensions</p>
                        </div>
                        ${itemExtensions}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Inject the dynamically built items into the container
    itemsAccordion.innerHTML = accordionHTML;

}

function generateItemExtension(ex) {
    let htmlContent = '';

    ex.forEach(item => {
        const itemTitle = item.url.substring(item.url.lastIndexOf('/') + 1).replace('extension-', '');
        let extractedValue = '';
        // Find the dynamic key (the one that is not 'url')
        const dynamicKey = Object.keys(item).find(key => key !== 'url');

        if (dynamicKey) {
            const rawValue = item[dynamicKey];

            // Check if the value is an object (like valueMoney or valueIdentifier)
            if (typeof rawValue === 'object' && rawValue !== null) {
                // Extract the nested 'value'
                extractedValue = rawValue.value !== undefined ? rawValue.value : '';
            } else {
                // If it's a primitive (like boolean or string), convert directly to string
                extractedValue = String(rawValue);
            }
        }

        // 3. Construct the HTML template
        htmlContent += `
        <div class="col-auto px-2 text-nowrap" style="max-width: 300px; overflow: hidden;">
            <div class="itemExt-badge">
                <span>${itemTitle}</span>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${extractedValue}</span>
            </div>
        </div>`;
    });

    return htmlContent;
}

function clearItemsLists() {
    itemsAccordion.innerHTML = `
    <div class="accordion-item custom-item" style="border: none;">
        <h2 class="accordion-header" id="heading-1">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-1" aria-expanded="false" aria-controls="collapse-1">
                <span class="row-cell"></span>
                <span class="row-cell"></span>
                <span class="row-cell"></span>
                <span class="row-cell"></span>
                <span class="row-cell"></span>
                <span class="row-cell"></span>
                <span class="row-cell"></span>
                <span class="row-cell"></span>
            </button>
        </h2>
    </div>
    `;
}

function extractSupportingInfo(x) {
    // X is the list of SupportingInfo
    if (!x || x.length == 0) {
        clearSuppInfoLists();
    } else {
        supportingInfoUL.innerHTML = '';
        let extractedCateg;
        const possibKeys = ["valueQuantity", "timingPeriod", "code", "timingDate", "valueString"];

        x.forEach((info, index) => {
            // Map each key and its value
            // Object.entries() converts an object into an array of its own key-value pairs.
            // [[seq, val], [category, val], [val1, val], [val2, val]]
            let suppInf = Object.entries(info).map(([key, val]) => ({ key, val }));

            extractedCateg = findSuppKey(suppInf, "category");
            let infoType = extractedCateg.val.coding[0].code;
            let noOfData = suppInf.length;

            let mainValue = ["Undefined", -1];
            let thirdValue = ["Undefined", -1];
            mainValue = getSuppInfo(possibKeys, suppInf);

            if (noOfData === 4) {
                thirdValue = getSuppInfo(possibKeys, suppInf, mainValue[1]);
                // main/thirdVal are an array of [the value, keyIndex]
            }

            addSuppInfoToList(index, noOfData, infoType, mainValue[0], thirdValue[0]);
        });
    }
}
function getSuppInfo(possibKeys, suppInfo, skippedKey = null) {
    let extractedVal;
    let keyTypeIndex = -1;
    for (let i = 0; i < possibKeys.length; i++) {
        if (i == skippedKey) { continue; } // Skip the founded info
        extractedVal = findSuppKey(suppInfo, possibKeys[i]);
        if (extractedVal != null) {
            keyTypeIndex = i;
            break;
        }
    }

    let processedValue = ["undefined", keyTypeIndex];
    switch (keyTypeIndex) {
        case 0: //valueQuantity
            processedValue[0] = extractedVal.val.value + " " + extractedVal.val.code ?? "";
            break;
        case 1: //timingPeriod
            processedValue[0] = extractedVal.val.start + " → " + extractedVal.val.end;
            break;
        case 2: //code
            processedValue[0] = extractedVal.val.coding?.[0].code ?? "Unknown";
            let isDisplay = extractedVal.val.text ?? extractedVal.val.coding?.[0].display ?? false;
            if (isDisplay) { processedValue[0] = processedValue[0] + " | " + isDisplay; }
            break;
        case 3: //timingDate
            processedValue[0] = extractedVal.val;
            break;
        case 4: //valueString
            processedValue[0] = extractedVal.val;
            break;
        default:
            processedValue[0] = "Not Found.";
    }

    return processedValue;
}
function findSuppKey(suppInfo, keyName) {
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
                <div class="info-label second-info text-secondary-emphasis opacity-50">${noOfParams == 3 ? "    " : "Timing Date/Period"}</div>
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
            let icdSeq = icd.sequence;
            let icdCode = icd.diagnosisCodeableConcept.coding[0].code ?? null;
            let icdType = icd.type[0].coding[0].code ?? null;

            // Add ICD to global ICD array
            arrayofICD.push([icdSeq, icdCode]);

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

function extractInsurerData(resource) {
    if (!resource || resource === null) {
        showToast('Error: could not extract Insurer data', 'danger');
    } else {
        try {
            insurerNameInput.value = resource.name;
            insurerCityInput.value = resource.address?.[0].city;
            insurerCountryInput.value = resource.address?.[0].country;
        } catch (e) {
            showToast('Error: something went wrong during Insurer data extraction', 'danger');
            console.warn(e);
            return;
        }
    }
}

function extractProviderData(resource) {
    if (!resource || resource === null) {
        showToast('Error: could not extract Provider data', 'danger');
    } else {
        try {
            providerNameInput.value = resource.name;
            providerCityInput.value = resource.address?.[0].city;
            providerContryInput.value = resource.address?.[0].country;
            let searchProvType = arrayofProviderTypes.find(t => t[0] == resource.extension?.[0].valueCodeableConcept.coding?.[0].code);
            providerTypeInput.value = searchProvType[1];
        } catch (e) {
            showToast('Error: something went wrong during Provider data extraction, open the log for more details.', 'danger');
            console.warn(e);
            return;
        }
    }
}

function extractPractitioners(entry, careTeamArr) {
    if (careTeamArr == null || careTeamArr.length == 0) {
        showToast('Error: unable to find the care team array.', 'danger');
        return;
    } else {
        try {

            careTeamTBody.innerHTML = ``;
            let ref;
            let resource;
            let practPersonalInfo;
            let role;
            let qual;
            for (i = 0; i < careTeamArr.length; i++) {
                ref = splitString(careTeamArr[i].provider.reference);
                res = findResource(entry, ref[0], ref[1]);

                // [License, Name]
                practPersonalInfo = [
                    res.resource.identifier?.[0].value ?? "-", res.resource.name?.[0].text ?? 'Unknown'
                ]

                // [License, Name, Role, Qualification]
                role = careTeamArr[i].role.coding?.[0].code ?? "Unknown";
                qual = careTeamArr[i].qualification.coding?.[0].code ?? "Unknown";
                let CareTeamMember = [practPersonalInfo[0], practPersonalInfo[1], role, qual];
                arrayofCareTeam.push(CareTeamMember);


                // Add to HTML
                const newEl = document.createElement('tr');

                newEl.innerHTML = `
                <th scope="row">${i + 1}</th>
                <td>${practPersonalInfo[0]}</td>
                <td>${practPersonalInfo[1]}</td>
                <td>${role}</td>
                <td>${qual}</td>
                `;
                careTeamTBody.appendChild(newEl);
            }


        } catch (e) {
            showToast('Error upon extracting the Care Team data, please check the logs.', 'danger');
            console.warn(e);
            return;
        }
    }
}

// User Modifications =======================================

reqClaimIDInput.addEventListener('change', (e) => {
    let newValue = e.target.value;
    // let targetKey = parsed.entry
    // 1. Ensure input is a string
    const jsonString = JSON.stringify(userInputJSON);

    // 2. Perform global string replacement
    const modifiedString = jsonString.replaceAll("req_3085", newValue);

    // 3. Return parsed JSON object

});

// reqClaimIDInput.addEventListener('change', () => {
//     const input = userInputJSON;
//     const paths = [
//         'entry[1].resource.identifier[0].value'
//     ];
//     changeReqValue(paths, input, reqClaimIDInput.value);
// });

// function changeReqValue(paths, reqBody, newValue) {
//     if (reqBody && reqBody !== '') {
//         let parsed;
//         try {
//             parsed = JSON.parse(reqBody);
//         } catch (e) {
//             showToast('Invalid JSON: ' + e.message, 'danger');
//             return;
//         }

//         try {
//             paths.forEach(path => {
//                 setValueByPath(parsed, path, newValue);
//             });
//         } catch (e) {
//             showToast('Failed to update value: ' + e.message, 'danger');
//             return;
//         }

//         requestBodyTxtArea.value = JSON.stringify(parsed, null, 4);
//     }
// }

// function setValueByPath(obj, path, value) {
//     const keys = path
//         .replace(/\[(\d+)\]/g, '.$1') // convert [1] -> .1
//         .split('.')
//         .filter(k => k !== '');

//     let target = obj;
//     for (let i = 0; i < keys.length - 1; i++) {
//         const key = keys[i];
//         if (target[key] === undefined) {
//             throw new Error(`Path "${path}" is invalid: "${key}" does not exist at this level.`);
//         }
//         target = target[key];
//     }

//     const lastKey = keys[keys.length - 1];
//     if (target[lastKey] === undefined) {
//         throw new Error(`Path "${path}" is invalid: final key "${lastKey}" does not exist.`);
//     }

//     target[lastKey] = value;
// }

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
        .then(() => showToast("Copied extension", "success"))
        .catch(err => showToast('Navigator copy extension failed:', 'danger'));
}
function fallbackCopy(val) {
    val.select();
    val.setSelectionRange(0, 9999);
    document.execCommand('copy');
}

// Error Handling ===========================================
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
