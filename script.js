const btn = document.getElementById("switchTheme");
const body = document.body;

btn.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-bs-theme");
    const newTheme = currentTheme == "dark" ? "light" : "dark";
    body.setAttribute("data-bs-theme", newTheme);

    btn.setAttribute("class", newTheme == "dark" ? "ph ph-sun" : "ph ph-moon")
});

// Refresh bundle button ============================================
function generateRandomAlphanumeric() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    function getRandomChars(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    return `${getRandomChars(3)}-${getRandomChars(5)}-${getRandomChars(5)}-${getRandomChars(4)}`;
}

document.getElementById('refresh-bundleid').addEventListener('click', () => {
    document.getElementById('bundleid-input').value = generateRandomAlphanumeric();
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