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
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        errorDiv.textContent = 'Invalid JSON: ' + e.message;
        return;
    }

    if (!('claimId' in parsed)) {
        errorDiv.textContent = 'Key "claimId" not found in JSON.';
        console.log("parsed= ", JSON.stringify(parsed));
        return;
    }

    resultDiv.textContent = 'Claim ID: ' + parsed.claimId;
});

// function extractClaimId() {
// const input = userInput.value.trim();
// const errorDiv = document.getElementById('error');
// const resultDiv = document.getElementById('result');

// errorDiv.textContent = '';
// resultDiv.textContent = '';

// if (!input) {
// errorDiv.textContent = 'Please enter some JSON.';
// return;
// }

// let parsed;ß
// try {
// parsed = JSON.parse(input);
// } catch (e) {
// errorDiv.textContent = 'Invalid JSON: ' + e.message;
// return;
// }

// if (!('claimId' in parsed)) {
// errorDiv.textContent = 'Key "claimId" not found in JSON.';
// return;
// }

// resultDiv.textContent = 'Claim ID: ' + parsed.claimId;
// }