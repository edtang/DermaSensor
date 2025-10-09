// CONFIG: edit these if your business logic differs
const CONFIG = {
    scansPerDevicePerMonth: 400,
    includeAPPsInPanel: false,
    appPanelWeight: 0.5
  };
  
  // DEFAULTS: centralized default values for all inputs
  const DEFAULTS = {
    // Section 2: Care Setting
    numberOfSites: 1,
    
  // Section 3: Care Team & Practice Size
  numberOfPhysicians: 1,  // Will be set by practiceType mapping
  numberOfAppProviders: 1,  // Will be synced to numberOfPhysicians
    averagePatientsPerPhysician: 1760,
    percentPatients40to64: 31.5,
    percentPatients65Plus: 16.8,
    percent4064CommercialInsurance: 74,
    percent65PlusMedicareCoverage: 98.9,
    
    // Section 4: At-Risk Patients & Lesions
    percentHighRiskPatients: 51,
    averageLesionsPerPatient: 1.57,
    
    // Section 5: Reimbursement
    commercialReimbursementPerScan: 145.34,
    medicareReimbursementPerScan: 145.78,
    cashPayPercentClaims: 3.0,
    cashPayReimbursementPerScan: 150.00,
    assumedPercentDenials: 20.0,
    dermaSensorSubscriptionCostPerMonth: 799,
    
  // Dropdown defaults
  practiceType: "Primary Care Practice",
  practiceSize: "1",
  commercialPayer: "Mean",
  medicareMac: "Mean"
};

// Practice Type to Number of Physicians mapping
const PRACTICE_TYPE_TO_PHYSICIANS = {
  "Primary Care Practice": 1,
  "Specialty Care Practice": 3,
  "Membership-based Care Practice": 6,
  "Large Practice": 20,
  "Enterprise/Group Network": 40
};

// Practice Type to Patients per Physician mapping
const PRACTICE_TYPE_TO_PATIENTS_PER_PHYSICIAN = {
  "Primary Care Practice": 1760,
  "Specialty Care Practice": 1760,
  "Membership-based Care Practice": 1400,
  "Large Practice": 1400,
  "Enterprise/Group Network": 1400
};

// Commercial Payer to Reimbursement per Scan mapping
const COMMERCIAL_PAYER_TO_REIMBURSEMENT = {
  "Mean": 145.34,
  "Kaiser Permanente Health Plans": 140.00,
  "UnitedHealthcare": 138.60,
  "Elevance Health": 140.00,
  "Health Care Service Corp": 125.00,
  "Guidewell Mutual Holding Group": 140.00,
  "Centene Corporation": 140.00,
  "Blue Shield of California": 140.00
};

// Medicare MAC to Reimbursement per Scan mapping
const MEDICARE_MAC_TO_REIMBURSEMENT = {
  "Mean": 145.78,
  "J5 - WPS Govt. Health Admin": 135.00,
  "J6 - National Govt. Services": 135.00,
  "J8 - National Govt. Services": 135.00,
  "J15 - CGS Administrators": 135.00,
  "JE - Noridian Healthcare Solutions": 135.00,
  "JF - Noridian Healthcare Solutions": 135.00,
  "JH - Novitas Solutions": 138.60
};

