// Custom Bootstrap validation


const requestTypeSelector = document.getElementById('RequestType');
const useType = document.getElementById('UseType');

requestTypeSelector.addEventListener('change', function () {
    if (this.value === 'Preauth') {
        useType.value = "new";
        useType.disabled = true; // disable button
    } else {
        useType.disabled = false; // enable button
    }
});

(function () {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
})();