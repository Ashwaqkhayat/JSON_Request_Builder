const CATEGORY_SYSTEM = 'http://nphies.sa/terminology/CodeSystem/claim-information-category';
const UCUM = 'http://unitsofmeasure.org';

const SUPPINF_CATEGORIES = [
    { code: 'chief-complaint', label: 'Chief Complaint', kind: 'string' },
    { code: 'temperature', label: 'Temperature', kind: 'timedValue', unit: { system: UCUM, code: 'Cel', display: '°C' } },
    { code: 'vital-sign-height', label: 'Vital Sign – Height', kind: 'timedValue', unit: { system: UCUM, code: 'cm', display: 'cm' } },
    { code: 'vital-sign-weight', label: 'Vital Sign – Weight', kind: 'timedValue', unit: { system: UCUM, code: 'kg', display: 'kg' } },
    { code: 'pulse', label: 'Pulse', kind: 'timedValue', unit: { system: UCUM, code: '/min', display: '/min' } },
    { code: 'oxygen-saturation', label: 'Oxygen Saturation', kind: 'timedValue', unit: { system: UCUM, code: '%', display: '%' } },
    { code: 'respiratory-rate', label: 'Respiratory Rate', kind: 'timedValue', unit: { system: UCUM, code: '/min', display: '/min' } },
    { code: 'vital-sign-systolic', label: 'Vital Sign – Systolic BP', kind: 'timedValue', unit: { system: UCUM, code: 'mm[Hg]', display: 'mmHg' } },
    { code: 'vital-sign-diastolic', label: 'Vital Sign – Diastolic BP', kind: 'timedValue', unit: { system: UCUM, code: 'mm[Hg]', display: 'mmHg' } },
    { code: 'ventilation-hours', label: 'Ventilation Hours', kind: 'timedValue', unit: { system: UCUM, code: 'h', display: 'hours' } },
    { code: 'admission-weight', label: 'Admission Weight', kind: 'plainValue', unit: { system: UCUM, code: 'kg', display: 'kg' } },
    { code: 'patient-history', label: 'Patient History', kind: 'string' },
    { code: 'treatment-plan', label: 'Treatment Plan', kind: 'string' },
    { code: 'physical-examination', label: 'Physical Examination', kind: 'string' },
    { code: 'history-of-present-illness', label: 'History of Present Illness', kind: 'string' },
    { code: 'investigation-result', label: 'Investigation Result', kind: 'investigation' },
    { code: 'onset', label: 'Onset (Diagnosis)', kind: 'onset' },
    { code: 'days-supply', label: 'Days Supply', kind: 'plainValue', unit: { system: UCUM, code: 'd', display: 'Days' } },
    { code: 'attachment', label: 'Attachment', kind: 'attachment' }
];
export const SUPPINF_CATEGORY_BY_CODE = Object.fromEntries(SUPPINF_CATEGORIES.map(c => [c.code, c]));
export var arrayofSupportingInfo = [];
let attachmentBase64 = null;
let attachmentContentType = null;
let attachmentFileName = null;

export function setArrayOfSupportingInfo(newArr) {
    arrayofSupportingInfo = newArr;
}

export function getArrayOfSupportingInfo() {
    return arrayofSupportingInfo;
}

export function populateCategorySelect() {
    const sel = newInfoTypeInput
    SUPPINF_CATEGORIES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = c.label;
        sel.appendChild(opt);
    });
}

function showFieldGroup(kind) {
    document.querySelectorAll('.field-group').forEach(g => {
        const isActive = g.dataset.kind === kind;
        g.classList.toggle('active', isActive);

        // Toggle required only on inputs marked as required-in-group
        g.querySelectorAll('[data-required-in-group]').forEach(input => {
            input.required = isActive;
            if (!isActive) {
                input.setCustomValidity('');       // clear any stale custom errors
                input.classList.remove('is-invalid'); // optional: clear stale visual state
            }
        });
    });
}

