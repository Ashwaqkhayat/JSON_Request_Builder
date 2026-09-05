// ---- extension ----
export function buildExtension({ patientShare, patientInvoiceNumber, tax, isMaternity, isPackage } = {}) {
    const extensions = [];

    if (patientShare !== undefined && patientShare !== null && patientShare !== '') {
        extensions.push({
            url: "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-patient-share",
            valueMoney: {
                value: patientShare,
                currency: "SAR"
            }
        });
    }

    if (patientInvoiceNumber !== undefined && patientInvoiceNumber !== null && patientInvoiceNumber !== '') {
        extensions.push({
            url: "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-patientInvoice",
            valueIdentifier: {
                system: "http://provider.com.sa/identifiers/patientInvoice",
                value: patientInvoiceNumber
            }
        });
    }

    if (tax !== undefined && tax !== null && tax !== '') {
        extensions.push({
            "url": "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-tax",
            "valueMoney": {
                "value": tax,
                "currency": "SAR"
            }
        });
    }

    if (isMaternity !== undefined && isMaternity !== null) {
        extensions.push({
            url: "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-maternity",
            valueBoolean: isMaternity
        });
    }

    if (isPackage !== undefined && isPackage !== null) {
        extensions.push({
            "url": "http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/extension-package",
            "valueBoolean": isPackage
        });
    }

    return extensions;
}

// ---- sequence ----
export function buildSequence(sequence) {
    return sequence;
}

// ---- careTeamSequence ----
export function buildCareTeamSequence(careTeamSequences) {
    const arr = Array.isArray(careTeamSequences)
        ? careTeamSequences
        : (careTeamSequences === undefined || careTeamSequences === null || careTeamSequences === '')
            ? []
            : [careTeamSequences];
    return arr.filter((seq) => seq !== undefined && seq !== null && seq !== '');
}

// ---- diagnosisSequence ----
export function buildDiagnosisSequence(diagnosisSequences) {
    const arr = Array.isArray(diagnosisSequences)
        ? diagnosisSequences
        : (diagnosisSequences === undefined || diagnosisSequences === null || diagnosisSequences === '')
            ? []
            : [diagnosisSequences];
    return [...arr];
}

// ---- informationSequence ----
export function buildInformationSequence(informationSequences) {
    const arr = Array.isArray(informationSequences)
        ? informationSequences
        : (informationSequences === undefined || informationSequences === null || informationSequences === '')
            ? []
            : [informationSequences];
    return arr.filter((seq) => seq !== undefined && seq !== null && seq !== '');
}

// ---- productOrService ----
export function buildProductOrService({
    nphiesCode,
    servCode,
    servDisplay
}) {
    return {
        coding: [
            {
                system: "http://nphies.sa/terminology/CodeSystem/procedures",
                code: nphiesCode,
                display: servDisplay
            },
            {
                system: "http://fsdgdsrg.sa/terminology/CodeSystem/procedures",
                code: servCode,
                display: servDisplay
            }
        ]
    };
}

// ---- servicedPeriod ----
export function buildServicedPeriod({ start, end }) {
    if (end == '' || end == null || end == undefined) {
        end = start
    }
    return {
        start,
        end
    };
}

// ---- quantity ----
export function buildQuantity(quantityValue, quantityType = "package") {
    return {
        value: quantityValue,
        system: "http://unitsofmeasure.org",
        code: quantityType
    };
}

// ---- unitPrice ----
export function buildUnitPrice(unitPriceValue) {
    return {
        value: unitPriceValue,
        currency: "SAR"
    };
}

// ---- factor ----
export function buildFactor(factorValue) {
    return factorValue
}

// ---- net ----
export function buildNet(netValue) {
    return {
        value: netValue,
        currency: "SAR"
    };
}

export function buildBodySite(bodySiteValue) {
    if (bodySiteValue == null || bodySiteValue == '') {
        return undefined;
    }
    return {
        coding: [
            {
                system: "http://nphies.sa/terminology/CodeSystem/fdi-oral-region",
                code: bodySiteValue
            }
        ]
    }
}

/**
 * Builds a single "item" entry by composing all first-layer key builders.
 * @param {Object} params - all inputs needed for one item
 */
export function buildItem(params) {
    const {
        // extension
        patientShare,
        patientInvoiceNumber,
        tax,
        isMaternity,
        isPackage,
        // sequence
        sequence,
        // careTeamSequence / diagnosisSequence / informationSequence
        careTeamSequences,
        diagnosisSequences,
        informationSequences,
        // productOrService
        nphiesCode,
        servCode,
        servDisplay,
        // servicedPeriod
        start,
        end,
        // quantity
        quantityValue,
        quantityType,
        // unitPrice
        unitPriceValue,
        // factor
        factorValue,
        // net
        netValue,
        // bodySite
        bodySiteValue
    } = params;

    const extension = buildExtension({ patientShare, patientInvoiceNumber, tax, isMaternity, isPackage });
    const careTeamSequence = buildCareTeamSequence(careTeamSequences);
    const informationSequence = buildInformationSequence(informationSequences);
    const bodySite = buildBodySite(bodySiteValue);

    // Omit "extension" entirely when none of the optional values were provided,
    // rather than emitting an empty array.
    return {
        ...(extension.length > 0 && { extension }),
        sequence: buildSequence(sequence),
        ...(careTeamSequence.length > 0 && { careTeamSequence }),
        diagnosisSequence: buildDiagnosisSequence(diagnosisSequences),
        ...(informationSequence.length > 0 && { informationSequence }),
        productOrService: buildProductOrService({
            nphiesCode,
            servCode,
            servDisplay
        }),
        servicedPeriod: buildServicedPeriod({ start, end }),
        quantity: buildQuantity(quantityValue, quantityType),
        unitPrice: buildUnitPrice(unitPriceValue),
        factor: buildFactor(factorValue),
        net: buildNet(netValue),
        ...(bodySite !== undefined && { bodySite }),
    };
}

/**
 * Builds the full JSON body: { "item": [ ...items ] }
 * @param {Object[]} itemsParams - array of param objects, one per item
 */
export function buildClaimBody(itemsParams) {
    console.log("construction item done")
    return {
        item: itemsParams.map(buildItem)
    };
}