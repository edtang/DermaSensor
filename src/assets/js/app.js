// CONFIG: edit these if your business logic differs
const CONFIG = {
    scansPerDevicePerMonth: 400,
    includeAPPsInPanel: false,
    appPanelWeight: 0.5
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
    const commercialPercentClaims = n("commercialPercentClaimsInput");
    const ratioCommercialPercentClaims = pctToRatio(commercialPercentClaims);
    const commercialReimbursementPerScan = n("commercialReimbursementPerScanInput");
  
    const medicareMac = s("medicareMacDropdown");
    const medicarePercentClaims = n("medicarePercentClaimsInput");
    const ratioMedicarePercentClaims = pctToRatio(medicarePercentClaims);
    const medicareReimbursementPerScan = n("medicareReimbursementPerScanInput");
  
    const cashPayPercentClaims = n("cashPayPercentClaimsInput");
    const ratioCashPayPercentClaims = pctToRatio(cashPayPercentClaims);
    const cashPayReimbursementPerScan = n("cashPayReimbursementPerScanInput");
  
    const assumedPercentDenials = n("assumedPercentDenialsInput");
    const ratioAssumedPercentDenials = pctToRatio(assumedPercentDenials);
  
    const floopySubscriptionCostPerMonth = n("floopySubscriptionCostPerMonthInput");
  
    // Output element refs
    const totalPatientsOutput = $("totalPatientsOutput");
    const totalPatients40to64Output = $("totalPatients40to64Output");
    const totalPatients65PlusOutput = $("totalPatients65PlusOutput");
    const atRiskPatientsPerPhysicianOutput = $("atRiskPatientsPerPhysicianOutput");
    const totalAtRiskPatientsOutput = $("totalAtRiskPatientsOutput");
    const totalLesionsScannedAnnuallyOutput = $("totalLesionsScannedAnnuallyOutput");
    const estimatedAnnualGrossReimbursementOutput = $("estimatedAnnualGrossReimbursementOutput");
    const numberOfFloopyDevicesOutput = $("numberOfFloopyDevicesOutput");
    const estimatedAnnualNetReimbursementOutput = $("estimatedAnnualNetReimbursementOutput");
    const breakEvenScansPerMonthOutput = $("breakEvenScansPerMonthOutput");
  
    // YOUR FORMULAS AND ASSIGNMENTS HERE, e.g.:
    const totalPatients = numberOfPhysicians * averagePatientsPerPhysician;
    totalPatientsOutput.textContent = fmtInt(totalPatients);
    // ...
  }
  
  function attachEvents() {
    // Percent-type inputs auto-clamp and trigger compute
    [
      "percentPatients40to64Input",
      "percentPatients65PlusInput",
      "percent4064CommercialInsuranceInput",
      "percent65PlusMedicareCoverageInput",
      "percentHighRiskPatientsInput",
      "commercialPercentClaimsInput",
      "medicarePercentClaimsInput",
      "cashPayPercentClaimsInput",
      "assumedPercentDenialsInput"
    ].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => { clampPct(el); compute(); });
      el.addEventListener("blur", () => { clampPct(el); compute(); });
    });
  
    // Other inputs and dropdowns trigger compute directly
    [
      "practiceNameInput",
      "practiceTypeDropdown",
      "practiceSizeDropdown",
      "numberOfSitesInput",
      "numberOfPhysiciansInput",
      "numberOfAppProvidersInput",
      "averagePatientsPerPhysicianInput",
      "averageLesionsPerPatientInput",
      "commercialPayerDropdown",
      "commercialReimbursementPerScanInput",
      "medicareMacDropdown",
      "medicareReimbursementPerScanInput",
      "cashPayReimbursementPerScanInput",
      "floopySubscriptionCostPerMonthInput"
    ].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", compute);
      el.addEventListener("change", compute);
    });
  
    compute();
  }
  
  document.addEventListener("DOMContentLoaded", attachEvents);
  