export function buildSuppInfEntry(cat) {
    const base = {
        sequence: arrayofSupportingInfo.length + 1,
        category: { coding: [{ system: CATEGORY_SYSTEM, code: cat.code }] }
    };

    switch (cat.kind) {
        case 'timedValue': {
            const start = el('tv_start').value;
            const end = el('tv_end').value || start;
            const val = el('tv_value').value;
            if (!start) throw new Error('Start date/time is required.');
            if (val === '') throw new Error('A value is required.');
            base.timingPeriod = { start: start, end: end };
            base.valueQuantity = { value: Number(val), system: cat.unit.system, code: cat.unit.code };
            return base;
        }
        case 'plainValue': {
            const val = el('pv_value').value;
            if (val === '') {
                throw new Error('A value is required.');
            }
            base.valueQuantity = { value: Number(val), system: cat.unit.system, code: cat.unit.code };
            return base;
        }
        case 'string': {
            const text = el('str_value').value.trim();
            if (!text) throw new Error('Text is required.');
            base.valueString = text;
            return base;
        }
        case 'investigation': {
            const code = el('inv_code').value.trim();
            const display = el('inv_display').value.trim();
            if (!code) throw new Error('A code is required.');
            const coding = { system: 'http://nphies.sa/terminology/CodeSystem/investigation-result', code: code };
            if (display) coding.display = display;
            base.code = { coding: [coding] };
            return base;
        }
        case 'onset': {
            const code = el('on_code').value.trim();
            const text = el('on_text').value.trim();
            const date = el('on_date').value;
            if (!code) throw new Error('An ICD code is required.');
            const coding = { system: 'http://hl7.org/fhir/sid/icd-10-am', code: code };
            base.code = { coding: [coding] };
            if (text) base.code.text = text;
            if (date) base.timingDate = date;
            return base;
        }
        case 'attachment': {
            if (!attachmentBase64) throw new Error('Please choose a PDF, PNG, or JPEG file.');
            const title = document.getElementById('att_title').value.trim();
            base.valueAttachment = {
                contentType: attachmentContentType,
                data: attachmentBase64,
                title: title || attachmentFileName,
                creation: new Date().toISOString().slice(0, 10)
            };
            return base;
        }
        default:
            throw new Error('Unknown category kind.');
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function categoryLabel(entry) {
    const code = entry.category && entry.category.coding && entry.category.coding[0] && entry.category.coding[0].code;
    const cat = SUPPINF_CATEGORY_BY_CODE[code];
    return cat ? cat.label : (code || 'unknown');
}

function summarize(entry) {
    let value = "-";
    let timeDetails = "";
    if (entry.valueQuantity) {
        value = entry.valueQuantity.value + ' ' + (entry.valueQuantity.code || '');
    }
    if (entry.valueString) {
        value = entry.valueString;
    }
    if (entry.code && entry.code.coding && entry.code.coding[0]) {
        const c = entry.code.coding[0];
        let s = [c.code, c.display || c.text || entry.code.text].filter(Boolean).join(' – ');
        value = s || 'Not Recognized';
    }
    if (entry.timingDate) {
        timeDetails = entry.timingDate;
    }
    if (entry.timingPeriod) {
        timeDetails = entry.timingPeriod.start + " → " + entry.timingPeriod.end;
    }
    if (entry.valueAttachment) {
        const va = entry.valueAttachment;
        const kb = va.data ? Math.round((va.data.length * 0.75) / 1024) : 0;
        value = (va.title || 'attachment') + ' – ' + va.contentType + (kb ? ' (' + kb + ' KB)' : '');
    }
    return [value, timeDetails];
}

export function renderSupportingInfo() {
    const ulBody = el('supportingInfoUL');
    ulBody.innerHTML = '';
    arrayofSupportingInfo.forEach((info, idx) => {
        let infoLabel = escapeHtml(categoryLabel(info))
        let infoVal = summarize(info) // this is an array [value, timeDetails]

        const newEl = document.createElement('li');
        newEl.className = 'info-item';
        newEl.id = `${infoLabel}Li-${idx}`;

        newEl.innerHTML = `
        <div class="info-content">
        <div class="d-flex flex-row w-100">
            <div class="info-index">#${info.sequence != null ? info.sequence : '–'}</div>
            <div class="d-flex flex-column flex-grow-1">
                <div class="d-flex flex-grow-1 flex-row justify-content-between">
                    <div class="info-label">${infoLabel.replaceAll("-", " ")}</div>
                    <div class="info-value d-inline-block text-truncate" style="max-width: 410px;">${infoVal[0]}</div>
                </div>
                <div class="d-flex flex-grow-1 flex-row justify-content-between">
                    <div class="info-label second-info text-secondary-emphasis opacity-50">${infoVal[1] == "" ? "&nbsp;" : "Timing Date/Period"}</div>
                    <div class="info-value second-info text-secondary-emphasis opacity-50">${infoVal[1]}</div>
                </div>
            </div>
        </div>
        </div>
        <button class="btn btn-outline-secondary info-copy-btn" type="button">
        <i class="ph-bold ph-copy phicon-container"></i>
        </button>
        `;
        ulBody.appendChild(newEl);
    });
}

// Event Wiring
newInfoTypeInput.addEventListener('change', (e) => {
    const cat = SUPPINF_CATEGORY_BY_CODE[e.target.value];
    showFieldGroup(cat ? cat.kind : null);
});

el('tv_sameAsStart').addEventListener('click', (e) => {
    e.preventDefault();
    el('tv_end').value = el('tv_start').value;
});

el('att_file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const info = el('att_fileInfo');
    attachmentBase64 = null; attachmentContentType = null; attachmentFileName = null;
    info.classList.remove('text-danger');

    if (!file) { info.textContent = ''; return; }

    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
        info.textContent = 'Unsupported type: ' + (file.type || 'unknown') + '. Choose a PDF, PNG, or JPEG.';
        info.classList.add('text-danger');
        e.target.value = '';
        return;
    }

    info.textContent = 'Reading ' + file.name + '…';
    const reader = new FileReader();
    reader.onload = () => {
        attachmentBase64 = reader.result.split(',')[1] || '';
        attachmentContentType = file.type;
        attachmentFileName = file.name;
        info.textContent = 'Loaded ' + file.name + ' (' + file.type + ', ' + Math.round(file.size / 1024) + ' KB)';
    };
    reader.onerror = () => {
        info.textContent = 'Could not read that file.';
        info.classList.add('text-danger');
    };
    reader.readAsDataURL(file);
});