// Utility helpers
  const $ = (id) => document.getElementById(id);
  const n = (id) => {
    const el = $(id);
    const v = parseFloat(el?.value ?? el?.textContent ?? 0);
    return Number.isFinite(v) ? v : 0;
  };
  const s = (id) => {
    const el = $(id);
    return el?.value || "Option 1"; // defined default for selects
  };
  const pctToRatio = (p) => Math.max(0, Math.min(100, p)) / 100;
  const clampPct = (el) => {
    if (!el) return;
    const v = parseFloat(el.value);
    if (!Number.isFinite(v)) return;
    el.value = Math.max(0, Math.min(100, v));
  };
  
  // Formatters
  const fmtInt = (x) => Math.round(x).toLocaleString();
  const fmtMoney = (x) => `$${(x || 0).toFixed(2)}`;
  const fmtNum = (x, digits = 2) => (Number.isFinite(x) ? x.toFixed(digits) : "0");
  
  // Sync APP providers to match number of physicians
  function syncAppProvidersToPhysicians() {
    const numberOfPhysiciansInput = $("numberOfPhysiciansInput");
    const numberOfAppProvidersInput = $("numberOfAppProvidersInput");
    
    if (numberOfPhysiciansInput && numberOfAppProvidersInput) {
      numberOfAppProvidersInput.value = numberOfPhysiciansInput.value;
    }
  }
  
  // Handle practice type change - update number of physicians and patients per physician
  function handlePracticeTypeChange() {
    const practiceTypeDropdown = $("practiceTypeDropdown");
    const numberOfPhysiciansInput = $("numberOfPhysiciansInput");
    const averagePatientsPerPhysicianInput = $("averagePatientsPerPhysicianInput");
    
    if (practiceTypeDropdown && numberOfPhysiciansInput) {
      const practiceType = practiceTypeDropdown.value;
      const physicians = PRACTICE_TYPE_TO_PHYSICIANS[practiceType];
      const patientsPerPhysician = PRACTICE_TYPE_TO_PATIENTS_PER_PHYSICIAN[practiceType];
      
      if (physicians !== undefined) {
        numberOfPhysiciansInput.value = physicians;
        syncAppProvidersToPhysicians(); // Sync APP providers
      }
      
      if (patientsPerPhysician !== undefined && averagePatientsPerPhysicianInput) {
        averagePatientsPerPhysicianInput.value = patientsPerPhysician;
      }
      
      compute(); // Trigger recalculation
    }
  }
  
  // Handle number of physicians change - sync APP providers
  function handlePhysiciansChange() {
    syncAppProvidersToPhysicians();
    compute();
  }
  
  // Handle commercial payer change - update reimbursement value
  function handleCommercialPayerChange() {
    const commercialPayerDropdown = $("commercialPayerDropdown");
    const commercialReimbursementInput = $("commercialReimbursementPerScanInput");
    
    if (commercialPayerDropdown && commercialReimbursementInput) {
      const selectedPayer = commercialPayerDropdown.value;
      const reimbursementValue = COMMERCIAL_PAYER_TO_REIMBURSEMENT[selectedPayer];
      
      if (reimbursementValue !== undefined) {
        commercialReimbursementInput.value = reimbursementValue;
        compute(); // Trigger recalculation
      }
    }
  }
  
  // Handle Medicare MAC change - update reimbursement value
  function handleMedicareMacChange() {
    const medicareMacDropdown = $("medicareMacDropdown");
    const medicareReimbursementInput = $("medicareReimbursementPerScanInput");
    
    if (medicareMacDropdown && medicareReimbursementInput) {
      const selectedMac = medicareMacDropdown.value;
      const reimbursementValue = MEDICARE_MAC_TO_REIMBURSEMENT[selectedMac];
      
      if (reimbursementValue !== undefined) {
        medicareReimbursementInput.value = reimbursementValue;
        compute(); // Trigger recalculation
      }
    }
  }
  
  // Initialize form with default values
  function initializeDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      // Convert key to element ID (e.g., "numberOfSites" -> "numberOfSitesInput" or "practiceType" -> "practiceTypeDropdown")
      let elementId;
      
      // Check if it's a dropdown
      if (key === 'practiceType' || key === 'practiceSize' || 
          key === 'commercialPayer' || key === 'medicareMac') {
        elementId = key + 'Dropdown';
      } else {
        elementId = key + 'Input';
      }
      
      const el = $(elementId);
      if (el) {
        el.value = value;
      }
    });
    
    // After setting defaults, update physicians based on practice type and sync APP providers
    handlePracticeTypeChange();
    
    // Set initial commercial reimbursement value based on selected payer
    handleCommercialPayerChange();
    
    // Set initial Medicare reimbursement value based on selected MAC
    handleMedicareMacChange();
  }
  
  // Reset form to default values (useful for "Reset" button)
  function resetToDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      let elementId;
      
      if (key === 'practiceType' || key === 'practiceSize' || 
          key === 'commercialPayer' || key === 'medicareMac') {
        elementId = key + 'Dropdown';
      } else {
        elementId = key + 'Input';
      }
      
      const el = $(elementId);
      if (el) {
        el.value = value;
      }
    });
    
    // Clear practice name
    const practiceNameEl = $("practiceNameInput");
    if (practiceNameEl) practiceNameEl.value = "";
    
    // Update commercial reimbursement value based on selected payer
    handleCommercialPayerChange();
    
    // Update Medicare reimbursement value based on selected MAC
    handleMedicareMacChange();
    
    compute();
  }
  
  // Core calculations (stubbed with real const declarations)
  function compute() {
    // Section 1
    const practiceName = $("practiceNameInput")?.value?.trim() || "";
  
    // Section 2 — Care Setting
    const practiceType = s("practiceTypeDropdown");
    const practiceSize = s("practiceSizeDropdown");
    const numberOfSites = n("numberOfSitesInput");
  
    // Section 3 — Care Team & Practice Size
    const numberOfPhysicians = n("numberOfPhysiciansInput");
    const numberOfAppProviders = n("numberOfAppProvidersInput");
    const averagePatientsPerPhysician = n("averagePatientsPerPhysicianInput");
  
    const percentPatients40to64 = n("percentPatients40to64Input");
    const ratioPatients40to64 = pctToRatio(percentPatients40to64);
  
    const percentPatients65Plus = n("percentPatients65PlusInput");
    const ratioPatients65Plus = pctToRatio(percentPatients65Plus);
  
    const percent4064CommercialInsurance = n("percent4064CommercialInsuranceInput");
    const ratio4064CommercialInsurance = pctToRatio(percent4064CommercialInsurance);
  
    const percent65PlusMedicareCoverage = n("percent65PlusMedicareCoverageInput");
    const ratio65PlusMedicareCoverage = pctToRatio(percent65PlusMedicareCoverage);
  
    // Section 4 — At-Risk Patients & Lesions
    const percentHighRiskPatients = n("percentHighRiskPatientsInput");
    const ratioHighRiskPatients = pctToRatio(percentHighRiskPatients);
  
    const averageLesionsPerPatient = n("averageLesionsPerPatientInput");
  
    // Section 5 — Reimbursement and Payer Mix
    const commercialPayer = s("commercialPayerDropdown");
    const commercialReimbursementPerScan = n("commercialReimbursementPerScanInput");
  
    const medicareMac = s("medicareMacDropdown");
    const medicareReimbursementPerScan = n("medicareReimbursementPerScanInput");
  
    const cashPayPercentClaims = n("cashPayPercentClaimsInput");
    const ratioCashPayPercentClaims = pctToRatio(cashPayPercentClaims);
    const cashPayReimbursementPerScan = n("cashPayReimbursementPerScanInput");
  
    const assumedPercentDenials = n("assumedPercentDenialsInput");
    const ratioAssumedPercentDenials = pctToRatio(assumedPercentDenials);
  
    const dermaSensorSubscriptionCostPerMonth = n("dermaSensorSubscriptionCostPerMonthInput");

    // Output element refs
    const totalPatientsOutput = $("totalPatientsOutput");
    const totalPatients40to64Output = $("totalPatients40to64Output");
    const totalPatients65PlusOutput = $("totalPatients65PlusOutput");
    const atRiskPatientsPerPhysicianOutput = $("atRiskPatientsPerPhysicianOutput");
    const totalAtRiskPatientsOutput = $("totalAtRiskPatientsOutput");
    const totalLesionsScannedAnnuallyOutput = $("totalLesionsScannedAnnuallyOutput");
    const commercialPercentClaimsOutput = $("commercialPercentClaimsOutput");
    const medicarePercentClaimsOutput = $("medicarePercentClaimsOutput");
    const estimatedAnnualGrossReimbursementOutput = $("estimatedAnnualGrossReimbursementOutput");
    const numberOfDermaSensorDevicesOutput = $("numberOfDermaSensorDevicesOutput");
    const estimatedAnnualNetReimbursementOutput = $("estimatedAnnualNetReimbursementOutput");
    const breakEvenScansPerMonthOutput = $("breakEvenScansPerMonthOutput");
  
    // YOUR FORMULAS AND ASSIGNMENTS HERE, e.g.:
    const totalPatients = numberOfPhysicians * averagePatientsPerPhysician;
    totalPatientsOutput.textContent = fmtInt(totalPatients);


    const totalPatients40to64 = totalPatients * ratioPatients40to64;
    totalPatients40to64Output.textContent = fmtInt(totalPatients40to64);

    const totalPatients65Plus = totalPatients * ratioPatients65Plus;
    totalPatients65PlusOutput.textContent = fmtInt(totalPatients65Plus);

    // At-Risk Patients per Physician = ((Patients per Physician * %40-64 * %Commercial) + (Patients per Physician * %65+ * %Medicare)) * %HighRisk
    const patients40to64WithCommercial = averagePatientsPerPhysician * ratioPatients40to64 * ratio4064CommercialInsurance;
    const patients65PlusWithMedicare = averagePatientsPerPhysician * ratioPatients65Plus * ratio65PlusMedicareCoverage;
    const patientsWithInsurance = patients40to64WithCommercial + patients65PlusWithMedicare;
    const atRiskPatientsPerPhysician = patientsWithInsurance * ratioHighRiskPatients;
    atRiskPatientsPerPhysicianOutput.textContent = fmtInt(atRiskPatientsPerPhysician);

    const totalAtRiskPatients = atRiskPatientsPerPhysician * numberOfPhysicians;
    totalAtRiskPatientsOutput.textContent = fmtInt(totalAtRiskPatients);

    // Calculate commercial percent claims using the formula: ((H17*H20*H23*H28*H14)/H31)-(F43/2)
    // Where: H17=averagePatientsPerPhysician, H20=percentPatients40to64, H23=percent4064CommercialInsurance, 
    //        H28=percentHighRiskPatients, H14=numberOfPhysicians, H31=totalAtRiskPatients, F43=cashPayPercentClaims
    // Note: All percentage values (H20, H23, H28, F43) should be treated as raw percentages, not ratios
    const commercialPercentClaims = ((averagePatientsPerPhysician * (percentPatients40to64/100) * (percent4064CommercialInsurance/100) * (percentHighRiskPatients/100) * numberOfPhysicians) / totalAtRiskPatients) - (cashPayPercentClaims/100 / 2);
    const ratioCommercialPercentClaims = pctToRatio(Math.max(0, Math.min(100, commercialPercentClaims)));
    
    // Calculate Medicare percent claims using the formula: ((H17*H21*H24*H28*H14)/H31)-(F43/2)
    // Where: H17=averagePatientsPerPhysician, H21=percentPatients65Plus, H24=percent65PlusMedicareCoverage,
    //        H28=percentHighRiskPatients, H14=numberOfPhysicians, H31=totalAtRiskPatients, F43=cashPayPercentClaims
    // Note: All percentage values (H21, H24, H28, F43) should be treated as raw percentages, not ratios
    const medicarePercentClaims = ((averagePatientsPerPhysician * (percentPatients65Plus/100) * (percent65PlusMedicareCoverage/100) * (percentHighRiskPatients/100) * numberOfPhysicians) / totalAtRiskPatients) - (cashPayPercentClaims/100 / 2);
    const ratioMedicarePercentClaims = pctToRatio(Math.max(0, Math.min(100, medicarePercentClaims)));

    // Total Lesions Scanned Annually = Total At-Risk Patients * Average Lesions per Patient
    const totalLesionsScannedAnnually = totalAtRiskPatients * averageLesionsPerPatient;
    totalLesionsScannedAnnuallyOutput.textContent = fmtInt(totalLesionsScannedAnnually);
    
    // Display calculated commercial percent claims
    commercialPercentClaimsOutput.textContent = fmtNum(commercialPercentClaims, 3) + "%";
    
    // Display calculated Medicare percent claims
    medicarePercentClaimsOutput.textContent = fmtNum(medicarePercentClaims, 3) + "%";
    
    // Calculate weighted average reimbursement per scan
    const weightedReimbursementPerScan = (
      (ratioCommercialPercentClaims * commercialReimbursementPerScan) +
      (ratioMedicarePercentClaims * medicareReimbursementPerScan) +
      (ratioCashPayPercentClaims * cashPayReimbursementPerScan)
    );
    
    // Estimated Annual Gross Reimbursement Opportunity using the formula: ((H35*F39*H39)+(H35*F41*H41)+(H35*F43*H43))*(1-H45)
    // Where: H35=totalLesionsScannedAnnually, F39=commercialPercentClaims, H39=commercialReimbursementPerScan,
    //        F41=medicarePercentClaims, H41=medicareReimbursementPerScan, F43=cashPayPercentClaims, H43=cashPayReimbursementPerScan, H45=assumedPercentDenials
    const commercialRevenue = totalLesionsScannedAnnually * (commercialPercentClaims) * commercialReimbursementPerScan;
    const medicareRevenue = totalLesionsScannedAnnually * (medicarePercentClaims) * medicareReimbursementPerScan;
    const cashPayRevenue = totalLesionsScannedAnnually * (cashPayPercentClaims/100) * cashPayReimbursementPerScan;
    
    const estimatedAnnualGrossReimbursement = (commercialRevenue + medicareRevenue + cashPayRevenue) * (1 - (assumedPercentDenials/100));
    estimatedAnnualGrossReimbursementOutput.textContent = fmtMoney(estimatedAnnualGrossReimbursement);
    
    // Number of DermaSensor Devices = H14 (Number of Physicians)
    const numberOfDermaSensorDevices = numberOfPhysicians;
    numberOfDermaSensorDevicesOutput.textContent = fmtInt(numberOfDermaSensorDevices);
    
    // Annual DermaSensor subscription cost
    const annualDermaSensorCost = numberOfDermaSensorDevices * dermaSensorSubscriptionCostPerMonth * 12;
    
    // Estimated Annual Net Reimbursement Opportunity using the formula: H47-(H50*12*H49)
    // Where: H47=estimatedAnnualGrossReimbursement, H50=dermaSensorSubscriptionCostPerMonth, H49=numberOfDermaSensorDevices
    const estimatedAnnualNetReimbursement = estimatedAnnualGrossReimbursement - (dermaSensorSubscriptionCostPerMonth * 12 * numberOfDermaSensorDevices);
    estimatedAnnualNetReimbursementOutput.textContent = fmtMoney(estimatedAnnualNetReimbursement);
    
    // Break-Even Estimate = Monthly DermaSensor Cost / Weighted Reimbursement per Scan
    const breakEvenScansPerMonth = (numberOfDermaSensorDevices * dermaSensorSubscriptionCostPerMonth) / weightedReimbursementPerScan;
    breakEvenScansPerMonthOutput.textContent = fmtInt(Math.ceil(breakEvenScansPerMonth));
  }
  
  function attachEvents() {
    // Initialize form with defaults first
    initializeDefaults();
    
    // Percent-type inputs auto-clamp and trigger compute
    [
      "percentPatients40to64Input",
      "percentPatients65PlusInput",
      "percent4064CommercialInsuranceInput",
      "percent65PlusMedicareCoverageInput",
      "percentHighRiskPatientsInput",
      "cashPayPercentClaimsInput",
      "assumedPercentDenialsInput"
    ].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => { clampPct(el); compute(); });
      el.addEventListener("blur", () => { clampPct(el); compute(); });
    });
  
    // Special handler for practice type dropdown - updates physicians automatically
    const practiceTypeDropdown = $("practiceTypeDropdown");
    if (practiceTypeDropdown) {
      practiceTypeDropdown.addEventListener("change", handlePracticeTypeChange);
    }
    
    // Special handler for number of physicians - syncs APP providers
    const numberOfPhysiciansInput = $("numberOfPhysiciansInput");
    if (numberOfPhysiciansInput) {
      numberOfPhysiciansInput.addEventListener("input", handlePhysiciansChange);
      numberOfPhysiciansInput.addEventListener("change", handlePhysiciansChange);
    }
    
    // Special handler for commercial payer dropdown - updates reimbursement value
    const commercialPayerDropdown = $("commercialPayerDropdown");
    if (commercialPayerDropdown) {
      commercialPayerDropdown.addEventListener("change", handleCommercialPayerChange);
    }
    
    // Special handler for Medicare MAC dropdown - updates reimbursement value
    const medicareMacDropdown = $("medicareMacDropdown");
    if (medicareMacDropdown) {
      medicareMacDropdown.addEventListener("change", handleMedicareMacChange);
    }
    
    // Other inputs and dropdowns trigger compute directly
    [
      "practiceNameInput",
      "practiceSizeDropdown",
      "numberOfSitesInput",
      "numberOfAppProvidersInput",
      "averagePatientsPerPhysicianInput",
      "averageLesionsPerPatientInput",
      "cashPayReimbursementPerScanInput",
      "dermaSensorSubscriptionCostPerMonthInput"
    ].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", compute);
      el.addEventListener("change", compute);
    });
  
    // Initial computation
    compute();
  }
  
  document.addEventListener("DOMContentLoaded", attachEvents);
  