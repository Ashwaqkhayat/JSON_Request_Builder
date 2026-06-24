function generateRequest() {
    const reqBody = document.getElementById("request-body-text");
    reqBody.style.whiteSpace = "pre" /* Keeps indentation and line breaks */

    const bundleID = document.getElementById("bundleid-input").value;
    const identifier = "3252346364Claim_test01";
    const url = "https://www.utfelge.com";


    const timeStampBox = document.getElementById('timestampField');
    const now = new Date(); // Get current date and time
    const timestamp = now.toISOString(); // Get Unix timestamp (milliseconds since 1970)

    timeStampBox.value = timestamp;

    // Template text
    const reqJson = JSON.stringify(
        {
            bundleID: bundleID,
            id: {
                identifier,
                url
            },
            timestamp: timestamp
        },
        null,
        2 //indent with 2 spaces
    )

    reqBody.textContent = reqJson;
}
