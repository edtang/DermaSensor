const electron = require('electron')
const {
    webContents
} = require('electron')
const {
    BrowserWindow
} = require('electron')

// In the Renderer process
const ipc = require('electron').ipcRenderer;

// test 

const {
    jsPDF
} = require("jspdf"); // will automatically load the node version

Chart.plugins.register(ChartDataLabels);

Chart.helpers.merge(Chart.defaults.global.plugins.datalabels, {
    color: "#000000",

    anchor: 'end',
    align: 'end',

});


var currencies = ["€", "CHF"];
var currentCurrencyObject = "Euro"
var currentCurrencyPrefix = "";
var currentCurrencySuffix = " €";
var currentLocaleCode = "en-MH";
var moneyDivs = $('.moneyinput');
var currentCurrency = 0;
var currentFlowRate = 2.239;
var currentACRate = 1.008;
var currentSTRate = 1.008;
var currentUTRate = 2.461;
const cityValues = [4400.00, 4399.19, 4385.43, 4399.57, 4388.41, 4397.53, 4390.67, 4386.25, 4394.22, 4386.27, 4385.26, 4500.75, 4425.00, 4385.06, 4385.06, 4385.37, 4385.06];

var currentBaseRate_CHF = 10000;
var currentBaseRate_Euro = 4400;
var currentBaserate = 4400.00;
var currentBaserateIdx = 0;
var currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
var whichPERisk = 0;

var flowTrieverNUBNegotiationResult  = 6000;
var NUBBackup = 6000;


$(document).ready(function() {
    setCurrency(currentCurrency);
    $('.currentBaserate').text(currentBaserateString);
    idx = document.querySelector('#statePicker').selectedIndex;
    cityName = (document.querySelector('#statePicker').options[idx]).text;
    currentBaserateIdx = idx;
    currentBaserate = cityValues[idx];
    currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
    $('.currentBaserate').text(currentBaserateString);
    $('#stateName').text(cityName);
    $('#cityValue').text(currentBaserateString);
    updateChartTitles();
    setGraphPage();
    $('.perAnnumResult').hide();
    $('.perAnnumResult2').hide();
    $('.perProcedureResultCHF').hide();
    $('.perAnnumResultCHF').hide();

});

function setGraphPage() {
    $('#mainInputs').show();
    $('#tabtitles').hide();
    $('#tab1').hide();
    $('.tab1title').hide();
    $('.tab2title').hide();
    $('#tab2').hide();
    $('#tab3').show();
    $('#tab4').hide();
    $('.tab3title').show();
    $('#whichCost').show();
    $('#whichGraph').show();
    $('.hideForReimbursement').show();
    $('#printTitleText').text("Estimated Costs for Pulmonary Embolism Interventions");

}



function setRisk(whichRisk) {
    whichPERisk = whichRisk;
    updateChartTitles();
    updateValues();
}

function setCurrency(whichCurrency) {
    currentCurrency = whichCurrency;
    switch (currentCurrency) {
        case 0: // Euro
            currentCurrencyPrefix = "";
            currentCurrencySuffix = "€";
            currentCurrencyObject = "Euro";
            currentLocaleCode = "en-MH";
            moneyDivs.parent().find('.datasuffix').show();
            moneyDivs.parent().find('.datasuffix').html(currentCurrencySuffix);
            moneyDivs.parent().find('.dataprefix').hide();
            currentBaserate = currentBaseRate_Euro;
            currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
            $('.currentBaserate').text(currentBaserateString);
            break;
        case 1: // German CHF
            currentCurrencyPrefix = "CHF ";
            currentCurrencyObject = "CHF";
            currentCurrencySuffix = "";
            currentLocaleCode = "de-CH";
            moneyDivs.parent().find('.dataprefix').show();
            moneyDivs.parent().find('.dataprefix').html(currentCurrencyPrefix);
            moneyDivs.parent().find('.datasuffix').hide();
            currentBaserate = currentBaseRate_CHF;
            currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
            $('.currentBaserate').text(currentBaserateString);
            break;

        default:
            // code block
    }


    updateValues();
}



$('#currencyPicker').on("change", function(event) {
    var idx = document.querySelector('#currencyPicker').selectedIndex;
    setCurrency(idx);


     $('.FlowDRGName').text(FlowTriever.Proceeds[currentCurrencyObject].DRG);
     $('.ACDRGName').text(Anticoagulation.Proceeds[currentCurrencyObject].DRG);
     $('.STDRGName').text(SystemicThrombolysis.Proceeds[currentCurrencyObject].DRG);

    $('.flowCostWeight').text(FlowTriever.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentFlowRate = FlowTriever.Proceeds[currentCurrencyObject].CostWeightBaseRate;

    $('.ACCostWeight').text(Anticoagulation.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentACRate = Anticoagulation.Proceeds[currentCurrencyObject].CostWeightBaseRate;


    $('.STCostWeight').text(SystemicThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentSTRate = SystemicThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate;

    $('.UTCostWeight').text(UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentUTRate = UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate;

    $('.flowDwellTime').text(FlowTriever.Proceeds[currentCurrencyObject].LimitDwellTime);
    $('.ACDwellTime').text(Anticoagulation.Proceeds[currentCurrencyObject].LimitDwellTime);
    $('.STDwellTime').text(SystemicThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime);
    $('.UTDwellTime').text(UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime);  

    if (idx == 0)
        {
            flowTrieverNUBNegotiationResult = NUBBackup;
             
            $('#statePicker').prop('disabled', false);
          //  $('#statePicker').trigger("change");
            $('.notCHF').show();
           
             $('.ACDRGText').text('DRG depends either with Cor Pulmonale DRG E64A; without: E64C') // we'll deal with you later
              if (whichCost == "PerProcedureCosts") {
            $('.perProcedureResultEuro').show();
                $('.perProcedureResultCHF').hide();
                $('.perAnnumResultEuro').hide();
            $('.perAnnumResultCHF').hide();
        } else {
             $('.perAnnumResultEuro').show();
            $('.perAnnumResultCHF').hide();
             $('.perProcedureResultEuro').hide();
               $('.perProcedureResultCHF').hide();
        }
           
            
           
        } else {
            flowTrieverNUBNegotiationResult = 0;
            $('#statePicker').val(0);
           // $('#statePicker').trigger("change");
            $('#statePicker').prop('disabled', true);
            $('.notCHF').hide();
             $('.ACDRGText').text('DRG')
             
           $('.perProcedureResultEuro').hide();
            $('.perProcedureResultCHF').show();

            if (whichCost == "PerProcedureCosts") {
            $('.perProcedureResultEuro').hide();
                $('.perProcedureResultCHF').show();
                 $('.perAnnumResultEuro').hide();
            $('.perAnnumResultCHF').hide();
        } else {
              $('.perProcedureResultEuro').hide();
               $('.perProcedureResultCHF').hide();
             $('.perAnnumResultEuro').hide();
            $('.perAnnumResultCHF').show();
        }
           

        }

    var checkBox = document.getElementById("hidefields32");
    if (checkBox.checked == true) {
        $('.maybeHidden32').css("display", "flex");
        // austin
        if (idx == 0)
        {

            $('.CHFDRG').css("display", "none");
            $('.euroDRG').show();
             $('.hideForCHF').show();
           
        } else
        {
            $('.CHFDRG').show();
            $('.euroDRG').css("display", "none");
             $('.hideForCHF').hide();
          
        }
    } 
     updateValues();

});
//asd
$('#FlowTrieverNUBNegotiationResult').on("change", function(event) {
    flowTrieverNUBNegotiationResult = parseInt($('#FlowTrieverNUBNegotiationResult').val());
    NUBBackup = flowTrieverNUBNegotiationResult;
    var NUBString = NUBBackup.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + " €";
    $('#FlowTrieverNUBNegotiationResult_value').text(NUBString);
    updateValues();
});




$('#statePicker').on("change", function(event) {
    idx = document.querySelector('#statePicker').selectedIndex;
    cityName = (document.querySelector('#statePicker').options[idx]).text;
    currentBaserateIdx = idx;
    currentBaseRate_Euro = cityValues[idx];
    currentBaserate = currentBaseRate_Euro
    currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
    $('.currentBaserate').text(currentBaserateString);
    $('#stateName').text(cityName);
    $('#cityValue').text(currentBaserateString);
     updateDRGChart();
    updateValues();

});

function updateDRGChart() {
     $('.fedBaseValueFlow_Euro').text(currentCurrencyPrefix + (currentBaserate * FlowTriever.Proceeds.Euro.CostWeightBaseRate).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);
     $('.fedBaseValueAC_Euro').text(currentCurrencyPrefix +(currentBaserate * Anticoagulation.Proceeds.Euro.CostWeightBaseRate).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);

      $('.fedBaseValueST_Euro').text(currentCurrencyPrefix +(currentBaserate * SystemicThrombolysis.Proceeds.Euro.CostWeightBaseRate).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);

     $('.fedBaseValueFlow_CHF').text(currentCurrencyPrefix + (currentBaserate * FlowTriever.Proceeds.CHF.CostWeightBaseRate).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);
     
     $('.fedBaseValueAC_CHF').text(currentCurrencyPrefix +(currentBaserate * Anticoagulation.Proceeds.CHF.CostWeightBaseRate).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);
      $('.fedBaseValueAC_CHF_Alt').text(currentCurrencyPrefix +(currentBaserate * Anticoagulation.Proceeds.CHF.CostWeightBaseRate_Alt).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);

      $('.fedBaseValueST_CHF').text(currentCurrencyPrefix +(currentBaserate * SystemicThrombolysis.Proceeds.CHF.CostWeightBaseRate).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);

      $('.fedBaseValueST_CHF_Alt').text(currentCurrencyPrefix +(currentBaserate * SystemicThrombolysis.Proceeds.CHF.CostWeightBaseRate_Alt).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })  + " " + currentCurrencySuffix);
}

$('#riskPicker').on("change", function(event) {

    idx = document.querySelector('#riskPicker').selectedIndex;
    setRisk(idx);

});


//moneyDivs.prop("data-suffix", "foowrong")
//console.log("test" +  $('.moneyinput').attr("data-suffix"));
//swapThingie();

// top section
var HospitalName = "Hospital Name";
var HospitalSize = 750;

var AnnualPERelatedHospitalisations2020 = 97718;
var TotalNumberOfHospitalBedsInGermany2023 = 476900;

var AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed = 0.2;
var AnnualHighRiskPEPatients = 33;
var AnnualIntermediateHighRiskPEPatients = 120;

var ProportionOfPatientsWithHighRiskPE = 0.05;
var ProportionOfPatientsWithIntHighRiskPE = 0.18;

var PercentageOfCostsVariableCatheterizationSuiteandICU = 1;
var PercentageOfCostsVariableGeneralHospitalWard = 1;




var AnnualHighRiskPEPatients_changed = false;
var AnnualIntermediateHighRiskPEPatients_changed = false;

var ProportionOfPatientsWithHighRiskPE_changed = false;
var ProportionOfPatientsWithIntHighRiskPE_changed = false;

var STCostOfBleedingEvents_changed = false;


var whichCost = "PerProcedureCosts"; // or could be "PerAnnumCosts;
var whichCostIdx = 0;
var whichGraph = 0;

//$('.lastRow').toggle();



Chart.plugins.register(ChartDataLabels);

Chart.helpers.merge(Chart.defaults.global.plugins.datalabels, {
    color: "#0000FF",

    anchor: 'end',
    align: 'end',

});



var whichView = 0;

var tab2Mode = 0;

var TotalsToRender_PerProcedure = [1, 1, 1, 1];
var TotalsToRender_PerAnnum = [1, 1, 1, 1];
var TotalsToRender_DRGPerProcedure = [1, 1, 1, 1, 1,1,1,1,1,1]
var TotalsToRender_DRGPerAnnum = [1, 1, 1, 1]
var TotalsToRender_DRGPerProcedureCHF = [1,1,1,1, 1,1,1,1];
var TotalsToRender_DRGPerAnnumCHF = [1,1,1,1]
var ctx_PerProcedure = document.getElementById("myChart_PerProcedure");
var myChart_PerProcedure = new Chart(ctx_PerProcedure, {
    type: 'bar',

    data: {
        labels: [
            ["FlowTriever"],
            ["Anticoagulation"],
            ["Systemic Thrombolysis"]
        ],
        datasets: [{
            label: 'Device, Ancillary, & Lytics',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)'

            ],
            borderColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)'

            ],
            borderWidth: 2
        }, {
            label: 'Bleeding Events',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )'
            ],
            borderColor: [
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )'

            ],
            borderWidth: 2
        }, {
            label: 'Hospital Readmissions',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgb(180, 180, 180 )',
                'rgb(180, 180, 180 )',
                'rgb(180, 180, 180 )',
                'rgb(180, 180, 180 )'

            ],
            borderColor: [
                'rgb(180, 180, 180 )',
                'rgb(180, 180, 180 )',
                'rgb(180, 180, 180 )',
                'rgb(180, 180, 180 )'
            ],
            borderWidth: 2
        }, {
            label: 'Acute Care',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        formatter: function(value, context) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_PerProcedure[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                        }
                    }
                },

            },

            backgroundColor: [

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )'


            ],
            borderColor: [

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )'
            ],
            borderWidth: 2
        }]
    },
    options: {
        layout: {
            padding: {
                top: 20
            }
        },
        responsive: true,

        legend: {
            display: true,
            position: 'bottom',
            maxWidth: 1200,
            width: 1200,
            labels: {
                boxWidth: 20,
            }


        },

        tooltips: {

            callbacks: {
                label: function(tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label + ":   " + currentCurrencyPrefix + Math.round(tooltipItems.yLabel).toLocaleString() + currentCurrencySuffix;
                }
            }
        },
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return currentCurrencyPrefix + value.toLocaleString() + currentCurrencySuffix;
                    },
                    afterTickToLabelConversion: function(scaleInstance) {
                        // set the first and last tick to null so it does not display
                        // note, ticks[0] is the last tick and ticks[length - 1] is the first
                        scaleInstance.ticks[0] = null;
                        scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;

                        // need to do the same thing for this similiar array which is used internally
                        scaleInstance.ticksAsNumbers[0] = null;
                        scaleInstance.ticksAsNumbers[scaleInstance.ticksAsNumbers.length - 1] = null;
                    }

                }
            }],
            xAxes: [{
                stacked: true,
                display: true,
                ticks: {
                    beginAtZero: true
                }
            }]


        }
    },
    plugins: {
        afterDraw: function(chart) {
            var ctx = chart.chart.ctx;
            var xAxis = chart.scales['x-axis-0'];

            if (!xAxis) return;

            // Count non-empty labels (technologies)
            var labelCount = xAxis.ticks.filter(tick => tick !== '').length;

            if (labelCount === 3) { 
                // 3 technologies: draw at tick 1 and tick 2
                var x1 = xAxis.getPixelForTick(1) - (xAxis.width / (xAxis.ticks.length - 1)) / 3;
                var x2 = xAxis.getPixelForTick(2)- (xAxis.width / (xAxis.ticks.length - 1)) / 3;

          
                [x1, x2].forEach(x => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, chart.chartArea.top);
                    ctx.lineTo(x, chart.chartArea.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgb(89, 46, 128)';
                    ctx.stroke();
                    ctx.restore();
                });
            } 
            else if (labelCount === 2) {
                // 2 technologies: draw only at tick 1
                var x = xAxis.getPixelForTick(1) - (xAxis.width / (xAxis.ticks.length - 1)) / 4;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            }
            else {
                // 1 technology or none: no lines
            }
        }
    }

});
var ctx_PerAnnum = document.getElementById("myChart_PerAnnum");
var myChart_PerAnnum = new Chart(ctx_PerAnnum, {
    type: 'bar',

    data: {
        labels: [
            ["FlowTriever"],
            ["Anticoagulation"],
            ["Systemic Thrombolysis"]
        ],
        datasets: [{
                label: 'Device, Ancillary, & Lytics',
                data: [0, 0, 0],
                datalabels: {
                    labels: {
                        title: null
                    }
                },

                backgroundColor: [
                    'rgba(87, 137, 205, 1.0)',
                    'rgba(87, 137, 205, 1.0)',
                    'rgba(87, 137, 205, 1.0)',
                    'rgba(87, 137, 205, 1.0)'

                ],
                borderColor: [
                    'rgba(87, 137, 205, 1.0)',
                    'rgba(87, 137, 205, 1.0)',
                    'rgba(87, 137, 205, 1.0)',
                    'rgba(87, 137, 205, 1.0)'

                ],
                borderWidth: 2
            }, {
                label: 'Bleeding Events',
                data: [0, 0, 0],
                datalabels: {
                    labels: {
                        title: null
                    }
                },

                backgroundColor: [

                    'rgb(240, 144, 72 )',
                    'rgb(240, 144, 72 )',
                    'rgb(240, 144, 72 )',
                    'rgb(240, 144, 72 )'
                ],
                borderColor: [
                    'rgb(240, 144, 72 )',
                    'rgb(240, 144, 72 )',
                    'rgb(240, 144, 72 )',
                    'rgb(240, 144, 72 )'

                ],
                borderWidth: 2
            }, {
                label: 'Hospital Readmissions',
                data: [0, 0, 0],
                datalabels: {
                    labels: {
                        title: null
                    }
                },

                backgroundColor: [

                    'rgb(180, 180, 180 )',
                    'rgb(180, 180, 180 )',
                    'rgb(180, 180, 180 )',
                    'rgb(180, 180, 180 )'

                ],
                borderColor: [
                    'rgb(180, 180, 180 )',
                    'rgb(180, 180, 180 )',
                    'rgb(180, 180, 180 )',
                    'rgb(180, 180, 180 )'
                ],
                borderWidth: 2
            }, {
                label: 'Acute Care',
                data: [0, 0, 0],
                datalabels: {
                    labels: {
                        myLabel2: {
                            color: "#000000",
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            formatter: function(value, context) {

                                return currentCurrencyPrefix + Math.round(TotalsToRender_PerAnnum[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                                //  return "$ 200" ;
                            }
                        }
                    },

                },

                backgroundColor: [

                    'rgb(255, 200, 44 )',
                    'rgb(255, 200, 44 )',
                    'rgb(255, 200, 44 )',
                    'rgb(255, 200, 44 )'


                ],
                borderColor: [

                    'rgb(255, 200, 44 )',
                    'rgb(255, 200, 44 )',
                    'rgb(255, 200, 44 )',
                    'rgb(255, 200, 44 )'
                ],
                borderWidth: 2
            }

        ]
    },
    options: {
        layout: {
            padding: {
                top: 20
            }
        },
        responsive: true,

        legend: {
            display: true,
            position: 'bottom',
            maxWidth: 1200,
            width: 1200,
            labels: {
                boxWidth: 20,
            }


        },

        tooltips: {

            callbacks: {
                label: function(tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label + ":    " + currentCurrencyPrefix + Math.round(tooltipItems.yLabel).toLocaleString() + currentCurrencySuffix;
                }
            }
        },
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return currentCurrencyPrefix + value.toLocaleString() + currentCurrencySuffix;
                    },
                    afterTickToLabelConversion: function(scaleInstance) {
                        // set the first and last tick to null so it does not display
                        // note, ticks[0] is the last tick and ticks[length - 1] is the first
                        scaleInstance.ticks[0] = null;
                        scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;

                        // need to do the same thing for this similiar array which is used internally
                        scaleInstance.ticksAsNumbers[0] = null;
                        scaleInstance.ticksAsNumbers[scaleInstance.ticksAsNumbers.length - 1] = null;
                    }

                }
            }],
            xAxes: [{
                stacked: true,
                display: true,
                ticks: {
                    beginAtZero: true
                }
            }]


        }
    },
    plugins: {
        afterDraw: function(chart) {
            var ctx = chart.chart.ctx;
            var xAxis = chart.scales['x-axis-0'];

            if (!xAxis) return;

            // Count non-empty labels (technologies)
            var labelCount = xAxis.ticks.filter(tick => tick !== '').length;

            if (labelCount === 3) { 
                // 3 technologies: draw at tick 1 and tick 2
                var x1 = xAxis.getPixelForTick(1) - (xAxis.width / (xAxis.ticks.length - 1)) / 3;
                var x2 = xAxis.getPixelForTick(2)- (xAxis.width / (xAxis.ticks.length - 1)) / 3;

          
                [x1, x2].forEach(x => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, chart.chartArea.top);
                    ctx.lineTo(x, chart.chartArea.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgb(89, 46, 128)';
                    ctx.stroke();
                    ctx.restore();
                });
            } 
            else if (labelCount === 2) {
                // 2 technologies: draw only at tick 1
                var x = xAxis.getPixelForTick(1) - (xAxis.width / (xAxis.ticks.length - 1)) / 4;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            }
            else {
                // 1 technology or none: no lines
            }
        }
    }


});

var ctx_DRGPerProcedure = document.getElementById("myChart_DRGPerProcedure");
var myChart_DRGPerProcedure = new Chart(ctx_DRGPerProcedure, {
    type: 'bar',

    data: {
        labels: [
            ["Cost per", "Procedure", ""],
            ["DRG Proceeds", "per", "Procedure", ""],
            ["DRG Net Return", "per", "Procedure", ""],
            ["DRG Net Return", "per", "Procedure", ""],
            ["Cost per", " Procedure", ""],
            ["DRG Proceeds", "per", "Procedure", ""],
            ["DRG Net Return", "per", "Procedure", ""],
            ["Cost per", "Procedure ", ""],
            ["DRG Proceeds", "per", "Procedure", ""],
            ["DRG Net Return", "per", "Procedure", ""],
            ["Cost per", "Procedure", ""],
            ["DRG Proceeds", "per", "Procedure", ""],
            ["DRG Net Return", "per", "Procedure", ""]

        ],

        datasets: [{
            label: "b",
            data: [0, 0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',


            ],
            borderColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
            ],
            borderWidth: 2
        }, {
            label: 'FlowTriever',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if (context.dataIndex < 4){
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedure[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },


            backgroundColor: [
                'rgba(128, 0, 128, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)'

            ],
            borderColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)'

            ],
            borderWidth: 2
        }, {
            label: 'Anticoagulation',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if ((context.dataIndex > 3) && (context.dataIndex < 7)) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedure[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },


            backgroundColor: [

                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )'
            ],
            borderColor: [
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )'

            ],
            borderWidth: 2
        }, {
            label: "Systemic Thrombolysis",
            data: [0, 0, 0],
           datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if ((context.dataIndex > 6) && (context.dataIndex < 10)) {
                            return  currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedure[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },

            backgroundColor: [

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )'


            ],
            borderColor: [

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )'
            ],
            borderWidth: 2
        }, {
            label: 'Ultrasound Assisted Thrombolysis',
            data: [0, 0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if (context.dataIndex > 9) {
                            return  currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedure[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },
            backgroundColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
            ],
            borderColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
            ],
            borderWidth: 2  
        }]
    },
    options: {
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        },
        responsive: true,

        legend: {
            display: false,
            position: 'bottom',
            maxWidth: 1200,
            width: 1200,
            labels: {
                boxWidth: 20,
            },





        },

        tooltips: {
            filter: function(tooltipItem) {
                return tooltipItem.datasetIndex >= 1;
            },
            callbacks: {
                title: function(tooltipItems, data) {
                    if (tooltipItems[0]){
                        return (tooltipItems[0].label).replace(/,/g, ' ');
                    }
                    
                },
                label: function(tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label + ":   " + currentCurrencyPrefix + Math.round(tooltipItems.yLabel).toLocaleString() + currentCurrencySuffix;
                }
            }
        },
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return currentCurrencyPrefix + value.toLocaleString() + currentCurrencySuffix;
                    },
                    afterTickToLabelConversion: function(scaleInstance) {
                        // set the first and last tick to null so it does not display
                        // note, ticks[0] is the last tick and ticks[length - 1] is the first
                        scaleInstance.ticks[0] = null;
                        scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;

                        // need to do the same thing for this similiar array which is used internally
                        scaleInstance.ticksAsNumbers[0] = null;
                        scaleInstance.ticksAsNumbers[scaleInstance.ticksAsNumbers.length - 1] = null;
                    }

                }
            }],
            xAxes: [{
                stacked: true,
                display: true,
                ticks: {
                    beginAtZero: true,
                    maxRotation: 0,
                    minRotation: 0,
                    fontSize: 10.5
                },

                gridLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 1
                }
            }]


        }
    },

   plugins: {
    afterDraw: function(chart) {
        var ctx = chart.chart.ctx;
        var xAxis = chart.scales['x-axis-0'];

        if (!xAxis) return;

        // Count the non-empty x labels
        var labelCount = xAxis.ticks.filter(tick => tick !== '').length;

        // Determine which technologies are visible based on the exact configuration
        var visibleTechnologies = [];
        var technologyPositions = [];
        
        // Get the current card picker selection
        var cardPickerIndex = document.querySelector('#cardPicker') ? document.querySelector('#cardPicker').selectedIndex : 0;
        
        if (cardPickerIndex === 0) {
            // Case 0: All Technologies (FlowTriever + AC + ST + USAT)
            // FlowTriever: positions 0-3, Anticoagulation: positions 4-6, Systemic Thrombolysis: positions 7-9, USAT: positions 10-12
            visibleTechnologies = ['FlowTriever', 'Anticoagulation', 'Systemic Thrombolysis', 'Ultrasound Assisted Thrombolysis'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2,
                (xAxis.getPixelForTick(7) + xAxis.getPixelForTick(9)) / 2,
                (xAxis.getPixelForTick(10) + xAxis.getPixelForTick(12)) / 2
            ];
        } else if (cardPickerIndex === 1) {
            // Case 1: FlowTriever + Anticoagulation
            // FlowTriever: positions 0-3, Anticoagulation: positions 4-6
            visibleTechnologies = ['FlowTriever', 'Anticoagulation'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2
            ];
        } else if (cardPickerIndex === 2) {
            // Case 2: FlowTriever + Systemic Thrombolysis
            // FlowTriever: positions 0-3, Systemic Thrombolysis: positions 4-6 (moved to dataset[2])
            visibleTechnologies = ['FlowTriever', 'Systemic Thrombolysis'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2
            ];
        } else if (cardPickerIndex === 3) {
            // Case 3: FlowTriever + Ultrasound Assisted Thrombolysis
            // FlowTriever: positions 0-3, USAT: positions 4-6 (moved to dataset[2])
            visibleTechnologies = ['FlowTriever', 'Ultrasound Assisted Thrombolysis'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2
            ];
        } else if (cardPickerIndex === 4) {
            // Case 4: FlowTriever only - positions 0-3 (4 columns)
            visibleTechnologies = ['FlowTriever'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2 // Center under positions 0-3
            ];
        } else if (cardPickerIndex === 5) {
            // Case 5: Anticoagulation only - positions 0-2 (3 columns)
            visibleTechnologies = ['Anticoagulation'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2 // Center under positions 0-2
            ];
        } else if (cardPickerIndex === 6) {
            // Case 6: Systemic Thrombolysis only - positions 0-2 (3 columns)
            visibleTechnologies = ['Systemic Thrombolysis'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2 // Center under positions 0-2
            ];
        } else if (cardPickerIndex === 7) {
            // Case 7: Ultrasound Assisted Thrombolysis only - positions 0-2 (3 columns)
            visibleTechnologies = ['Ultrasound Assisted Thrombolysis'];
            technologyPositions = [
                (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2 // Center under positions 0-2
            ];
        }

        // Draw centered category labels for visible technologies
        if (visibleTechnologies.length > 0) {
            ctx.save();
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            
            visibleTechnologies.forEach((label, index) => {
                var y = chart.chartArea.bottom + 60; // Position below the x-axis
                // Only draw if position is within chart bounds
                if (technologyPositions[index] >= chart.chartArea.left && technologyPositions[index] <= chart.chartArea.right) {
                    ctx.fillText(label, technologyPositions[index], y);
                }
            });
            ctx.restore();
        }

        // Draw separation lines based on visible technologies
        if (labelCount >= 12) { 
            // 4 technologies: draw lines at tick 4, 7, 10
            var x1 = xAxis.getPixelForTick(4) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
            var x2 = xAxis.getPixelForTick(7) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
            var x3 = xAxis.getPixelForTick(10) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

            [x1, x2, x3].forEach(x => {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            });
        } 
        else if (labelCount >= 9) { 
            // 3 technologies: draw lines at tick 4 and tick 7
            var x1 = xAxis.getPixelForTick(4) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
            var x2 = xAxis.getPixelForTick(7) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

            [x1, x2].forEach(x => {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            });
        } 
        else if (labelCount >= 6) {
            // 2 technologies: draw line at tick 4
            var x = xAxis.getPixelForTick(4)-  (xAxis.width / (xAxis.ticks.length - 1)) / 2.4;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, chart.chartArea.top);
            ctx.lineTo(x, chart.chartArea.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(89, 46, 128)';
            ctx.stroke();
            ctx.restore();
        } 
        else {
            // 1 technology: no lines
        }
    }
}


});

