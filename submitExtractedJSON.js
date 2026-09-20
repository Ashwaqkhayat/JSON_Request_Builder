import { refreshBundleTimestamp, reqType } from "./retrieve.js";

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

const resJSONField = el('resJSONField');
const resOutcomeInput = el('resOutcomeInput'); // Outcome
const resAdjOutcomeInput = el('resAdjOutcomeInput');
const resReqRefInput = el('resReqRefInput');
const requestRefIDInput = el('requestRefIDInput');
const requestDespositionInput = el('requestDespositionInput');
const outcomeDot = el('outcomeDot');

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
        await new Promise(resolve => setTimeout(resolve, 1000));
        let JSONRes = JSON.parse(resSample);

        let outcomeText = JSONRes.outcome
        resOutcomeInput.innerText = outcomeText?.charAt(0).toUpperCase() + outcomeText?.slice(1) ?? "Unknown";

        outcomeDot.classList.remove('bg-secondary')
        if (outcomeText == 'approved' || outcomeText == 'pended' || outcomeText == 'complete') {
            outcomeDot.classList.add('bg-success')
        } else {
            outcomeDot.classList.add('bg-danger')
        }

        resAdjOutcomeInput.value = JSONRes.item?.[0]?.extension?.[0]?.valueCodeableConcept?.coding?.[0]?.code ?? "Unknown";

        if ( JSONRes.preAuthRef ) {
            resReqRefInput.value = JSONRes.preAuthRef;
        } else {
            requestRefIDInput.setAttribute('hidden', true)
            requestDespositionInput.removeAttribute('hidden')
            requestDespositionInput.value = JSONRes.disposition ?? "Unknown";
        }

        resJSONField.value = JSON.stringify(JSONRes, null, 4);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(submitBtn, false);
        topPanel.classList.remove('closed');
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

const resSample = `
{
  "resourceType": "ClaimResponse",
  "id": "173087",
  "meta": {
    "profile": [
      "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/prior-auth-response|1.0.0"
    ]
  },
  "extension": [
    {
      "url": "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-adjudication-outcome",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://nphies.sa/terminology/CodeSystem/adjudication-outcome",
            "code": "approved"
          }
        ]
      }
    }
  ],
  "identifier": [
    {
      "system": "http://sni.com.sa/identifiers/claimresponse",
      "value": "res_470333"
    }
  ],
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
        "code": "professional"
      }
    ]
  },
  "subType": {
    "coding": [
      {
        "system": "http://nphies.sa/terminology/CodeSystem/claim-subtype",
        "code": "emr"
      }
    ]
  },
  "use": "preauthorization",
  "patient": {
    "reference": "Patient/123454186"
  },
  "created": "2023-12-05",
  "insurer": {
    "reference": "Organization/bff3aa1fbd3648619ac082357bf135db"
  },
  "requestor": {
    "reference": "Organization/5025"
  },
  "request": {
    "type": "Claim",
    "identifier": {
      "system": "http://saudiprofessionalclinic.com.sa/identifiers/authorization",
      "value": "req_17308886"
    }
  },
  "outcome": "failed",
  "preAuthRef": "Auth13234434",
  "preAuthPeriod": {
    "start": "2023-12-05",
    "end": "2023-12-20"
  },
  "item": [
    {
      "extension": [
        {
          "url": "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-adjudication-outcome",
          "valueCodeableConcept": {
            "coding": [
              {
                "system": "http://nphies.sa/terminology/CodeSystem/adjudication-outcome",
                "code": "approved"
              }
            ]
          }
        }
      ],
      "itemSequence": 1,
      "adjudication": [
        {
          "category": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                "code": "eligible"
              }
            ]
          },
          "amount": {
            "value": 120,
            "currency": "SAR"
          }
        },
        {
          "category": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                "code": "copay"
              }
            ]
          },
          "amount": {
            "value": 0,
            "currency": "SAR"
          }
        },
        {
          "category": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                "code": "benefit"
              }
            ]
          },
          "amount": {
            "value": 120,
            "currency": "SAR"
          }
        },
        {
          "category": {
            "coding": [
              {
                "system": "http://nphies.sa/terminology/CodeSystem/ksa-adjudication",
                "code": "approved-quantity"
              }
            ]
          },
          "value": 1
        }
      ]
    }
  ],
  "total": [
    {
      "category": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "eligible"
          }
        ]
      },
      "amount": {
        "value": 120,
        "currency": "SAR"
      }
    },
    {
      "category": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "benefit"
          }
        ]
      },
      "amount": {
        "value": 120,
        "currency": "SAR"
      }
    },
    {
      "category": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "copay"
          }
        ]
      },
      "amount": {
        "value": 0,
        "currency": "SAR"
      }
    }
  ],
  "insurance": [
    {
      "sequence": 1,
      "focal": true,
      "coverage": {
        "reference": "Coverage/1333"
      }
    }
  ]
}`