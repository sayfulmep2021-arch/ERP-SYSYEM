/**
 * Initial Default Production Plan Dataset (MEP Fan Ltd.)
 * Default Period: July 2026 to June 2027
 */
const DEFAULT_PRODUCTION_PLAN = {
    fromMonth: "July",
    fromYear: 2026,
    toMonth: "June",
    toYear: 2027,
    categories: [
        {
            name: "Ceiling Fan",
            bgColor: "#fef08a",
            textColor: "#854d0e",
            items: [
                {
                    sl: "1",
                    code: "CF5601/CF5601IV",
                    customDesc: "SFG1010079",
                    name: "56 Inch Premium Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 21000, 0, 24500, 24500, 23500, 23500, 29500, 29500, 0, 0]
                },
                {
                    sl: "2",
                    code: "CF5602/CF5602IV",
                    customDesc: "SFG1010080",
                    name: "56 Inch Speed King Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 5000, 0, 5000, 5000, 6000, 6000, 5000, 5000, 0, 0]
                },
                {
                    sl: "3",
                    code: "CF5603/CF5603IV",
                    customDesc: "SFG1010097",
                    name: "56 Inch Premium Gold Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 1000, 0, 500, 500, 500, 500, 500, 500, 0, 0]
                },
                {
                    sl: "",
                    code: "CF5606/CF5606IV",
                    customDesc: "SFG1010137",
                    name: "56 Inch Premium Plus Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "4",
                    code: "CF5607/CF5607IV",
                    customDesc: "SFG1010135",
                    name: "56 Inch Crown Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "5",
                    code: "CF4801/CF4801IV",
                    customDesc: "SFG1010078",
                    name: "48 Inch Popular Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 3000, 0, 0, 0, 0, 0, 5000, 5000, 0, 0]
                },
                {
                    sl: "6",
                    code: "CF3601/CF3601IV",
                    customDesc: "SFG1010077",
                    name: "36 Inch Hero Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 7000, 0, 10000, 5000, 10000, 10000, 0, 0, 0, 0]
                },
                {
                    sl: "7",
                    code: "CF2401/CF2401IV",
                    customDesc: "SFG1010076",
                    name: "24 Inch Super Ceiling Fan - Ivory",
                    unit: "Pcs",
                    months: [0, 0, 3000, 0, 10000, 5000, 10000, 10000, 0, 0, 0, 0]
                }
            ]
        },
        {
            name: "Rechargeable Fan",
            bgColor: "#fb7185",
            textColor: "#ffffff",
            items: [
                {
                    sl: "1",
                    code: "MRTF1201",
                    name: "12 Inch Swasti Rechargeable Table Fan",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "2",
                    code: "MRTF1601",
                    name: "16 Inch Swasti Rechargeable Table Fan",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            ]
        },
        {
            name: "Exhaust Fan",
            bgColor: "#fb7185",
            textColor: "#ffffff",
            items: [
                {
                    sl: "1",
                    code: "EF1001OW/EF1001OW",
                    name: "10 Inch Fresh Air Exhaust Fan Off White",
                    unit: "Pcs",
                    months: [10000, 10000, 10000, 10000, 2500, 0, 0, 2500, 2500, 0, 0, 0]
                },
                {
                    sl: "2",
                    code: "EF0801OW/EF0801OW",
                    name: "08 Inch Fresh Air Exhaust Fan Off White",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "3",
                    code: "EF1001AF",
                    name: "Aero Flow 10'' Exhaust Fan",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "4",
                    code: "EF0801AF",
                    name: "Aero Flow 8'' Exhaust Fan",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "5",
                    code: "CFCP001",
                    name: "Ceiling Fan Capacitor 2.5 uf",
                    unit: "Pcs",
                    months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    sl: "6",
                    code: "CFCP002",
                    name: "Ceiling Fan Capacitor 3.5 uf",
                    unit: "Pcs",
                    months: [10000, 10000, 10000, 10000, 0, 2500, 2500, 0, 0, 2500, 0, 0]
                }
            ]
        }
    ]
};

/**
 * Get dynamic Production Plan Target for a specific Year & Month
 * Reads from localStorage('mep_yearly_production_plans_all') or fallback to DEFAULT_PRODUCTION_PLAN
 */
function getProductionPlanTargetForPeriod(year, monthName) {
    const yrNum = parseInt(year) || 2026;
    let currentPlan = DEFAULT_PRODUCTION_PLAN;

    try {
        const storedAll = localStorage.getItem('mep_yearly_production_plans_all');
        if (storedAll) {
            const allObj = JSON.parse(storedAll);
            let foundKey = Object.keys(allObj).find(k => k.includes(String(yrNum)));
            if (!foundKey && allObj['July_2026_June_2027']) {
                foundKey = 'July_2026_June_2027';
            }
            if (foundKey && allObj[foundKey]) {
                currentPlan = allObj[foundKey];
            }
        }
    } catch(e) {}

    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const fromM = currentPlan.fromMonth || "July";
    const fromY = parseInt(currentPlan.fromYear) || 2026;

    let startMonthIdx = MONTH_NAMES.indexOf(fromM);
    if (startMonthIdx === -1) startMonthIdx = 6; // July

    let targetColIdx = -1;
    let curM = startMonthIdx;
    let curY = fromY;

    for (let i = 0; i < 12; i++) {
        if (MONTH_NAMES[curM].toLowerCase() === String(monthName).toLowerCase() || 
            MONTH_NAMES[curM].toLowerCase().startsWith(String(monthName).toLowerCase().slice(0, 3))) {
            if (curY === yrNum || !year) {
                targetColIdx = i;
                break;
            }
        }
        curM++;
        if (curM > 11) {
            curM = 0;
            curY++;
        }
    }

    if (targetColIdx === -1) targetColIdx = 2; // Default to Sep (col 2)

    let grandTotalTarget = 0;
    let fanTarget = 0;
    const monthlyTargets = new Array(12).fill(0);

    if (currentPlan && currentPlan.categories) {
        currentPlan.categories.forEach(cat => {
            const isCeiling = cat.name.toLowerCase().includes('ceiling');
            cat.items.forEach(item => {
                if (Array.isArray(item.months)) {
                    item.months.forEach((v, idx) => {
                        if (idx < 12) {
                            monthlyTargets[idx] += (parseFloat(v) || 0);
                        }
                    });
                    const val = parseFloat(item.months[targetColIdx]) || 0;
                    grandTotalTarget += val;
                    if (isCeiling) fanTarget += val;
                }
            });
        });
    }

    if (grandTotalTarget === 0) {
        grandTotalTarget = 40000;
        fanTarget = 40000;
    }

    const ceilingFanTarget = fanTarget || 40000;
    const bladeTarget = Math.round((grandTotalTarget - ceilingFanTarget) * 0.5) || 10000;
    const armTarget = Math.max(0, grandTotalTarget - ceilingFanTarget - bladeTarget) || 10000;

    return {
        year: yrNum,
        month: monthName,
        columnIndex: targetColIdx,
        totalTarget: ceilingFanTarget,
        ceilingFanTarget: ceilingFanTarget,
        grandTotalTarget: grandTotalTarget,
        branchBreakdown: {
            fanAssemble: ceilingFanTarget,
            bladeDimmer: bladeTarget,
            armatureWinding: armTarget
        },
        monthlyTargets: monthlyTargets
    };
}

if (typeof window !== 'undefined') {
    window.DEFAULT_PRODUCTION_PLAN = DEFAULT_PRODUCTION_PLAN;
    window.getProductionPlanTargetForPeriod = getProductionPlanTargetForPeriod;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_PRODUCTION_PLAN, getProductionPlanTargetForPeriod };
}