var ctx_DRGPerAnnum = document.getElementById("myChart_DRGPerAnnum");
var myChart_DRGPerAnnum = new Chart(ctx_DRGPerAnnum, {
    type: 'bar',

    data: {
        labels: [
            ["Cost per", "Annum"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"],
            ["Cost per", " Annum"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"],
            ["Cost per", "Annum "],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"],
            ["Cost per", "Annum "],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"]

        ],
        datasets: [{
            label: "b",
            data: [0, 0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )'


            ],
            borderColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )'
            ],
            borderWidth: 2
        }, {
            label: 'FlowTriever',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },


            backgroundColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)'

            ],
            borderColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)'

            ],
            borderWidth: 2
        }, {
            label: 'Anticoagulation',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )'
            ],
            borderColor: [
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )',
                'rgb(240, 144, 72 )'

            ],
            borderWidth: 2
        }, {
            label: 'Systemic Thrombolysis',
            data: [0, 0, 0],
           

             datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerAnnum[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                        }
                    }
                },
            },
            backgroundColor: [

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                 'rgb(255, 200, 44 )',
                  'rgb(255, 200, 44 )'


            ],
            borderColor: [

                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                'rgb(255, 200, 44 )',
                 'rgb(255, 200, 44 )',
                  'rgb(255, 200, 44 )'
            ],
            borderWidth: 2
        }, {
            label: 'Ultrasound Assisted Thrombolysis',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerAnnum[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                        }
                    }
                },
            },
            backgroundColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
            ],
            borderColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
            ],
            borderWidth: 2
        }
    ]
    },
    options: {
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        },
        responsive: true,

        legend: {
            display: false,
            position: 'bottom',
            maxWidth: 1200,
            width: 1200,
            labels: {
                boxWidth: 20,
            }


        },

        tooltips: {
            filter: function(tooltipItem) {
                return tooltipItem.datasetIndex >= 1;
            },
            callbacks: {
                title: function(tooltipItems, data) {
                    if (tooltipItems[0]){
                        return (tooltipItems[0].label).replace(/,/g, ' ');
                    }
                   
                },
                label: function(tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label + ":   " + currentCurrencyPrefix + Math.round(tooltipItems.yLabel).toLocaleString() + currentCurrencySuffix;
                }
            }
        },
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return currentCurrencyPrefix + value.toLocaleString() + currentCurrencySuffix;
                    },
                    afterTickToLabelConversion: function(scaleInstance) {
                        // set the first and last tick to null so it does not display
                        // note, ticks[0] is the last tick and ticks[length - 1] is the first
                        scaleInstance.ticks[0] = null;
                        scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;

                        // need to do the same thing for this similiar array which is used internally
                        scaleInstance.ticksAsNumbers[0] = null;
                        scaleInstance.ticksAsNumbers[scaleInstance.ticksAsNumbers.length - 1] = null;
                    }

                }
            }],
            xAxes: [{
                stacked: true,
                display: true,
                ticks: {
                    beginAtZero: true,
                    maxRotation: 0,
                    minRotation: 0,
                    fontSize: 10.5
                }
            }]


        }
    },

    plugins: {
        afterDraw: function(chart) {
            var ctx = chart.chart.ctx;
            var xAxis = chart.scales['x-axis-0'];

            if (!xAxis) {
                return;
            }


            // Count the non-empty x labels
            var labelCount = xAxis.ticks.filter(tick => tick !== '').length;

            // Determine which technologies are visible based on the exact configuration
            var visibleTechnologies = [];
            var technologyPositions = [];
            
            // Get the current card picker selection
            var cardPickerIndex = document.querySelector('#cardPicker') ? document.querySelector('#cardPicker').selectedIndex : 0;
            
            if (cardPickerIndex === 0) {
                // Case 0: All Technologies (FlowTriever + AC + ST + USAT)
                // FlowTriever: positions 0-3 (4 columns), Anticoagulation: positions 4-6, Systemic Thrombolysis: positions 7-9, USAT: positions 10-12
                visibleTechnologies = ['FlowTriever', 'Anticoagulation', 'Systemic Thrombolysis', 'Ultrasound Assisted Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                    (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2,
                    (xAxis.getPixelForTick(7) + xAxis.getPixelForTick(9)) / 2,
                    (xAxis.getPixelForTick(10) + xAxis.getPixelForTick(12)) / 2
                ];
            } else if (cardPickerIndex === 1) {
                // Case 1: FlowTriever + Anticoagulation
                visibleTechnologies = ['FlowTriever', 'Anticoagulation'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                    (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2
                ];
            } else if (cardPickerIndex === 2) {
                // Case 2: FlowTriever + Systemic Thrombolysis
                visibleTechnologies = ['FlowTriever', 'Systemic Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                    (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2
                ];
            } else if (cardPickerIndex === 3) {
                // Case 3: FlowTriever + Ultrasound Assisted Thrombolysis
                visibleTechnologies = ['FlowTriever', 'Ultrasound Assisted Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2,
                    (xAxis.getPixelForTick(4) + xAxis.getPixelForTick(6)) / 2
                ];
            } else if (cardPickerIndex === 4) {
                // Case 4: FlowTriever only - positions 0-3 (4 columns)
                visibleTechnologies = ['FlowTriever'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(3)) / 2
                ];
            } else if (cardPickerIndex === 5) {
                // Case 5: Anticoagulation only - positions 0-2 (3 columns)
                visibleTechnologies = ['Anticoagulation'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            } else if (cardPickerIndex === 6) {
                // Case 6: Systemic Thrombolysis only - positions 0-2 (3 columns)
                visibleTechnologies = ['Systemic Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            } else if (cardPickerIndex === 7) {
                // Case 7: Ultrasound Assisted Thrombolysis only - positions 0-2 (3 columns)
                visibleTechnologies = ['Ultrasound Assisted Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            }

            // Draw centered category labels for visible technologies
            
            if (visibleTechnologies.length > 0) {
                ctx.save();
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                
                visibleTechnologies.forEach((label, index) => {
                    var y = chart.chartArea.bottom + 60; // Position below the x-axis
                    // Only draw if position is within chart bounds
                    if (technologyPositions[index] >= chart.chartArea.left && technologyPositions[index] <= chart.chartArea.right) {
                        ctx.fillText(label, technologyPositions[index], y);
                    }
                });
                ctx.restore();
            }

       
        if (labelCount >= 12) { 
            // 4 technologies: draw lines at tick 4, 7, 10
            var x1 = xAxis.getPixelForTick(4) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
            var x2 = xAxis.getPixelForTick(7) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
            var x3 = xAxis.getPixelForTick(10) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

            [x1, x2, x3].forEach(x => {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            });
        } 
        else if (labelCount >= 9) { 
            // 3 technologies: draw lines at tick 4 and tick 7
            var x1 = xAxis.getPixelForTick(4) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
            var x2 = xAxis.getPixelForTick(7) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

            [x1, x2].forEach(x => {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            });
        } 
        else if (labelCount >= 6) {
            // 2 technologies: draw line at tick 4
            var x = xAxis.getPixelForTick(4)-  (xAxis.width / (xAxis.ticks.length - 1)) / 2.4;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, chart.chartArea.top);
            ctx.lineTo(x, chart.chartArea.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(89, 46, 128)';
            ctx.stroke();
            ctx.restore();
        } 
        else {
            // 1 technology: no lines
        }
    
    }
}

});


var ctx_DRGPerProcedureCHF = document.getElementById("myChart_DRGPerProcedureCHF");
var myChart_DRGPerProcedureCHF = new Chart(ctx_DRGPerProcedureCHF, {
    type: 'bar',

    data: {
        labels: [
            ["Cost per", "Procedure"],
            ["DRG Proceeds", "per", "Procedure"],
            ["DRG Net Return", "per", "Procedure"],
            ["Cost per", " Procedure"],
            ["DRG Proceeds", "per", "Procedure"],
            ["DRG Net Return", "per", "Procedure"],
            ["Cost per", "Procedure "],
            ["DRG Proceeds", "per", "Procedure"],
            ["DRG Net Return", "per", "Procedure"], 
            ["Cost per", "Procedure "],
            ["DRG Proceeds", "per", "Procedure"],
            ["DRG Net Return", "per", "Procedure"]
        ],

        datasets: [{
            label: "b",
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                 'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                 'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                 'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )'


            ],
            borderColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )', 
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                 'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                  'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )'
            ],
            borderWidth: 2
        }, {
            label: 'FlowTriever',
            data: [0, 0, 0],
             data: [0, 0, 0],
           datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if (context.dataIndex < 3) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedureCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },


            backgroundColor: [
                 'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)'

            ],
            borderColor: [
               'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)'
            ],
            borderWidth: 2
        }, {
            label: 'Anticoagulation',
            data: [0, 0, 0],
                  datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if ((context.dataIndex > 2) && (context.dataIndex < 6)) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedureCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },


            backgroundColor: [

                'rgb(140,  140, 140  )',
                 'rgb(140,  140, 140  )',
                  'rgb(140,  140, 140  )',
                   'rgb(140,  140, 140  )',
                    'rgb(140,  140, 140  )',
                     'rgb(140,  140, 140  )',
                      'rgb(140,  140, 140  )',
                       'rgb(140,  140, 140  )',
                        'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )'
            ],
            borderColor: [
               'rgb(140,  140, 140  )',
                 'rgb(140,  140, 140  )',
                  'rgb(140,  140, 140  )',
                   'rgb(140,  140, 140  )',
                    'rgb(140,  140, 140  )',
                     'rgb(140,  140, 140  )',
                      'rgb(140,  140, 140  )',
                       'rgb(140,  140, 140  )',
                        'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )'

            ],
            borderWidth: 2
        }, {
            label: "Systemic Thrombolysis",
            data: [0, 0, 0],
                  datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if (context.dataIndex > 5) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedureCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },

            backgroundColor: [

             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',  
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )'    
             


            ],
            borderColor: [

                'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',  
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )'
            ],
            borderWidth: 2
        }, {
            label: "test",
            data: [0, 0, 0],
                  datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 14,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                            if (context.dataIndex > 8) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerProcedureCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else {
                                return "";
                            } 
                        }
                    }
                },
            },

            backgroundColor: [

             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    


            ],
            borderColor: [

             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',    
             'rgb(87, 137, 205   )',
             'rgb(87, 137, 205   )',  
            ],
            borderWidth: 2
        } ]
    },
    options: {
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        },
        responsive: true,

        legend: {
            display: false,
            position: 'bottom',
            maxWidth: 1200,
            width: 1200,
            labels: {
                boxWidth: 20,
            },





        },

        tooltips: {
            filter: function(tooltipItem) {
                return tooltipItem.datasetIndex >= 1;
            },
            callbacks: {
                title: function(tooltipItems, data) {
                    if (tooltipItems[0]) {
                        return (tooltipItems[0].label).replace(/,/g, ' '); 
                    }
                },
                label: function(tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label + ":   " + currentCurrencyPrefix + Math.round(tooltipItems.yLabel).toLocaleString() + currentCurrencySuffix;
                }
            }
        },
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return currentCurrencyPrefix + value.toLocaleString() + currentCurrencySuffix;
                    },
                    afterTickToLabelConversion: function(scaleInstance) {
                        // set the first and last tick to null so it does not display
                        // note, ticks[0] is the last tick and ticks[length - 1] is the first
                        scaleInstance.ticks[0] = null;
                        scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;

                        // need to do the same thing for this similiar array which is used internally
                        scaleInstance.ticksAsNumbers[0] = null;
                        scaleInstance.ticksAsNumbers[scaleInstance.ticksAsNumbers.length - 1] = null;
                    }

                }
            }],
            xAxes: [{
                stacked: true,
                display: true,
                ticks: {
                    beginAtZero: true,
                    maxRotation: 0,
                    minRotation: 0,
                    fontSize: 10.5
                },

                gridLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 1
                }
            }]


        }
    },

    plugins: {
        afterDraw: function(chart) {
            var ctx = chart.chart.ctx;
            var xAxis = chart.scales['x-axis-0'];

            if (!xAxis) {
                return;
            }


            // Count the non-empty x labels
            var labelCount = xAxis.ticks.filter(tick => tick !== '').length;

            // Draw separation lines first
            if (labelCount >= 12) { 
                // 4 technologies: draw lines at tick 3, 6, 9
                var x1 = xAxis.getPixelForTick(3) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
                var x2 = xAxis.getPixelForTick(6) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
                var x3 = xAxis.getPixelForTick(9) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

                [x1, x2, x3].forEach(x => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, chart.chartArea.top);
                    ctx.lineTo(x, chart.chartArea.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgb(89, 46, 128)';
                    ctx.stroke();
                    ctx.restore();
                });
            } else if (labelCount >= 9) { 
                // 3 technologies: draw lines at tick 3 and tick 6
                var x1 = xAxis.getPixelForTick(3) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
                var x2 = xAxis.getPixelForTick(6) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

                [x1, x2].forEach(x => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, chart.chartArea.top);
                    ctx.lineTo(x, chart.chartArea.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgb(89, 46, 128)';
                    ctx.stroke();
                    ctx.restore();
                });
            } else if (labelCount >= 6) {
                // 2 technologies: draw line at tick 3
                var x = xAxis.getPixelForTick(3) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.4;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(89, 46, 128)';
                ctx.stroke();
                ctx.restore();
            }

            // Determine which technologies are visible based on the exact configuration
            var visibleTechnologies = [];
            var technologyPositions = [];
            
            // Get the current card picker selection
            var cardPickerIndex = document.querySelector('#cardPicker') ? document.querySelector('#cardPicker').selectedIndex : 0;
            
            if (cardPickerIndex === 0) {
                // Case 0: All Technologies (FlowTriever + AC + ST + USAT)
                // FlowTriever: positions 0-2 (3 columns), Anticoagulation: positions 3-5, Systemic Thrombolysis: positions 6-8, USAT: positions 9-11
                visibleTechnologies = ['FlowTriever', 'Anticoagulation', 'Systemic Thrombolysis', 'Ultrasound Assisted Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
                    (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2,
                    (xAxis.getPixelForTick(6) + xAxis.getPixelForTick(8)) / 2,
                    (xAxis.getPixelForTick(9) + xAxis.getPixelForTick(11)) / 2
                ];
            } else if (cardPickerIndex === 1) {
                // Case 1: FlowTriever + Anticoagulation
                visibleTechnologies = ['FlowTriever', 'Anticoagulation'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
                    (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2
                ];
            } else if (cardPickerIndex === 2) {
                // Case 2: FlowTriever + Systemic Thrombolysis
                visibleTechnologies = ['FlowTriever', 'Systemic Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
                    (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2
                ];
            } else if (cardPickerIndex === 3) {
                // Case 3: FlowTriever + Ultrasound Assisted Thrombolysis
                visibleTechnologies = ['FlowTriever', 'Ultrasound Assisted Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
                    (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2
                ];
            } else if (cardPickerIndex === 4) {
                // Case 4: FlowTriever only - positions 0-2 (3 columns)
                visibleTechnologies = ['FlowTriever'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            } else if (cardPickerIndex === 5) {
                // Case 5: Anticoagulation only - positions 0-2 (3 columns)
                visibleTechnologies = ['Anticoagulation'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            } else if (cardPickerIndex === 6) {
                // Case 6: Systemic Thrombolysis only - positions 0-2 (3 columns)
                visibleTechnologies = ['Systemic Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            } else if (cardPickerIndex === 7) {
                // Case 7: Ultrasound Assisted Thrombolysis only - positions 0-2 (3 columns)
                visibleTechnologies = ['Ultrasound Assisted Thrombolysis'];
                technologyPositions = [
                    (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
                ];
            }

            // Draw centered category labels for visible technologies
            
            if (visibleTechnologies.length > 0) {
                ctx.save();
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                
                visibleTechnologies.forEach((label, index) => {
                    var y = chart.chartArea.bottom + 60; // Position below the x-axis
                    // Only draw if position is within chart bounds
                    if (technologyPositions[index] >= chart.chartArea.left && technologyPositions[index] <= chart.chartArea.right) {
                        ctx.fillText(label, technologyPositions[index], y);
                    }
                });
                ctx.restore();
            }
        }
    }
});

console.log('myChart_DRGPerAnnum created:', myChart_DRGPerAnnum);


var ctx_DRGPerAnnumCHF = document.getElementById("myChart_DRGPerAnnumCHF");
var myChart_DRGPerAnnumCHF = new Chart(ctx_DRGPerAnnumCHF, {
    type: 'bar',

    data: {
        labels: [
            ["Cost per", "Annum"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"],
            ["Cost per", " Annum"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"],
            ["Cost per", "Annum "],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"],
            ["Cost per", "Annum "],
            ["DRG", "Proceeds"],
            ["Net Return per", "Annum"]
        ],
        datasets: [{
            label: "b",
            data: [0, 0, 0, 0],
            datalabels: {
                labels: {
                    title: null
                }
            },

            backgroundColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )'


            ],
            borderColor: [

                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )',
                'rgba(255, 200, 44, 0 )'
            ],
            borderWidth: 2
        }, {
            label: 'FlowTriever',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 10,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                         if (context.dataIndex < 4) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerAnnumCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ; }
                        }
                    }
                    }
                },
            },


            backgroundColor: [
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)'

            ],
            borderColor: [
               'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)',
                'rgba(85 ,  47,  126 , 1.0)'

            ],
            borderWidth: 2
        }, {
            label: 'Anticoagulation',
            data: [0, 0, 0],
                datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 10,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                             if ((context.dataIndex > 2 ) && (context.dataIndex < 6)) {
                                return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerAnnumCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;
                            } else 
                            {
                                return "";
                            }
                        }
                    }
                },
            },

            backgroundColor: [

                'rgb(140,  140, 140  )',
                 'rgb(140,  140, 140  )',
                  'rgb(140,  140, 140  )',
                   'rgb(140,  140, 140  )',
                    'rgb(140,  140, 140  )',
                     'rgb(140,  140, 140  )',
                      'rgb(140,  140, 140  )',
                       'rgb(140,  140, 140  )',
                        'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )'
            ],
            borderColor: [
               
                'rgb(140,  140, 140  )',
                 'rgb(140,  140, 140  )',
                  'rgb(140,  140, 140  )',
                   'rgb(140,  140, 140  )',
                    'rgb(140,  140, 140  )',
                     'rgb(140,  140, 140  )',
                      'rgb(140,  140, 140  )',
                       'rgb(140,  140, 140  )',
                        'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )',
                         'rgb(140,  140, 140  )'

            ],
            borderWidth: 2
        }, {
            label: 'Systemic Thrombolysis',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 10,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                             if ((context.dataIndex > 5) && (context.dataIndex < 9)) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerAnnumCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;}
                            } else {
                                return "";
                            }
                        }
                    }
                },

            },

            backgroundColor: [

                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )',
                'rgb(123, 22,  14   )'



            ],
            borderColor: [

               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )',
               'rgb(123, 22,  14   )'
            ],
            borderWidth: 2  
        }, {
            label: 'Ultrasound Assisted Thrombolysis',
            data: [0, 0, 0],
            datalabels: {
                labels: {
                    myLabel2: {
                        color: "#000000",
                        font: {
                            size: 10,
                            weight: 'bold'
                        },

                        formatter: function(value, context) {
                             if ((context.dataIndex > 8)) {
                            return currentCurrencyPrefix + Math.round(TotalsToRender_DRGPerAnnumCHF[context.dataIndex]).toLocaleString() + currentCurrencySuffix;
                            //  return "$ 200" ;}
                            } else {
                                return "";
                            }
                        }
                    }
                },

            },
            backgroundColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
            ],
            borderColor: [
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
                'rgba(87, 137, 205, 1.0)',
            ],
            borderWidth: 2
        }
    ]
    },
    options: {
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        },
        responsive: true,

        legend: {
            display: false,
            position: 'bottom',
            maxWidth: 1200,
            width: 1200,
            labels: {
                boxWidth: 20,
            }


        },

        tooltips: {
            filter: function(tooltipItem) {
                return tooltipItem.datasetIndex >= 1;
            },
            callbacks: {
                title: function(tooltipItems, data) {
                     if (tooltipItems[0]) {
                       return (tooltipItems[0].label).replace(/,/g, ' ');
                   }
                },
                label: function(tooltipItems, data) {
                    return data.datasets[tooltipItems.datasetIndex].label + ":   " + currentCurrencyPrefix + Math.round(tooltipItems.yLabel).toLocaleString() + currentCurrencySuffix;
                }
            }
        },
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return currentCurrencyPrefix + value.toLocaleString() + currentCurrencySuffix;
                    },
                    afterTickToLabelConversion: function(scaleInstance) {
                        // set the first and last tick to null so it does not display
                        // note, ticks[0] is the last tick and ticks[length - 1] is the first
                        scaleInstance.ticks[0] = null;
                        scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;

                        // need to do the same thing for this similiar array which is used internally
                        scaleInstance.ticksAsNumbers[0] = null;
                        scaleInstance.ticksAsNumbers[scaleInstance.ticksAsNumbers.length - 1] = null;
                    }

                }
            }],
            xAxes: [{
                stacked: true,
                display: true,
                ticks: {
                    beginAtZero: true,
                    maxRotation: 0,
                    minRotation: 0,
                    fontSize: 10.5
                }
            }]


        }
    },

    plugins: {
        afterDraw: function(chart) {
            var ctx = chart.chart.ctx;
            var xAxis = chart.scales['x-axis-0'];

            if (!xAxis) {
                return;
            }

    
       // Count the non-empty x labels
       var labelCount = xAxis.ticks.filter(tick => tick !== '').length;
       // hart
       if (labelCount >= 12) { 
           // 4 technologies: draw lines at tick 3, 6, 9
           var x1 = xAxis.getPixelForTick(3) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
           var x2 = xAxis.getPixelForTick(6) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
           var x3 = xAxis.getPixelForTick(9) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

           [x1, x2, x3].forEach(x => {
               ctx.save();
               ctx.beginPath();
               ctx.moveTo(x, chart.chartArea.top);
               ctx.lineTo(x, chart.chartArea.bottom);
               ctx.lineWidth = 2;
               ctx.strokeStyle = 'rgb(89, 46, 128)';
               ctx.stroke();
               ctx.restore();
           });
       } else 
       if (labelCount >= 9) { 
           // 3 technologies: draw lines at tick 3 and tick 6
           var x1 = xAxis.getPixelForTick(3) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;
           var x2 = xAxis.getPixelForTick(6) - (xAxis.width / (xAxis.ticks.length - 1)) / 2.25;

           [x1, x2].forEach(x => {
               ctx.save();
               ctx.beginPath();
               ctx.moveTo(x, chart.chartArea.top);
               ctx.lineTo(x, chart.chartArea.bottom);
               ctx.lineWidth = 2;
               ctx.strokeStyle = 'rgb(89, 46, 128)';
               ctx.stroke();
               ctx.restore();
           });
       } 
       else if (labelCount >= 6) {
           // 2 technologies: draw line at tick 3
           var x = xAxis.getPixelForTick(3)-  (xAxis.width / (xAxis.ticks.length - 1)) / 2.4;

           ctx.save();
           ctx.beginPath();
           ctx.moveTo(x, chart.chartArea.top);
           ctx.lineTo(x, chart.chartArea.bottom);
           ctx.lineWidth = 2;
           ctx.strokeStyle = 'rgb(89, 46, 128)';
           ctx.stroke();
           ctx.restore();
       }
       else {
           // 1 technology: no lines
       }

       // Determine which technologies are visible based on the exact configuration
       var visibleTechnologies = [];
       var technologyPositions = [];
       
       // Get the current card picker selection
       var cardPickerIndex = document.querySelector('#cardPicker') ? document.querySelector('#cardPicker').selectedIndex : 0;
       
       if (cardPickerIndex === 0) {
           // Case 0: All Technologies (FlowTriever + AC + ST + USAT)
           // FlowTriever: positions 0-2, Anticoagulation: positions 3-5, Systemic Thrombolysis: positions 6-8, USAT: positions 9-11
           visibleTechnologies = ['FlowTriever', 'Anticoagulation', 'Systemic Thrombolysis', 'Ultrasound Assisted Thrombolysis'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
               (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2,
               (xAxis.getPixelForTick(6) + xAxis.getPixelForTick(8)) / 2,
               (xAxis.getPixelForTick(9) + xAxis.getPixelForTick(11)) / 2
           ];
       } else if (cardPickerIndex === 1) {
           // Case 1: FlowTriever + Anticoagulation
           visibleTechnologies = ['FlowTriever', 'Anticoagulation'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
               (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2
           ];
       } else if (cardPickerIndex === 2) {
           // Case 2: FlowTriever + Systemic Thrombolysis
           visibleTechnologies = ['FlowTriever', 'Systemic Thrombolysis'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
               (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2
           ];
       } else if (cardPickerIndex === 3) {
           // Case 3: FlowTriever + Ultrasound Assisted Thrombolysis
           visibleTechnologies = ['FlowTriever', 'Ultrasound Assisted Thrombolysis'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2,
               (xAxis.getPixelForTick(3) + xAxis.getPixelForTick(5)) / 2
           ];
       } else if (cardPickerIndex === 4) {
           // Case 4: FlowTriever only - positions 0-2 (3 columns)
           visibleTechnologies = ['FlowTriever'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
           ];
       } else if (cardPickerIndex === 5) {
           // Case 5: Anticoagulation only - positions 0-2 (3 columns)
           visibleTechnologies = ['Anticoagulation'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
           ];
       } else if (cardPickerIndex === 6) {
           // Case 6: Systemic Thrombolysis only - positions 0-2 (3 columns)
           visibleTechnologies = ['Systemic Thrombolysis'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
           ];
       } else if (cardPickerIndex === 7) {
           // Case 7: Ultrasound Assisted Thrombolysis only - positions 0-2 (3 columns)
           visibleTechnologies = ['Ultrasound Assisted Thrombolysis'];
           technologyPositions = [
               (xAxis.getPixelForTick(0) + xAxis.getPixelForTick(2)) / 2
           ];
       }

       // Draw centered category labels for visible technologies
       
       if (visibleTechnologies.length > 0) {
           ctx.save();
           ctx.font = 'bold 12px Arial';
           ctx.fillStyle = '#000000';
           ctx.textAlign = 'center';
           
           visibleTechnologies.forEach((label, index) => {
               var y = chart.chartArea.bottom + 60; // Position below the x-axis
               // Only draw if position is within chart bounds
               if (technologyPositions[index] >= chart.chartArea.left && technologyPositions[index] <= chart.chartArea.right) {
                   ctx.fillText(label, technologyPositions[index], y);
               }
           });
           ctx.restore();
       }
    }
}

});


/// MAIN STATE


// 0 is High
// 1 is Int-High
// 2 is High and Int-High

var FlowTriever = {
    FlowTrieverSystemPPP: 7200,
    OtherMaterialCosts: 350,
    CostOfFibrinolytics: 300,

    CostPerProcedure: 650,
    CostPerAnnum: 99890,

    // aikido - add references here
    CostOfBleedingEvents: {
        HighRiskPE: {
            PercentWithMajorBleedingEvents: .113,
            PercentWithMajorBleedingEvents_ref: "Silver MJ, et al. FLAME Study. Circ Cardiovasc Interv. 2023 Oct;16(10):e013406.",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            PercentWithMinorBleedingEvents: 0.025,
            PercentWithMinorBleedingEvents_ref: "Weighted mean of 2 studies: Graif, et al. (2020), and Markovitz, et al. (2020).",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 588,
            TotalContingentCostPerAnnum: 0

        },
        IntermediateHighRisk: {
            PercentWithMajorBleedingEvents: .023,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 10 studies: Toma, et al. (2023), Luedemann, et al. (2022), Pizano, et al. (2021), Tu, et al. (2019), Wible, et al. (2019), Inci, et al. (2023), Elmoghrabi, et al. (2023), Toma, et al. (2020), Graif, et al. (2020), and Markovitz, et al. (2020).",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Rollover reference: Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            PercentWithMinorBleedingEvents: 0.025,
            PercentWithMinorBleedingEvents_ref: "Weighted mean of 2 studies: Graif, et al. (2020), and Markovitz, et al. (2020).",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            MeanCostsPerProcedureForBleeding: 125,
            TotalContingentCostPerAnnum: 0
        },
        HighRiskIntHighRiskPE: {
            PercentWithMajorBleedingEvents: .023,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 10 studies:Toma, et al. (2023), Luedemann, et al. (2022), Pizano, et al. (2021), Tu, et al. (2019), Wible, et al. (2019), Inci, et al. (2023), Elmoghrabi, et al. (2023), Toma, et al. (2020), Graif, et al. (2020), and Markovitz, et al. (2020).",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            PercentWithMinorBleedingEvents: 0.025,
            PercentWithMinorBleedingEvents_ref: "Weighted mean of 2 studies: Graif, et al. (2020), and Markovitz, et al. (2020).",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            MeanCostsPerProcedureForBleeding: 125,

        }
    },

    CostsOfHospitalReadmissions: {
        HighRiskPE: {
            ThirtyDayReadmissionRate: 0.085,
            ThirtyDayReadmissionRate_ref: "Horowitz JM, et al, J Soc Cardiovasc Angiogr Interv. 2023 Oct 31;3(1):101124. ",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 284,
            TotalContingentCostPerAnnum: 0
        },
        IntermediateHighRisk: {
            ThirtyDayReadmissionRate: 0.065,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 3 studies: Toma, et al. (2023), Graif, et al. (2020), and Buckley, et al. (2022).",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 217,
            TotalContingentCostPerAnnum: 0
        },
        HighRiskIntHighRiskPE: {
            ThirtyDayReadmissionRate: 0.065,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 3 studies: Toma, et al. (2023), Graif, et al. (2020), and Buckley, et al. (2022).",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 217,
            TotalContingentCostPerAnnum: 0
        }
    },

    CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime: {
        TimeMinutesDays: 73.9,
        TimeMinutesDays_ref: "Weighted mean of 7 studies: Toma, et al. (2023), Luedemann, et al. (2022), Pizano, et al. (2021), Yasin, et al. (2020), Tu, et al. (2019), Wible, et al. (2019), and Graif, et al. (2020).",
        PercentVariable: 0.38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        CostPerMinPerDay: 23.46,
        PerProcedureCost: 658.80,
        PerAnnumCost: 101243
    },

    CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime: {
        PercentageOfPatients: 0.0250,
        PercentageOfPatients_ref: "Weighted mean of 3 studies: Toma, et al. (2023), Luedemann, et al. (2022), and Pizano, et al. (2021).",
        TimeMinutesDays: 69.9,
        TimeMinutesDays_ref: "Noman A. Am J Cardiol. 2024 Aug 15;225:178-189. ",
        PercentVariable: 0.38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        CostPerMinPerDay: 23.46,
        PerProcedureCost: 15.58,
        PerAnnumCost: 2394
    },
    CostOfIntensiveCareUnitICUStay: {
        PercentageOfPatients: 0.457, // ask brian
        PercentageOfPatients_ref: "Weighted mean of 8 studies: Toma, et al. (2023), Pizano, et al. (2021), Yasin, et al. (2020), Tu, et al. (2019), Wible, et al. (2019), Inci, et al. (2023), Elmoghrabi, et al. (2023), and Graif, et al. (2020).",
        TimeMinutesDays: 1.4,
        TimeMinutesDays_ref: "Weighted mean of 7 studies: Toma, et al. (2023), Luedemann, et al. (2022), Tu, et al. (2019), Inci, et al. (2023), Graif, et al. (2020), Markovitz, et al. (2020),  and Buckley, et al. (2022).",
        PercentVariable: 1,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        CostPerMinPerDay: 1771.01,
        CostPerMinPerDay_ref: "Weighted mean of 3 studies (inflation adjusted to 2024 Euros) Tan S, et al. Crit Care 12 (Suppl 2), P526 (2008)., Tan SS, Value Health. 2012 Jan;15(1):81-6., and Martin J, et al. Anaesthesist 57, 505–512 (2008). ",
        PerProcedureCost: 430.58,
        PerAnnumCost: 66169
    },

    CostOfHospitalStay: {
        TimeMinutesDays: 3.9,
        TimeMinutesDays_ref: "Weighted mean of 9 studies: Toma, et al. (2023), Luedemann, et al. (2022), Pizano, et al. (2021), Tu, et al. (2019), Elmoghrabi, et al. (2023), Toma, et al. (2020), Graif, et al. (2020), Markovitz, et al. (2020), and Buckley, et al. (2022). ",
        PercentVariable: 0.2,
        CostPerMinPerDay: 496.88,
        PerProcedureCost: 387.57,
        PerAnnumCost: 59560
    },


    DRGProceedsPerProcedure: 100,
    DRGProceedsPerAnnum: 100,
    CMIReturnPerProcedure: 100,
    CMIReturnPerAnnum: 100,

    Proceeds: {
        Euro: {
            Baserate: 4400,
            DRG: "E05C",
            CostWeightBaseRate: 2.239,
            FederalBaseCaseValue: 9852,
            LimitDwellTime: "3 / 9 / 18"
        },
        CHF: {
            Baserate: 10000,
            DRG: "E05B",
            CostWeightBaseRate: 1.721,
            FederalBaseCaseValue: 17210,
            LimitDwellTime: "2 / 6,8 / 14"
        }
    }


}

var Anticoagulation = {
    CostOfFibrinolytics: 673,
    OtherMaterialCosts: 50,
    OtherMedicationPharmaceuticalProducts: 300,

    CostPerProcedure: 1023,
    CostPerAnnum: 157211,

    CostOfBleedingEvents: {
        HighRiskPE: {
            PercentWithMajorBleedingEvents: .179,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 3 studies: Silver MJ, et al. Journal of the Society for Cardiovascular Angiography & Interventions, Volume 2, Issue 1, 100548., Mohr K, et al. Clin Res Cardiol. 2024 Apr 2., and Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0. ",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.043,
            PercentWithMinorBleedingEvents_ref: "Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            MeanCostsPerProcedureForBleeding: 19644
        },
        IntermediateHighRisk: {
            PercentWithMajorBleedingEvents: .038,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 3 studies: Patel AB, et al. Blood. 2 November 2023 | Volume 142, Number Supplement 1. 2644–2645., Mudrakola HV, et al. J Thromb Thrombolysis. 2022 Jul;54(1):145-152., and Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0. ",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.004,
            PercentWithMinorBleedingEvents_ref: "Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            MeanCostsPerProcedureForBleeding: 23642
        },
        HighRiskIntHighRiskPE: {
            PercentWithMajorBleedingEvents: .069,
            PercentWithMajorBleedingEvents_ref: "Silver MJ. Journal of the Society for Cardiovascular Angiography & Interventions, Volume 2, Issue 1,100548.",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.012,
            PercentWithMinorBleedingEvents_ref: "Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            MeanCostsPerProcedureForBleeding: 54790
        }
    },

    CostsOfHospitalReadmissions: {
        HighRiskPE: {
            ThirtyDayReadmissionRate: 0.24,
            ThirtyDayReadmissionRate_ref: "Mohr K, et al. European Heart Journal - Quality of Care and Clinical Outcomes, 2024;, qcae050.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 26791
        },
        IntermediateHighRisk: {
            ThirtyDayReadmissionRate: 0.13,
            ThirtyDayReadmissionRate_ref: "Buckley JR, et al. J Intensive Care Med. 2022 Jul;37(7):877-882.  ",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 52242
        },
        HighRiskIntHighRiskPE: {
            ThirtyDayReadmissionRate: 0.154,
            ThirtyDayReadmissionRate_ref: "Mohr K, et al. European Heart Journal - Quality of Care and Clinical Outcomes, 2024;, qcae050. and Buckley JR, et al. J Intensive Care Med. 2022 Jul;37(7):877-882.  ",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 79092
        }
    },

    TotalContingentCostPerAnnum: 20,
    TotalDeviceAndContingentCostPerAnnum: 2000,

    NursingPharmacistCostsForAnticoagulantTreatment: {
        ACStaffingHoursPerDay: 2,
        DaysOnAnticoagulation: 8.9,
        DaysOnAnticoagulation_ref: "Weighted mean of 5 studies:: Kostev K,et al. J Thromb Thrombolysis. 2024 Oct;57(7):1154-1162., de Miguel-Díez J, et al. Eur Respir J. 2014 Oct;44(4):942-50., Mudrakola HV,et al. J Thromb Thrombolysis. 2022 Jul;54(1):145-152., Mohr K, et al. Clin Res Cardiol. 2024 Apr 2., and Valerio L, et al, The FOCUS study. Eur Heart J. 2022 Sep 21;43(36):3387-3398. ",
        HourlyRate: 29.03,
        HourlyRate_ref: "SalaryExpert.com",
        PercentVariable: .38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        ACStaffingCostPerProcedure: 196.36,
        ACStaffingCostPerAnnumCost: 30176
    },

    PhysicianSpecialistCostsForAnticoagulantTreatment: {
        ACStaffingHoursPerDay: 0.5,
        DaysOnAnticoagulation: 8.9,
        DaysOnAnticoagulation_ref: "Weighted mean of 5 studies:: Kostev K,et al. J Thromb Thrombolysis. 2024 Oct;57(7):1154-1162., de Miguel-Díez J, et al. Eur Respir J. 2014 Oct;44(4):942-50., Mudrakola HV,et al. J Thromb Thrombolysis. 2022 Jul;54(1):145-152., Mohr K, et al. Clin Res Cardiol. 2024 Apr 2., and Valerio L, et al, The FOCUS study. Eur Heart J. 2022 Sep 21;43(36):3387-3398. ",
        HourlyRate: 115.22,
        HourlyRate_ref: "SalaryExpert.com",
        PercentVariable: .38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        ACStaffingCostPerProcedure: 194.84,
        ACStaffingCostPerAnnumCost: 29942
    },


    CostOfIntensiveCareUnitICUStay: {
        PercentageOfPatients: 0.19,
        PercentageOfPatients_ref: "Weighted mean of 2 studies: Mohr K, et al. Clin Res Cardiol. 2024 Apr 2., and Millington SJ, et al. Intensive Care Med. 2024 Feb;50(2):195-208.",
        TimeDays: 5.7,
        TimeDays_ref: "Mudrakola HV, et al. J Thromb Thrombolysis. 2022 Jul;54(1):145-152",
        PercentVariable: 0.38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        CostPerMinPerDay: 1771.01,
        CostPerMinPerDay_ref: "Weighted mean of 3 studies (inflation adjusted to 2024 Euros) Tan S, et al. Crit Care 12 (Suppl 2), P526 (2008)., Tan SS, Value Health. 2012 Jan;15(1):81-6., and ",
        PerProcedureCost: 728.84,
        PerAnnumCost: 112006
    },

    CostOfHospitalStay: {
        TimeDays: 8.9,
        TimeDays_ref: "Weighted mean of 5 studies: Kostev K,et al. J Thromb Thrombolysis. 2024 Oct;57(7):1154-1162., de Miguel-Díez J, et al. Eur Respir J. 2014 Oct;44(4):942-50., Mudrakola HV,et al. J Thromb Thrombolysis. 2022 Jul;54(1):145-152., Mohr K, et al. Clin Res Cardiol. 2024 Apr 2., and Valerio L, et al, The FOCUS study. Eur Heart J. 2022 Sep 21;43(36):3387-3398. ",
        PercentVariable: 0.2,
        CostPerMinPerDay: 496.88,
        CostPerMinPerDay_ref: "Zwerwer L.R, et al. Health Econ Rev 14, 4 (2024).",
        PerProcedureCost: 884.45,
        PerAnnumCost: 135919
    },

    DRGProceedsPerProcedure: 100,
    DRGProceedsPerAnnum: 100,
    CMIReturnPerProcedure: 100,
    CMIReturnPerAnnum: 100,

    Proceeds: {
        Euro: {
            Baserate: 4400,
            DRG: "E64A",
            CostWeightBaseRate: 1.008,
            FederalBaseCaseValue: 4435,
            LimitDwellTime: "3 / 8,1 / 16"
        },
        CHF: {
            Baserate: 10000,
            DRG: "E87B",
            CostWeightBaseRate: 1.083,
            CostWeightBaseRate_Alt: 1.597,
            FederalBaseCaseValue: 10830,
            LimitDwellTime: "2 / 6 / 12"
        }
    }

}


var SystemicThrombolysis = {
    CostOfFibrinolytics: 1468,
    OtherMaterialCosts: 100,
    OtherMedicationPharmaceuticalProducts: 300,

    CostPerProcedure: 1868,
    CostPerAnnum: 287068,

    CostOfBleedingEvents: {
        CurrentPerProcedureCost: 0,
        CurrentPerAnnumCost: 0,
        HighRiskPE: {
            PercentWithMajorBleedingEvents: .261,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 4 studies: Avgerinos ED, et al. J Vasc Surg Venous Lymphat Disord. 2018 Jul;6(4):425-432., Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0., Furdyna A, et al. Folia Med Cracov. 2018;58(4):75-83.  and Kuebel D, et al. J Thromb Thrombolysis. 2023 Apr;55(3):545-552. ",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.022,
            PercentWithMinorBleedingEvents_ref: "Liang NL, et al. J Vasc Surg Venous Lymphat Disord. 2017 Mar;5(2):171-176.e1. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 1349,
            TotalContingentCostPerAnnum: 2
        },
        IntermediateHighRisk: {
            PercentWithMajorBleedingEvents: .081,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 4 studies: Avgerinos ED, et al. J Vasc Surg Venous Lymphat Disord. 2018 Jul;6(4):425-432., Patel AB, et al. Blood. 2 November 2023 | Volume 142, Number Supplement 1. 2644–2645., Kuebel D, et al. J Thromb Thrombolysis. 2023 Apr;55(3):545-552., and Meyer G, et al. N Engl J Med. 2014 Apr 10;370(15):1402-11. ",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.016,
            PercentWithMinorBleedingEvents_ref: "Patel AB, et al. Blood. 2 November 2023 | Volume 142, Number Supplement 1. 2644–2645., and Chatterjee S, et al. JAMA 311(23):2414–242.",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 421,
            TotalContingentCostPerAnnum: 2
        },
        HighRiskIntHighRiskPE: {
            PercentWithMajorBleedingEvents: .12,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 6 studies: Calé, et al. (2022), Sista, et al. (2021), Araszkiewicz, et al. (2020), De Gregorio, et al. (2019), Ciampi-Dopazo, et al. (2018), and Al-Hakim, et al. (2017).",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.017,
            PercentWithMinorBleedingEvents_ref: "Secemsky E, et al. Am J Med. 2018 Dec;131(12):1506-1514.e0. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 623,
            TotalContingentCostPerAnnum: 2
        }
    },

    CostsOfHospitalReadmissions: {
        HighRiskPE: {
            ThirtyDayReadmissionRate: 0.103,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 2 stuides; Arora S, et al. Am J Cardiol. 2017 Nov 1;120(9):1653-1661., and Wahood W, et al, Journal of Vascular and Interventional Radiology, Volume 34, Issue 1, 116 - 123.e14.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 344
        },
        IntermediateHighRisk: {
            ThirtyDayReadmissionRate: 0.103,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 2 stuides; Arora S, et al. Am J Cardiol. 2017 Nov 1;120(9):1653-1661., and Wahood W, et al, Journal of Vascular and Interventional Radiology, Volume 34, Issue 1, 116 - 123.e14.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 344
        },
        HighRiskIntHighRiskPE: {
            ThirtyDayReadmissionRate: 0.103,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 2 stuides; Arora S, et al. Am J Cardiol. 2017 Nov 1;120(9):1653-1661., and Wahood W, et al, Journal of Vascular and Interventional Radiology, Volume 34, Issue 1, 116 - 123.e14.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 344
        }
    },

    TotalContingentCostPerAnnum: 20,
    TotalDeviceAndContingentCostPerAnnum: 2000,

    NursingPharmacistCostsForAnticoagulantTreatment: {
        STStaffingHoursPerDay: 4,
        DaysOnSystemicLysis: 2,
        DaysOnSystemicLysis_ref: "Macovei L, et al. Clin Appl Thromb Hemost. 2020 Jan-Dec;26:1076029620929764.",
        HourlyRate: 29.03,
        HourlyRate_ref: "SalaryExpert.com",
        PercentVariable: .38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        STStaffingCostPerProcedure: 88.25,
        STStaffingCostPerAnnumCost: 13562
    },

    PhysicianSpecialistCostsForAnticoagulantTreatment: {
        STStaffingHoursPerDay: 2,
        DaysOnSystemicLysis: 2,
        DaysOnSystemicLysis_ref: "Macovei L, et al. Clin Appl Thromb Hemost. 2020 Jan-Dec;26:1076029620929764.",
        HourlyRate: 115.22,
        HourlyRate_ref: "SalaryExpert.com",
        PercentVariable: .38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        STStaffingCostPerProcedure: 175.83,
        STStaffingCostPerAnnumCost: 26914
    },


    CostOfIntensiveCareUnitICUStay: {
        PercentageOfPatients: 1,
        TimeDays: 5.3,
        TimeDays_ref: "Weighted mean of 2 studies: Sista AK, et al. Vasc Med. 2018 Feb;23(1):65-71. and Aller A, et al. Crit Care. 2011;15(Suppl 1):P16. ",
        PercentVariable: 0.38,
        PercentVariable_ref: "Moerer O et al. A German national prevalence study on the cost of intensive care: an evaluation from 51 intensive care units. Crit Care. 2007;11(3):R69. ",
        CostPerMinPerDay: 1771.01,
        CostPerMinPerDay_ref: "Weighted mean of 3 studies (inflation adjusted to 2024 Euros) Tan S, et al. Crit Care 12 (Suppl 2), P526 (2008)., Tan SS, Value Health. 2012 Jan;15(1):81-6., and Martin J, et al. Anaesthesist 57, 505–512 (2008). ",
        PerProcedureCost: 728.84,
        PerAnnumCost: 112006
    },

    CostOfHospitalStay: {
        TimeDays: 7,
        TimeDays_ref: "Weighted mean of 2 studies: Sista AK, et al. Vasc Med. 2018 Feb;23(1):65-71., and Mohr K, et al. Clin Res Cardiol. 2024 Apr 2. ",
        PercentVariable: 0.2,
        CostPerMinPerDay: 496.88,
        CostPerMinPerDay_ref: "Zwerwer L.R, et al. Health Econ Rev 14, 4 (2024).",
        PerProcedureCost: 884.45,
        PerAnnumCost: 135919
    },

    DRGProceedsPerProcedure: 100,
    DRGProceedsPerAnnum: 100,
    CMIReturnPerProcedure: 100,
    CMIReturnPerAnnum: 100,

    Proceeds: {
        Euro: {
            Baserate: 4400,
            DRG: "E64A",
            CostWeightBaseRate: 1.008,
            FederalBaseCaseValue: 4435,
            LimitDwellTime: "3 / 8,1 / 16"
        },
        CHF: {
            Baserate: 10000,
            DRG: "E87B",
            CostWeightBaseRate: 1.083,
            CostWeightBaseRate_Alt: 1.597,
            FederalBaseCaseValue: 10830,
            LimitDwellTime: "2 / 6 / 12"
        }
    }

}

var UltrasoundAssistedThrombolysis = {
    EKOSSystemPPP: 2800,
    ControlUnitCostPerEpisode: 35,
    CostOfFibrinolytics: 742.95,

    CostPerProcedure: 3578,
    CostPerAnnum: 116672,

    CostOfBleedingEvents: {
        CurrentPerProcedureCost: 0,
        CurrentPerAnnumCost: 0,
        HighRiskPE: {
            PercentWithMajorBleedingEvents: .303,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 3 studies: Wessinger M, et al. Clin Res Cardiol. 2025 May 19., Kaymaz C, et al. Curr Vasc Pharmacol. 2022;20:370-378., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604.  ",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.085,
            PercentWithMinorBleedingEvents_ref: "Weighted mean of 3 studies: Kaymaz C, et al. Curr Vasc Pharmacol. 2022;20:370-378., Kucher N, et al. Circulation. 2014 Jan 28;129(4):479-86., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604.",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 1349,
            TotalContingentCostPerAnnum: 2
        }, 
        IntermediateHighRisk: {
            PercentWithMajorBleedingEvents: .204,
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 3 studies: Kaymaz C, et al. Curr Vasc Pharmacol. 2022;20:370-378., Kucher N, et al. Circulation. 2014 Jan 28;129(4):479-86., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604.",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.093,
            PercentWithMinorBleedingEvents_ref: "Weighted mean of 3 studies: Kaymaz C, et al. Curr Vasc Pharmacol. 2022;20:370-378., Kucher N, et al. Circulation. 2014 Jan 28;129(4):479-86., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 421,
            TotalContingentCostPerAnnum: 2
        },
        HighRiskIntHighRiskPE: {
            PercentWithMajorBleedingEvents: .226, // varibale
            PercentWithMajorBleedingEvents_ref: "Weighted mean of 4 studies:Wessinger M, et al. Clin Res Cardiol. 2025 May 19.,  Kaymaz C,et al. Curr Vasc Pharmacol. 2022;20:370-378., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604., Kucher N, et al. Circulation. 2014 Jan 28;129(4):479-86.",
            CostPerMajorBleedingEvent: 5145.22,
            CostPerMajorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PercentWithMinorBleedingEvents: 0.091,
            PercentWithMinorBleedingEvents_ref: "Weighted mean of 4 studies: Wessinger M, et al. Clin Res Cardiol. 2025 May 19.,  Kaymaz C,et al. Curr Vasc Pharmacol. 2022;20:370-378., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604., Kucher N, et al. Circulation. 2014 Jan 28;129(4):479-86.. ",
            CostPerMinorBleedingEvent: 264.04,
            CostPerMinorBleedingEvent_ref: "Farmakis IT. J Am Heart Assoc. 2022 Oct 18;11(20):e027514.",
            MeanCostsPerProcedureForBleeding: 623,
            TotalContingentCostPerAnnum: 2
        }
    },

    CostsOfHospitalReadmissions: {
        HighRiskPE: {
            ThirtyDayReadmissionRate: 0.099,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 2 stuides; Kennedy RJ, et al. J Vasc Interv Radiol. 2013 Jun;24(6):841-8.,  Robles KE, et al. Innovations (Phila). 2022 Jan-Feb;17(1):30-36.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 331
        },
        IntermediateHighRisk: {
            ThirtyDayReadmissionRate: 0.099,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 2 stuides; Kennedy RJ, et al. J Vasc Interv Radiol. 2013 Jun;24(6):841-8.,  Robles KE, et al. Innovations (Phila). 2022 Jan-Feb;17(1):30-36.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 331
        },
        HighRiskIntHighRiskPE: {
            ThirtyDayReadmissionRate: 0.099,
            ThirtyDayReadmissionRate_ref: "Weighted mean of 2 stuides; Kennedy RJ, et al. J Vasc Interv Radiol. 2013 Jun;24(6):841-8.,  Robles KE, et al. Innovations (Phila). 2022 Jan-Feb;17(1):30-36.",
            ThirtyDayReadmissionCosts: 3341.33,
            ThirtyDayReadmissionCosts_ref: "Weighted mean of 2 studies: Mohr K. Eur Heart J Qual Care Clin Outcomes. 2024 Jul 1:qcae050., and Farmakis IT, et al. PREFER in VTE Registry. J Am Heart Assoc. 2022 Oct 18;11(20):e027514. ",
            PerProcedure30DayReadmissionCost: 331
        }
    },

    TotalContingentCostPerAnnum: 20,
    TotalDeviceAndContingentCostPerAnnum: 2000,

    

    CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime: {
        TimeMinutesDays: 53.8,
        TimeMinutesDays_ref: "Weighted mean of 4 studies: Robles KE, et al. Innovations (Phila). Jan-Feb 2022;17:30-36., Graif A, et al. J Vasc Interv Radiol. Oct 2017;28:1339-1347., Kucher N, et al.Circulation. Jan 28 2014;129:479-486.,  Graif A, et al. Journal of Vascular and Interventional Radiology. 2020;31:2052-2059.",
        PercentVariable: 1,
        PercentVariable_ref: "",
        CostPerMinPerDay: 23.46,
        PerProcedureCost: 15.58,
        PerAnnumCost: 2394
    },
    CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime: {
        PercentageOfPatients: 0.0380,
        PercentageOfPatients_ref: "Graif A. Journal of Vascular and Interventional Radiology. 2020;31:2052-2059.",
        TimeMinutesDays: 53.8,
        TimeMinutesDays_ref: "Weighted mean of 4 studies: Robles KE, et al. Innovations (Phila). Jan-Feb 2022;17:30-36., Graif A, et al. J Vasc Interv Radiol. Oct 2017;28:1339-1347., Kucher N, et al.Circulation. Jan 28 2014;129:479-486.,  Graif A, et al. Journal of Vascular and Interventional Radiology. 2020;31:2052-2059.",
        PercentVariable: 1,
        PercentVariable_ref: "",     
        CostPerMinPerDay: 23.46,
        PerProcedureCost: 15.58,
        PerAnnumCost: 2394
    },


    CostOfIntensiveCareUnitICUStay: {
        PercentageOfPatients: 1,
        PercentageOfPatients_ref: "Weighted mean of 3 studies: Klein F, et al. Canadian Respiratory Journal. 2022;2022:1-9., Visco E, et al. J Cardiovasc Med (Hagerstown). 2019 Mar;20(3):131-136., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604.",
        TimeMinutesDays: 2.7,
        TimeMinutesDays_ref: "Weighted mean of 4 studies: Klein F, et al. Can Respir J. 2022 Feb 27;2022:7135958., Wessinger M, et al. Clin Res Cardiol. 2025 May 19., Elhakim A, et al. Adv Respir Med. 2022 Nov 23;90(6):483-499., Engelberger RP, et al. Eur Heart J. 2015 Mar 7;36(10):597-604.",
        PercentVariable: 1,
        PercentVariable_ref: "",     
        CostPerMinPerDay: 1771.01,
        CostPerMinPerDay_ref: "Weighted mean of 3 studies (inflation adjusted to 2024 Euros): Tan S, et al. Crit Care 12 (Suppl 2), P526 (2008)., Tan SS, Value Health. 2012 Jan;15(1):81-6., and Martin J, et al. Anaesthesist 57, 505–512 (2008). ",
        PerProcedureCost: 15.58,
        PerAnnumCost: 2394
    },

    CostOfHospitalStay: {
        TimeMinutesDays: 7.1,
        TimeMinutesDays_ref: "Weighted mean of 5 studies: Kucher N, et al. Circulation. 2014 Jan 28;129(4):479-86., Klein F, et al. Can Respir J. 2022 Feb 27;2022:7135958., Elhakim A,et al. Clin Res Cardiol. 2025 May 19. ,Voci D, et al. Viruses. 2022 Jul 22;14(8):1606., Wessinger M, et al. Clin Res Cardiol. 2025 May 19.",
        PercentVariable: 1,
        CostPerMinPerDay: 496.88,
        CostPerMinPerDay_ref: "Zwerwer L.R, et al. Health Econ Rev 14, 4 (2024).",
        PerProcedureCost: 884.45,
        PerAnnumCost: 135919
    },

    // sexy

    DRGProceedsPerProcedure: 100,
    DRGProceedsPerAnnum: 100,
    CMIReturnPerProcedure: 100,
    CMIReturnPerAnnum: 100,

    Proceeds: {
        Euro: {
            Baserate: 4400,
            DRG: "E02A",
            CostWeightBaseRate: 2.461,
            FederalBaseCaseValue: 4435,
            LimitDwellTime: "5 / 14,3 / 29"
        },
        CHF: {
            Baserate: 4400,
            DRG: "E02A",
            CostWeightBaseRate: 2.461,
            CostWeightBaseRate_Alt: 1.597,
            FederalBaseCaseValue: 10830,
            LimitDwellTime: "5 / 14,3 / 29"
        }
    }

}



function getMultiplier() {
    var multiplier = 1;

    if (whichCost == "PerProcedureCosts") {
        multiplier = 1;
    } else {
        multiplier = AnnualIntermediateHighRiskPEPatients;
    }
    return multiplier;


}

updateValues();

function updateProceeds() {

}

function recalcAnnualHighRiskPEPatients() {

   // if (AnnualHighRiskPEPatients_changed == false) {
        AnnualHighRiskPEPatients = (HospitalSize * AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed) * (ProportionOfPatientsWithHighRiskPE / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE))
        $('#AnnualHighRiskPEPatients').val(AnnualHighRiskPEPatients);
    //}

}

