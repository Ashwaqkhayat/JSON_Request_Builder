import { refreshBundleTimestamp } from "./retrieve.js";

const el = val => document.getElementById(val);
const submitBtn = el('reqSubmitBtn')
const topPanel = el('topPanel');
const toggleBtn = el('togglePanelBtn');
const closeBtn = el('closePanelBtn');


const LOADING_HTML = `
  <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
  <span role="status">Sending...</span>
`;

function setLoading(btn, isLoading) {
    if (isLoading) {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = LOADING_HTML;
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalHtml;
        btn.disabled = false;
    }
}

submitBtn.addEventListener('click', async () => {
    refreshBundleTimestamp()
    setLoading(submitBtn, true)
    // try {
    //     const res = await fetch('/api/submit', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ name: 'Example' })
    //     });
    //     if (!res.ok) throw new Error(`HTTP ${res.status}`);
    //     const data = await res.json();
    //     console.log(data);
    // } catch (err) {
    //     console.error(err);
    // } finally {
    //     setLoading(submitBtn, false);
    // }

    // For Testing Purposes
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        topPanel.classList.remove('closed');
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(submitBtn, false);
    }
});

toggleBtn.addEventListener('click', () => {
    const isExpanded = topPanel.classList.toggle('expanded');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
    toggleBtn.title = isExpanded ? 'Collapse' : 'Expand';
});



closeBtn.addEventListener('click', () => {
    topPanel.classList.add('closed');
});