/**
 * ============================================================================
 * MEP FAN LTD. - Armature Summary (ERP Stock Report)
 * Initial Dataset (43 Items across 3 Categories: RM, SFG, Production Consumption)
 * ============================================================================
 */

const RAW_ARMATURE_SUMMARY_DATA = [
    // --- RAW MATERIAL (RM) ---
    { id: "arm_rm_1", category: "Raw Material", sl: "1", code: "3101010062", name: "Armature Coton Tap", unit: "Mtr", opening: 1967, storeRec: 4800, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 925, closing: 5842 },
    { id: "arm_rm_2", category: "Raw Material", sl: "2", code: "3101010028", name: "Armature Rope", unit: "KG", opening: 0.878, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0, closing: 0.878 },
    { id: "arm_rm_3", category: "Raw Material", sl: "3", code: "3101010137", name: "MEP Cable Tie -2.5 x100mm", unit: "Pcs", opening: 125394, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 25485, closing: 99909 },
    { id: "arm_rm_4", category: "Raw Material", sl: "4", code: "3101010037", name: "Deko Paint Green Lim", unit: "KG", opening: 0.20715, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0.1386, closing: 0.06855 },
    { id: "arm_rm_5", category: "Raw Material", sl: "5", code: "3101010036", name: "Deko Paint Oxford Blue", unit: "KG", opening: 0.5985, storeRec: 10, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 8.4679, closing: 2.1306 },
    { id: "arm_rm_6", category: "Raw Material", sl: "6", code: "3101010091", name: "FAN Ampere Tube-01 no", unit: "Mtr", opening: 284.5744, storeRec: 8500, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 3830.7884, closing: 4953.786 },
    { id: "arm_rm_7", category: "Raw Material", sl: "7", code: "3101010022", name: "FAN Ampere Tube-03 no", unit: "Mtr", opening: 1039.08, storeRec: 9500, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 4842.15, closing: 5696.93 },
    { id: "arm_rm_8", category: "Raw Material", sl: "8", code: "3101010024", name: "FAN Ampere Tube-08 no", unit: "Mtr", opening: 73.672, storeRec: 2300, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 1172.31, closing: 1201.362 },
    { id: "arm_rm_9", category: "Raw Material", sl: "9", code: "3101010112", name: "Flaxible Cable 14x0.0076 - Black", unit: "Mtr", opening: 7543.16, storeRec: 9600, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 7772.925, closing: 9370.235 },
    { id: "arm_rm_10", category: "Raw Material", sl: "10", code: "3101010090", name: "Flaxible Cable 14x0.0076 - Red", unit: "Mtr", opening: 9043.16, storeRec: 9000, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 7772.925, closing: 10270.235 },
    { id: "arm_rm_11", category: "Raw Material", sl: "11", code: "3101010111", name: "Flaxible Cable 14x0.0076 - Yellow", unit: "Mtr", opening: 5173.16, storeRec: 11700, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 7772.925, closing: 9100.235 },
    { id: "arm_rm_12", category: "Raw Material", sl: "12", code: "3101010019", name: "Insulation Fiber 20 mm x 0.35mm", unit: "KG", opening: 26.413, storeRec: 105, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 57.294, closing: 74.119 },
    { id: "arm_rm_13", category: "Raw Material", sl: "13", code: "3101010020", name: "Insulation Fiber 27 mm x 0.190mm", unit: "KG", opening: 20.639, storeRec: 315, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 150.814, closing: 184.825 },
    { id: "arm_rm_14", category: "Raw Material", sl: "14", code: "3101010021", name: "Lather Fiber 10 mm", unit: "KG", opening: 58.666, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 17.188, closing: 41.478 },
    { id: "arm_rm_15", category: "Raw Material", sl: "15", code: "3101010108", name: "NC / ABC Thinner", unit: "Ltr", opening: 2.546, storeRec: 49, sectionRec: 2, productionRec: 0, damage: 0, othersRec: 0, delivery: 38.0295, closing: 15.5165 },
    { id: "arm_rm_16", category: "Raw Material", sl: "16", code: "3101010026", name: "Solven", unit: "Ltr", opening: 32.647, storeRec: 650, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 322.334, closing: 402.666 },
    { id: "arm_rm_17", category: "Raw Material", sl: "17", code: "3101010016", name: "Super Wire (SWG 33) / 0.253mm", unit: "KG", opening: 49.79, storeRec: 4974.3, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 5006.8, closing: 17.29 },
    { id: "arm_rm_18", category: "Raw Material", sl: "18", code: "3101010017", name: "Super Wire (SWG 34) / 0.233mm", unit: "KG", opening: 66.53, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 52.154, closing: 14.376 },
    { id: "arm_rm_19", category: "Raw Material", sl: "19", code: "3101010018", name: "Super Wire (SWG 35) / 0.213mm", unit: "KG", opening: 473.97, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 434.75, closing: 39.22 },
    { id: "arm_rm_20", category: "Raw Material", sl: "20", code: "3101010027", name: "Vernish-1132", unit: "Ltr", opening: 77.647, storeRec: 610, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 322.334, closing: 378.313 },
    { id: "arm_rm_21", category: "Raw Material", sl: "21", code: "3101010030", name: "XL/Shaft (Big)-144mm", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 33150, productionRec: 0, damage: 0, othersRec: 0, delivery: 23908, closing: 9242 },
    { id: "arm_rm_22", category: "Raw Material", sl: "22", code: "3101010031", name: "XL/Shaft (small)-137mm", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 1241, productionRec: 0, damage: 0, othersRec: 0, delivery: 1241, closing: 0 },
    { id: "arm_rm_23", category: "Raw Material", sl: "23", code: "3101010120", name: "XL/Shaft -178mm", unit: "Pcs", opening: 19, storeRec: 0, sectionRec: 360, productionRec: 0, damage: 0, othersRec: 0, delivery: 336, closing: 43 },

    // --- SFG (SUB-ASSEMBLY) ---
    { id: "arm_sfg_1", category: "SFG", sl: "1", code: "SFG1010019", name: "Armature 5.5 Circle 16mm", unit: "Pcs", opening: 495, storeRec: 0, sectionRec: 7940, productionRec: 0, damage: 0, othersRec: 0, delivery: 1850, closing: 6585 },
    { id: "arm_sfg_2", category: "SFG", sl: "2", code: "SFG1010021", name: "Armature 6 Circle 15mm Black Sheet", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0, closing: 0 },
    { id: "arm_sfg_3", category: "SFG", sl: "3", code: "SFG1010020", name: "Armature 6 Circle 16 mm", unit: "Pcs", opening: 204, storeRec: 0, sectionRec: 386, productionRec: 0, damage: 0, othersRec: 0, delivery: 178, closing: 412 },
    { id: "arm_sfg_4", category: "SFG", sl: "4", code: "SFG1010022", name: "Armature 7 Circle 15mm", unit: "Pcs", opening: 445, storeRec: 0, sectionRec: 25669, productionRec: 0, damage: 0, othersRec: 0, delivery: 17345, closing: 8769 },
    { id: "arm_sfg_5", category: "SFG", sl: "5", code: "SFG1010121", name: "Armature 7 Circle 16mm", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 200, productionRec: 0, damage: 0, othersRec: 0, delivery: 200, closing: 0 },
    { id: "arm_sfg_6", category: "SFG", sl: "6", code: "SFG1010027", name: "Complete Armature 5.5 Circle 16mm", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 5024, damage: 0, othersRec: 0, delivery: 5024, closing: 0 },
    { id: "arm_sfg_7", category: "SFG", sl: "7", code: "SFG1010029", name: "Complete Armature 6 Circle 15mm Black Sheet", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0, closing: 0 },
    { id: "arm_sfg_8", category: "SFG", sl: "8", code: "SFG1010028", name: "Complete Armature 6 Circle 16mm", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 1241, damage: 0, othersRec: 0, delivery: 1241, closing: 0 },
    { id: "arm_sfg_9", category: "SFG", sl: "9", code: "SFG1010030", name: "Complete Armature 7 Circle 15mm", unit: "Pcs", opening: 6090, storeRec: 0, sectionRec: 0, productionRec: 18824, damage: 0, othersRec: 0, delivery: 24914, closing: 0 },
    { id: "arm_sfg_10", category: "SFG", sl: "10", code: "SFG1010141", name: "Complete Armature 7 Circle 16mm -5606", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 60, damage: 0, othersRec: 0, delivery: 60, closing: 0 },
    { id: "arm_sfg_11", category: "SFG", sl: "11", code: "SFG1010123", name: "Complete Armature 7 Circle 16mm -5607", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 336, damage: 0, othersRec: 0, delivery: 336, closing: 0 },
    { id: "arm_sfg_12", category: "SFG", sl: "12", code: "SFG1010023", name: "Winding Armature 5.5 Circle 16mm", unit: "Pcs", opening: 3174, storeRec: 0, sectionRec: 0, productionRec: 1850, damage: 0, othersRec: 0, delivery: 5024, closing: 0 },
    { id: "arm_sfg_13", category: "SFG", sl: "13", code: "SFG1010025", name: "Winding Armature 6 Circle 15mm Black Sheet", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0, closing: 0 },
    { id: "arm_sfg_14", category: "SFG", sl: "14", code: "SFG1010024", name: "Winding Armature 6 Circle 16mm", unit: "Pcs", opening: 2123, storeRec: 0, sectionRec: 0, productionRec: 178, damage: 0, othersRec: 0, delivery: 1241, closing: 1060 },
    { id: "arm_sfg_15", category: "SFG", sl: "15", code: "SFG1010026", name: "Winding Armature 7 Circle 15mm", unit: "Pcs", opening: 11331, storeRec: 0, sectionRec: 0, productionRec: 15000, damage: 0, othersRec: 0, delivery: 18824, closing: 7507 },
    { id: "arm_sfg_16", category: "SFG", sl: "16", code: "SFG1010122", name: "Winding Armature 7 Circle 16mm", unit: "Pcs", opening: 788, storeRec: 0, sectionRec: 0, productionRec: 160, damage: 0, othersRec: 0, delivery: 396, closing: 552 },

    // --- PRODUCTION CONSUMPTION ---
    { id: "arm_pc_1", category: "Production Consumption", sl: "1", code: "700000003", name: "Hands Gloves - Cotton", unit: "Pcs", opening: 0, storeRec: 168, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 168, closing: 0 },
    { id: "arm_pc_2", category: "Production Consumption", sl: "2", code: "700000004", name: "Hands Gloves - Rubber", unit: "Pcs", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0, closing: 0 },
    { id: "arm_pc_3", category: "Production Consumption", sl: "3", code: "700000015", name: "Kerosene", unit: "Ltr", opening: 0, storeRec: 0, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 0, closing: 0 },
    { id: "arm_pc_4", category: "Production Consumption", sl: "4", code: "700000021", name: "Thinner(Fan)", unit: "Ltr", opening: 0, storeRec: 5, sectionRec: 0, productionRec: 0, damage: 0, othersRec: 0, delivery: 5, closing: 0 }
];