function recalcAnnualIntermediateHighRiskPEPatients() {
    //if (AnnualIntermediateHighRiskPEPatients_changed == false) {
        AnnualIntermediateHighRiskPEPatients = (HospitalSize * AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed) * (ProportionOfPatientsWithIntHighRiskPE / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE))
        $('#AnnualIntermediateHighRiskPEPatients').val(AnnualIntermediateHighRiskPEPatients);



    //}
}

function  recalcProportionOfPatientsWithHighRiskPE() {

  ProportionOfPatientsWithHighRiskPE = (AnnualHighRiskPEPatients * ProportionOfPatientsWithIntHighRiskPE) / ((HospitalSize * AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed) - AnnualHighRiskPEPatients);
 $('#ProportionOfPatientsWithHighRiskPE').val(ProportionOfPatientsWithHighRiskPE * 100);
}

function recalcProportionOfPatientsWithIntHighRiskPE() {
  ProportionOfPatientsWithIntHighRiskPE = (AnnualIntermediateHighRiskPEPatients * ProportionOfPatientsWithHighRiskPE) / ((HospitalSize * AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed) - AnnualIntermediateHighRiskPEPatients);
   $('#ProportionOfPatientsWithIntHighRiskPE').val(ProportionOfPatientsWithIntHighRiskPE * 100);
}


function recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed() {
     AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed = AnnualPERelatedHospitalisations2020 / TotalNumberOfHospitalBedsInGermany2023;
    $('#AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed').val(AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed);

 /*   recalcAnnualHighRiskPEPatients()
    recalcAnnualIntermediateHighRiskPEPatients();
    recalcProportionOfPatientsWithHighRiskPE();
    recalcProportionOfPatientsWithIntHighRiskPE();*/
}

function recalcAnnualPERelatedHospitalisations2020() {
    AnnualPERelatedHospitalisations2020 = AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed * TotalNumberOfHospitalBedsInGermany2023;
    $('#AnnualPERelatedHospitalisations2020').val(AnnualPERelatedHospitalisations2020);
    recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed();
}


 
function updateValues() {

    var currentRisk;
    var currentRiskString;
    switch (whichPERisk) {
        case 0:
            currentRisk = AnnualHighRiskPEPatients;
            currentRiskString = "HighRiskPE";
            break;
        case 1:
            currentRisk = AnnualIntermediateHighRiskPEPatients;
            currentRiskString = "IntermediateHighRisk";
            break;
        case 2:
            currentRisk = AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients;
            currentRiskString = "HighRiskIntHighRiskPE";
            break;
        default:
            break;
    }

    // new one 

    $('.UltrasoundAssistedThrombolysis_EKOSSystemPPP').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.EKOSSystemPPP.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    $('.UltrasoundAssistedThrombolysis_ControlUnitCostPerEpisode').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.ControlUnitCostPerEpisode.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    $('.UltrasoundAssistedThrombolysis_CostOfFibrinolytics').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfFibrinolytics.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    UltrasoundAssistedThrombolysis.CostPerProcedure = UltrasoundAssistedThrombolysis.EKOSSystemPPP + UltrasoundAssistedThrombolysis.ControlUnitCostPerEpisode + UltrasoundAssistedThrombolysis.CostOfFibrinolytics;
    UltrasoundAssistedThrombolysis.CostPerAnnum = UltrasoundAssistedThrombolysis.CostPerProcedure * currentRisk;
 
    if (whichCostIdx == 0) {
        $('.UltrasoundAssistedThrombolysis_TechnologyTotal').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostPerProcedure.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    } else {
        $('.UltrasoundAssistedThrombolysis_TechnologyTotal').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostPerAnnum.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent) + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent) + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent);
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent) + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent);
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding * currentRisk;
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;



    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }

    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostOfBleedingEvents.MeanCostsPerProcedureForBleeding * currentRisk;

    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = (UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts);
    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = (UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts);
    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = (UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts);
    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;
    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost * currentRisk;

    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;

   

    
   
    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }

    UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.TotalContingentCostPerAnnum = UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.PerProcedure30DayReadmissionCost * currentRisk;


    var UltrasoundAssistedThrombolysis_TotalDeviceContingent = UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost;
    var UltrasoundAssistedThrombolysis_TotalDeviceContingentAnnum = UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum;

    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.UltrasoundAssistedThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis_TotalDeviceContingent).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.UltrasoundAssistedThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.UltrasoundAssistedThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.UltrasoundAssistedThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.UltrasoundAssistedThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.UltrasoundAssistedThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        case 2:

            if (whichCostIdx == 0) {
                $('.UltrasoundAssistedThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.UltrasoundAssistedThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.UltrasoundAssistedThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.UltrasoundAssistedThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        default:
            break;
    }



    // end new col 4

    // note
    $('.FlowTriever_FlowTrieverSystemPPP').text(currentCurrencyPrefix + FlowTriever.FlowTrieverSystemPPP.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    $('.FlowTriever_OtherMaterialCosts').text(currentCurrencyPrefix + FlowTriever.OtherMaterialCosts.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    $('.FlowTriever_CostOfFibrinolytics').text(currentCurrencyPrefix + FlowTriever.CostOfFibrinolytics.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    FlowTriever.CostPerProcedure = FlowTriever.FlowTrieverSystemPPP + FlowTriever.OtherMaterialCosts + FlowTriever.CostOfFibrinolytics;
    FlowTriever.CostPerAnnum = FlowTriever.CostPerProcedure * currentRisk;
 
    if (whichCostIdx == 0) {
        $('.FlowTriever_TechnologyTotal').text(currentCurrencyPrefix + FlowTriever.CostPerProcedure.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    } else {
        $('.FlowTriever_TechnologyTotal').text(currentCurrencyPrefix + FlowTriever.CostPerAnnum.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    FlowTriever.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = (FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent) + (FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
    FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = (FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent) + (FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent);
    FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = (FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent) + (FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent);
    FlowTriever.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum = FlowTriever.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;
    FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum = FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding * currentRisk;
    FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;

    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.FlowTriever_CostOfBleedingEvents').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.FlowTriever_CostOfBleedingEvents').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.FlowTriever_CostOfBleedingEvents').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.FlowTriever_CostOfBleedingEvents').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.FlowTriever_CostOfBleedingEvents').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.FlowTriever_CostOfBleedingEvents').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }

    FlowTriever.CostOfBleedingEvents.TotalContingentCostPerAnnum = FlowTriever.CostOfBleedingEvents.MeanCostsPerProcedureForBleeding * currentRisk;

    FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = (FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts);
    FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = (FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts);
    FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = (FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts);
    FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum = FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;
    FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum = FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost * currentRisk;

    FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;

   

    
   
    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.FlowTriever_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.FlowTriever_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.FlowTriever_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.FlowTriever_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.FlowTriever_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.FlowTriever_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }

    FlowTriever.CostsOfHospitalReadmissions.TotalContingentCostPerAnnum = FlowTriever.CostsOfHospitalReadmissions.PerProcedure30DayReadmissionCost * currentRisk;


    var FlowTriever_TotalDeviceContingent = FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost;
    var FlowTriever_TotalDeviceContingentAnnum = FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum;

    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.FlowTriever_TotalVariableCosts').text(currentCurrencyPrefix + (FlowTriever.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.FlowTriever_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (FlowTriever_TotalDeviceContingent).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.FlowTriever_TotalVariableCosts').text(currentCurrencyPrefix + (FlowTriever.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.FlowTriever_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.FlowTriever_TotalVariableCosts').text(currentCurrencyPrefix + (FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.FlowTriever_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.FlowTriever_TotalVariableCosts').text(currentCurrencyPrefix + (FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.FlowTriever_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        case 2:

            if (whichCostIdx == 0) {
                $('.FlowTriever_TotalVariableCosts').text(currentCurrencyPrefix + (FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.FlowTriever_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.FlowTriever_TotalVariableCosts').text(currentCurrencyPrefix + (FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.FlowTriever_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        default:
            break;
    }





    FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients * FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').on("change", function(event) {
        calcFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
    })

    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').on("change", function(event) {
        calcFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
    })


    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').on("change", function(event) {
        calcFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
    })

    FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost = FlowTriever.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * FlowTriever.CostOfIntensiveCareUnitICUStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * FlowTriever.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            FlowTriever.CostOfIntensiveCareUnitICUStay.PerAnnumCost = FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            FlowTriever.CostOfIntensiveCareUnitICUStay.PerAnnumCost = FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            FlowTriever.CostOfIntensiveCareUnitICUStay.PerAnnumCost = FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.FlowTriever_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.FlowTriever_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfIntensiveCareUnitICUStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    FlowTriever.CostOfHospitalStay.PerProcedureCost = FlowTriever.CostOfHospitalStay.TimeMinutesDays * PercentageOfCostsVariableGeneralHospitalWard * FlowTriever.CostOfHospitalStay.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            FlowTriever.CostOfHospitalStay.PerAnnumCost = FlowTriever.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            FlowTriever.CostOfHospitalStay.PerAnnumCost = FlowTriever.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            FlowTriever.CostOfHospitalStay.PerAnnumCost = FlowTriever.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.FlowTriever_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfHospitalStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.FlowTriever_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + FlowTriever.CostOfHospitalStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    var FlowTriever_TotalDeviceContingent_TotalCostTotal = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost + FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost + FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost + FlowTriever.CostOfHospitalStay.PerProcedureCost
    var FlowTriever_TotalDeviceContingent_TotalAnnumTotal = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost + FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost + FlowTriever.CostOfIntensiveCareUnitICUStay.PerAnnumCost + FlowTriever.CostOfHospitalStay.PerAnnumCost;
    $('.FlowTriever_TotalCosts').text(currentCurrencyPrefix + (FlowTriever_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);
    $('.FlowTriever_TotalAnnum').text(currentCurrencyPrefix + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)

    if (whichCostIdx == 0) {
        $('.FlowTriever_TotalCostsSubtotal').text(currentCurrencyPrefix + (FlowTriever_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    } else {
        $('.FlowTriever_TotalCostsSubtotal').text(currentCurrencyPrefix + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

   
    switch (whichPERisk) {
        case 0:
            $('.FlowTriever_result').text(currentCurrencyPrefix + ((FlowTriever_TotalDeviceContingent) + (FlowTriever_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.FlowTrieverAnnum_result').text(currentCurrencyPrefix + ((FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum) + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.FlowTriever_result_title').text("FlowTriever Total Cost per Procedure High-Risk");
            $('.FlowTrieverAnnum_result_title').html("FlowTriever Total Cost per Annum High-Risk<br><br>");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")
            break;
        case 1:
            $('.FlowTriever_result').text(currentCurrencyPrefix + ((FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (FlowTriever_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.FlowTrieverAnnum_result').text(currentCurrencyPrefix + ((FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum) + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.FlowTriever_result_title').text("FlowTriever Total Cost per Procedure Int-High Risk");
            $('.FlowTrieverAnnum_result_title').text("FlowTriever Total Cost per Annum Int-High Risk");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")
            break;
        case 2:
            $('.FlowTriever_result').text(currentCurrencyPrefix + ((FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (FlowTriever_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.FlowTrieverAnnum_result').text(currentCurrencyPrefix + ((FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum) + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.FlowTriever_result_title').text("FlowTriever Total Cost per Procedure High-Risk and Int-High Risk");
            $('.FlowTrieverAnnum_result_title').html("FlowTriever Total Cost per Annum High-Risk and Int-High Risk<br><br>");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")

            break;
        default:

            break;
    }

    // new card 4 code

    


    UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients * UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').on("change", function(event) {
        calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
    })

    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').on("change", function(event) {
        calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
    })


    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').on("change", function(event) {
        calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
    })

    UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfHospitalStay.TimeMinutesDays * PercentageOfCostsVariableGeneralHospitalWard * UltrasoundAssistedThrombolysis.CostOfHospitalStay.CostPerMinPerDay;
    switch (whichPERisk) {
        case 0:
            UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerAnnumCost = UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            break;
    }

    if (whichCostIdx == 0) {
        $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    var UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost + UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost + UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost + UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost
    var UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost + UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerAnnumCost + UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost + UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerAnnumCost;
    $('.UltrasoundAssistedThrombolysis_TotalCosts').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);
    $('.UltrasoundAssistedThrombolysis_TotalAnnum').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)

    if (whichCostIdx == 0) {
        $('.UltrasoundAssistedThrombolysis_TotalCostsSubtotal').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    } else {
        $('.UltrasoundAssistedThrombolysis_TotalCostsSubtotal').text(currentCurrencyPrefix + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

   
    switch (whichPERisk) {
        case 0:
            $('.UltrasoundAssistedThrombolysis_result').text(currentCurrencyPrefix + ((UltrasoundAssistedThrombolysis_TotalDeviceContingent) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.UltrasoundAssistedThrombolysisAnnum_result').text(currentCurrencyPrefix + ((UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.UltrasoundAssistedThrombolysis_result_title').text("Ultrasound Assisted Thrombolysis Total Cost per Procedure High-Risk");
            $('.UltrasoundAssistedThrombolysisAnnum_result_title').text("Ultrasound Assisted Thrombolysis Total Cost per Annum High-Risk");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")
            break;
        case 1:
            $('.UltrasoundAssistedThrombolysis_result').text(currentCurrencyPrefix + ((UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.UltrasoundAssistedThrombolysisAnnum_result').text(currentCurrencyPrefix + ((UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.UltrasoundAssistedThrombolysis_result_title').text("Ultrasound Assisted Thrombolysis Total Cost per Procedure Int-High Risk");
            $('.UltrasoundAssistedThrombolysisAnnum_result_title').text("Ultrasound Assisted Thrombolysis Total Cost per Annum Int-High Risk");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")
            break;
        case 2:
            $('.UltrasoundAssistedThrombolysis_result').text(currentCurrencyPrefix + ((UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.UltrasoundAssistedThrombolysisAnnum_result').text(currentCurrencyPrefix + ((UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.UltrasoundAssistedThrombolysis_result_title').text("Ultrasound Assisted Thrombolysis Total Cost per Procedure High-Risk and Int-High Risk");
            $('.UltrasoundAssistedThrombolysisAnnum_result_title').html("Ultrasound Assisted Thrombolysis Total Cost per Annum High-Risk and Int-High Risk<br><br>");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")

            break;
        default:

            break;
    }


    $('.Anticoagulation_CostOfFibrinolytics').text(currentCurrencyPrefix + Anticoagulation.CostOfFibrinolytics.toLocaleString(currentLocaleCode) + currentCurrencySuffix);
    $('.Anticoagulation_OtherMaterialCosts').text(currentCurrencyPrefix + Anticoagulation.OtherMaterialCosts.toLocaleString(currentLocaleCode) + currentCurrencySuffix);
    $('.Anticoagulation_OtherMedicationPharmaceuticalProducts').text(currentCurrencyPrefix + Anticoagulation.OtherMedicationPharmaceuticalProducts.toLocaleString(currentLocaleCode) + currentCurrencySuffix);
    Anticoagulation.CostPerProcedure = Anticoagulation.CostOfFibrinolytics + Anticoagulation.OtherMaterialCosts + Anticoagulation.OtherMedicationPharmaceuticalProducts;
    Anticoagulation.CostPerAnnum = Anticoagulation.CostPerProcedure * currentRisk;

    if (whichCostIdx == 0) {
        $('.Anticoagulation_TechnologyTotal').text(currentCurrencyPrefix + Anticoagulation.CostPerProcedure.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    } else {
        $('.Anticoagulation_TechnologyTotal').text(currentCurrencyPrefix + Anticoagulation.CostPerAnnum.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents = ((Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * ProportionOfPatientsWithHighRiskPE) + ( Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * ProportionOfPatientsWithIntHighRiskPE) ) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);
    Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents = ((Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * ProportionOfPatientsWithHighRiskPE) + ( Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * ProportionOfPatientsWithIntHighRiskPE) ) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);
   
    Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = (Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent) + (Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
    Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = (Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent) + (Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent);
    Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = (Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent) + (Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent);
    Anticoagulation.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum = Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;
    Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum = Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding * currentRisk;
    Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;


    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.Anticoagulation_CostOfBleedingEvents').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.Anticoagulation_CostOfBleedingEvents').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.Anticoagulation_CostOfBleedingEvents').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.Anticoagulation_CostOfBleedingEvents').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.Anticoagulation_CostOfBleedingEvents').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.Anticoagulation_CostOfBleedingEvents').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }





    Anticoagulation.CostOfBleedingEvents.TotalContingentCostPerAnnum = Anticoagulation.CostOfBleedingEvents.MeanCostsPerProcedureForBleeding * currentRisk;

    Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate = ((Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * ProportionOfPatientsWithHighRiskPE) + ( Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * ProportionOfPatientsWithIntHighRiskPE) ) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);
  

    Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = (Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts);
    Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = (Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts);
    Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = (Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts);

    Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum = Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;

    Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum = Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost * currentRisk;

    Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;


    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.Anticoagulation_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.Anticoagulation_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.Anticoagulation_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.Anticoagulation_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.Anticoagulation_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.Anticoagulation_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }

    Anticoagulation.CostsOfHospitalReadmissions.TotalContingentCostPerAnnum = Anticoagulation.CostsOfHospitalReadmissions.PerProcedure30DayReadmissionCost * currentRisk;


    var Anticoagulation_TotalDeviceContingent = Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost;
    var Anticoagulation_TotalDeviceContingentAnnum = Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum;


    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.Anticoagulation_TotalVariableCosts').text(currentCurrencyPrefix + (Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.Anticoagulation_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.Anticoagulation_TotalVariableCosts').text(currentCurrencyPrefix + (Anticoagulation.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.Anticoagulation_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.Anticoagulation_TotalVariableCosts').text(currentCurrencyPrefix + (Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.Anticoagulation_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.Anticoagulation_TotalVariableCosts').text(currentCurrencyPrefix + (Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.Anticoagulation_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        case 2:

            if (whichCostIdx == 0) {
                $('.Anticoagulation_TotalVariableCosts').text(currentCurrencyPrefix + (Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.Anticoagulation_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.Anticoagulation_TotalVariableCosts').text(currentCurrencyPrefix + (Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.Anticoagulation_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        default:
            break;
    }

    Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay * Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnAnticoagulation * Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate * PercentageOfCostsVariableCatheterizationSuiteandICU;
    switch (whichPERisk) {
        case 0:
            Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure * AnnualHighRiskPEPatients;
            break;
        case 1:
            Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay * Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnAnticoagulation * Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate * PercentageOfCostsVariableCatheterizationSuiteandICU;
    switch (whichPERisk) {
        case 0:
            Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure * AnnualHighRiskPEPatients;
            break;
        case 1:
            Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost = Anticoagulation.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * Anticoagulation.CostOfIntensiveCareUnitICUStay.TimeDays * PercentageOfCostsVariableCatheterizationSuiteandICU * Anticoagulation.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;

    switch (whichPERisk) {
        case 0:
            Anticoagulation.CostOfIntensiveCareUnitICUStay.PerAnnumCost = Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            Anticoagulation.CostOfIntensiveCareUnitICUStay.PerAnnumCost = Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            Anticoagulation.CostOfIntensiveCareUnitICUStay.PerAnnumCost = Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + Anticoagulation.CostOfIntensiveCareUnitICUStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    Anticoagulation.CostOfHospitalStay.PerProcedureCost = Anticoagulation.CostOfHospitalStay.TimeDays * PercentageOfCostsVariableGeneralHospitalWard * Anticoagulation.CostOfHospitalStay.CostPerMinPerDay;

    switch (whichPERisk) {
        case 0:
            Anticoagulation.CostOfHospitalStay.PerAnnumCost = Anticoagulation.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            Anticoagulation.CostOfHospitalStay.PerAnnumCost = Anticoagulation.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            Anticoagulation.CostOfHospitalStay.PerAnnumCost = Anticoagulation.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.Anticoagulation_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + Anticoagulation.CostOfHospitalStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.Anticoagulation_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + Anticoagulation.CostOfHospitalStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }
 

//      var Anticoagulation_TotalDeviceContingent_TotalCostTotal = Anticoagulation.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost + Anticoagulation.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost + Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost + Anticoagulation.CostOfHospitalStay.PerProcedureCost
  
    var Anticoagulation_TotalDeviceContingent_TotalCostTotal = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure + Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure + Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost + Anticoagulation.CostOfHospitalStay.PerProcedureCost;
    
    var Anticoagulation_TotalDeviceContingent_TotalAnnumTotal = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost + Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost + Anticoagulation.CostOfIntensiveCareUnitICUStay.PerAnnumCost + Anticoagulation.CostOfHospitalStay.PerAnnumCost;
    $('.Anticoagulation_TotalCosts').text(currentCurrencyPrefix + (Anticoagulation_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);
    $('.Anticoagulation_TotalAnnum').text(currentCurrencyPrefix + (Anticoagulation_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)

    if (whichCostIdx == 0) {
        $('.Anticoagulation_TotalCostsSubtotal').text(currentCurrencyPrefix + (Anticoagulation_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    } else {
        $('.Anticoagulation_TotalCostsSubtotal').text(currentCurrencyPrefix + (Anticoagulation_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    switch (whichPERisk) {
        case 0:
            $('.Anticoagulation_result').text(currentCurrencyPrefix + ((Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost) + (Anticoagulation_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.AnticoagulationAnnum_result').text(currentCurrencyPrefix + (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.Anticoagulation_result_title').text("Anticoagulation Total Cost per Procedure High-Risk");
            $('.AnticoagulationAnnum_result_title').text("Anticoagulation Total Cost per Annum High-Risk");
            break;
        case 1:
            $('.Anticoagulation_result').text(currentCurrencyPrefix + ((Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (Anticoagulation_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.AnticoagulationAnnum_result').text(currentCurrencyPrefix + (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.Anticoagulation_result_title').text("Anticoagulation Total Cost per Procedure Int-High Risk");
            $('.AnticoagulationAnnum_result_title').text("Anticoagulation Total Cost per Annum Int-High Risk");
            break;
        case 2:
            $('.Anticoagulation_result').text(currentCurrencyPrefix + ((Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (Anticoagulation_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.AnticoagulationAnnum_result').text(currentCurrencyPrefix + (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.Anticoagulation_result_title').text("Anticoagulation Total Cost per Procedure High-Risk and Int-High Risk");
            $('.AnticoagulationAnnum_result_title').text("Anticoagulation Total Cost per Annum High-Risk and Int-High Risk");

            break;
        default:

            break;
    }




    $('.SystemicThrombolysis_CostOfFibrinolytics').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfFibrinolytics.toLocaleString(currentLocaleCode) + currentCurrencySuffix);
    $('.SystemicThrombolysis_OtherMaterialCosts').text(currentCurrencyPrefix + SystemicThrombolysis.OtherMaterialCosts.toLocaleString(currentLocaleCode) + currentCurrencySuffix);
    $('.SystemicThrombolysis_OtherMedicationPharmaceuticalProducts').text(currentCurrencyPrefix + SystemicThrombolysis.OtherMedicationPharmaceuticalProducts.toLocaleString(currentLocaleCode) + currentCurrencySuffix);
    SystemicThrombolysis.CostPerProcedure = SystemicThrombolysis.CostOfFibrinolytics + SystemicThrombolysis.OtherMaterialCosts + SystemicThrombolysis.OtherMedicationPharmaceuticalProducts;
    SystemicThrombolysis.CostPerAnnum = SystemicThrombolysis.CostPerProcedure * currentRisk;

    if (whichCostIdx == 0) {
        $('.SystemicThrombolysis_TechnologyTotal').text(currentCurrencyPrefix + SystemicThrombolysis.CostPerProcedure.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    } else {
        $('.SystemicThrombolysis_TechnologyTotal').text(currentCurrencyPrefix + SystemicThrombolysis.CostPerAnnum.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents = ((SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * ProportionOfPatientsWithHighRiskPE) + ( SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * ProportionOfPatientsWithIntHighRiskPE) ) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);
    SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents = ((SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * ProportionOfPatientsWithHighRiskPE) + ( SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * ProportionOfPatientsWithIntHighRiskPE) ) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);
   
    SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = (SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent) + (SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
    SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = (SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent) + (SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent);
    SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = (SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent) + (SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent);
    SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum = SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;
    SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum = SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding * currentRisk;
    SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding * currentRisk;

    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.SystemicThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.SystemicThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.SystemicThrombolysis_CostOfBleedingEvents').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }



    SystemicThrombolysis.CostOfBleedingEvents.TotalContingentCostPerAnnum = SystemicThrombolysis.CostOfBleedingEvents.MeanCostsPerProcedureForBleeding * currentRisk;

    SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate = ((SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * ProportionOfPatientsWithHighRiskPE) + ( SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * ProportionOfPatientsWithIntHighRiskPE) ) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);
  
    SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = (SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts);
    SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = (SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts);
    SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = (SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts);
    SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum = SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;
    SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum = SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost * currentRisk;
    SystemicThrombolysis.CostsOfHospitalReadmissions.TotalContingentCostPerAnnum = SystemicThrombolysis.CostsOfHospitalReadmissions.PerProcedure30DayReadmissionCost * currentRisk;
    SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum = SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost * currentRisk;

    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {
                $('.SystemicThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.SystemicThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        case 2:
            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            } else {

                $('.SystemicThrombolysis_CostsOfHospitalReadmissions').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum.toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
            }
            break;
        default:
            break;
    }


    //foobag
    $('#SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed.toLocaleString(currentLocaleCode) + currentCurrencySuffix);


    var SystemicThrombolysis_TotalDeviceContingent = SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost;
    var SystemicThrombolysis_TotalDeviceContingentAnnum = SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum;


    switch (whichPERisk) {
        case 0:

            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.SystemicThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.SystemicThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        case 1:
            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.SystemicThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.SystemicThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        case 2:

            if (whichCostIdx == 0) {
                $('.SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.SystemicThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').text("Total Device and Contingent Costs per Procedure")

            } else {
                $('.SystemicThrombolysis_TotalVariableCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.SystemicThrombolysis_TotalDeviceAndContingentCosts').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum).toLocaleString(currentLocaleCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) + currentCurrencySuffix)
                $('.TotalDeviceAndContingentCostsTitle').html("Total Device and Contingent Costs per Annum<br><br>")

            }

            break;
        default:
            break;
    }


    SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingHoursPerDay * SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnSystemicLysis * SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate * PercentageOfCostsVariableCatheterizationSuiteandICU;
    switch (whichPERisk) {
        case 0:
            SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure * AnnualHighRiskPEPatients;
            break;
        case 1:
            SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    } else {
        $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingHoursPerDay * SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnSystemicLysis * SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate * PercentageOfCostsVariableCatheterizationSuiteandICU;
    switch (whichPERisk) {
        case 0:
            SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure * AnnualHighRiskPEPatients;
            break;
        case 1:
            SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure.toLocaleString(currentLocaleCode) + currentCurrencySuffix)
    } else {
        $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.TimeDays * PercentageOfCostsVariableCatheterizationSuiteandICU * SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;

    switch (whichPERisk) {
        case 0:
            SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }


    SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost = SystemicThrombolysis.CostOfHospitalStay.TimeDays * PercentageOfCostsVariableGeneralHospitalWard * SystemicThrombolysis.CostOfHospitalStay.CostPerMinPerDay;

    switch (whichPERisk) {
        case 0:
            SystemicThrombolysis.CostOfHospitalStay.PerAnnumCost = SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            SystemicThrombolysis.CostOfHospitalStay.PerAnnumCost = SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            SystemicThrombolysis.CostOfHospitalStay.PerAnnumCost = SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    if (whichCostIdx == 0) {
        $('.SystemicThrombolysis_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + currentCurrencySuffix)
    } else {
        $('.SystemicThrombolysis_CostOfHospitalStay_TotalCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfHospitalStay.PerAnnumCost.toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    var SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure + SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure + SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost + SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost;
    var SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost + SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost + SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost + SystemicThrombolysis.CostOfHospitalStay.PerAnnumCost;
  
    $('.SystemicThrombolysis_TotalCosts').text(currentCurrencyPrefix + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);
    $('.SystemicThrombolysis_TotalAnnum').text(currentCurrencyPrefix + (SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)


    if (whichCostIdx == 0) {
        $('.SystemicThrombolysis_TotalCostsSubtotal').text(currentCurrencyPrefix + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    } else {
        $('.SystemicThrombolysis_TotalCostsSubtotal').text(currentCurrencyPrefix + (SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + currentCurrencySuffix)
    }

    switch (whichPERisk) {
        case 0:
            $('.SystemicThrombolysis_result').text(currentCurrencyPrefix + ((SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost) + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.SystemicThrombolysisAnnum_result').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.SystemicThrombolysis_result_title').text("Systemic Thrombolysis Total Cost per Procedure High-Risk");
            $('.SystemicThrombolysisAnnum_result_title').text("Systemic Thrombolysis Total Cost per Annum High-Risk");
            break;
        case 1:
            $('.SystemicThrombolysis_result').text(currentCurrencyPrefix + ((SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.SystemicThrombolysisAnnum_result').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.SystemicThrombolysis_result_title').text("Systemic Thrombolysis Total Cost per Procedure Int-High Risk");
            $('.SystemicThrombolysisAnnum_result_title').text("Systemic Thrombolysis Total Cost per Annum Int-High Risk");
            break;
        case 2:
            $('.SystemicThrombolysis_result').text(currentCurrencyPrefix + ((SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal)).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
            $('.SystemicThrombolysisAnnum_result').text(currentCurrencyPrefix + (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal).toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            $('.SystemicThrombolysis_result_title').text("Systemic Thrombolysis Total Cost per Procedure High-Risk and Int-High Risk");
            $('.SystemicThrombolysisAnnum_result_title').text("Systemic Thrombolysis Total Cost per Annum High-Risk and Int-High Risk");

            break;
        default:

            break;
    }

    switch (whichPERisk) {
        case 0:

             $('.FlowTriever_TotalAnnum_title').html("Total Acute Care per Annum High-Risk PE<br><br>");
            $('.Anticoagulation_TotalAnnum_title').html("Total Acute Care per Annum High-Risk PE<br><br>");
            $('.SystemicThrombolysis_TotalAnnum_title').html("Total Acute Care per Annum High-Risk PE<br><br>");
            $('.UltrasoundAssistedThrombolysis_TotalAnnum_title').html("Total Acute Care per Annum High-Risk PE<br><br>");
            break;
        case 1:
            $('.FlowTriever_TotalAnnum_title').html("Total Acute Care per Annum Int-High Risk PE<br><br>");
            $('.Anticoagulation_TotalAnnum_title').html("Total Acute Care per Annum Int-High Risk PE<br<br>");
            $('.SystemicThrombolysis_TotalAnnum_title').html("Total Acute Care per Annum Int-High Risk PE<br><br>");
            $('.UltrasoundAssistedThrombolysis_TotalAnnum_title').html("Total Acute Care per Annum Int-High Risk PE<br><br>");
            break;
        case 2:
            $('.FlowTriever_TotalAnnum_title').html("Total Acute Care per Annum High-Risk and Int-High Risk PE");
            $('.Anticoagulation_TotalAnnum_title').html("Total Acute Care per Annum High-Risk and Int-High Risk PE");
            $('.SystemicThrombolysis_TotalAnnum_title').html("Total Acute Care per Annum High-Risk and Int-High Risk PE");
            $('.UltrasoundAssistedThrombolysis_TotalAnnum_title').html("Total Acute Care per Annum High-Risk and Int-High Risk PE");
            break;
        default:
            // code for any other value
            
            break;
    }

    // needs to be redone - pulled out
    //AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed = AnnualPERelatedHospitalisations2020 / TotalNumberOfHospitalBedsInGermany2023;
    //$('#AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed').val(AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed);



    FlowTriever.DRGProceedsPerProcedure = (currentBaserate * currentFlowRate) + flowTrieverNUBNegotiationResult;
    Anticoagulation.DRGProceedsPerProcedure = (currentBaserate * currentACRate);
    SystemicThrombolysis.DRGProceedsPerProcedure = (currentBaserate * currentSTRate);
    UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure = (currentBaserate * currentUTRate);
    $('.Flowtriever_DRGProceeds').text(currentCurrencyPrefix + FlowTriever.DRGProceedsPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
    $('.Anticoagulation_DRGProceeds').text(currentCurrencyPrefix + Anticoagulation.DRGProceedsPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
    $('.SystemicThrombolysis_DRGProceeds').text(currentCurrencyPrefix + SystemicThrombolysis.DRGProceedsPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);


    switch (whichPERisk) {
        case 0:
            FlowTriever.DRGProceedsPerAnnum = FlowTriever.DRGProceedsPerProcedure * AnnualHighRiskPEPatients;
            FlowTriever.CMIReturnPerProcedure = FlowTriever.DRGProceedsPerProcedure - ((FlowTriever_TotalDeviceContingent) + (FlowTriever_TotalDeviceContingent_TotalCostTotal))
            FlowTriever.CMIReturnPerAnnum = FlowTriever.DRGProceedsPerAnnum - ((FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum) + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal));

            Anticoagulation.DRGProceedsPerAnnum = Anticoagulation.DRGProceedsPerProcedure * AnnualHighRiskPEPatients;
            Anticoagulation.CMIReturnPerProcedure = Anticoagulation.DRGProceedsPerProcedure - ((Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost) + (Anticoagulation_TotalDeviceContingent_TotalCostTotal));
            Anticoagulation.CMIReturnPerAnnum = Anticoagulation.DRGProceedsPerAnnum - (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal);

            SystemicThrombolysis.DRGProceedsPerAnnum = SystemicThrombolysis.DRGProceedsPerProcedure * AnnualHighRiskPEPatients;
            SystemicThrombolysis.CMIReturnPerProcedure = SystemicThrombolysis.DRGProceedsPerProcedure - ((SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost) + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal));
            SystemicThrombolysis.CMIReturnPerAnnum = SystemicThrombolysis.DRGProceedsPerAnnum - (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal);

            UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum = UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure * AnnualHighRiskPEPatients;
            UltrasoundAssistedThrombolysis.CMIReturnPerProcedure = UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - ((UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal));
            UltrasoundAssistedThrombolysis.CMIReturnPerAnnum = UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal);

            $('.DRGProceeds_Title').text("DRG Proceeds per Annum High-Risk PE");
            $('.FlowTriever_CMIReturn_Title').text("FlowTriever CMI Net Return per Procedure High-Risk PE");
            $('.FlowTriever_CMIReturn_PerAnnum_Title').text("FlowTriever CMI Net Return per Annum High-Risk PE");
            $('.Anticoagulation_CMIReturn_Title').text("Anticoagulation CMI Net Return per Procedure High-Risk PE");
            $('.Anticoagulation_CMIReturn_PerAnnum_Title').text("Anticoagulation CMI Net Return per Annum High-Risk PE");
            $('.SystemicThrombolysis_CMIReturn_Title').text("Systemic Lysis CMI Net Return per Procedure High-Risk PE");
            $('.SystemicThrombolysis_CMIReturn_PerAnnum_Title').text("Systemic Lysis CMI Net Return per Annum High-Risk PE");
            $('.UltrasoundAssistedThrombolysis_CMIReturn_Title').text("Ultrasound Assisted Thrombolysis CMI Net Return per Procedure High-Risk PE");
            $('.UltrasoundAssistedThrombolysis_CMIReturn_PerAnnum_Title').text("Ultrasound Assisted Thrombolysis CMI Net Return per Annum High-Risk PE");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")
            break;
        case 1:
            FlowTriever.DRGProceedsPerAnnum = FlowTriever.DRGProceedsPerProcedure * AnnualIntermediateHighRiskPEPatients;
            FlowTriever.CMIReturnPerProcedure = FlowTriever.DRGProceedsPerProcedure - ((FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (FlowTriever_TotalDeviceContingent_TotalCostTotal))
            FlowTriever.CMIReturnPerAnnum = FlowTriever.DRGProceedsPerAnnum - ((FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum) + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal));

            Anticoagulation.DRGProceedsPerAnnum = Anticoagulation.DRGProceedsPerProcedure * AnnualIntermediateHighRiskPEPatients;
            Anticoagulation.CMIReturnPerProcedure = Anticoagulation.DRGProceedsPerProcedure - ((Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (Anticoagulation_TotalDeviceContingent_TotalCostTotal));
            Anticoagulation.CMIReturnPerAnnum = Anticoagulation.DRGProceedsPerAnnum - (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal);

            SystemicThrombolysis.DRGProceedsPerAnnum = SystemicThrombolysis.DRGProceedsPerProcedure * AnnualIntermediateHighRiskPEPatients;
            SystemicThrombolysis.CMIReturnPerProcedure = SystemicThrombolysis.DRGProceedsPerProcedure - ((SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal));
            SystemicThrombolysis.CMIReturnPerAnnum = SystemicThrombolysis.DRGProceedsPerAnnum - (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal);

            UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum = UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure * AnnualIntermediateHighRiskPEPatients;
            UltrasoundAssistedThrombolysis.CMIReturnPerProcedure = UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - ((UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal));
            UltrasoundAssistedThrombolysis.CMIReturnPerAnnum = UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal);

            $('.DRGProceeds_Title').text("DRG Proceeds per Annum Int-High Risk PE");
            $('.FlowTriever_CMIReturn_Title').text("FlowTriever CMI Net Return per Procedure Int-High Risk PE");
            $('.FlowTriever_CMIReturn_PerAnnum_Title').text("FlowTriever CMI Net Return per Annum Int-High Risk PE");
            $('.Anticoagulation_CMIReturn_Title').text("Anticoagulation CMI Net Return per Procedure Int-High Risk PE");
            $('.Anticoagulation_CMIReturn_PerAnnum_Title').text("Anticoagulation CMI Net Return per Annum Int-High Risk PE");
            $('.SystemicThrombolysis_CMIReturn_Title').text("Systemic Lysis CMI Net Return per Procedure Int-High Risk PE");
            $('.SystemicThrombolysis_CMIReturn_PerAnnum_Title').text("Systemic Lysis CMI Net Return per Annum Int-High Risk PE");
            $('.UltrasoundAssistedThrombolysis_CMIReturn_Title').text("Ultrasound Assisted Thrombolysis CMI Net Return per Procedure Int-High Risk PE");
            $('.UltrasoundAssistedThrombolysis_CMIReturn_PerAnnum_Title').text("Ultrasound Assisted Thrombolysis CMI Net Return per Annum Int-High Risk PE");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "20px")
            break;
        case 2:
            FlowTriever.DRGProceedsPerAnnum = FlowTriever.DRGProceedsPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            FlowTriever.CMIReturnPerProcedure = FlowTriever.DRGProceedsPerProcedure - ((FlowTriever.CostPerProcedure + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (FlowTriever_TotalDeviceContingent_TotalCostTotal))
            FlowTriever.CMIReturnPerAnnum = FlowTriever.DRGProceedsPerAnnum - ((FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum) + (FlowTriever_TotalDeviceContingent_TotalAnnumTotal));

            Anticoagulation.DRGProceedsPerAnnum = Anticoagulation.DRGProceedsPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            Anticoagulation.CMIReturnPerProcedure = Anticoagulation.DRGProceedsPerProcedure - ((Anticoagulation.CostPerProcedure + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (Anticoagulation_TotalDeviceContingent_TotalCostTotal));
            Anticoagulation.CMIReturnPerAnnum = Anticoagulation.DRGProceedsPerAnnum - (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal);

            SystemicThrombolysis.DRGProceedsPerAnnum = SystemicThrombolysis.DRGProceedsPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            SystemicThrombolysis.CMIReturnPerProcedure = SystemicThrombolysis.DRGProceedsPerProcedure - ((SystemicThrombolysis.CostPerProcedure + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal));
            SystemicThrombolysis.CMIReturnPerAnnum = SystemicThrombolysis.DRGProceedsPerAnnum - (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal);

            UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum = UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            UltrasoundAssistedThrombolysis.CMIReturnPerProcedure = UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - ((UltrasoundAssistedThrombolysis.CostPerProcedure + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost) + (UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal));
            UltrasoundAssistedThrombolysis.CMIReturnPerAnnum = UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal);

            $('.DRGProceeds_Title').text("DRG Proceeds per Annum High-Risk and Int-High Risk PE");
            $('.FlowTriever_CMIReturn_Title').text("FlowTriever CMI Net Return per Procedure High-Risk and Int-High Risk PE");
            $('.FlowTriever_CMIReturn_PerAnnum_Title').text("FlowTriever CMI Net Return per Annum High-Risk and Int-High Risk PE");
            $('.Anticoagulation_CMIReturn_Title').text("Anticoagulation CMI Net Return per Procedure High-Risk and Int-High Risk PE");
            $('.Anticoagulation_CMIReturn_PerAnnum_Title').text("Anticoagulation CMI Net Return per Annum High-Risk and Int-High Risk PE");
            $('.SystemicThrombolysis_CMIReturn_Title').text("Systemic Lysis CMI Net Return per Procedure High-Risk and Int-High Risk PE");
            $('.SystemicThrombolysis_CMIReturn_PerAnnum_Title').text("Systemic Lysis CMI Net Return per Annum High-Risk and Int-High Risk PE");
            $('.UltrasoundAssistedThrombolysis_CMIReturn_Title').text("Ultrasound Assisted Thrombolysis CMI Net Return per Procedure High-Risk and Int-High Risk PE");
            $('.UltrasoundAssistedThrombolysis_CMIReturn_PerAnnum_Title').text("Ultrasound Assisted Thrombolysis CMI Net Return per Annum High-Risk and Int-High Risk PE");
            $('.resultOrangeTitle2Extended').css("padding-bottom", "10px");


            break;
        default:
            // code for any other value
            
            break;
    }


// love me tender
    $('.Flowtriever_DRGProceeds_PerAnnum').text(currentCurrencyPrefix + FlowTriever.DRGProceedsPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
    $('.FlowTriever_CMIReturnPerProcedure').text(currentCurrencyPrefix + FlowTriever.CMIReturnPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
    $('.FlowTriever_CMIReturnPerAnnum').text(currentCurrencyPrefix + FlowTriever.CMIReturnPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);

    $('.Anticoagulation_DRGProceeds_PerAnnum').text(currentCurrencyPrefix + Anticoagulation.DRGProceedsPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);
    $('.Anticoagulation_CMIReturnPerProcedure').text(currentCurrencyPrefix + Anticoagulation.CMIReturnPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;
    $('.Anticoagulation_CMIReturnPerAnnum').text(currentCurrencyPrefix + Anticoagulation.CMIReturnPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);

    $('.SystemicThrombolysis_DRGProceeds_PerAnnum').text(currentCurrencyPrefix + SystemicThrombolysis.DRGProceedsPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;
    $('.SystemicThrombolysis_CMIReturnPerProcedure').text(currentCurrencyPrefix + SystemicThrombolysis.CMIReturnPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;
    $('.SystemicThrombolysis_CMIReturnPerAnnum').text(currentCurrencyPrefix + SystemicThrombolysis.CMIReturnPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;

    $('.UltrasoundAssistedThrombolysis_DRGProceeds_PerAnnum').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;

    $('.UltrasoundAssistedThrombolysis_CMIReturnPerProcedure').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CMIReturnPerProcedure.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;

    $('.UltrasoundAssistedThrombolysis_CMIReturnPerAnnum').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CMIReturnPerAnnum.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix);;

    // graphtime
    var FlowTriever_TotalDeviceContingent_firstTotal = (FlowTriever_TotalDeviceContingent + FlowTriever_TotalDeviceContingent_TotalCostTotal);
    var Anticoagulation_TotalDeviceContingent_firstTotal = Anticoagulation_TotalDeviceContingent + Anticoagulation_TotalDeviceContingent_TotalCostTotal
    var SystemicThrombolysis_TotalDeviceContingent_firstTotal = SystemicThrombolysis_TotalDeviceContingent + SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal;
    var UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal = UltrasoundAssistedThrombolysis_TotalDeviceContingent + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal;
const transparentColor = 'rgba(0, 0, 0, 0.0)';
const flowTrieverColor = 'rgba(85 ,  47,  126 , 1.0)';
const anticoagulationColor =  'rgb(140,  140, 140  )';
const systemicThrombolysisColor = 'rgb(123, 22,  14   )';
const ultrasoundAssistedThrombolysisColor = 'rgb(123, 122,  14   )';

let idx = document.querySelector('#cardPicker').selectedIndex;
switch (idx) {
    case 0: // All Technologies (FlowTriever + AC + ST)
        [myChart_DRGPerAnnum, myChart_DRGPerProcedure].forEach(chart => {
            chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[1].backgroundColor = [
                flowTrieverColor, flowTrieverColor, flowTrieverColor, flowTrieverColor,
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

            chart.data.datasets[2].backgroundColor = [
                transparentColor, transparentColor, transparentColor, transparentColor,
                anticoagulationColor, anticoagulationColor, anticoagulationColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

            chart.data.datasets[3].backgroundColor = [
                transparentColor, transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor,
                systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor
            ];
            chart.data.datasets[3].borderColor = chart.data.datasets[3].backgroundColor;

            chart.data.datasets[4].backgroundColor = [
                transparentColor, transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor,
                ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor
            ];
            chart.data.datasets[4].borderColor = chart.data.datasets[4].backgroundColor;
        });

         [myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
            chart.data.datasets[0].backgroundColor = Array(12).fill(transparentColor);
            chart.data.datasets[0].borderColor = Array(12).fill(transparentColor);

            chart.data.datasets[1].backgroundColor = [
                flowTrieverColor, flowTrieverColor, flowTrieverColor,
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

            chart.data.datasets[2].backgroundColor = [
                transparentColor, transparentColor, transparentColor,
                anticoagulationColor, anticoagulationColor, anticoagulationColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

            chart.data.datasets[3].backgroundColor = [
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor,
                systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor
            ];
            chart.data.datasets[3].borderColor = chart.data.datasets[3].backgroundColor;
            chart.data.datasets[4].backgroundColor = [
                transparentColor, transparentColor, transparentColor, 
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor,
                ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor
            ];
            chart.data.datasets[4].borderColor = chart.data.datasets[4].backgroundColor;
        });
        break;

    case 1: // FlowTriever + AC
        [myChart_DRGPerAnnum, myChart_DRGPerProcedure].forEach(chart => {
            chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[1].backgroundColor = [
                flowTrieverColor, flowTrieverColor, flowTrieverColor,  flowTrieverColor,
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

            chart.data.datasets[2].backgroundColor = [
                transparentColor, transparentColor, transparentColor,transparentColor,
                anticoagulationColor, anticoagulationColor, anticoagulationColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

            chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
        });
         [myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
            chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[1].backgroundColor = [
                flowTrieverColor, flowTrieverColor, flowTrieverColor,  
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

            chart.data.datasets[2].backgroundColor = [
                transparentColor, transparentColor, transparentColor,
                anticoagulationColor, anticoagulationColor, anticoagulationColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

            chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
        });
        break;

case 2: // FlowTriever + ST
    [myChart_DRGPerAnnum, myChart_DRGPerProcedure].forEach(chart => {
        chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[1].backgroundColor = [
            flowTrieverColor, flowTrieverColor, flowTrieverColor, flowTrieverColor,
            transparentColor, transparentColor, transparentColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

        chart.data.datasets[2].backgroundColor = [
            transparentColor, transparentColor, transparentColor, transparentColor,
            systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

        chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
    });

      [myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
        chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[1].backgroundColor = [
            flowTrieverColor, flowTrieverColor, flowTrieverColor,
            transparentColor, transparentColor, transparentColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

        chart.data.datasets[2].backgroundColor = [
            transparentColor, transparentColor, transparentColor,
            systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

        chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
    });
    break;

    case 3: // FlowTriever + USAT
    [myChart_DRGPerAnnum, myChart_DRGPerProcedure].forEach(chart => {
        chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[1].backgroundColor = [
            flowTrieverColor, flowTrieverColor, flowTrieverColor, flowTrieverColor,
            transparentColor, transparentColor, transparentColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

        chart.data.datasets[2].backgroundColor = [
            transparentColor, transparentColor, transparentColor, transparentColor,
            ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

        chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
    });

      [myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
        chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[1].backgroundColor = [
            flowTrieverColor, flowTrieverColor, flowTrieverColor,
            transparentColor, transparentColor, transparentColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

        chart.data.datasets[2].backgroundColor = [
            transparentColor, transparentColor, transparentColor,
            ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor,
            transparentColor, transparentColor, transparentColor
        ];
        chart.data.datasets[2].borderColor = chart.data.datasets[2].backgroundColor;

        chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
    });
    break;


    case 4: // FlowTriever only
        [myChart_DRGPerAnnum, myChart_DRGPerProcedure].forEach(chart => {
            chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[1].backgroundColor = [
                flowTrieverColor, flowTrieverColor, flowTrieverColor, flowTrieverColor,
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

            chart.data.datasets[2].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[2].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
        });

        [myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
            chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[1].backgroundColor = [
                flowTrieverColor, flowTrieverColor, flowTrieverColor,
                transparentColor, transparentColor, transparentColor,
                transparentColor, transparentColor, transparentColor
            ];
            chart.data.datasets[1].borderColor = chart.data.datasets[1].backgroundColor;

            chart.data.datasets[2].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[2].borderColor = Array(9).fill(transparentColor);

            chart.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
            chart.data.datasets[3].borderColor = Array(9).fill(transparentColor);
        });
        break;
    case 5: // AC only
  
        myChart_DRGPerAnnum.data.datasets[0].backgroundColor = Array(3).fill(transparentColor).concat(Array(6).fill(transparentColor));
        myChart_DRGPerAnnum.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        myChart_DRGPerAnnum.data.datasets[1].backgroundColor = Array(9).fill(transparentColor);
        myChart_DRGPerAnnum.data.datasets[1].borderColor = Array(9).fill(transparentColor);

        myChart_DRGPerAnnum.data.datasets[2].backgroundColor = [
            anticoagulationColor, anticoagulationColor, anticoagulationColor,
            'rgb(255, 0, 0)', 'rgb(255, 0, 0)', 'rgb(255, 0, 0)',
            'rgb(0, 0, 255)', 'rgb(0, 0, 255)', 'rgb(0, 0, 255)'
        ];
        myChart_DRGPerAnnum.data.datasets[2].borderColor = myChart_DRGPerAnnum.data.datasets[2].backgroundColor;

        myChart_DRGPerAnnum.data.datasets[3].backgroundColor = myChart_DRGPerAnnum.data.datasets[2].backgroundColor;
        myChart_DRGPerAnnum.data.datasets[3].borderColor = myChart_DRGPerAnnum.data.datasets[2].backgroundColor;
 

    myChart_DRGPerProcedure.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
    myChart_DRGPerProcedure.data.datasets[0].borderColor = Array(9).fill(transparentColor);

    myChart_DRGPerProcedure.data.datasets[1].backgroundColor = Array(9).fill(transparentColor);
    myChart_DRGPerProcedure.data.datasets[1].borderColor = Array(9).fill(transparentColor);

    myChart_DRGPerProcedure.data.datasets[2].backgroundColor = [
        anticoagulationColor, anticoagulationColor, anticoagulationColor,
        anticoagulationColor, anticoagulationColor, anticoagulationColor,
        anticoagulationColor, anticoagulationColor, anticoagulationColor
    ];

    myChart_DRGPerProcedure.data.datasets[2].borderColor = myChart_DRGPerProcedure.data.datasets[2].backgroundColor;

    myChart_DRGPerProcedure.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
    myChart_DRGPerProcedure.data.datasets[3].borderColor = Array(9).fill(transparentColor);

      myChart_DRGPerAnnumCHF.data.datasets[0].backgroundColor = Array(3).fill(transparentColor).concat(Array(6).fill(transparentColor));
        myChart_DRGPerAnnumCHF.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        myChart_DRGPerAnnumCHF.data.datasets[1].backgroundColor = Array(9).fill(transparentColor);
        myChart_DRGPerAnnumCHF.data.datasets[1].borderColor = Array(9).fill(transparentColor);

        myChart_DRGPerAnnumCHF.data.datasets[2].backgroundColor = [
            anticoagulationColor, anticoagulationColor, anticoagulationColor,
            'rgb(255, 0, 0)', 'rgb(255, 0, 0)', 'rgb(255, 0, 0)',
            'rgb(0, 0, 255)', 'rgb(0, 0, 255)', 'rgb(0, 0, 255)'
        ];
        myChart_DRGPerAnnumCHF.data.datasets[2].borderColor = myChart_DRGPerAnnumCHF.data.datasets[2].backgroundColor;

        myChart_DRGPerAnnumCHF.data.datasets[3].backgroundColor = myChart_DRGPerAnnumCHF.data.datasets[2].backgroundColor;
        myChart_DRGPerAnnumCHF.data.datasets[3].borderColor = myChart_DRGPerAnnumCHF.data.datasets[2].backgroundColor;
 

    myChart_DRGPerProcedureCHF.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
    myChart_DRGPerProcedureCHF.data.datasets[0].borderColor = Array(9).fill(transparentColor);

    myChart_DRGPerProcedureCHF.data.datasets[1].backgroundColor = Array(9).fill(transparentColor);
    myChart_DRGPerProcedureCHF.data.datasets[1].borderColor = Array(9).fill(transparentColor);

    myChart_DRGPerProcedureCHF.data.datasets[2].backgroundColor = [
        anticoagulationColor, anticoagulationColor, anticoagulationColor,
        anticoagulationColor, anticoagulationColor, anticoagulationColor,
        anticoagulationColor, anticoagulationColor, anticoagulationColor
    ];

    myChart_DRGPerProcedureCHF.data.datasets[2].borderColor = myChart_DRGPerProcedureCHF.data.datasets[2].backgroundColor;

    myChart_DRGPerProcedureCHF.data.datasets[3].backgroundColor = Array(9).fill(transparentColor);
    myChart_DRGPerProcedureCHF.data.datasets[3].borderColor = Array(9).fill(transparentColor);
   
    break;

case 6: // ST only
    [myChart_DRGPerAnnum, myChart_DRGPerProcedure, myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
        chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[1].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[1].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[2].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[2].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[3].backgroundColor = [
            systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor,
            systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor,
            systemicThrombolysisColor, systemicThrombolysisColor, systemicThrombolysisColor
        ];
        chart.data.datasets[3].borderColor = chart.data.datasets[3].backgroundColor;
    });
    break;

    case 7: // USAT only
    [myChart_DRGPerAnnum, myChart_DRGPerProcedure, myChart_DRGPerAnnumCHF, myChart_DRGPerProcedureCHF].forEach(chart => {
        chart.data.datasets[0].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[0].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[1].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[1].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[2].backgroundColor = Array(9).fill(transparentColor);
        chart.data.datasets[2].borderColor = Array(9).fill(transparentColor);

        chart.data.datasets[3].backgroundColor = [
            ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor,
            ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor,
            ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor, ultrasoundAssistedThrombolysisColor
        ];
        chart.data.datasets[3].borderColor = chart.data.datasets[3].backgroundColor;
    });

    break;

}




    
    let procedureCosts = [];
    let bleedingCosts = [];
    let readmissionCosts = [];
    let deviceContingentCosts = [];
    let totals = [];
    let labels = [];

    switch (idx) {
        case 0: // All Technologies
            procedureCosts = [
                FlowTriever.CostPerProcedure,
                Anticoagulation.CostPerProcedure,
                SystemicThrombolysis.CostPerProcedure,
                UltrasoundAssistedThrombolysis.CostPerProcedure
            ];
            bleedingCosts = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding,
                Anticoagulation.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding,
                SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding,
                UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding
            ];
            readmissionCosts = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost,
                Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost,
                SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost,
                UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost
            ];
            deviceContingentCosts = [
                FlowTriever_TotalDeviceContingent_TotalCostTotal,
                Anticoagulation_TotalDeviceContingent_TotalCostTotal,
                SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal
            ];
            totals = [
                FlowTriever_TotalDeviceContingent_firstTotal,
                Anticoagulation_TotalDeviceContingent_firstTotal,
                SystemicThrombolysis_TotalDeviceContingent_firstTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
            ];
            labels = ["FlowTriever", "Anticoagulation", "Systemic Thrombolysis", "Ultrasound Assisted Thrombolysis"];
            break;
        
        case 1: // FlowTriever + AC
            procedureCosts = [
                FlowTriever.CostPerProcedure,
                Anticoagulation.CostPerProcedure
            ];
            bleedingCosts = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding,
                Anticoagulation.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding
            ];
            readmissionCosts = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost,
                Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost
            ];
            deviceContingentCosts = [
                FlowTriever_TotalDeviceContingent_TotalCostTotal,
                Anticoagulation_TotalDeviceContingent_TotalCostTotal
            ];
            totals = [
                FlowTriever_TotalDeviceContingent_firstTotal,
                Anticoagulation_TotalDeviceContingent_TotalCostTotal
            ];
            labels = ["FlowTriever", "Anticoagulation"];
            break;

        case 2: // FlowTriever + ST
            procedureCosts = [
                FlowTriever.CostPerProcedure,
                SystemicThrombolysis.CostPerProcedure
            ];
            bleedingCosts = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding,
                SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding
            ];
            readmissionCosts = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost,
                SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost
            ];
            deviceContingentCosts = [
                FlowTriever_TotalDeviceContingent_TotalCostTotal,
                SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal
            ];
            totals = [
                FlowTriever_TotalDeviceContingent_firstTotal,
                SystemicThrombolysis_TotalDeviceContingent_firstTotal
            ];
            labels = ["FlowTriever", "Systemic Thrombolysis"];
            break;

        case 3: // FlowTriever + USAT
            procedureCosts = [
                FlowTriever.CostPerProcedure,
                UltrasoundAssistedThrombolysis.CostPerProcedure
            ];
            bleedingCosts = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding,
                UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding
            ];
            readmissionCosts = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost,
                UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost
            ];
            deviceContingentCosts = [
                FlowTriever_TotalDeviceContingent_TotalCostTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal
            ];
            totals = [
                FlowTriever_TotalDeviceContingent_firstTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
            ];
            labels = ["FlowTriever", "Ultrasound Assisted Thrombolysis"];
            break;

        case 4: // FlowTriever
            procedureCosts = [FlowTriever.CostPerProcedure];
            bleedingCosts = [FlowTriever.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding];
            readmissionCosts = [FlowTriever.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost];
            deviceContingentCosts = [FlowTriever_TotalDeviceContingent_TotalCostTotal];
            totals = [FlowTriever_TotalDeviceContingent_firstTotal];
            labels = ["FlowTriever"];
            break;

        case 5: // Anticoagulation (AC)
            procedureCosts = [Anticoagulation.CostPerProcedure];
            bleedingCosts = [Anticoagulation.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding];
            readmissionCosts = [Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost];
            deviceContingentCosts = [Anticoagulation_TotalDeviceContingent_TotalCostTotal];
            totals = [Anticoagulation_TotalDeviceContingent_TotalCostTotal];
            labels = ["Anticoagulation"];
            break;

        case 6: // Systemic Thrombolysis (ST)
            procedureCosts = [SystemicThrombolysis.CostPerProcedure];
            bleedingCosts = [SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding];
            readmissionCosts = [SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost];
            deviceContingentCosts = [SystemicThrombolysis_TotalDeviceContingent_TotalCostTotal];
            totals = [SystemicThrombolysis_TotalDeviceContingent_firstTotal];
            labels = ["Systemic Thrombolysis"];
            break;
        
        case 7: // Ultrasound Assisted Thrombolysis (USAT)
            procedureCosts = [UltrasoundAssistedThrombolysis.CostPerProcedure];
            bleedingCosts = [UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].MeanCostsPerProcedureForBleeding];
            readmissionCosts = [UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].PerProcedure30DayReadmissionCost];
            deviceContingentCosts = [UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalCostTotal];
            totals = [UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal];
            labels = ["Ultrasound Assisted Thrombolysis"];
            break;

        default:
            // Do nothing
    }

    myChart_PerProcedure.data.datasets[0].data = procedureCosts;
    myChart_PerProcedure.data.datasets[1].data = bleedingCosts;
    myChart_PerProcedure.data.datasets[2].data = readmissionCosts;
    myChart_PerProcedure.data.datasets[3].data = deviceContingentCosts;
    myChart_PerProcedure.data.labels = labels;
    TotalsToRender_PerProcedure = totals;
    
    myChart_PerProcedure.update();


    // ----- Update myChart_PerAnnum -----

    let procedureCosts_Annum = [];
    let bleedingCosts_Annum = [];
    let readmissionCosts_Annum = [];
    let deviceContingentCosts_Annum = [];
    let totals_Annum = [];
    let labels_Annum = [];

    switch (idx) {
        case 0: // All Technologies
            procedureCosts_Annum = [
                FlowTriever.CostPerAnnum,
                Anticoagulation.CostPerAnnum,
                SystemicThrombolysis.CostPerAnnum,
                UltrasoundAssistedThrombolysis.CostPerAnnum
            ];
            bleedingCosts_Annum = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum,
                Anticoagulation.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum,
                SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum,
                UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum
            ];
            readmissionCosts_Annum = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum,
                Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum,
                SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum,
                UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum
            ];
            deviceContingentCosts_Annum = [
                FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                Anticoagulation_TotalDeviceContingent_TotalAnnumTotal,
                SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal
            ];
            totals_Annum = [
                FlowTriever_TotalDeviceContingentAnnum + FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                Anticoagulation_TotalDeviceContingentAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal,
                SystemicThrombolysis_TotalDeviceContingentAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingentAnnum + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal
            ];
            labels_Annum = ["FlowTriever", "Anticoagulation", "Systemic Thrombolysis", "Ultrasound Assisted Thrombolysis"];
            break;

        case 1: // FlowTriever + AC
            procedureCosts_Annum = [
                FlowTriever.CostPerAnnum,
                Anticoagulation.CostPerAnnum
            ];
            bleedingCosts_Annum = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum,
                Anticoagulation.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum
            ];
            readmissionCosts_Annum = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum,
                Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum
            ];
            deviceContingentCosts_Annum = [
                FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                Anticoagulation_TotalDeviceContingent_TotalAnnumTotal
            ];
            totals_Annum = [
                FlowTriever_TotalDeviceContingentAnnum + FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                Anticoagulation_TotalDeviceContingentAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal
            ];
            labels_Annum = ["FlowTriever", "Anticoagulation"];
            break;

        case 2: // FlowTriever + ST
            procedureCosts_Annum = [
                FlowTriever.CostPerAnnum,
                SystemicThrombolysis.CostPerAnnum
            ];
            bleedingCosts_Annum = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum,
                SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum
            ];
            readmissionCosts_Annum = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum,
                SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum
            ];
            deviceContingentCosts_Annum = [
                FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal
            ];
            totals_Annum = [
                FlowTriever_TotalDeviceContingentAnnum + FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                SystemicThrombolysis_TotalDeviceContingentAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal
            ];
            labels_Annum = ["FlowTriever", "Systemic Thrombolysis"];
            break;

        case 3: // FlowTriever + USAT
            procedureCosts_Annum = [
                FlowTriever.CostPerAnnum,
                UltrasoundAssistedThrombolysis.CostPerAnnum
            ];
            bleedingCosts_Annum = [
                FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum,
                UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum
            ];
            readmissionCosts_Annum = [
                FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum,
                UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum
            ];
            deviceContingentCosts_Annum = [
                FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal
            ];
            totals_Annum = [
                FlowTriever_TotalDeviceContingentAnnum + FlowTriever_TotalDeviceContingent_TotalAnnumTotal,
                UltrasoundAssistedThrombolysis_TotalDeviceContingentAnnum + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal
            ];
            labels_Annum = ["FlowTriever", "Ultrasound Assisted Thrombolysis"];
            break;

        case 4: // FlowTriever
            procedureCosts_Annum = [FlowTriever.CostPerAnnum];
            bleedingCosts_Annum = [FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum];
            readmissionCosts_Annum = [FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum];
            deviceContingentCosts_Annum = [FlowTriever_TotalDeviceContingent_TotalAnnumTotal];
            totals_Annum = [FlowTriever_TotalDeviceContingentAnnum + FlowTriever_TotalDeviceContingent_TotalAnnumTotal];
            labels_Annum = ["FlowTriever"];
            break;

        case 5: // Anticoagulation (AC)
            procedureCosts_Annum = [Anticoagulation.CostPerAnnum];
            bleedingCosts_Annum = [Anticoagulation.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum];
            readmissionCosts_Annum = [Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum];
            deviceContingentCosts_Annum = [Anticoagulation_TotalDeviceContingent_TotalAnnumTotal];
            totals_Annum = [Anticoagulation_TotalDeviceContingentAnnum + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal];
            labels_Annum = ["Anticoagulation"];
            break;

        case 6: // Systemic Thrombolysis (ST)
            procedureCosts_Annum = [SystemicThrombolysis.CostPerAnnum];
            bleedingCosts_Annum = [SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum];
            readmissionCosts_Annum = [SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum];
            deviceContingentCosts_Annum = [SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal];
            totals_Annum = [SystemicThrombolysis_TotalDeviceContingentAnnum + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal];
            labels_Annum = ["Systemic Thrombolysis"];
            break;

        case 7: // Ultrasound Assisted Thrombolysis (USAT)
            procedureCosts_Annum = [UltrasoundAssistedThrombolysis.CostPerAnnum];
            bleedingCosts_Annum = [UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum];
            readmissionCosts_Annum = [UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum];
            deviceContingentCosts_Annum = [UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal];
            totals_Annum = [UltrasoundAssistedThrombolysis_TotalDeviceContingentAnnum + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal];
            labels_Annum = ["Ultrasound Assisted Thrombolysis"];
            break;

        default:
            // Do nothing
    }

    // Assign new data
    myChart_PerAnnum.data.datasets[0].data = procedureCosts_Annum;
    myChart_PerAnnum.data.datasets[1].data = bleedingCosts_Annum;
    myChart_PerAnnum.data.datasets[2].data = readmissionCosts_Annum;
    myChart_PerAnnum.data.datasets[3].data = deviceContingentCosts_Annum;
    myChart_PerAnnum.data.labels = labels_Annum;
    TotalsToRender_PerAnnum = totals_Annum;

    myChart_PerAnnum.update();


   // ----- Update myChart_DRGPerProcedure -----

let drgData0 = [];
let drgData1 = [];
let drgData2 = [];
let drgData3 = [];
let drgData4 = [];
let totals_DRGPerProcedure = [];
let labels_DRGPerProcedure = [];

switch (idx) {
    case 0: // All Technologies
        drgData0 = [0, 0, FlowTriever.DRGProceedsPerProcedure-flowTrieverNUBNegotiationResult, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0, 0];
        drgData1 = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure - flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0, 0, 0, 0
        ];
        drgData2 = [0, 0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData3 = [0, 0, 0, 0, 0, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, SystemicThrombolysis.DRGProceedsPerProcedure, SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal];
        totals_DRGPerProcedure = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure- flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult, 
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            Anticoagulation_TotalDeviceContingent_firstTotal,
            Anticoagulation.DRGProceedsPerProcedure,
            Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal,
            SystemicThrombolysis_TotalDeviceContingent_firstTotal,
            SystemicThrombolysis.DRGProceedsPerProcedure,
            SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["NUB", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 1: // FlowTriever + AC
        drgData0 = [0, 0, FlowTriever.DRGProceedsPerProcedure-flowTrieverNUBNegotiationResult, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, 0];
         drgData1 = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure - flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];
        drgData2 = [0, 0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedure = [
           FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure- flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult, 
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            Anticoagulation_TotalDeviceContingent_firstTotal,
            Anticoagulation.DRGProceedsPerProcedure,
            Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["NUB", "Proceeds"],
            ["DRG & NUB", "Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;
case 2: // FlowTriever + ST
    drgData0 = [0, 0, FlowTriever.DRGProceedsPerProcedure-flowTrieverNUBNegotiationResult, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, 0];
    drgData1 = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure - flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
        0, 0, 0, 0, 0, 0
    ];
    drgData2 = [0, 0, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, SystemicThrombolysis.DRGProceedsPerProcedure, SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
    drgData3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    totals_DRGPerProcedure = [
           FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure- flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult, 
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
        SystemicThrombolysis_TotalDeviceContingent_firstTotal,
        SystemicThrombolysis.DRGProceedsPerProcedure,
        SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal
    ];
   labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["NUB", "Proceeds"],
            ["DRG & NUB", "Net Return per", "Procedure"],
        ["Cost per", "Procedure"],
        ["DRG", "Proceeds"],
        ["Net Return per", "Procedure"]
    ];
    break;

    case 3: // FlowTriever + USAT
        drgData0 = [0, 0, FlowTriever.DRGProceedsPerProcedure-flowTrieverNUBNegotiationResult, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0, 0];
        drgData1 = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure - flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];

        drgData2 = [0, 0, 0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedure = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure- flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult, 
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["NUB", "Proceeds"],
            ["DRG & NUB", "Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;
       
    case 4: // FlowTriever
       drgData0 = [0, 0, FlowTriever.DRGProceedsPerProcedure-flowTrieverNUBNegotiationResult, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, 0];
     drgData1 = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure - flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];
        drgData2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
         totals_DRGPerProcedure = [
           FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure- flowTrieverNUBNegotiationResult,
            flowTrieverNUBNegotiationResult, 
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
        ];
       labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["NUB", "Proceeds"],
            ["DRG & NUB", "Net Return per", "Procedure"],
        ];
        break;

    case 5: // Anticoagulation (AC)
        drgData0 = [0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0];
        drgData1 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData2 = [0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData2 = [Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0, 0];

        drgData3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedure = [
            Anticoagulation_TotalDeviceContingent_firstTotal,
            Anticoagulation.DRGProceedsPerProcedure,
            Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 6: // Systemic Thrombolysis (ST)
        drgData0 = [0, 0, 0, 0, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0];
        drgData1 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData2 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData3 = [SystemicThrombolysis_TotalDeviceContingent_firstTotal, SystemicThrombolysis.DRGProceedsPerProcedure, SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal];
        totals_DRGPerProcedure = [
            SystemicThrombolysis_TotalDeviceContingent_firstTotal,
            SystemicThrombolysis.DRGProceedsPerProcedure,
            SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 7: // Ultrasound Assisted Thrombolysis (USAT)
        drgData0 = [0, 0, 0, 0, 0, 0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, 0, 0];
        drgData1 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData2 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData3 = [UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal];
        totals_DRGPerProcedure = [
            UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedure = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    default:
        // Do nothing
}

    // Assign the new data
    myChart_DRGPerProcedure.data.datasets[0].data = drgData0;
    myChart_DRGPerProcedure.data.datasets[1].data = drgData1;
    myChart_DRGPerProcedure.data.datasets[2].data = drgData2;
    myChart_DRGPerProcedure.data.datasets[3].data = drgData3;
    myChart_DRGPerProcedure.data.datasets[4].data = drgData4;
        
    myChart_DRGPerProcedure.data.labels = labels_DRGPerProcedure;
    TotalsToRender_DRGPerProcedure = totals_DRGPerProcedure;

    myChart_DRGPerProcedure.update();


let drgData0CHF = [];
let drgData1CHF = [];
let drgData2CHF = [];
let drgData3CHF = [];
let drgData4CHF = [];
let totals_DRGPerProcedureCHF = [];
let labels_DRGPerProcedureCHF = [];

switch (idx) {
    case 0: // All Technologies
        drgData0CHF = [0, 0, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal];
        drgData1CHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];
        drgData2CHF = [0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData3CHF = [0, 0, 0, 0, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, SystemicThrombolysis.DRGProceedsPerProcedure, SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal];
        drgData4CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0,  UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal];
        totals_DRGPerProcedureCHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            Anticoagulation_TotalDeviceContingent_firstTotal,
            Anticoagulation.DRGProceedsPerProcedure,
            Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal,
            SystemicThrombolysis_TotalDeviceContingent_firstTotal,
            SystemicThrombolysis.DRGProceedsPerProcedure,
            SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG Proceeds", "per", "Procedure"],
            ["DRG Net Return", "per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 1: // FlowTriever + AC
        drgData0CHF = [0, 0, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData1CHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];
        drgData2CHF = [0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData3CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedureCHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            Anticoagulation_TotalDeviceContingent_firstTotal,
            Anticoagulation.DRGProceedsPerProcedure,
            Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;
case 2: // FlowTriever + ST
    drgData0CHF = [0, 0, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
    drgData1CHF = [
        FlowTriever_TotalDeviceContingent_firstTotal,
        FlowTriever.DRGProceedsPerProcedure,
        FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
        0, 0, 0, 0, 0, 0
    ];
    drgData2CHF = [0, 0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, SystemicThrombolysis.DRGProceedsPerProcedure, SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
    drgData3CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    totals_DRGPerProcedureCHF = [
        FlowTriever_TotalDeviceContingent_firstTotal,
        FlowTriever.DRGProceedsPerProcedure,
        FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
        SystemicThrombolysis_TotalDeviceContingent_firstTotal,
        SystemicThrombolysis.DRGProceedsPerProcedure,
        SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal
    ];
    labels_DRGPerProcedureCHF = [
        ["Cost per", "Procedure"],
        ["DRG", "Proceeds"],
        ["Net Return per", "Procedure"],
        ["Cost per", "Procedure"],
        ["DRG", "Proceeds"],
        ["Net Return per", "Procedure"]
    ];
    break;

    case 3: // FlowTriever + USAT
        drgData0CHF = [0, 0, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData1CHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];
        drgData2CHF = [0, 0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData3CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedureCHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"],
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 4: // FlowTriever
        drgData0CHF = [0, 0, FlowTriever_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0, 0];
        drgData1CHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal,
            0, 0, 0, 0, 0, 0
        ];
        drgData2CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData3CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedureCHF = [
            FlowTriever_TotalDeviceContingent_firstTotal,
            FlowTriever.DRGProceedsPerProcedure,
            FlowTriever.DRGProceedsPerProcedure - FlowTriever_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 5: // Anticoagulation (AC)
        drgData0CHF = [0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0];
        drgData1CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData2CHF = [0, 0, 0, Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0];
        drgData2CHF = [Anticoagulation_TotalDeviceContingent_firstTotal, Anticoagulation.DRGProceedsPerProcedure, Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal, 0, 0, 0, 0, 0, 0];

        drgData3CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        totals_DRGPerProcedureCHF = [
            Anticoagulation_TotalDeviceContingent_firstTotal,
            Anticoagulation.DRGProceedsPerProcedure,
            Anticoagulation.DRGProceedsPerProcedure - Anticoagulation_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 6: // Systemic Thrombolysis (ST)
        drgData0CHF = [0, 0, SystemicThrombolysis_TotalDeviceContingent_firstTotal, 0, 0];
        drgData1CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData2CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData3CHF = [SystemicThrombolysis_TotalDeviceContingent_firstTotal, SystemicThrombolysis.DRGProceedsPerProcedure, SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal];
        totals_DRGPerProcedureCHF = [
            SystemicThrombolysis_TotalDeviceContingent_firstTotal,
            SystemicThrombolysis.DRGProceedsPerProcedure,
            SystemicThrombolysis.DRGProceedsPerProcedure - SystemicThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    case 7: // Ultrasound Assisted Thrombolysis (USAT)
        drgData0CHF = [0, 0, UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, 0, 0];
        drgData1CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData2CHF = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        drgData3CHF = [UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure, UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal];
        totals_DRGPerProcedureCHF = [
            UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure,
            UltrasoundAssistedThrombolysis.DRGProceedsPerProcedure - UltrasoundAssistedThrombolysis_TotalDeviceContingent_firstTotal
        ];
        labels_DRGPerProcedureCHF = [
            ["Cost per", "Procedure"],
            ["DRG", "Proceeds"],
            ["Net Return per", "Procedure"]
        ];
        break;

    default:
        // Do nothing
}

    // Assign the new data
    myChart_DRGPerProcedureCHF.data.datasets[0].data = drgData0CHF;
    myChart_DRGPerProcedureCHF.data.datasets[1].data = drgData1CHF;
    myChart_DRGPerProcedureCHF.data.datasets[2].data = drgData2CHF;
    myChart_DRGPerProcedureCHF.data.datasets[3].data = drgData3CHF;
    myChart_DRGPerProcedureCHF.data.datasets[4].data = drgData4CHF;
    myChart_DRGPerProcedureCHF.data.labels = labels_DRGPerProcedureCHF;
    TotalsToRender_DRGPerProcedureCHF = totals_DRGPerProcedureCHF;

    myChart_DRGPerProcedureCHF.update();
   
        // Pre-calculate Per Annum totals
    var FlowTriever_PerAnnumTotal = (FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + FlowTriever_TotalDeviceContingent_TotalAnnumTotal;
    var FlowTriever_PerAnnumNUB = (flowTrieverNUBNegotiationResult *currentRisk);
    var Anticoagulation_PerAnnumTotal = (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal;
    var SystemicThrombolysis_PerAnnumTotal = (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal;
    var UltrasoundAssistedThrombolysis_PerAnnumTotal = (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal;
    // Set up chart data
    switch (idx) {
        case 0: // All Technologies
            myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumTotal, 0, 0, 0, 0, 0, 0];
            myChart_DRGPerAnnum.data.datasets[1].data = [FlowTriever_PerAnnumTotal, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumNUB, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal, 0, 0, 0];
            myChart_DRGPerAnnum.data.datasets[2].data = [0, 0, 0, 0, Anticoagulation_PerAnnumTotal, Anticoagulation.DRGProceedsPerAnnum, Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotal];
            myChart_DRGPerAnnum.data.datasets[3].data = [0, 0, 0, 0, 0, 0, 0, SystemicThrombolysis_PerAnnumTotal, SystemicThrombolysis.DRGProceedsPerAnnum, SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotal];
            myChart_DRGPerAnnum.data.datasets[4].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotal];
            TotalsToRender_DRGPerAnnum = [
                FlowTriever_PerAnnumTotal,
                FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB,
                FlowTriever_PerAnnumNUB,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal,
                Anticoagulation_PerAnnumTotal,
                Anticoagulation.DRGProceedsPerAnnum,
                Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotal,
                SystemicThrombolysis_PerAnnumTotal,
                SystemicThrombolysis.DRGProceedsPerAnnum,
                SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotal,
                UltrasoundAssistedThrombolysis_PerAnnumTotal,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["NUB", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 1: // FlowTriever + AC
            myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumTotal, 0, 0, 0];
           myChart_DRGPerAnnum.data.datasets[1].data = [FlowTriever_PerAnnumTotal, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumNUB, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal, 0, 0, 0, 0];
             myChart_DRGPerAnnum.data.datasets[2].data = [0, 0, 0, 0,  Anticoagulation_PerAnnumTotal, Anticoagulation.DRGProceedsPerAnnum, Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotal];
            myChart_DRGPerAnnum.data.datasets[3].data = [0, 0, 0, 0, 0, 0, 0];
            TotalsToRender_DRGPerAnnum = [
                          FlowTriever_PerAnnumTotal,
                FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB,
                FlowTriever_PerAnnumNUB,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal,
 
                Anticoagulation_PerAnnumTotal,
                Anticoagulation.DRGProceedsPerAnnum,
                Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
            ["Cost per", "Annum"], ["DRG", "Proceeds"], ["NUB", "Proceeds"], ["Net Return per", "Annum"],
                     ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

    case 2: // FlowTriever + ST (Per Annum)

          myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumTotal, 0, 0, 0];
           myChart_DRGPerAnnum.data.datasets[1].data = [FlowTriever_PerAnnumTotal, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumNUB, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal, 0, 0, 0, 0];
          
        myChart_DRGPerAnnum.data.datasets[2].data = [
            0, 0, 0, 0,
            SystemicThrombolysis_PerAnnumTotal,
            SystemicThrombolysis.DRGProceedsPerAnnum,
            SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotal
        ];
        
        myChart_DRGPerAnnum.data.datasets[3].data = [0, 0, 0, 0, 0, 0, 0];

        TotalsToRender_DRGPerAnnum = [
                       FlowTriever_PerAnnumTotal,
                FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB,
                FlowTriever_PerAnnumNUB,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal,
             SystemicThrombolysis_PerAnnumTotal,
            SystemicThrombolysis.DRGProceedsPerAnnum,
            SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotal
        ];

        myChart_DRGPerAnnum.data.labels = [
         ["Cost per", "Annum"], ["DRG", "Proceeds"], ["NUB", "Proceeds"], ["Net Return per", "Annum"],
                  ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
        ];

        break;

        case 3: // FlowTriever + USAT (Per Annum)
            myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumTotal, 0, 0, 0];
            myChart_DRGPerAnnum.data.datasets[1].data = [FlowTriever_PerAnnumTotal, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumNUB, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal, 0, 0, 0, 0];
            myChart_DRGPerAnnum.data.datasets[2].data = [0, 0, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotal];
            myChart_DRGPerAnnum.data.datasets[3].data = [0, 0, 0, 0, 0, 0, 0];
            TotalsToRender_DRGPerAnnum = [
                FlowTriever_PerAnnumTotal,
                FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB,
                FlowTriever_PerAnnumNUB,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal,
                UltrasoundAssistedThrombolysis_PerAnnumTotal,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["NUB", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;
                
        case 3: // FlowTriever only
             myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumTotal, 0, 0, 0];
           myChart_DRGPerAnnum.data.datasets[1].data = [FlowTriever_PerAnnumTotal, FlowTriever.DRGProceedsPerAnnum-FlowTriever_PerAnnumNUB, FlowTriever_PerAnnumNUB, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal, 0, 0, 0, 0];
              myChart_DRGPerAnnum.data.datasets[2].data = [];
            myChart_DRGPerAnnum.data.datasets[3].data = [];
            TotalsToRender_DRGPerAnnum = [
                FlowTriever_PerAnnumTotal,
                FlowTriever.DRGProceedsPerAnnum,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
            ["Cost per", "Annum"], ["DRG", "Proceeds"], ["NUB", "Proceeds"], ["Net Return per", "Annum"],
               ];
            break;

        case 5: // Anticoagulation only
            myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, 0, Anticoagulation_PerAnnumTotal, 0, 0, 0, 0, 0];
            myChart_DRGPerAnnum.data.datasets[1].data = [];
            myChart_DRGPerAnnum.data.datasets[2].data = [Anticoagulation_PerAnnumTotal, Anticoagulation.DRGProceedsPerAnnum, Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotal];
            myChart_DRGPerAnnum.data.datasets[3].data = [];
            TotalsToRender_DRGPerAnnum = [
                Anticoagulation_PerAnnumTotal,
                Anticoagulation.DRGProceedsPerAnnum,
                Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 6: // Systemic Thrombolysis only
            myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, 0, 0, 0, 0, SystemicThrombolysis_PerAnnumTotal, 0, 0];
            myChart_DRGPerAnnum.data.datasets[1].data = [];
            myChart_DRGPerAnnum.data.datasets[2].data = [];
            myChart_DRGPerAnnum.data.datasets[3].data = [SystemicThrombolysis_PerAnnumTotal, SystemicThrombolysis.DRGProceedsPerAnnum, SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotal];
            TotalsToRender_DRGPerAnnum = [
                SystemicThrombolysis_PerAnnumTotal,
                SystemicThrombolysis.DRGProceedsPerAnnum,
                SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 7: // Ultrasound Assisted Thrombolysis only
            myChart_DRGPerAnnum.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotal, 0, 0];
            myChart_DRGPerAnnum.data.datasets[1].data = [];
            myChart_DRGPerAnnum.data.datasets[2].data = [];
            myChart_DRGPerAnnum.data.datasets[3].data = [UltrasoundAssistedThrombolysis_PerAnnumTotal, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotal];
            TotalsToRender_DRGPerAnnum = [
                UltrasoundAssistedThrombolysis_PerAnnumTotal,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotal
            ];
            myChart_DRGPerAnnum.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;
    }

    // Finally:
    myChart_DRGPerAnnum.update();




   // Pre-calculate Per Annum totals
    var FlowTriever_PerAnnumTotalCHF = (FlowTriever.CostPerAnnum + FlowTriever.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + FlowTriever.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + FlowTriever_TotalDeviceContingent_TotalAnnumTotal;
    var Anticoagulation_PerAnnumTotalCHF = (Anticoagulation.CostPerAnnum + Anticoagulation.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + Anticoagulation.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + Anticoagulation_TotalDeviceContingent_TotalAnnumTotal;
    var SystemicThrombolysis_PerAnnumTotalCHF = (SystemicThrombolysis.CostPerAnnum + SystemicThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + SystemicThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + SystemicThrombolysis_TotalDeviceContingent_TotalAnnumTotal;
    var UltrasoundAssistedThrombolysis_PerAnnumTotalCHF = (UltrasoundAssistedThrombolysis.CostPerAnnum + UltrasoundAssistedThrombolysis.CostOfBleedingEvents[currentRiskString].TotalContingentCostPerAnnum + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions[currentRiskString].TotalContingentCostPerAnnum) + UltrasoundAssistedThrombolysis_TotalDeviceContingent_TotalAnnumTotal;

    // Set up chart data
    switch (idx) {
        case 0: // All Technologies
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, FlowTriever_PerAnnumTotalCHF, 0, 0, Anticoagulation_PerAnnumTotalCHF, 0, 0, SystemicThrombolysis_PerAnnumTotalCHF, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [FlowTriever_PerAnnumTotalCHF, FlowTriever.DRGProceedsPerAnnum, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [0, 0, 0, Anticoagulation_PerAnnumTotalCHF, Anticoagulation.DRGProceedsPerAnnum, Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [0, 0, 0, 0, 0, 0, SystemicThrombolysis_PerAnnumTotalCHF, SystemicThrombolysis.DRGProceedsPerAnnum, SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[4].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotalCHF, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotalCHF];
            TotalsToRender_DRGPerAnnumCHF = [
                FlowTriever_PerAnnumTotalCHF,
                FlowTriever.DRGProceedsPerAnnum,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF,
                Anticoagulation_PerAnnumTotalCHF,
                Anticoagulation.DRGProceedsPerAnnum,
                Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotalCHF,
                SystemicThrombolysis_PerAnnumTotalCHF,
                SystemicThrombolysis.DRGProceedsPerAnnum,
                SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotalCHF,
                UltrasoundAssistedThrombolysis_PerAnnumTotalCHF,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 1: // FlowTriever + AC
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, FlowTriever_PerAnnumTotalCHF, 0, 0, Anticoagulation_PerAnnumTotalCHF, 0, 0, 0];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [FlowTriever_PerAnnumTotalCHF, FlowTriever.DRGProceedsPerAnnum, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [0, 0, 0, Anticoagulation_PerAnnumTotalCHF, Anticoagulation.DRGProceedsPerAnnum, Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [0, 0, 0, 0, 0, 0];
            TotalsToRender_DRGPerAnnumCHF = [
                FlowTriever_PerAnnumTotalCHF,
                FlowTriever.DRGProceedsPerAnnum,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF,
                Anticoagulation_PerAnnumTotalCHF,
                Anticoagulation.DRGProceedsPerAnnum,
                Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

    case 2: // FlowTriever + ST (Per Annum)

        myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, FlowTriever_PerAnnumTotalCHF, 0, 0, SystemicThrombolysis_PerAnnumTotalCHF, 0, 0, 0];
        
        myChart_DRGPerAnnumCHF.data.datasets[1].data = [
            FlowTriever_PerAnnumTotalCHF,
            FlowTriever.DRGProceedsPerAnnum,
            FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF
        ];
        
        myChart_DRGPerAnnumCHF.data.datasets[2].data = [
            0, 0, 0,
            SystemicThrombolysis_PerAnnumTotalCHF,
            SystemicThrombolysis.DRGProceedsPerAnnum,
            SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotalCHF
        ];
        
        myChart_DRGPerAnnumCHF.data.datasets[3].data = [0, 0, 0, 0, 0, 0];

        TotalsToRender_DRGPerAnnumCHF = [
            FlowTriever_PerAnnumTotalCHF,
            FlowTriever.DRGProceedsPerAnnum,
            FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF,
            SystemicThrombolysis_PerAnnumTotalCHF,
            SystemicThrombolysis.DRGProceedsPerAnnum,
            SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotalCHF
        ];

        myChart_DRGPerAnnumCHF.data.labels = [
            ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
            ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
        ];

        break;

        case 3: // FlowTriever + USAT (Per Annum)
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, FlowTriever_PerAnnumTotalCHF, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotalCHF, 0, 0, 0];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [FlowTriever_PerAnnumTotalCHF, FlowTriever.DRGProceedsPerAnnum, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [0, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotalCHF, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [0, 0, 0, 0, 0, 0];
            TotalsToRender_DRGPerAnnumCHF = [
                FlowTriever_PerAnnumTotalCHF,
                FlowTriever.DRGProceedsPerAnnum,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF,
                UltrasoundAssistedThrombolysis_PerAnnumTotalCHF,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"],
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 4: // FlowTriever only
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, FlowTriever_PerAnnumTotalCHF, 0, 0, 0, 0, 0, 0];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [FlowTriever_PerAnnumTotalCHF, FlowTriever.DRGProceedsPerAnnum, FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [];
            TotalsToRender_DRGPerAnnumCHF = [
                FlowTriever_PerAnnumTotalCHF,
                FlowTriever.DRGProceedsPerAnnum,
                FlowTriever.DRGProceedsPerAnnum - FlowTriever_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 5: // Anticoagulation only
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, 0, Anticoagulation_PerAnnumTotalCHF, 0, 0, 0, 0, 0];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [Anticoagulation_PerAnnumTotalCHF, Anticoagulation.DRGProceedsPerAnnum, Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotalCHF];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [];
            TotalsToRender_DRGPerAnnumCHF = [
                Anticoagulation_PerAnnumTotalCHF,
                Anticoagulation.DRGProceedsPerAnnum,
                Anticoagulation.DRGProceedsPerAnnum - Anticoagulation_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 6: // Systemic Thrombolysis only
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, 0, 0, 0, 0, SystemicThrombolysis_PerAnnumTotalCHF, 0, 0];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [SystemicThrombolysis_PerAnnumTotalCHF, SystemicThrombolysis.DRGProceedsPerAnnum, SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotalCHF];
            TotalsToRender_DRGPerAnnumCHF = [
                SystemicThrombolysis_PerAnnumTotalCHF,
                SystemicThrombolysis.DRGProceedsPerAnnum,
                SystemicThrombolysis.DRGProceedsPerAnnum - SystemicThrombolysis_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;

        case 7: // Ultrasound Assisted Thrombolysis only
            myChart_DRGPerAnnumCHF.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0, 0, UltrasoundAssistedThrombolysis_PerAnnumTotalCHF, 0, 0];
            myChart_DRGPerAnnumCHF.data.datasets[1].data = [];
            myChart_DRGPerAnnumCHF.data.datasets[2].data = [];
            myChart_DRGPerAnnumCHF.data.datasets[3].data = [UltrasoundAssistedThrombolysis_PerAnnumTotalCHF, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum, UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotalCHF];
            TotalsToRender_DRGPerAnnumCHF = [
                UltrasoundAssistedThrombolysis_PerAnnumTotalCHF,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum,
                UltrasoundAssistedThrombolysis.DRGProceedsPerAnnum - UltrasoundAssistedThrombolysis_PerAnnumTotalCHF
            ];
            myChart_DRGPerAnnumCHF.data.labels = [
                ["Cost per", "Annum"], ["DRG", "Proceeds"], ["Net Return per", "Annum"]
            ];
            break;
    }

    // Finally:
    myChart_DRGPerAnnumCHF.update();


    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents  = (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * ProportionOfPatientsWithHighRiskPE + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * ProportionOfPatientsWithIntHighRiskPE) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);;
    UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents  = (UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * ProportionOfPatientsWithHighRiskPE + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * ProportionOfPatientsWithIntHighRiskPE) / (ProportionOfPatientsWithHighRiskPE + ProportionOfPatientsWithIntHighRiskPE);;
}



function updateChartPerProcedure(currentRiskString) {
   
}


function updateAnnualIntermediateHighRiskPEPatients() {
    NumberOfAnnualPEInpatientCases2016 = NumberOfAnnualPECasesDiagnosedandTreatedInpatientOutpatient * PercentageOfPECasesInpatientTreated;
    $('.NumberOfAnnualPEInpatientCases2016').text(Math.round(NumberOfAnnualPEInpatientCases2016).toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0
    }));
   
    AnnualIntermediateHighRiskPEPatients = Math.round(HospitalSize * AnnualIntermediateHighRiskPEPatientsPerBed);
    $('#AnnualIntermediateHighRiskPEPatients').val(Math.floor(AnnualIntermediateHighRiskPEPatients));

    updateValues();
}


$('#AnnualIntermediateHighRiskPEPatientsPerBed').on("change", function(event) {
    AnnualIntermediateHighRiskPEPatientsPerBed = $(this).val();
    updateAnnualIntermediateHighRiskPEPatients();
})


$('#HospitalName').on("change", function(event) {
    HospitalName = $(this).val();
    
})


$('#HospitalSize').on("change", function(event) {
    HospitalSize = $(this).val();
    AnnualHighRiskPEPatients_changed = false;
    AnnualIntermediateHighRiskPEPatients_changed = false;
    recalcAnnualHighRiskPEPatients();
    recalcAnnualIntermediateHighRiskPEPatients();
    updateValues();
})

// Function to handle change for AnnualPERelatedHospitalisations2020
$('#AnnualPERelatedHospitalisations2020').on("change", function(event) {
    AnnualPERelatedHospitalisations2020 = parseInt($(this).val());
    recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed();
     recalcProportionOfPatientsWithHighRiskPE();
    recalcProportionOfPatientsWithIntHighRiskPE();
    updateValues();
});

// Function to handle change for TotalNumberOfHospitalBedsInGermany2023
$('#TotalNumberOfHospitalBedsInGermany2023').on("change", function(event) {
    TotalNumberOfHospitalBedsInGermany2023 = parseInt($(this).val());
    recalcAnnualPERelatedHospitalisations2020();
    recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed();
    updateValues();
});

// Function to handle change for AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed
$('#AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed').on("change", function(event) {
    AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed = parseFloat($(this).val());
    recalcAnnualHighRiskPEPatients();
  //  recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed();
    recalcAnnualIntermediateHighRiskPEPatients();
    recalcProportionOfPatientsWithHighRiskPE();
    recalcProportionOfPatientsWithIntHighRiskPE();
    recalcAnnualPERelatedHospitalisations2020();
    updateValues();
});

// Function to handle change for AnnualHighRiskPEPatients
$('#AnnualHighRiskPEPatients').on("change", function(event) {
//    AnnualHighRiskPEPatients_changed = true;
    AnnualHighRiskPEPatients = parseInt($(this).val());
    recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed();
    recalcProportionOfPatientsWithHighRiskPE();
    updateValues();
});

// Function to handle change for AnnualIntermediateHighRiskPEPatients
$('#AnnualIntermediateHighRiskPEPatients').on("change", function(event) {
  //  AnnualIntermediateHighRiskPEPatients_changed = true;
    AnnualIntermediateHighRiskPEPatients = parseInt($(this).val());
    recalcAnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed();
    recalcProportionOfPatientsWithIntHighRiskPE();
    updateValues();
});

// Function to handle change for ProportionOfPatientsWithHighRiskPE (Convert to decimal)
$('#ProportionOfPatientsWithHighRiskPE').on("change", function(event) {
    ProportionOfPatientsWithHighRiskPE = parseFloat($(this).val()) / 100;
    recalcAnnualHighRiskPEPatients();
    recalcAnnualIntermediateHighRiskPEPatients();
    updateValues();
});

// Function to handle change for ProportionOfPatientsWithIntHighRiskPE (Convert to decimal)
$('#ProportionOfPatientsWithIntHighRiskPE').on("change", function(event) {
    ProportionOfPatientsWithIntHighRiskPE = parseFloat($(this).val()) / 100;
    recalcAnnualHighRiskPEPatients();
    recalcAnnualIntermediateHighRiskPEPatients();
    updateValues();
});

// Function to handle change for PercentageOfCostsVariableCatheterizationSuiteandICU (Convert to decimal)
$('#PercentageOfCostsVariableCatheterizationSuiteandICU').on("change", function(event) {
    PercentageOfCostsVariableCatheterizationSuiteandICU = parseFloat($(this).val()) / 100;
    updateValues();
});

// Function to handle change for PercentageOfCostsVariableGeneralHospitalWard (Convert to decimal)
$('#PercentageOfCostsVariableGeneralHospitalWard').on("change", function(event) {
    PercentageOfCostsVariableGeneralHospitalWard = parseFloat($(this).val()) / 100;
    updateValues();
});




$('#AnnualIntermediateHighRiskPEPatients').on("change", function(event) {
    AnnualIntermediateHighRiskPEPatients = $(this).val() * 1;
    updateValues();
})


function resetFlowTrieverNUBNegotiationResult_modal() {
    $('#FlowTrieverNUBNegotiationResult_input').val(NUBBackup);
}

function saveFlowTrieverNUBNegotiationResult_modal() {
    flowTrieverNUBNegotiationResult = parseInt($('#FlowTrieverNUBNegotiationResult_input').val());
    NUBBackup = flowTrieverNUBNegotiationResult;
    $('#FlowTrieverNUBNegotiationResult').val(NUBBackup);
    $('#FlowTrieverNUBNegotiationResult_value').text(NUBBackup.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + " €");
    updateValues();
}


function resetBaserate_modal() {
    $('#Baserate_Cost').val(currentBaserate);
}

function saveBaserate_modal() {
  
    if (currentBaserate != parseInt($('#Baserate_Cost').val())) {
        var newValue = parseInt($('#Baserate_Cost').val())
        if (currentCurrency == 0) {
            currentBaseRate_Euro = newValue;
        } else {
            currentBaseRate_CHF = newValue;
        }
        currentBaserate = newValue;
        currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
        $('.currentBaserate').text(currentBaserateString);
         $('#stateName').text("Custom Value");
         $('#cityValue').text(currentBaserateString);
         updateDRGChart();

    }

    updateValues();
}

function resetFlowTriever_DRG_modal() {
    $('#FlowTriever_DRG_input').val(FlowTriever.Proceeds[currentCurrencyObject].DRG);
}

function saveFlowTriever_DRG_modal() {
    FlowTriever.Proceeds[currentCurrencyObject].DRG = $('#FlowTriever_DRG_input').val();
    $('.FlowDRGName').text(FlowTriever.Proceeds[currentCurrencyObject].DRG);
}


function resetAnticoagulation_DRG_modal() {
    $('#Anticoagulation_DRG_input').val(Anticoagulation.Proceeds[currentCurrencyObject].DRG);
}

function saveAnticoagulation_DRG_modal() {
    Anticoagulation.Proceeds[currentCurrencyObject].DRG = $('#Anticoagulation_DRG_input').val();
    $('.ACDRGName').text(Anticoagulation.Proceeds[currentCurrencyObject].DRG);
}

function resetSystemicThrombolysis_DRG_modal() {
    $('#SystemicThrombolysis_DRG_input').val(SystemicThrombolysis.Proceeds[currentCurrencyObject].DRG);
}


function saveSystemicThrombolysis_DRG_modal() {
    SystemicThrombolysis.Proceeds[currentCurrencyObject].DRG = $('#SystemicThrombolysis_DRG_input').val();
    $('.STDRGName').text(SystemicThrombolysis.Proceeds[currentCurrencyObject].DRG);
}



function resetFlowTriever_CostWeightBaseRate_modal() {
    $('#FlowTriever_CostWeightBaseRate_input').val(FlowTriever.Proceeds[currentCurrencyObject].CostWeightBaseRate);
}

function saveFlowTriever_CostWeightBaseRate_modal() {
    FlowTriever.Proceeds[currentCurrencyObject].CostWeightBaseRate = $('#FlowTriever_CostWeightBaseRate_input').val();
    $('.flowCostWeight').text(FlowTriever.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentFlowRate = FlowTriever.Proceeds[currentCurrencyObject].CostWeightBaseRate;
    updateValues();
}

function resetAnticoagulation_CostWeightBaseRate_modal() {
    $('#Anticoagulation_CostWeightBaseRate_input').val(Anticoagulation.Proceeds[currentCurrencyObject].CostWeightBaseRate);
}

function saveAnticoagulation_CostWeightBaseRate_modal() {
    Anticoagulation.Proceeds[currentCurrencyObject].CostWeightBaseRate = $('#Anticoagulation_CostWeightBaseRate_input').val();
    $('.ACCostWeight').text(Anticoagulation.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentACRate = Anticoagulation.Proceeds[currentCurrencyObject].CostWeightBaseRate;
    updateValues();
}


function resetSystemicThrombolysis_CostWeightBaseRate_modal() {
    $('#SystemicThrombolysis_CostWeightBaseRate_input').val(SystemicThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate);
}

function saveSystemicThrombolysisCostWeightBaseRate_modal() {
    SystemicThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate = $('#SystemicThrombolysis_CostWeightBaseRate_input').val();
    $('.STCostWeight').text(SystemicThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentSTRate = SystemicThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate;
    updateValues();
}

function resetUltrasoundAssistedThrombolysis_CostWeightBaseRate_modal() {
    $('#UltrasoundAssistedThrombolysis_CostWeightBaseRate_input').val(UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate);
}

function saveUltrasoundAssistedThrombolysis_CostWeightBaseRate_modal() {
    UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate = $('#UltrasoundAssistedThrombolysis_CostWeightBaseRate_input').val();
    $('.UTCostWeight').text(UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate);
    currentUTRate = UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].CostWeightBaseRate;
    updateValues();
}   


function resetFlowTriever_LimitDwellTime_modal() {
    $('#FlowTriever_LimitDwellTime_input').val(FlowTriever.Proceeds[currentCurrencyObject].LimitDwellTime);
}

function saveFlowTriever_LimitDwellTime_modal() {
    FlowTriever.Proceeds[currentCurrencyObject].LimitDwellTime = $('#FlowTriever_LimitDwellTime_input').val();
    $('.flowDwellTime').text(FlowTriever.Proceeds[currentCurrencyObject].LimitDwellTime);
}


function resetAnticoagulation_LimitDwellTime_modal() {
    $('#Anticoagulation_LimitDwellTime_input').val(Anticoagulation.Proceeds[currentCurrencyObject].LimitDwellTime);
}

function saveAnticoagulation_LimitDwellTime_modal() {
    Anticoagulation.Proceeds[currentCurrencyObject].LimitDwellTime = $('#Anticoagulation_LimitDwellTime_input').val();
    $('.ACDwellTime').text(Anticoagulation.Proceeds[currentCurrencyObject].LimitDwellTime);
}

function resetSystemicThrombolysis_LimitDwellTime_modal() {
    $('#SystemicThrombolysis_LimitDwellTime_input').val(SystemicThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime);
}


function saveSystemicThrombolysis_LimitDwellTime_modal() {
    SystemicThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime = $('#SystemicThrombolysis_LimitDwellTime_input').val();
    $('.STDwellTime').text(SystemicThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime);
}

function resetUltrasoundAssistedThrombolysis_LimitDwellTime_modal() {
    $('#UltrasoundAssistedThrombolysis_LimitDwellTime_input').val(UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime);
}


function saveUltrasoundAssistedThrombolysis_LimitDwellTime_modal() {
    UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime = $('#UltrasoundAssistedThrombolysis_LimitDwellTime_input').val();
    $('.UTDwellTime').text(UltrasoundAssistedThrombolysis.Proceeds[currentCurrencyObject].LimitDwellTime);
}


// new col card 4 code
function resetUltrasoundAssistedThrombolysis_EKOSSystemPPP_modal() {
    $('#UltrasoundAssistedThrombolysis_EKOSSystemPPP_Cost').val(UltrasoundAssistedThrombolysis.EKOSSystemPPP);
}

function saveUltrasoundAssistedThrombolysis_EKOSSystemPPP_modal() {
    UltrasoundAssistedThrombolysis.EKOSSystemPPP = parseInt($('#UltrasoundAssistedThrombolysis_EKOSSystemPPP_Cost').val());
    updateValues();
}


function resetUltrasoundAssistedThrombolysis_ControlUnitCostPerEpisode_modal() {
    $('#UltrasoundAssistedThrombolysis_ControlUnitCostPerEpisode_Cost').val(UltrasoundAssistedThrombolysis.ControlUnitCostPerEpisode);
}

function saveUltrasoundAssistedThrombolysis_ControlUnitCostPerEpisode_modal() {
    UltrasoundAssistedThrombolysis.ControlUnitCostPerEpisode = parseInt($('#UltrasoundAssistedThrombolysis_ControlUnitCostPerEpisode_Cost').val());
    updateValues();
}


function resetUltrasoundAssistedThrombolysis_CostOfFibrinolytics_modal() {
    $('#UltrasoundAssistedThrombolysis_CostOfFibrinolytics_Cost').val(UltrasoundAssistedThrombolysis.CostOfFibrinolytics);
}

function saveUltrasoundAssistedThrombolysis_CostOfFibrinolytics_modal() {
    UltrasoundAssistedThrombolysis.CostOfFibrinolytics = parseInt($('#UltrasoundAssistedThrombolysis_CostOfFibrinolytics_Cost').val());
    updateValues();
}



function resetUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal() {

    switch (whichPERisk) {
        case 0:
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row3").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row4").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents_ref);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * 100)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent_ref);
            $('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row3").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents_ref);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * 100)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row4").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent_ref);
            $('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent)
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;
        case 2:
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val((UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * 100).toFixed(2));
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent)
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row3").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val((UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * 100).toFixed(2));
            $("#UltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal .row4").attr('title', UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent)
            $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal() {
    var TotalCost = (($('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))
    $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal() {
    var TotalCost = (($('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))

    switch (whichPERisk) {
        case 0:
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents = $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent = parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents = $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent = parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;
            break;
        case 1:
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents = $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent = parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents = $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent = parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = TotalCost;
            break;
        case 2:
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents = $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent = parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents = $('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent = parseInt($('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            UltrasoundAssistedThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;

            break;
        default:
            // code for any other value
            
            break;


    }

    updateValues();
}

$('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal();
})

$('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal();
})


$('.UltrasoundAssistedThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal();
})


$('#UltrasoundAssistedThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfBleedingEvents_modal();
})




function resetUltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal() {
    $('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row1').attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate_ref);


    switch (whichPERisk) {
        case 0:
            $("#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate_ref);
            $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts)
            $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate_ref);
            $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * 100)
            $("#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts_ref);
            $('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts)
            $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 2:
            $("#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate_ref);
            $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts)
            $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcUltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal() {
    var TotalCost = (($('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))
    $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveUltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal() {

    var TotalCost = (($('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))

    switch (whichPERisk) {
        case 0:
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate = $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts = ($('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 1:
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate = $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts = ($('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 2:
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate = $('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts = ($('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            UltrasoundAssistedThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;

            break;
        default:
            // code for any other value
            
            break;
    }
    updateValues();
}

$('.UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal();
})


$('#UltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostsOfHospitalReadmissions_modal();
})


function saveUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal() {
    UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays = $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').val();
    UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay = $('#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = TotalCost2;
    updateValues();
}


function resetUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal() {

    $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').val(UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays);
    $("#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PercentVariable_ref);
    $('#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val(UltrasoundAssistedThrombolysis.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay);
    calcUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
}



function calcUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal() {
    var TotalCost1 = $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
   
    $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    console.log(TotalCost1);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}

$('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
})



$('#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
})

$('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
})

$('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
})


$('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
})

function saveUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal() {
    UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients = $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').val() * 0.01
    UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays = $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').val();
    UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay = $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients * UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost = TotalCost2;
    updateValues();

}

function resetUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal() {

    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').val(UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients * 100);
    $("#UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').val(UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays);
    $("#UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal .row3").attr('title', UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentVariable_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val(UltrasoundAssistedThrombolysis.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay);
    calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
}

function calcUltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal() {
    console.log("calc");
    var TotalCost1 = $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').val() * 0.01 * $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.UltrasoundAssistedThrombolysis_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);


}



function calcUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
})

$('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
})



$('#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
})

function saveUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {
    UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients = $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01
    UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays = $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val();
    UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay = $('#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {

    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val(UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * 100);
    $("#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val(UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays);
    $("#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row2").attr('title', UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row3").attr('title', UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.PercentVariable_ref);
    $('#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val(UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay);
    $("#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row4").attr('title', UltrasoundAssistedThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay_ref);

    calcUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
}

function calcUltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.UltrasoundAssistedThrombolysis_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}



function saveUltrasoundAssistedThrombolysis_CostOfHospitalStay_modal() {
    UltrasoundAssistedThrombolysis.CostOfHospitalStay.TimeMinutesDays = $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_TimeMinutesDays').val();
    UltrasoundAssistedThrombolysis.CostOfHospitalStay.CostPerMinPerDay = $('#UltrasoundAssistedThrombolysis_CostOfHospitalStay_CostPerMinPerDay').val();
    UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost = UltrasoundAssistedThrombolysis.CostOfHospitalStay.TimeMinutesDays * PercentageOfCostsVariableGeneralHospitalWard * UltrasoundAssistedThrombolysis.CostOfHospitalStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    UltrasoundAssistedThrombolysis.CostOfHospitalStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetUltrasoundAssistedThrombolysis_CostOfHospitalStay_modal() {
console.log(UltrasoundAssistedThrombolysis.CostOfHospitalStay.TimeMinutesDays)
    $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_TimeMinutesDays').val(UltrasoundAssistedThrombolysis.CostOfHospitalStay.TimeMinutesDays);
    $("#UltrasoundAssistedThrombolysis_CostOfHospitalStay_modal .row1").attr('title', UltrasoundAssistedThrombolysis.CostOfHospitalStay.TimeMinutesDays_ref);
    $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_PercentVariable').text((PercentageOfCostsVariableGeneralHospitalWard * 100) + "%");
    $('#UltrasoundAssistedThrombolysis_CostOfHospitalStay_CostPerMinPerDay').val(UltrasoundAssistedThrombolysis.CostOfHospitalStay.CostPerMinPerDay);
    calcUltrasoundAssistedThrombolysis_CostOfHospitalStay_modal();
}

function calcUltrasoundAssistedThrombolysis_CostOfHospitalStay_modal() {
    var TotalCost1 = $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_TimeMinutesDays').val() * PercentageOfCostsVariableGeneralHospitalWard * $('#UltrasoundAssistedThrombolysis_CostOfHospitalStay_CostPerMinPerDay').val();
    $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.UltrasoundAssistedThrombolysis_CostOfHospitalStay_TimeMinutesDays').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfHospitalStay_modal();
})


$('#UltrasoundAssistedThrombolysis_CostOfHospitalStay_CostPerMinPerDay').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfHospitalStay_modal();
})



$('.UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
})



$('#UltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').on("change", function(event) {
    calcUltrasoundAssistedThrombolysis_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
})

// end new col 4

function resetFlowTriever_FlowTrieverSystemPPP_modal() {
    $('#FlowTriever_FlowTrieverSystemPPP_Cost').val(FlowTriever.FlowTrieverSystemPPP);
}

function saveFlowTriever_FlowTrieverSystemPPP_modal() {
    FlowTriever.FlowTrieverSystemPPP = parseInt($('#FlowTriever_FlowTrieverSystemPPP_Cost').val());
    updateValues();
}

function resetFlowTriever_OtherMaterialCosts_modal() {
    $('#FlowTriever_OtherMaterialCosts_Cost').val(FlowTriever.OtherMaterialCosts);
}

function saveFlowTriever_OtherMaterialCosts_modal() {
    FlowTriever.OtherMaterialCosts = parseInt($('#FlowTriever_OtherMaterialCosts_Cost').val());
    updateValues();
}

function resetFlowTriever_CostOfFibrinolytics_modal() {
    $('#FlowTriever_CostOfFibrinolytics_Cost').val(FlowTriever.CostOfFibrinolytics);
}

function saveFlowTriever_CostOfFibrinolytics_modal() {
    FlowTriever.CostOfFibrinolytics = parseInt($('#FlowTriever_CostOfFibrinolytics_Cost').val());
    updateValues();
}

function resetAnticoagulation_CostOfFibrinolytics_modal() {
    $('#Anticoagulation_CostOfFibrinolytics_Cost').val(Anticoagulation.CostOfFibrinolytics);
}

function saveAnticoagulation_CostOfFibrinolytics_modal() {
    Anticoagulation.CostOfFibrinolytics = parseInt($('#Anticoagulation_CostOfFibrinolytics_Cost').val());
    updateValues();
}

function resetAnticoagulation_OtherMaterialCosts_modal() {
    $('#Anticoagulation_OtherMaterialCosts_Cost').val(Anticoagulation.OtherMaterialCosts);

}

function saveAnticoagulation_OtherMaterialCosts_modal() {
    Anticoagulation.OtherMaterialCosts = parseInt($('#Anticoagulation_OtherMaterialCosts_Cost').val());
    updateValues();
}

function resetAnticoagulation_OtherMedicationPharmaceuticalProducts_modal() {
    $('#Anticoagulation_OtherMedicationPharmaceuticalProducts_Cost').val(Anticoagulation.OtherMedicationPharmaceuticalProducts);
}

function saveAnticoagulation_OtherMedicationPharmaceuticalProducts_modal() {
    Anticoagulation.OtherMedicationPharmaceuticalProducts = parseInt($('#Anticoagulation_OtherMedicationPharmaceuticalProducts_Cost').val());
    updateValues();
}


function resetSystemicThrombolysis_CostOfFibrinolytics_modal() {
    $('#SystemicThrombolysis_CostOfFibrinolytics_Cost').val(SystemicThrombolysis.CostOfFibrinolytics);
}

function saveSystemicThrombolysis_CostOfFibrinolytics_modal() {
    SystemicThrombolysis.CostOfFibrinolytics = parseInt($('#SystemicThrombolysis_CostOfFibrinolytics_Cost').val());
    updateValues();
}

function resetSystemicThrombolysis_OtherMaterialCosts_modal() {
    $('#SystemicThrombolysis_OtherMaterialCosts_Cost').val(SystemicThrombolysis.OtherMaterialCosts);
}

function saveSystemicThrombolysis_OtherMaterialCosts_modal() {
    SystemicThrombolysis.OtherMaterialCosts = parseInt($('#SystemicThrombolysis_OtherMaterialCosts_Cost').val());
    updateValues();
}

function resetSystemicThrombolysis_OtherMedicationPharmaceuticalProducts_modal() {
    $('#SystemicThrombolysis_OtherMedicationPharmaceuticalProducts_Cost').val(SystemicThrombolysis.OtherMedicationPharmaceuticalProducts);

}

function saveSystemicThrombolysis_OtherMedicationPharmaceuticalProducts_modal() {
    SystemicThrombolysis.OtherMedicationPharmaceuticalProducts = parseInt($('#SystemicThrombolysis_OtherMedicationPharmaceuticalProducts_Cost').val());
    updateValues();
}

function resetFlowTriever_CostOfBleedingEvents_modal() {

    switch (whichPERisk) {
        case 0:
            $("#FlowTriever_CostOfBleedingEvents_modal .row1").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#FlowTriever_CostOfBleedingEvents_modal .row2").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent)
            $("#FlowTriever_CostOfBleedingEvents_modal .row3").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#FlowTriever_CostOfBleedingEvents_modal .row4").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
            $('.FlowTriever_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#FlowTriever_CostOfBleedingEvents_modal .row1").attr('title', FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents_ref);
            $('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * 100)
            $("#FlowTriever_CostOfBleedingEvents_modal .row2").attr('title', FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent_ref);
            $('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent)
            $("#FlowTriever_CostOfBleedingEvents_modal .row3").attr('title', FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents_ref);
            $('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * 100)
            $("#FlowTriever_CostOfBleedingEvents_modal .row4").attr('title', FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent_ref);
            $('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent)
            $('.FlowTriever_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;
        case 2:
            $("#FlowTriever_CostOfBleedingEvents_modal .row1").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#FlowTriever_CostOfBleedingEvents_modal .row2").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent)
            $("#FlowTriever_CostOfBleedingEvents_modal .row3").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#FlowTriever_CostOfBleedingEvents_modal .row4").attr('title', FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent)
            $('.FlowTriever_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcFlowTriever_CostOfBleedingEvents_modal() {
    var TotalCost = (($('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))
    $('.FlowTriever_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveFlowTriever_CostOfBleedingEvents_modal() {
    var TotalCost = (($('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))

    switch (whichPERisk) {
        case 0:
            FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents = $('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent = parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            FlowTriever.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents = $('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            FlowTriever.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent = parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            FlowTriever.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;
            break;
        case 1:
            FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents = $('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent = parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents = $('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent = parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            FlowTriever.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = TotalCost;
            break;
        case 2:
            FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents = $('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent = parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents = $('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent = parseInt($('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            FlowTriever.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;

            break;
        default:
            // code for any other value
            
            break;


    }

    updateValues();
}

$('.FlowTriever_CostOfBleedingEvent_PercentWithMajorBleedingEvents').on("change", function(event) {
    calcFlowTriever_CostOfBleedingEvents_modal();
})

$('#FlowTriever_CostOfBleedingEvent_CostPerMajorBleedingEvent').on("change", function(event) {
    calcFlowTriever_CostOfBleedingEvents_modal();
})


$('.FlowTriever_CostOfBleedingEvent_PercentWithMinorBleedingEvents').on("change", function(event) {
    calcFlowTriever_CostOfBleedingEvents_modal();
})


$('#FlowTriever_CostOfBleedingEvent_CostPerMinorBleedingEvent').on("change", function(event) {
    calcFlowTriever_CostOfBleedingEvents_modal();
})




function resetFlowTriever_CostsOfHospitalReadmissions_modal() {


    switch (whichPERisk) {
        case 0:
            $("#FlowTriever_CostsOfHospitalReadmissions_modal .row1").attr('title', FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate_ref);
            $('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#FlowTriever_CostsOfHospitalReadmissions_modal .row2").attr('title', FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts)
            $('.FlowTriever_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#FlowTriever_CostsOfHospitalReadmissions_modal .row1").attr('title', FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate_ref);
            $('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * 100)
            $("#FlowTriever_CostsOfHospitalReadmissions_modal .row2").attr('title', FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts_ref);
            $('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts)
            $('.FlowTriever_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 2:
            $("#FlowTriever_CostsOfHospitalReadmissions_modal .row1").attr('title', FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate_ref);
            $('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#FlowTriever_CostsOfHospitalReadmissions_modal .row2").attr('title', FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts)
            $('.FlowTriever_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcFlowTriever_CostsOfHospitalReadmissions_modal() {
    var TotalCost = (($('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))
    $('.FlowTriever_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveFlowTriever_CostsOfHospitalReadmissions_modal() {

    var TotalCost = (($('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))

    switch (whichPERisk) {
        case 0:
            FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate = $('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts = ($('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            FlowTriever.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 1:
            FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate = $('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts = ($('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            FlowTriever.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 2:
            FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate = $('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts = ($('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            FlowTriever.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;

            break;
        default:
            // code for any other value
            
            break;
    }
    updateValues();
}

$('.FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').on("change", function(event) {
    calcFlowTriever_CostsOfHospitalReadmissions_modal();
})


$('#FlowTriever_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').on("change", function(event) {
    calcFlowTriever_CostsOfHospitalReadmissions_modal();
})


function resetAnticoagulation_CostOfBleedingEvents_modal() {

    switch (whichPERisk) {
        case 0:
            $("#Anticoagulation_CostOfBleedingEvents_modal .row1").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row2").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row3").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row4").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
            $('.Anticoagulation_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#Anticoagulation_CostOfBleedingEvents_modal .row1").attr('title', Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents_ref);
            $('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * 100)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row2").attr('title', Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent_ref);
            $('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row3").attr('title', Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents_ref);
            $('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * 100)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row4").attr('title', Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent_ref);
            $('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent)
            $('.Anticoagulation_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;
        case 2:
            $("#Anticoagulation_CostOfBleedingEvents_modal .row1").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row2").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row3").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#Anticoagulation_CostOfBleedingEvents_modal .row4").attr('title', Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent)
            $('.Anticoagulation_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcAnticoagulation_CostOfBleedingEvents_modal() {
    var TotalCost = (($('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))
    $('.Anticoagulation_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveAnticoagulation_CostOfBleedingEvents_modal() {
    var TotalCost = (($('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))

    switch (whichPERisk) {
        case 0:
            Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents = $('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent = parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            Anticoagulation.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents = $('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            Anticoagulation.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent = parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            Anticoagulation.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;
            break;
        case 1:
            Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents = $('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent = parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents = $('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent = parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            Anticoagulation.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = TotalCost;
            break;
        case 2:
            Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents = $('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent = parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents = $('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent = parseInt($('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            Anticoagulation.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;

            break;
        default:
            // code for any other value
            
            break;

    }
    updateValues();
}

$('#Anticoagulation_CostOfBleedingEvent_PercentWithMajorBleedingEvents').on("change", function(event) {
    calcAnticoagulation_CostOfBleedingEvents_modal();
})

$('#Anticoagulation_CostOfBleedingEvent_CostPerMajorBleedingEvent').on("change", function(event) {
    calcAnticoagulation_CostOfBleedingEvents_modal();
})


$('#Anticoagulation_CostOfBleedingEvent_PercentWithMinorBleedingEvents').on("change", function(event) {
    calcAnticoagulation_CostOfBleedingEvents_modal();
})


$('#Anticoagulation_CostOfBleedingEvent_CostPerMinorBleedingEvent').on("change", function(event) {
    calcAnticoagulation_CostOfBleedingEvents_modal();
})




function resetAnticoagulation_CostsOfHospitalReadmissions_modal() {


    switch (whichPERisk) {
        case 0:
            $("#Anticoagulation_CostsOfHospitalReadmissions_modal .row1").attr('title', Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate_ref);
            $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#Anticoagulation_CostsOfHospitalReadmissions_modal .row2").attr('title', Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts)
            $('.Anticoagulation_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#Anticoagulation_CostsOfHospitalReadmissions_modal .row1").attr('title', Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate_ref);
            $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * 100)
            $("#Anticoagulation_CostsOfHospitalReadmissions_modal .row2").attr('title', Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts_ref);
            $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts)
            $('.Anticoagulation_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 2:
            $("#Anticoagulation_CostsOfHospitalReadmissions_modal .row1").attr('title', Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate_ref);
            $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#Anticoagulation_CostsOfHospitalReadmissions_modal .row2").attr('title', Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts)
            $('.Anticoagulation_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcAnticoagulation_CostsOfHospitalReadmissions_modal() {
    var TotalCost = (($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))
    $('.Anticoagulation_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveAnticoagulation_CostsOfHospitalReadmissions_modal() {

    var TotalCost = (($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))

    switch (whichPERisk) {
        case 0:
            Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate = $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts = parseInt($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            Anticoagulation.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 1:
            Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate = $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts = parseInt($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            Anticoagulation.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 2:
            Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate = $('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts = parseInt($('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            Anticoagulation.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;

            break;
        default:
            // code for any other value
            
            break;
    }
    updateValues();
}

$('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').on("change", function(event) {
    calcAnticoagulation_CostsOfHospitalReadmissions_modal();
})


$('#Anticoagulation_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').on("change", function(event) {
    calcAnticoagulation_CostsOfHospitalReadmissions_modal();
})



function resetSystemicThrombolysis_CostOfBleedingEvents_modal() {

    switch (whichPERisk) {
        case 0:
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row1").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row2").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row3").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row4").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent);
            $('.SystemicThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row1").attr('title', SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents * 100)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row2").attr('title', SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row3").attr('title', SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents * 100)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row4").attr('title', SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent)
            $('.SystemicThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;
        case 2:
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row1").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents * 100)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row2").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row3").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents * 100)
            $("#SystemicThrombolysis_CostOfBleedingEvents_modal .row4").attr('title', SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent_ref);
            $('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val(SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent)
            $('.SystemicThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcSystemicThrombolysis_CostOfBleedingEvents_modal() {
    var TotalCost = (($('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))
    $('.SystemicThrombolysis_CostOfBleedingEvent_MeanCostsPerProcedureForBleeding').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveSystemicThrombolysis_CostOfBleedingEvents_modal() {
    var TotalCost = (($('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01) * parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val())) + (($('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01) * parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val()))

    switch (whichPERisk) {
        case 0:
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMajorBleedingEvents = $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMajorBleedingEvent = parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.PercentWithMinorBleedingEvents = $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.CostPerMinorBleedingEvent = parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;
            CurrentPerAnnumCost = TotalCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMajorBleedingEvents = $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMajorBleedingEvent = parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.PercentWithMinorBleedingEvents = $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.CostPerMinorBleedingEvent = parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            SystemicThrombolysis.CostOfBleedingEvents.IntermediateHighRisk.MeanCostsPerProcedureForBleeding = TotalCost;
            CurrentPerAnnumCost = TotalCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMajorBleedingEvents = $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').val() * 0.01;
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMajorBleedingEvent = parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').val());
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.PercentWithMinorBleedingEvents = $('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').val() * 0.01;
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.CostPerMinorBleedingEvent = parseInt($('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').val());
            SystemicThrombolysis.CostOfBleedingEvents.HighRiskIntHighRiskPE.MeanCostsPerProcedureForBleeding = TotalCost;
            CurrentPerAnnumCost = TotalCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
            CurrentPerProcedureCost = TotalCost;

    }

    updateValues();
}

$('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMajorBleedingEvents').on("change", function(event) {
    calcSystemicThrombolysis_CostOfBleedingEvents_modal();
})

$('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMajorBleedingEvent').on("change", function(event) {
    calcSystemicThrombolysis_CostOfBleedingEvents_modal();
})


$('#SystemicThrombolysis_CostOfBleedingEvent_PercentWithMinorBleedingEvents').on("change", function(event) {
    calcSystemicThrombolysis_CostOfBleedingEvents_modal();
})


$('#SystemicThrombolysis_CostOfBleedingEvent_CostPerMinorBleedingEvent').on("change", function(event) {
    calcSystemicThrombolysis_CostOfBleedingEvents_modal();
})




function resetSystemicThrombolysis_CostsOfHospitalReadmissions_modal() {


    switch (whichPERisk) {
        case 0:
            $("#SystemicThrombolysis_CostsOfHospitalReadmissions_modal .row1").attr('title', SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate_ref);
            $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val((SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate * 100))
            $("#SystemicThrombolysis_CostsOfHospitalReadmissions_modal .row2").attr('title', SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts)
            $('.SystemicThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 1:
            $("#SystemicThrombolysis_CostsOfHospitalReadmissions_modal .row1").attr('title', SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate_ref);
            $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate * 100)
            $("#SystemicThrombolysis_CostsOfHospitalReadmissions_modal .row2").attr('title', SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts_ref);
            $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts)
            $('.SystemicThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)
            break;
        case 2:
            $("#SystemicThrombolysis_CostsOfHospitalReadmissions_modal .row1").attr('title', SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate_ref);
            $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val(SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate * 100)
            $("#SystemicThrombolysis_CostsOfHospitalReadmissions_modal .row2").attr('title', SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts_ref);
            $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val(SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts)
            $('.SystemicThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost.toLocaleString(currentLocaleCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + currentCurrencySuffix)

            break;

        default:
            // code for any other value
            
            break;
    }

}

function calcSystemicThrombolysis_CostsOfHospitalReadmissions_modal() {
    var TotalCost = (($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))
    $('.SystemicThrombolysis_CostsOfHospitalReadmissions_PerProcedure30DayReadmissionCost').text(currentCurrencyPrefix + TotalCost.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)
}

function saveSystemicThrombolysis_CostsOfHospitalReadmissions_modal() {

    var TotalCost = (($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01) * parseInt($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val()))

    switch (whichPERisk) {
        case 0:
            SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionRate = $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.ThirtyDayReadmissionCosts = parseInt($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 1:
            SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionRate = $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.ThirtyDayReadmissionCosts = parseInt($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            SystemicThrombolysis.CostsOfHospitalReadmissions.IntermediateHighRisk.PerProcedure30DayReadmissionCost = TotalCost;
            break;
        case 2:
            SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionRate = $('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').val() * 0.01;
            SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.ThirtyDayReadmissionCosts = parseInt($('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').val());
            SystemicThrombolysis.CostsOfHospitalReadmissions.HighRiskIntHighRiskPE.PerProcedure30DayReadmissionCost = TotalCost;

            break;
        default:
            // code for any other value
            
            break;
    }
    updateValues();
}

$('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionRate').on("change", function(event) {
    calcSystemicThrombolysis_CostsOfHospitalReadmissions_modal();
})


$('#SystemicThrombolysis_CostsOfHospitalReadmissions_ThirtyDayReadmissionCosts').on("change", function(event) {
    calcSystemicThrombolysis_CostsOfHospitalReadmissions_modal();
})





function saveFlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal() {
    FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays = $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').val();
    FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay = $('#FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetFlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal() {

    $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').val(FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays);
    $("#FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal .row1").attr('title', FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.TimeMinutesDays_ref);
    $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal .row2").attr('title', FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.PercentVariable_ref);
    $('#FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val(FlowTriever.CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime.CostPerMinPerDay);
    calcFlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
}

function calcFlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal() {
    var TotalCost1 = $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}

$('.FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_TimeMinutesDays').on("change", function(event) {
    calcFlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
})



$('#FlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_CostPerMinPerDay').on("change", function(event) {
    calcFlowTriever_CostOfPrimaryProcedureCatheterizationSuiteAndStaffTime_modal();
})

function saveFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal() {
    FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients = $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').val() * 0.01
    FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays = $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').val();
    FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay = $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients * FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PerProcedureCost = TotalCost2;
    updateValues();

}

function resetFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal() {

    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').val(FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients * 100);
    $("#FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal .row1").attr('title', FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentageOfPatients_ref);
    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').val(FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays);
    $("#FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal .row2").attr('title', FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.TimeMinutesDays_ref);
    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal .row3").attr('title', FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.PercentVariable_ref);
    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val(FlowTriever.CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime.CostPerMinPerDay);
    calcFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal();
}

function calcFlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_modal() {
    var TotalCost1 = $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PercentageOfPatients').val() * 0.01 * $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_CostPerMinPerDay').val();
    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.FlowTriever_CostOfAdjunctiveThrombolysisCatheterizationSuiteAndStaffTime_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);


}



function calcFlowTriever_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.FlowTriever_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#FlowTriever_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.FlowTriever_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').on("change", function(event) {
    calcFlowTriever_CostOfIntensiveCareUnitICUStay_modal();
})

$('.FlowTriever_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').on("change", function(event) {
    calcFlowTriever_CostOfIntensiveCareUnitICUStay_modal();
})



$('#FlowTriever_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').on("change", function(event) {
    calcFlowTriever_CostOfIntensiveCareUnitICUStay_modal();
})

function saveFlowTriever_CostOfIntensiveCareUnitICUStay_modal() {
    FlowTriever.CostOfIntensiveCareUnitICUStay.PercentageOfPatients = $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01
    FlowTriever.CostOfIntensiveCareUnitICUStay.TimeMinutesDays = $('.FlowTriever_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val();
    FlowTriever.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay = $('#FlowTriever_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost = FlowTriever.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * FlowTriever.CostOfIntensiveCareUnitICUStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * FlowTriever.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = FlowTriever.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    FlowTriever.CostOfIntensiveCareUnitICUStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetFlowTriever_CostOfIntensiveCareUnitICUStay_modal() {

    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val(FlowTriever.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * 100);
    $("#FlowTriever_CostOfIntensiveCareUnitICUStay_modal .row1").attr('title', FlowTriever.CostOfIntensiveCareUnitICUStay.PercentageOfPatients_ref);
    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val(FlowTriever.CostOfIntensiveCareUnitICUStay.TimeMinutesDays);
    $("#FlowTriever_CostOfIntensiveCareUnitICUStay_modal .row2").attr('title', FlowTriever.CostOfIntensiveCareUnitICUStay.TimeMinutesDays_ref);
    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#FlowTriever_CostOfIntensiveCareUnitICUStay_modal .row3").attr('title', FlowTriever.CostOfIntensiveCareUnitICUStay.PercentVariable_ref);
    $('#FlowTriever_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val(FlowTriever.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay);
    $("#FlowTriever_CostOfIntensiveCareUnitICUStay_modal .row4").attr('title', FlowTriever.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay_ref);

    calcFlowTriever_CostOfIntensiveCareUnitICUStay_modal();
}

function calcFlowTriever_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.FlowTriever_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#FlowTriever_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.FlowTriever_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}



function saveFlowTriever_CostOfHospitalStay_modal() {
    FlowTriever.CostOfHospitalStay.TimeMinutesDays = $('.FlowTriever_CostOfHospitalStay_TimeMinutesDays').val();
    FlowTriever.CostOfHospitalStay.CostPerMinPerDay = $('#FlowTriever_CostOfHospitalStay_CostPerMinPerDay').val();
    FlowTriever.CostOfHospitalStay.PerProcedureCost = FlowTriever.CostOfHospitalStay.TimeMinutesDays * PercentageOfCostsVariableGeneralHospitalWard * FlowTriever.CostOfHospitalStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = FlowTriever.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = FlowTriever.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = FlowTriever.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    FlowTriever.CostOfHospitalStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetFlowTriever_CostOfHospitalStay_modal() {

    $('.FlowTriever_CostOfHospitalStay_TimeMinutesDays').val(FlowTriever.CostOfHospitalStay.TimeMinutesDays);
    $("#FlowTriever_CostOfHospitalStay_modal .row1").attr('title', FlowTriever.CostOfHospitalStay.TimeMinutesDays_ref);
    $('.FlowTriever_CostOfHospitalStay_PercentVariable').text((PercentageOfCostsVariableGeneralHospitalWard * 100) + "%");
    $('#FlowTriever_CostOfHospitalStay_CostPerMinPerDay').val(FlowTriever.CostOfHospitalStay.CostPerMinPerDay);
    calcFlowTriever_CostOfHospitalStay_modal();
}

function calcFlowTriever_CostOfHospitalStay_modal() {
    var TotalCost1 = $('.FlowTriever_CostOfHospitalStay_TimeMinutesDays').val() * PercentageOfCostsVariableGeneralHospitalWard * $('#FlowTriever_CostOfHospitalStay_CostPerMinPerDay').val();
    $('.FlowTriever_CostOfHospitalStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.FlowTriever_CostOfHospitalStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.FlowTriever_CostOfHospitalStay_TimeMinutesDays').on("change", function(event) {
    calcFlowTriever_CostOfHospitalStay_modal();
})


$('#FlowTriever_CostOfHospitalStay_CostPerMinPerDay').on("change", function(event) {
    calcFlowTriever_CostOfHospitalStay_modal();
})



function saveAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal() {
    Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay = $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').val();
    Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnAnticoagulation = $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').val();
    Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate = $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').val();
    Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.PercentageOfPatients * Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay * PercentageOfCostsVariableCatheterizationSuiteandICU * Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = TotalCost2;
    updateValues();
}

function resetAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal() {

    $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').val(Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay);
    $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').val(Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnAnticoagulation);
    $("#Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal .row2").attr('title', Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnAnticoagulation_ref);
    $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').val(Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate);
    $("#Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal .row3").attr('title', Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate_ref);
    $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal .row4").attr('title', Anticoagulation.NursingPharmacistCostsForAnticoagulantTreatment.PercentVariable_ref);

    calcAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal();
}

function calcAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal() {
    var TotalCost1 = $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').val() * $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').val() * $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').val() * PercentageOfCostsVariableCatheterizationSuiteandICU;
    $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_ACStaffingCostPerProcedure').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_ACStaffingCostPerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}

$('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').on("change", function(event) {
    calcAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal();
})

$('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').on("change", function(event) {
    calcAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal();
})

$('.Anticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').on("change", function(event) {
    calcAnticoagulation_NursingPharmacistCostsForAnticoagulantTreatment_modal();
})





function saveAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal() {
    Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay = $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').val();
    Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnAnticoagulation = $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').val();
    Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate = $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').val();
    Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerProcedure = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.PercentageOfPatients * Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay * PercentageOfCostsVariableCatheterizationSuiteandICU * Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingCostPerAnnumCost = TotalCost2;
    updateValues();
}

function resetAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal() {

    $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').val(Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.ACStaffingHoursPerDay);
    $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').val(Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnAnticoagulation);
    $("#Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal .row2").attr('title', Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnAnticoagulation_ref);
    $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').val(Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate);
    $("#Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal .row3").attr('title', Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate_ref);
    $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal .row4").attr('title', Anticoagulation.PhysicianSpecialistCostsForAnticoagulantTreatment.PercentVariable_ref);

    calcAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
}

function calcAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal() {
    var TotalCost1 = $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').val() * $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').val() * $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').val() * PercentageOfCostsVariableCatheterizationSuiteandICU;
    $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_ACStaffingCostPerProcedure').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_ACStaffingCostPerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}

$('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_ACStaffingHoursPerDay').on("change", function(event) {
    calcAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
})

$('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnAnticoagulation').on("change", function(event) {
    calcAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
})

$('.Anticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').on("change", function(event) {
    calcAnticoagulation_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
})




function calcAnticoagulation_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#Anticoagulation_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').on("change", function(event) {
    calcAnticoagulation_CostOfIntensiveCareUnitICUStay_modal();
})

$('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').on("change", function(event) {
    calcAnticoagulation_CostOfIntensiveCareUnitICUStay_modal();
})



$('#Anticoagulation_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').on("change", function(event) {
    calcAnticoagulation_CostOfIntensiveCareUnitICUStay_modal();
})

function saveAnticoagulation_CostOfIntensiveCareUnitICUStay_modal() {
    Anticoagulation.CostOfIntensiveCareUnitICUStay.PercentageOfPatients = $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01
    Anticoagulation.CostOfIntensiveCareUnitICUStay.TimeDays = $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val();
    Anticoagulation.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay = $('#Anticoagulation_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost = Anticoagulation.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * Anticoagulation.CostOfIntensiveCareUnitICUStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * Anticoagulation.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = Anticoagulation.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    Anticoagulation.CostOfIntensiveCareUnitICUStay.PerAnnumCost = TotalCost2;
    updateValues();

}

function resetAnticoagulation_CostOfIntensiveCareUnitICUStay_modal() {

    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val(Anticoagulation.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * 100);
    $("#Anticoagulation_CostOfIntensiveCareUnitICUStay_modal .row1").attr('title', Anticoagulation.CostOfIntensiveCareUnitICUStay.PercentageOfPatients_ref);
    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val(Anticoagulation.CostOfIntensiveCareUnitICUStay.TimeDays);
    $("#Anticoagulation_CostOfIntensiveCareUnitICUStay_modal .row2").attr('title', Anticoagulation.CostOfIntensiveCareUnitICUStay.TimeMinutesDays_ref);
    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#Anticoagulation_CostOfIntensiveCareUnitICUStay_modal .row3").attr('title', Anticoagulation.CostOfIntensiveCareUnitICUStay.PercentVariable_ref);
    $('#Anticoagulation_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val(Anticoagulation.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay);
    $("#Anticoagulation_CostOfIntensiveCareUnitICUStay_modal .row4").attr('title', Anticoagulation.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay_ref);

    calcAnticoagulation_CostOfIntensiveCareUnitICUStay_modal();
}

function calcAnticoagulation_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#Anticoagulation_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.Anticoagulation_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}



function saveAnticoagulation_CostOfHospitalStay_modal() {
    Anticoagulation.CostOfHospitalStay.TimeDays = $('.Anticoagulation_CostOfHospitalStay_TimeMinutesDays').val();
    Anticoagulation.CostOfHospitalStay.CostPerMinPerDay = $('#Anticoagulation_CostOfHospitalStay_CostPerMinPerDay').val();
    Anticoagulation.CostOfHospitalStay.PerProcedureCost = Anticoagulation.CostOfHospitalStay.TimeMinutesDays * PercentageOfCostsVariableGeneralHospitalWard * Anticoagulation.CostOfHospitalStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = Anticoagulation.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = Anticoagulation.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = Anticoagulation.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    Anticoagulation.CostOfHospitalStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetAnticoagulation_CostOfHospitalStay_modal() {

    $('.Anticoagulation_CostOfHospitalStay_TimeMinutesDays').val(Anticoagulation.CostOfHospitalStay.TimeDays);
    $("#Anticoagulation_CostOfHospitalStay_modal .row1").attr('title', Anticoagulation.CostOfHospitalStay.TimeMinutesDays_ref);
    $('.Anticoagulation_CostOfHospitalStay_PercentVariable').text((PercentageOfCostsVariableGeneralHospitalWard * 100) + "%");
    $('#Anticoagulation_CostOfHospitalStay_CostPerMinPerDay').val(Anticoagulation.CostOfHospitalStay.CostPerMinPerDay);
    calcAnticoagulation_CostOfHospitalStay_modal();
}

function calcAnticoagulation_CostOfHospitalStay_modal() {
    var TotalCost1 = $('.Anticoagulation_CostOfHospitalStay_TimeMinutesDays').val() * PercentageOfCostsVariableGeneralHospitalWard * $('#Anticoagulation_CostOfHospitalStay_CostPerMinPerDay').val();
    $('.Anticoagulation_CostOfHospitalStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.Anticoagulation_CostOfHospitalStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);

}

$('.Anticoagulation_CostOfHospitalStay_TimeMinutesDays').on("change", function(event) {
    calcAnticoagulation_CostOfHospitalStay_modal();
})



$('#Anticoagulation_CostOfHospitalStay_CostPerMinPerDay').on("change", function(event) {
    calcAnticoagulation_CostOfHospitalStay_modal();
})



function saveSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal() {
    SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingHoursPerDay = $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').val();
    SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnSystemicLysis = $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnSystemicLysis').val();
    SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate = $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').val();
    SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.PercentageOfPatients * SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingHoursPerDay * PercentageOfCostsVariableCatheterizationSuiteandICU * SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = TotalCost2;
    updateValues();

}

function resetSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal() {

    $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').val(SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.STStaffingHoursPerDay);
    $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnSystemicLysis').val(SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnSystemicLysis);
    $("#SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal .row2").attr('title', SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.DaysOnSystemicLysis_ref);
    $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').val(SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate);
    $("#SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal .row3").attr('title', SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.HourlyRate_ref);
    $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal .row4").attr('title', SystemicThrombolysis.NursingPharmacistCostsForAnticoagulantTreatment.PercentVariable_ref);

    calcSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal();
}

function calcSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal() {
    var TotalCost1 = $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').val() * $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnSystemicLysis').val() * $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').val() * PercentageOfCostsVariableCatheterizationSuiteandICU;
    $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_STStaffingCostPerProcedure').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix)
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_STStaffingCostPerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix)



}

$('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').on("change", function(event) {
    calcSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal();
})

$('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_DaysOnSystemicThrombolysis').on("change", function(event) {
    calcSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal();
})

$('.SystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_HourlyRate').on("change", function(event) {
    calcSystemicThrombolysis_NursingPharmacistCostsForAnticoagulantTreatment_modal();
})






function saveSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal() {
    SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingHoursPerDay = $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').val();
    SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnSystemicLysis = $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnSystemicLysis').val();
    SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate = $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').val();
    SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerProcedure = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.PercentageOfPatients * SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingHoursPerDay * PercentageOfCostsVariableCatheterizationSuiteandICU * SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingCostPerAnnumCost = TotalCost2;
    updateValues();
}

function resetSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal() {

    $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').val(SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.STStaffingHoursPerDay);
    $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnSystemicLysis').val(SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnSystemicLysis);
    $("#SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal .row2").attr('title', SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.DaysOnSystemicThrombolysis_ref);
    $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').val(SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate);
    $("#SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal .row3").attr('title', SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.HourlyRate_ref);
    $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_PercentVariable').text((PercentageOfCostsVariableCatheterizationSuiteandICU * 100) + "%");
    $("#SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal .row4").attr('title', SystemicThrombolysis.PhysicianSpecialistCostsForAnticoagulantTreatment.PercentVariable_ref);

    calcSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
}

function calcSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal() {
    var TotalCost1 = $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').val() * $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnSystemicLysis').val() * $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').val() * PercentageOfCostsVariableCatheterizationSuiteandICU;
    $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_STStaffingCostPerProcedure').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_STStaffingCostPerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);
}

$('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_STStaffingHoursPerDay').on("change", function(event) {
    calcSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
})

$('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_DaysOnSystemicThrombolysis').on("change", function(event) {
    calcSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
})

$('.SystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_HourlyRate').on("change", function(event) {
    calcSystemicThrombolysis_PhysicianSpecialistCostsForAnticoagulantTreatment_modal();
})





function calcSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').on("change", function(event) {
    calcSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
})

$('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').on("change", function(event) {
    calcSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
})



$('#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').on("change", function(event) {
    calcSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
})

function saveSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {
    SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.TimeDays = $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val();
    SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay = $('#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {

    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val(SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients * 100);
    $("#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row1").attr('title', SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PercentageOfPatients_ref);
    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val(SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.TimeDays);
    $("#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row2").attr('title', SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.TimeMinutesDays_ref);
    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PercentVariable').text((SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PercentVariable * 100) + "%");
    $("#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row3").attr('title', SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.PercentVariable_ref);
    $('#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val(SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay);
    $("#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal .row4").attr('title', SystemicThrombolysis.CostOfIntensiveCareUnitICUStay.CostPerMinPerDay_ref);

    calcSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal();
}

function calcSystemicThrombolysis_CostOfIntensiveCareUnitICUStay_modal() {
    var TotalCost1 = $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PercentageOfPatients').val() * 0.01 * $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_TimeMinutesDays').val() * PercentageOfCostsVariableCatheterizationSuiteandICU * $('#SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_CostPerMinPerDay').val();
    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.SystemicThrombolysis_CostOfIntensiveCareUnitICUStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}



function saveSystemicThrombolysis_CostOfHospitalStay_modal() {
    SystemicThrombolysis.CostOfHospitalStay.TimeDays = $('.SystemicThrombolysis_CostOfHospitalStay_TimeMinutesDays').val();
    SystemicThrombolysis.CostOfHospitalStay.CostPerMinPerDay = $('#SystemicThrombolysis_CostOfHospitalStay_CostPerMinPerDay').val();
    SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost = SystemicThrombolysis.CostOfHospitalStay.TimeMinutesDays * PercentageOfCostsVariableCatheterizationSuiteandICU * SystemicThrombolysis.CostOfHospitalStay.CostPerMinPerDay;
    var TotalCost2
    switch (whichPERisk) {
        case 0:
            TotalCost2 = SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = SystemicThrombolysis.CostOfHospitalStay.PerProcedureCost * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    SystemicThrombolysis.CostOfHospitalStay.PerAnnumCost = TotalCost2;
    updateValues();
}

function resetSystemicThrombolysis_CostOfHospitalStay_modal() {

    $('.SystemicThrombolysis_CostOfHospitalStay_TimeMinutesDays').val(SystemicThrombolysis.CostOfHospitalStay.TimeDays);
    $("#SystemicThrombolysis_CostOfHospitalStay_modal .row1").attr('title', SystemicThrombolysis.CostOfHospitalStay.TimeMinutesDays_ref);
    $('.SystemicThrombolysis_CostOfHospitalStay_PercentVariable').text((PercentageOfCostsVariableGeneralHospitalWard * 100) + "%");
    $('#SystemicThrombolysis_CostOfHospitalStay_CostPerMinPerDay').val(SystemicThrombolysis.CostOfHospitalStay.CostPerMinPerDay);
    calcSystemicThrombolysis_CostOfHospitalStay_modal();
}

function calcSystemicThrombolysis_CostOfHospitalStay_modal() {
    var TotalCost1 = $('.SystemicThrombolysis_CostOfHospitalStay_TimeMinutesDays').val() * PercentageOfCostsVariableGeneralHospitalWard * $('#SystemicThrombolysis_CostOfHospitalStay_CostPerMinPerDay').val();
    $('.SystemicThrombolysis_CostOfHospitalStay_PerProcedureCost').text(currentCurrencyPrefix + TotalCost1.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + currentCurrencySuffix);
    var TotalCost2;
    switch (whichPERisk) {
        case 0:
            TotalCost2 = TotalCost1 * AnnualHighRiskPEPatients;
            break;
        case 1:
            TotalCost2 = TotalCost1 * AnnualIntermediateHighRiskPEPatients;
            break;
        case 2:
            TotalCost2 = TotalCost1 * (AnnualHighRiskPEPatients + AnnualIntermediateHighRiskPEPatients);
            break;
        default:
            // code for any other value
            
            break;
    }

    $('.SystemicThrombolysis_CostOfHospitalStay_PerAnnumCost').text(currentCurrencyPrefix + TotalCost2.toLocaleString(currentLocaleCode, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + currentCurrencySuffix);



}

$('.SystemicThrombolysis_CostOfHospitalStay_TimeMinutesDays').on("change", function(event) {
    calcSystemicThrombolysis_CostOfHospitalStay_modal();
})


$('#SystemicThrombolysis_CostOfHospitalStay_CostPerMinPerDay').on("change", function(event) {
    calcSystemicThrombolysis_CostOfHospitalStay_modal();
})





$('#whichCost').on("change", function(event) {
    idx = document.querySelector('#whichCost').selectedIndex;
    whichCostIdx = idx;
    switch (whichCostIdx) {
        case 0:
            whichCost = "PerProcedureCosts";

            updateValues();
            updateChartTitles();
            myChart_PerProcedure.update();
            myChart_PerAnnum.update();
            $('.perAnnumResult').hide();
            $('.perAnnumResult2').hide();

            $('.perProcedureResult').css("display", "flex");
            $('.perProcedureResult2').show();

            // sonya

             $('.perAnnumResultEuro').hide();
            $('.perAnnumResultCHF').hide();
            if (currentCurrency == 0) {
            $('.perProcedureResultEuro').show();
            $('.perProcedureResultCHF').hide();
        } else {
             $('.perProcedureResultEuro').hide();
            $('.perProcedureResultCHF').show();
        }


            break;
        case 1:
            whichCost = "PerAnnumCosts";


            updateValues();
            updateChartTitles()
            myChart_PerProcedure.update();
            myChart_PerAnnum.update();
            $('.perAnnumResult').css("display", "flex");
            $('.perAnnumResult2').show();
            $('.perProcedureResult').hide();
            $('.perProcedureResult2').hide();

             $('.perProcedureResultEuro').hide();
            $('.perProcedureResultCHF').hide();

             if (currentCurrency == 0) {
            $('.perAnnumResultEuro').show();
            $('.perAnnumResultCHF').hide();
        } else {
             $('.perAnnumResultCHF').show();
            $('.perAnnumResultEuro').hide();
        }

            break;
        default:
    }
})

function updateChartTitles() {
    switch (whichPERisk) {
        case 0:
            $('#graphtitle1').text("Total Care Costs per Procedure High-Risk PE");
            $('#graphtitle2').text("Total Care Costs per Annum High-Risk PE");
            $('#graphtitle3').text("DRG Net Return per Procedure High-Risk PE");
            $('#graphtitle4').text("DRG Net Return per Annum High-Risk PE");


            break;
        case 1:
            $('#graphtitle1').text("Total Care Costs per Procedure Int-High Risk PE");
            $('#graphtitle2').text("Total Care Costs per Annum Int-High Risk PE");
            $('#graphtitle3').text("DRG Net Return per Procedure Int-High Risk PE");
            $('#graphtitle4').text("DRG Net Return per Annum Int-High Risk PE");
            break;
        case 2:
            $('#graphtitle1').text("Total Care Costs per Procedure High Risk & Int-High Risk PE");
            $('#graphtitle2').text("Total Care Costs per Annum  High Risk & Int-High Risk PE");
            $('#graphtitle3').text("DRG Net Return per Procedure  High Risk & Int-High Risk PE");
            $('#graphtitle4').text("DRG Net Return per Annum  High Risk & Int-High Risk PE");
            break;
        default:
            break;
    }
}


$('#whichView').on("change", function(event) {
    // console.log(document.querySelector('#whichCost').selectedIndex)
    updateValues();
    idx = document.querySelector('#whichView').selectedIndex;
    whichView = idx;
    switch (idx) {
        case 0:

            $('#mainInputs').show();
            $('#tabtitles').hide();
            $('#tab1').hide();
            $('.tab1title').hide();
            $('.tab2title').hide();
            $('#tab2').hide();
            $('#tab3').show();
            $('#tab4').hide();
         //   $('.tab3title').show();
            //    $('#cardPicker').hide();
            //  $('#graphPicker').show();
            $('#whichCost').show();
            $('#whichGraph').show();
            $('#currencyPicker').show();
            $('#statePicker').show();
            $('#riskPicker').show();
            $('.hideForReimbursement').show();
            $('#printTitleText').text("Estimated Costs for Pulmonary Embolism Interventions");

            break;
        case 1:
         

             $('#mainInputs').show();
            $('#tabtitles').show();
            $('#tab1').show();
            $('.tab1title').show();
            $('#tab2').hide();
            $('.tab2title').hide();
            $('#tab3').hide();
            $('#tab4').hide();
          //  $('.tab3title').hide();
            $('#cardPicker').show();
            //$('#graphPicker').hide();
            $('#whichCost').show();
            $('#whichGraph').hide();
            $('#currencyPicker').show();
            $('#statePicker').show();
            $('#riskPicker').show();
            $('.hideForReimbursement').show();
            $('#printTitleText').text("Estimated Costs for Pulmonary Embolism Interventions");
            break;

        case 2:
   $('#mainInputs').show();
            $('#tabtitles').show();
            $('#tab1').hide();
            $('.tab1title').hide();
            $('.tab2title').show();
            $('#tab2').show();
            $('#tab3').hide();
            $('#tab4').hide();
        //    $('.tab3title').hide();
            $('#cardPicker').show();
            //   $('#graphPicker').hide();
            $('#whichCost').show();
            $('#whichGraph').hide();
            $('#currencyPicker').show();
            $('#statePicker').show();
            $('#riskPicker').show();
            $('.hideForReimbursement').hide();
            $('#printTitleText').text("Estimated Reimbursement for Pulmonary Embolism Interventions");

            break;
           
        case 3:
            $('#mainInputs').hide();
            $('#tabtitles').hide();
            $('#tab1').hide();
            $('.tab1title').hide();
            $('.tab2title').hide();
            $('#tab2').hide();
            $('#tab3').hide();
            $('#tab4').show();
       //     $('.tab3title').hide();
            $('#cardPicker').hide();
            //   $('#graphPicker').hide();
            $('#whichCost').hide();
            $('#whichGraph').hide();
            $('#currencyPicker').hide();
            $('#statePicker').hide();
            $('#riskPicker').hide();
            $('#printTitleText').text("Supporting References");

            break;
        default:
    }
})

$('#cardPicker').on("change", function(event) {
    console.log(document.querySelector('#cardPicker').selectedIndex);
    idx = document.querySelector('#cardPicker').selectedIndex;

    // Show/hide cards
    switch (idx) {
        case 0: // All Technologies
            $('.card1').show();
            $('.card2').show();
            $('.card3').show();
            $('.card4').show();
            break;
        case 1: // FlowTriever + AC
            $('.card1').show();
            $('.card2').show();
            $('.card3').hide();
            $('.card4').hide();
            break;
        case 2: // FlowTriever + ST
            $('.card1').show();
            $('.card2').hide();
            $('.card3').show();
            $('.card4').hide();
            break;
        case 3: // FlowTriever + USAT
            $('.card1').show();
            $('.card2').hide();
            $('.card3').hide();
            $('.card4').show();
            break;
        case 4: // FlowTriever only
            $('.card1').show();
            $('.card2').hide();
            $('.card3').hide();
            $('.card4').hide();
            break;
        case 5: // Anticoagulation (AC)
            $('.card1').hide();
            $('.card2').show();
            $('.card3').hide();
            $('.card4').hide();
            break;
        case 6: // Systemic Thrombolysis (ST)
            $('.card1').hide();
            $('.card2').hide();
            $('.card3').show();
            $('.card4').hide();
            break;
        case 7: // USAT 
            $('.card1').hide();
            $('.card2').hide();
            $('.card3').hide();
            $('.card4').show();
            break;
        default:
            // Do nothing
    }
      $('#hidefields3').prop('checked', true);
    // Hide all labels first
    $('#labelFlowTriever').hide();
    $('#labelAnticoagulation').hide();
    $('#labelSystemicThrombolysis').hide();
    $('#labelUltrasoundAssistedThrombolysis').hide();


    // Reset transform styles
    $('#labelFlowTriever p').css('transform', 'translateX(-18%) translateY(-50%)');
    $('#labelAnticoagulation p').css('transform', 'translateX(-5%) translateY(-50%)');
    $('#labelSystemicThrombolysis p').css('transform', 'translateX(-35%) translateY(-50%)');
    $('#labelUltrasoundAssistedThrombolysis p').css('transform', 'translateX(-35%) translateY(-50%)');

    let selectedLabels = [];

    // Figure out which labels to show
    switch (idx) {
        case 0: // All Technologies
            $('#labelFlowTriever').show();
            $('#labelAnticoagulation').show();
            $('#labelSystemicThrombolysis').show();
            $('#labelUltrasoundAssistedThrombolysis').show();
            break;
        case 1: // FlowTriever + AC
            $('#labelFlowTriever').show();
            $('#labelAnticoagulation').show();
            selectedLabels.push('#labelFlowTriever', '#labelAnticoagulation');
            break;
        case 2: // FlowTriever + ST
            $('#labelFlowTriever').show();
            $('#labelSystemicThrombolysis').show();
            selectedLabels.push('#labelFlowTriever', '#labelSystemicThrombolysis');
            break;
        case 3: // FlowTriever + USAT
            $('#labelFlowTriever').show();
            $('#labelUltrasoundAssistedThrombolysis').show();
            selectedLabels.push('#labelFlowTriever', '#labelUltrasoundAssistedThrombolysis');
            break;
        case 4: // FlowTriever only
            $('#labelFlowTriever').show();
            break;
        case 5: // Anticoagulation only
            $('#labelAnticoagulation').show();
            break;
        case 6: // Systemic Thrombolysis only
            $('#labelSystemicThrombolysis').show();
            break;
        case 7: // USAT only
            $('#labelUltrasoundAssistedThrombolysis').show();
            break;
        default:
            // Do nothing
    }

    // Adjust label positions if exactly 2 selected
    if (selectedLabels.length === 2) {
        if (idx === 1) {
            // FlowTriever + AC
            $(selectedLabels[0] + ' p').css('transform', 'translateX(170%) translateY(-50%)');
            $(selectedLabels[1] + ' p').css('transform', 'translateX(330%) translateY(-50%)');
        } else if (idx === 2) {
            // FlowTriever + ST
              $(selectedLabels[0] + ' p').css('transform', 'translateX(170%) translateY(-50%)');
             $(selectedLabels[1] + ' p').css('transform', 'translateX(151%) translateY(-50%)');
        }  else if (idx === 3) {
            // FlowTriever + USAT
              $(selectedLabels[0] + ' p').css('transform', 'translateX(170%) translateY(-50%)');
             $(selectedLabels[1] + ' p').css('transform', 'translateX(210%) translateY(-50%)');
        }
    }

    // Adjust label positions if exactly 1 selected
    if (selectedLabels.length === 0) {
        switch (idx) {
            case 4: // FlowTriever only
                $('#labelFlowTriever p').css('transform', 'translateX(420%) translateY(-50%)');
                break;
            case 5: // Anticoagulation only
                $('#labelAnticoagulation p').css('transform', 'translateX(230%) translateY(-50%)');
                break;
            case 6: // Systemic Thrombolysis only
                $('#labelSystemicThrombolysis p').css('transform', 'translateX(90%) translateY(-50%)');
                break;
            case 7: // USAT only
                $('#labelUltrasoundAssistedThrombolysis p').css('transform', 'translateX(130%) translateY(-50%)');
                break;
            default:
                // Do nothing
        }
    }

    updateValues();
});



function roundTwo(input) {
    //return (Math.round((input + Number.EPSILON) * 100) / 100);
    return Math.round(input);
}


function pmtCalc(rate_per_period, number_of_payments, present_value, future_value, type) {
    if (rate_per_period != 0.0) {
        // Interest rate exists
        var q = Math.pow(1 + rate_per_period, number_of_payments);
        return -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));

    } else if (number_of_payments != 0.0) {
        // No interest rate, but number of payments exists
        return -(future_value + present_value) / number_of_payments;
    }

    return 0;
}

function myFunction() {
    $('.lastRow').toggle();
}

function myTest() {
    console.log("mytest");
}

function hideFields() {
    var checkBox = document.getElementById("hidefields");
    if (checkBox.checked == true) {
        $('.maybeHidden').css("display", "flex");
    } else {
        $('.maybeHidden').hide();
    }
}

function hideFields2() {
    var checkBox = document.getElementById("hidefields2");
    if (checkBox.checked == true) {
        $('.maybeHidden2').css("display", "flex");
        
    } else {
        $('.maybeHidden2').hide();
        
    }
}


function hideFields3() {
    var checkBox = document.getElementById("hidefields3");
    if (checkBox.checked == true) {
        $('.maybeHidden3').css("display", "block");
        $('#cardPicker').trigger('change');

    } else {
        $('.maybeHidden3').hide();

    }



}

function hideFields32() {
    var checkBox = document.getElementById("hidefields32");
    if (checkBox.checked == true) {
        $('.maybeHidden32').css("display", "flex");
        // austin
        if (currentCurrency == 0)
        {
            $('.CHFDRG').css("display", "none");
            $('.euroDRG').show();
             $('.hideForCHF').show();
        } else
        {
            $('.CHFDRG').show();
            $('.euroDRG').css("display", "none");
             $('.hideForCHF').hide();
        }
    } else {
        $('.maybeHidden32').hide();
    }
}

function hideFields36() {
    var checkBox = document.getElementById("hidefields36");
    if (checkBox.checked == true) {
        $('.maybeHidden36').css("display", "flex");
    } else {
        $('.maybeHidden36').hide();
    }
}


function toggleDeviceCosts() {
    console.log($('.deviceCosts').css("display"))
    if ($('.deviceCosts').css("display") == "none") {
        $('.deviceCosts').show();
        $('.deviceCostsTotals').css("padding-top", "0px");

    } else {
        $('.deviceCosts').hide();
        $('.deviceCostsTotals').css("padding-top", "4px");
    }

}

function togglePharmacyCosts() {
    console.log($('.deviceCosts').css("display"))
    if ($('.pharmacyCosts').css("display") == "none") {
        $('.pharmacyCosts').show();
        $('.pharmacyCostsTotals').css("padding-top", "0px");

    } else {
        $('.pharmacyCosts').hide();
        $('.pharmacyCostsTotals').css("padding-top", "4px");
    }
}

function toggleFixedCosts() {
    console.log($('.fixedCosts').css("display"))
    if ($('.fixedCosts').css("display") == "none") {
        $('.fixedCosts').show();
        $('.fixedCostsTotals').css("padding-top", "0px");

    } else {
        $('.fixedCosts').hide();
        $('.fixedCostsTotals').css("padding-top", "4px");
    }
}


function tab2ModeSwitch() {
    /*if (whichView == 1) {
      
      if (tab2Mode == 0)
      {
        tab2Mode = 1
         $('.tab2Mode2').show();
          $('.tab2Mode1').hide();
      } else {
        tab2Mode = 0;
         $('.tab2Mode1').show();
         $('.tab2Mode2').hide();
      }
      updateValues();
    }*/

}

$('#resetBtn1').on('click', reset1);

function reset1() {

    AnnualPERelatedHospitalisations2020 = 97718;
    TotalNumberOfHospitalBedsInGermany2023 = 476900;

    AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed = 0.2;
    AnnualHighRiskPEPatients = 33;
    AnnualIntermediateHighRiskPEPatients = 120;

    $('#AnnualPERelatedHospitalisations2020').val(AnnualPERelatedHospitalisations2020);
    $('#TotalNumberOfHospitalBedsInGermany2023').val(TotalNumberOfHospitalBedsInGermany2023);
    $('#AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed').val(AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed);
    $('#AnnualHighRiskPEPatients').val(AnnualHighRiskPEPatients);
    $('#AnnualIntermediateHighRiskPEPatients').val(AnnualIntermediateHighRiskPEPatients);
    updateValues();
}

$('#resetBtn2').on('click', reset2);


function reset2() {

    ProportionOfPatientsWithHighRiskPE = 0.05;
     ProportionOfPatientsWithIntHighRiskPE = 0.18;

     PercentageOfCostsVariableCatheterizationSuiteandICU = 1;
     PercentageOfCostsVariableGeneralHospitalWard = 1;


    $('#ProportionOfPatientsWithHighRiskPE').val(ProportionOfPatientsWithHighRiskPE * 100);
    $('#ProportionOfPatientsWithIntHighRiskPE').val(ProportionOfPatientsWithIntHighRiskPE * 100);
    $('#PercentageOfCostsVariableCatheterizationSuiteandICU').val(PercentageOfCostsVariableCatheterizationSuiteandICU * 100);
    $('#PercentageOfCostsVariableGeneralHospitalWard').val(PercentageOfCostsVariableGeneralHospitalWard * 100);
   
           $('#ProportionOfPatientsWithHighRiskPE').trigger('change');
           $('#ProportionOfPatientsWithIntHighRiskPE').trigger('change');

    updateValues();
}

//updateAnnualIntermediateHighRiskPEPatients();



$('.savePDFBtn').on("click", function(event) {
    //swapThingie();
    savePDF();
});

$('.saveCombinedPDFBtn').on("click", function(event) {
    saveCombinedPDFSequential();
});

function savePDF() {
    $('body,html').css('background', '#ffffff');
    $('.hideForPrint').css('display', 'none');
    $('.printTitle').show();
    $('.chartContainer').css('width', '950px');
    $('.dropdowns').css('zoom', '0.9')
    $('#mainInputs').css('width', '1000px');
 //   $('#mainInputs').css('margin-left', '-30px');
     $('#mainInputs').css('zoom', '0.85');
    $('#tab1').css('width', '1000px');
    $('#tab1').css('margin-left', '-30px');
    $('#tabtitles').css('width', '1030px');
    $('#tabtitles').css('margin-left', '-45px');
    $('#tab2').css('width', '1000px');
    $('#tab2').css('margin-left', '-30px');
    $('#tab3').css('zoom', '0.8');
     $('#tab3').css('width', '1000px');
    $('#tab3').css('margin-left', '100px');
      $('#wierdrow').css('margin-left', '-100px')

         $('#wierdrow').css('width', '1050px')


        $('#pagebreak2').css('page-break-after', 'always');

      if (whichView == 0) {
       
        if (($('#hidefields2').prop('checked')) || ($('#hidefields32').prop('checked')) || ($('#hidefields36').prop('checked'))) {
            console.log("checked"); 
          $('.pagebreak1').css('page-break-before', 'always');
           } else {
             $('.pagebreak1').css('page-break-before', 'avoid');
             $('#pagebreak2').css('page-break-after', 'avoid');
          }
      
      }


    whichSelector = document.querySelector('#cardPicker').selectedIndex;

 switch (whichSelector) {
        case 0: 
             $('#labelFlowTriever p').css('left', '23%');
             $('#labelAnticoagulation p').css('left', '53%');
            $('#labelSystemicThrombolysis p').css('left', '84%');
                $('#labelSystemicThrombolysis p').css('font-size', '12px');
            break;
        case 1: 
           
            $('#labelFlowTriever p').css('left', '20%');
             $('#labelAnticoagulation p').css('left', '53%');
            $('#labelSystemicThrombolysis p').css('left', '84%');
            break;
            case 2: 
           
            $('#labelFlowTriever p').css('left', '20%');
             $('#labelAnticoagulation p').css('left', '53%');
            $('#labelSystemicThrombolysis p').css('left', '58%');
            break;
            

        default:
            // code block
    }






    $('#tab4').show();
    myChart_PerProcedure.options.legend.display = true;

    myChart_PerProcedure.update();

    myChart_PerAnnum.options.legend.display = true;
    myChart_PerAnnum.update();

    console.log(ipc);
 ipc.send('savePDF');
}

// Sequential PDF generation function
let pdfSections = [];
let currentSectionIndex = 0;
let isGeneratingCombinedPDF = false;
let pdfGenerationTimeout = null;
let originalTabState = null;

function saveCombinedPDFSequential() {
    // Reset state
    pdfSections = [];
    currentSectionIndex = 0;
    isGeneratingCombinedPDF = true;
    
    // Clear any existing timeout
    if (pdfGenerationTimeout) {
        clearTimeout(pdfGenerationTimeout);
    }
    
    // Store original view state and UI state
    const originalViewIndex = document.querySelector('#whichView').selectedIndex;
    originalTabState = {
        viewIndex: originalViewIndex,
        cardPickerIndex: document.querySelector('#cardPicker') ? document.querySelector('#cardPicker').selectedIndex : 0,
        costSelectorIndex: document.querySelector('#whichCost') ? document.querySelector('#whichCost').selectedIndex : 0,
        riskPickerIndex: document.querySelector('#riskPicker') ? document.querySelector('#riskPicker').selectedIndex : 0
    };
    
    console.log('Stored original tab state:', originalTabState);
    console.log('Current view selector value:', document.querySelector('#whichView').value);
    console.log('Current view selector text:', document.querySelector('#whichView').options[originalViewIndex].text);
    
    // Define sections to generate (matching dropdown options)
    const sections = [
        { index: 0, name: 'Graph', title: 'Estimated Costs for Pulmonary Embolism Interventions - Graph' },
        { index: 1, name: 'Costs', title: 'Estimated Costs for Pulmonary Embolism Interventions - Costs' },
        { index: 2, name: 'Proceeds', title: 'Estimated Reimbursement for Pulmonary Embolism Interventions' },
        { index: 3, name: 'References', title: 'Supporting References' }
    ];
    
    console.log('Starting sequential PDF generation for', sections.length, 'sections');
    
    // Set a safety timeout - if we don't complete in 30 seconds, force combination
    pdfGenerationTimeout = setTimeout(() => {
        console.log('PDF generation timeout reached, forcing combination...');
        combinePDFs();
    }, 30000);
    
    // Start with the first section
    const firstSection = sections[0];
    console.log(`Starting with section: ${firstSection.name}`);
    switchToSection(firstSection.index);
    
    // Wait a moment for UI to update, then generate PDF
    setTimeout(() => {
        generateSingleSectionPDF(firstSection, sections, originalViewIndex);
    }, 500);
}


function switchToSection(sectionIndex) {
    // Programmatically change the dropdown
    document.querySelector('#whichView').selectedIndex = sectionIndex;
    
    // Trigger the change event to update the UI
    $('#whichView').trigger('change');
    
    // Update values
    updateValues();
}

function generateSingleSectionPDF(currentSection, sections, originalViewIndex) {
    // Apply print styling for this section
    applyPrintStyling();
    
    // Use the existing PDF generation but with a custom filename
    // We'll modify the main process to handle sequential PDF generation
    ipc.send('saveSectionPDF', {
        sectionName: currentSection.name,
        sectionTitle: currentSection.title,
        sectionIndex: currentSection.index,
        totalSections: sections.length,
        originalViewIndex: originalViewIndex
    });
}

function applyPrintStyling() {
    // Apply the exact same styling as the original savePDF function
    $('body,html').css('background', '#ffffff');
    $('.hideForPrint').css('display', 'none');
    $('.printTitle').show();
    $('.chartContainer').css('width', '950px');
    $('.dropdowns').css('zoom', '0.9')
    $('#mainInputs').css('width', '1000px');
 //   $('#mainInputs').css('margin-left', '-30px');
     $('#mainInputs').css('zoom', '0.85');
     $('#tab1').css('zoom', '0.68');
    $('#tab1').css('width', '1000px');
    $('#tab1').css('margin-left', '-30px');
    $('#tabtitles').css('width', '1030px');
    $('#tabtitles').css('margin-left', '-45px');
    $('#tabtitles').css('zoom', '0.95');
    $('#tab1').css('zoom', '0.95');
    $('#tab2').css('zoom', '0.95');
    $('#tab3').css('zoom', '0.68');
    $('#tab2').css('width', '1000px');
    $('#tab2').css('margin-left', '-30px');
     $('#tab3').css('width', '1000px');
    $('#tab3').css('margin-left', '100px');
      $('#wierdrow').css('margin-left', '-100px')

         $('#wierdrow').css('width', '1050px')

         $('#pagebreak2').css('page-break-after', 'never');

    // Page break logic (same as savePDF)
    if (($('#hidefields2').prop('checked')) || ($('#hidefields32').prop('checked')) || ($('#hidefields36').prop('checked'))) {
        console.log("checked"); 
        $('.pagebreak1').css('page-break-before', 'always');
    } else {
        $('.pagebreak1').css('page-break-before', 'avoid');
    }
    

    $('#pagebreak2').css('page-break-after', 'avoid');

    // Card picker positioning (same as savePDF)
    whichSelector = document.querySelector('#cardPicker').selectedIndex;
    switch (whichSelector) {
        case 0: 
            $('#labelFlowTriever p').css('left', '23%');
            $('#labelAnticoagulation p').css('left', '53%');
            $('#labelSystemicThrombolysis p').css('left', '84%');
            $('#labelSystemicThrombolysis p').css('font-size', '12px');
            break;
        case 1: 
            $('#labelFlowTriever p').css('left', '20%');
            $('#labelAnticoagulation p').css('left', '53%');
            $('#labelSystemicThrombolysis p').css('left', '84%');
            break;
        case 2: 
            $('#labelFlowTriever p').css('left', '20%');
            $('#labelAnticoagulation p').css('left', '53%');
            $('#labelSystemicThrombolysis p').css('left', '58%');
            break;
        default:
            // code block
    }
    
    // Update charts (same as savePDF)
    myChart_PerProcedure.options.legend.display = true;
    myChart_PerProcedure.update();
    myChart_PerAnnum.options.legend.display = true;
    myChart_PerAnnum.update();
}

function combinePDFs() {
    console.log('Combining PDFs...');
    
    // Clear the timeout since we're completing
    if (pdfGenerationTimeout) {
        clearTimeout(pdfGenerationTimeout);
        pdfGenerationTimeout = null;
    }
    
    // Request the actual PDF data from main process
    ipc.send('getCombinedPDFData');
}

function restoreUIState() {
    // Restore the original styling
    $('body,html').css('background', 'rgb(231,233,235)');
    $('.hideForPrint').css('display', 'flex');
    $('.btn-primary').css('display', 'inline-block');
    $('.saveCombinedPDFBtn').css('display', 'inline-block'); // Ensure combined PDF button stays inline-block
    $('.printTitle').hide();
    $('.dropdowns').css('zoom', '1');
    $('.chartContainer').css('width', 'auto');
    $('#tab1').css('width', 'auto');
    $('#tab1').css('margin-left', 'auto');
    $('#mainInputs').css('width', '1110px');
    $('#mainInputs').css('margin-left', '0px');
    $('#mainInputs').css('zoom', '1');
    $('#tabtitles').css('width', '1140px');
    $('#tabtitles').css('margin-left', '-15px');
    $('#tab2').css('width', 'auto');
    $('#tab2').css('margin-left', 'auto');
    $('#tabtitles').css('zoom', '1');
    $('#tab1').css('zoom', '1');
    $('#tab2').css('zoom', '1');
    $('#tab3').css('zoom', '1');
    $('#tab3').css('width', 'auto');
    $('#tab3').css('margin-left', 'auto');
    $('#wierdrow').css('margin-left', 'auto');
    $('#wierdrow').css('width', 'auto');

}

function restoreOriginalTabState() {
    if (originalTabState) {
        console.log('Restoring original tab state:', originalTabState);
        
        // Wait a moment for UI to be ready
        setTimeout(() => {
            // Restore the main view selector
            const viewSelector = document.querySelector('#whichView');
            if (viewSelector) {
                viewSelector.selectedIndex = originalTabState.viewIndex;
                console.log('Restored view selector to index:', originalTabState.viewIndex);
            }
            
            // Restore other selectors if they exist
            if (document.querySelector('#cardPicker')) {
                document.querySelector('#cardPicker').selectedIndex = originalTabState.cardPickerIndex;
                console.log('Restored card picker to index:', originalTabState.cardPickerIndex);
            }
            if (document.querySelector('#whichCost')) {
                document.querySelector('#whichCost').selectedIndex = originalTabState.costSelectorIndex;
                console.log('Restored cost selector to index:', originalTabState.costSelectorIndex);
            }
            if (document.querySelector('#riskPicker')) {
                document.querySelector('#riskPicker').selectedIndex = originalTabState.riskPickerIndex;
                console.log('Restored risk picker to index:', originalTabState.riskPickerIndex);
            }
            
            // Trigger the change event to update the UI
            $('#whichView').trigger('change');
            console.log('Triggered view change event');
            
            // Update values
            if (typeof updateValues === 'function') {
                updateValues();
                console.log('Called updateValues()');
            }
            
            // Clear the stored state
            originalTabState = null;
            console.log('Tab state restoration completed');
        }, 100);
    } else {
        console.log('No original tab state to restore');
    }
}

// Handle section PDF generation responses
ipc.on('section-pdf-generated', (event, args) => {
    console.log(`PDF generated for ${args.sectionName} (${args.sectionIndex + 1}/${args.totalSections})`);
    console.log('isComplete:', args.isComplete, 'currentSectionIndex:', currentSectionIndex);
    
    // Store the section data
    pdfSections.push({
        name: args.sectionName,
        title: args.sectionTitle || `${args.sectionName} Section`,
        index: args.sectionIndex
    });
    
    console.log('Total sections collected so far:', pdfSections.length);
    
    if (args.isComplete || currentSectionIndex >= 3) {
        // All sections generated, now combine them
        console.log('All sections generated, combining PDFs...');
        combinePDFs();
    } else {
        // Move to next section
        currentSectionIndex++;
        const sections = [
            { index: 0, name: 'Graph', title: 'Estimated Costs for Pulmonary Embolism Interventions - Graph' },
            { index: 1, name: 'Costs', title: 'Estimated Costs for Pulmonary Embolism Interventions - Costs' },
             { index: 2, name: 'Proceeds', title: 'Estimated Reimbursement for Pulmonary Embolism Interventions' },
            { index: 3, name: 'References', title: 'Supporting References' }
        ];
        
        if (currentSectionIndex < sections.length) {
            const nextSection = sections[currentSectionIndex];
            console.log(`Switching to next section: ${nextSection.name} (${currentSectionIndex + 1}/${sections.length})`);
            switchToSection(nextSection.index);
            
            // Wait a moment for UI to update, then generate PDF
            setTimeout(() => {
                generateSingleSectionPDF(nextSection, sections, 0);
            }, 500);
        } else {
            console.log('All sections processed, should combine now');
            combinePDFs();
        }
    }
});

ipc.on('section-pdf-error', (event, args) => {
    console.log(`Error generating PDF for ${args.sectionName}:`, args.error);
    // Continue with next section even if this one failed
    currentSectionIndex++;
    
    // Check if we should still try to combine
    if (currentSectionIndex >= 4) {
        console.log('Error occurred but we have processed all 4 sections, attempting to combine...');
        combinePDFs();
    }
});

// Handle combined PDF save responses
ipc.on('combined-pdf-saved', (event, savePath) => {
    console.log('Combined PDF saved successfully to:', savePath);
    alert(`Combined PDF saved successfully to:\n${savePath}`);
    
    // Reset state
    isGeneratingCombinedPDF = false;
    pdfSections = [];
    currentSectionIndex = 0;
    
    // Restore original UI state
    restoreUIState();
    
    // Wait a bit longer before restoring tab state to ensure UI is ready
    setTimeout(() => {
        restoreOriginalTabState();
    }, 500);
});

ipc.on('combined-pdf-error', (event, error) => {
    console.error('Error saving combined PDF:', error);
    alert('Error saving combined PDF. Please try again.');
    
    // Reset state
    isGeneratingCombinedPDF = false;
    pdfSections = [];
    currentSectionIndex = 0;
    
    // Restore original UI state
    restoreUIState();
    
    // Wait a bit longer before restoring tab state to ensure UI is ready
    setTimeout(() => {
        restoreOriginalTabState();
    }, 500);
});

ipc.on('combined-pdf-cancelled', (event) => {
    console.log('Combined PDF save cancelled by user');
    
    // Reset state
    isGeneratingCombinedPDF = false;
    pdfSections = [];
    currentSectionIndex = 0;
    
    // Restore original UI state
    restoreUIState();
    
    // Wait a bit longer before restoring tab state to ensure UI is ready
    setTimeout(() => {
        restoreOriginalTabState();
    }, 500);
});

// Handle merged PDF ready
ipc.on('merged-pdf-ready', (event, data) => {
    console.log('Merged PDF ready with', data.totalSections, 'sections');
    
    try {
        // Convert the merged PDF bytes to base64 for saving
        const base64Data = Buffer.from(data.data).toString('base64');
        const dataUri = `data:application/pdf;base64,${base64Data}`;
        
        // Use IPC to save the merged PDF with file dialog
        ipc.send('saveCombinedPDF', {
            data: dataUri,
            fileName: `Inari_Combined_Report_${new Date().toISOString().split('T')[0]}.pdf`
        });
        
    } catch (error) {
        console.error('Error processing merged PDF:', error);
        alert('Error processing merged PDF. Please try again.');
        
        // Reset state on error
        isGeneratingCombinedPDF = false;
        pdfSections = [];
        currentSectionIndex = 0;
        restoreUIState();
    }
});

// Handle PDF merge error
ipc.on('pdf-merge-error', (event, error) => {
    console.error('Error merging PDFs:', error);
    alert('Error merging PDFs. Please try again.');
    
    // Reset state on error
    isGeneratingCombinedPDF = false;
    pdfSections = [];
    currentSectionIndex = 0;
    restoreUIState();
    
    // Wait a bit longer before restoring tab state to ensure UI is ready
    setTimeout(() => {
        restoreOriginalTabState();
    }, 500);
});

ipc.on('wrote-pdf', (event, args) => {

    console.log("pdf wrote");




    $('body,html').css('background', 'rgb(231,233,235)');
    $('.hideForPrint').css('display', 'flex');
    $('.btn-primary').css('display', 'inline-block');
    $('.saveCombinedPDFBtn').css('display', 'inline-block');
    $('.printTitle').hide();
        $('.dropdowns').css('zoom', '1')
    $('.chartContainer').css('width', 'auto');
    $('#tab1').css('width', 'auto');
    $('#tab1').css('margin-left', 'auto');
    $('#mainInputs').css('width', '1110px');
    $('#mainInputs').css('margin-left', '0px');
    $('#mainInputs').css('zoom', '1');
    $('#tabtitles').css('width', '1140px');
    $('#tabtitles').css('margin-left', '-15px');
    $('#tab2').css('width', 'auto');
    $('#tab2').css('margin-left', 'auto');
     $('#tab3').css('zoom', '1');
     $('#tab3').css('margin-left', 'auto');
     $('#tab3').css('width', 'auto');
     $('#wierdrow').css('margin-left', 'auto')
      $('#pagebreak2').css('page-break-after', 'never');

    myChart_PerProcedure.options.legend.display = false;
    myChart_PerProcedure.update();
    myChart_PerAnnum.options.legend.display = false;
    myChart_PerAnnum.update();

    if (whichView < 3) {
        $('#tab4').hide()
    }

      $('#labelSystemicThrombolysis p').css('font-size', '18px');

  $('#labelFlowTriever p').css('left', '55%');
             $('#labelAnticoagulation p').css('left', '45%');
            $('#labelSystemicThrombolysis p').css('left', '33%');
       $('#cardPicker').trigger('change');

   
});


function createSaveData() {
    saveData = {

        currentCurrencyPrefix: currentCurrencyPrefix,
        currentCurrencySuffix: currentCurrencySuffix,
        currentLocaleCode: currentLocaleCode,
        currentCurrency: currentCurrency,
        currentBaserate: currentBaserate,
        currentBaserateIdx: currentBaserateIdx,
        currentBaseRate_Euro: currentBaseRate_Euro,
        currentBaseRate_CHF: currentBaseRate_CHF,
        currentFlowRate: currentFlowRate,
        currentACRate: currentACRate,
        currentSTRate: currentSTRate,
        currentUTRate: currentUTRate,
        whichPERisk: whichPERisk,
        HospitalName: HospitalName,
        HospitalSize: HospitalSize,
        AnnualPERelatedHospitalisations2020: AnnualPERelatedHospitalisations2020,
        TotalNumberOfHospitalBedsInGermany2023: TotalNumberOfHospitalBedsInGermany2023,
        AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed: AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed,
        AnnualHighRiskPEPatients: AnnualHighRiskPEPatients,
        AnnualIntermediateHighRiskPEPatients: AnnualIntermediateHighRiskPEPatients,
        ProportionOfPatientsWithHighRiskPE: ProportionOfPatientsWithHighRiskPE,
        ProportionOfPatientsWithIntHighRiskPE: ProportionOfPatientsWithIntHighRiskPE,
        PercentageOfCostsVariableCatheterizationSuiteandICU: PercentageOfCostsVariableCatheterizationSuiteandICU,
        PercentageOfCostsVariableGeneralHospitalWard: PercentageOfCostsVariableGeneralHospitalWard,
        AnnualHighRiskPEPatients_changed: AnnualHighRiskPEPatients_changed,
        AnnualIntermediateHighRiskPEPatients_changed: AnnualIntermediateHighRiskPEPatients_changed,
        STCostOfBleedingEvents_changed: STCostOfBleedingEvents_changed,
        whichCost: whichCost,
        whichCostIdx: whichCostIdx,
        whichGraph: whichGraph,
        FlowTriever: FlowTriever,
        Anticoagulation: Anticoagulation,
        SystemicThrombolysis: SystemicThrombolysis,
        flowTrieverNUBNegotiationResult: flowTrieverNUBNegotiationResult,
        currentCurrencyObject: currentCurrencyObject,

    };
}

$('.saveBtn').on("click", function(event) {
    createSaveData();
    ipc.send('saveData', saveData);

})

$('.zeroBtn').on("click", function(event) {
    zeroEverything();

})

$('.loadBtn').on("click", function(event) {
    createSaveData();
    ipc.send('loadData', saveData);

})


ipc.on('loaded-data', (event, args) => {
    var loadedData = JSON.parse(args);

    currentCurrencyPrefix = loadedData.currentCurrencyPrefix;
    currentCurrencySuffix = loadedData.currentCurrencySuffix;
    currentLocaleCode = loadedData.currentLocaleCode;
    currentFlowRate = loadedData.currentFlowRate;
    currentACRate = loadedData.currentACRate;
    currentSTRate = loadedData.currentSTRate;
    currentUTRate = loadedData.currentUTRate;
    currentCurrency = loadedData.currentCurrency;
    $('#currencyPicker option').eq(currentCurrency).prop('selected', true);

    currentBaserate = loadedData.currentBaserate;
    currentBaserateIdx = loadedData.currentBaserateIdx;
    $('#statePicker option').eq(currentBaserateIdx).prop('selected', true);

    cityName = (document.querySelector('#statePicker').options[currentBaserateIdx]).text;
    currentBaseRate_Euro = loadedData.currentBaseRate_Euro;
    currentBaseRate_CHF = loadedData.currentBaseRate_CHF;
   // currentBaserate = cityValues[currentBaserateIdx];
    if (currentCurrency == 0) {
        currentBaserate = currentBaseRate_Euro;
    } else {
        currentBaserate = currentBaseRate_CHF;
    }
    currentBaserateString = currentCurrencyPrefix + currentBaserate.toLocaleString(currentLocaleCode) + " " + currentCurrencySuffix
    $('.currentBaserate').text(currentBaserateString);
    $('#stateName').text(cityName);
    $('#cityValue').text(currentBaserateString);

    whichPERisk = loadedData.whichPERisk;
    $('#riskPicker option').eq(whichPERisk).prop('selected', true);

    HospitalName = loadedData.HospitalName;
    $('#HospitalName').text(HospitalName);
    HospitalSize = loadedData.HospitalSize;
    $('#HospitalSize').val(HospitalSize);
    AnnualPERelatedHospitalisations2020 = loadedData.AnnualPERelatedHospitalisations2020;
    $('#AnnualPERelatedHospitalisations2020').val(AnnualPERelatedHospitalisations2020);
    TotalNumberOfHospitalBedsInGermany2023 = loadedData.TotalNumberOfHospitalBedsInGermany2023;
    $('#TotalNumberOfHospitalBedsInGermany2023').val(TotalNumberOfHospitalBedsInGermany2023);
    AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed = loadedData.AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed;
    $('#AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed').val(AnnualHighRiskAndIntermediateHighRiskPEPatientsPerBed);
    AnnualHighRiskPEPatients = loadedData.AnnualHighRiskPEPatients;
    $('#AnnualHighRiskPEPatients').val(AnnualHighRiskPEPatients);
    AnnualIntermediateHighRiskPEPatients = loadedData.AnnualIntermediateHighRiskPEPatients;
    $('#AnnualIntermediateHighRiskPEPatients').val(AnnualIntermediateHighRiskPEPatients);
    ProportionOfPatientsWithHighRiskPE = loadedData.ProportionOfPatientsWithHighRiskPE;
    $('#ProportionOfPatientsWithHighRiskPE').val(ProportionOfPatientsWithHighRiskPE * 100);
    ProportionOfPatientsWithIntHighRiskPE = loadedData.ProportionOfPatientsWithIntHighRiskPE;
    $('#ProportionOfPatientsWithIntHighRiskPE').val(ProportionOfPatientsWithIntHighRiskPE * 100);
    PercentageOfCostsVariableCatheterizationSuiteandICU = loadedData.PercentageOfCostsVariableCatheterizationSuiteandICU;
    $('#PercentageOfCostsVariableCatheterizationSuiteandICU').val(PercentageOfCostsVariableCatheterizationSuiteandICU * 100);
    PercentageOfCostsVariableGeneralHospitalWard = loadedData.PercentageOfCostsVariableGeneralHospitalWard;
    $('#PercentageOfCostsVariableGeneralHospitalWard').val(PercentageOfCostsVariableGeneralHospitalWard * 100);
    AnnualHighRiskPEPatients_changed = loadedData.AnnualHighRiskPEPatients_changed;
    AnnualIntermediateHighRiskPEPatients_changed = loadedData.AnnualIntermediateHighRiskPEPatients_changed;
    STCostOfBleedingEvents_changed = loadedData.STCostOfBleedingEvents_changed;

    whichCost = loadedData.whichCost;
    whichCostIdx = loadedData.whichCostIdx;

    $('#whichCost option').eq(whichCostIdx).prop('selected', true);

    whichGraph = loadedData.whichGraph;
    FlowTriever = loadedData.FlowTriever;
    Anticoagulation = loadedData.Anticoagulation;
    SystemicThrombolysis = loadedData.SystemicThrombolysis;
    flowTrieverNUBNegotiationResult = loadedData.flowTrieverNUBNegotiationResult;
    currentCurrencyObject = loadedData.currentCurrencyObject;

    updateValues();
    setCurrency(currentCurrency);


});

window.onerror = function(message, source, lineno, colno, error) {
  alert(`Uncaught Error:\n${message}\nAt ${source}:${lineno}:${colno}`);
};

window.onunhandledrejection = function(event) {
  alert(`Unhandled Promise Rejection:\n${event.reason}`);
};
