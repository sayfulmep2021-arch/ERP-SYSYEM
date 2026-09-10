/**
 * Default Daily Production Plan Dataset (MEP Fan Ltd.)
 * Categories: FG Item, SFG Blade Item, SFG Assemble Item, Armature Item
 */
const DEFAULT_DAILY_PRODUCTION_PLAN = {
    planDate: "2026-08-26",
    categories: [
        {
            name: "FG Item",
            rowStyle: "style-pink",
            items: [
                { sl: "1", code: "SFG1010076", name: "2401 Super Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 4000, preDay: 4000 },
                { sl: "2", code: "SFG1010077", name: "3601 Hero Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "3", code: "SFG1010078", name: "4801 Popular Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "4", code: "SFG1010080", name: "5602 Speed King Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "5", code: "SFG1010097", name: "5603 Premium Gold Complete Body - Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "6", code: "SFG1010137", name: "5606 Premium Plus Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "7", code: "SFG1010135", name: "5607 Crown Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "9", code: "SFG1010079", name: "5601 Premium Ceiling Fan Complete Body - Ivory", unit: "Pcs", qty: 1000, preDay: 2000 }
            ]
        },
        {
            name: "SFG Blade Item",
            rowStyle: "style-pink",
            items: [
                { sl: "1", code: "SFG1010074", name: "5601 Premium Ceiling Fan Blade - Ivory", unit: "Set", qty: 2000, preDay: 2000 },
                { sl: "3", code: "SFG1010075", name: "5602 Speed King Ceiling Fan Blade - Ivory", unit: "Set", qty: 0, preDay: 0 },
                { sl: "4", code: "SFG1010096", name: "5603 Premium Gold Ceiling Fan Blade", unit: "Set", qty: 0, preDay: 0 },
                { sl: "5", code: "SFG1010139", name: "5606 Premium Plus Ceiling Fan Blade - Ivory", unit: "Set", qty: 0, preDay: 0 },
                { sl: "6", code: "SFG1010136", name: "5607 Crown Ceiling Fan Blade - Ivory", unit: "Set", qty: 0, preDay: 0 },
                { sl: "7", code: "SFG1010073", name: "4801 Popular Ceiling Fan Blade - Ivory", unit: "Set", qty: 0, preDay: 0 },
                { sl: "8", code: "SFG1010072", name: "3601 Hero Ceiling Fan Blade - Ivory", unit: "Set", qty: 0, preDay: 0 },
                { sl: "9", code: "SFG1010071", name: "2401 Super Ceiling Fan Blade - Ivory", unit: "Set", qty: 0, preDay: 0 }
            ]
        },
        {
            name: "SFG Assemble Item",
            rowStyle: "style-amber",
            items: [
                { sl: "1", code: "SFG1010064", name: "Complete Down Pipe 10 Inch- 4801, 5601, 5603 - Ivory", unit: "Pcs", qty: 3600, preDay: 1100 },
                { sl: "3", code: "SFG1010065", name: "Complete Down Pipe 10 Inch -(5602,3601,2401)- Ivory", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "4", code: "SFG1010082", name: "Completed Clamp with Accessories - 4801, 5601, 5603", unit: "Set", qty: 5000, preDay: 1100 },
                { sl: "7", code: "SFG1010069", name: "Complete Canopy Small-5602", unit: "Pcs", qty: 0, preDay: 0 },
                { sl: "9", code: "SFG1010070", name: "Complete Canopy Big - 4801, 5601, 5603", unit: "Pcs", qty: 3000, preDay: 1000 }
            ]
        },
        {
            name: "Armature Item",
            rowStyle: "style-armature",
            items: [
                { sl: "5", code: "SFG1010023", name: "Winding Armature 5.5 Circle 16mm", unit: "Pcs", qty: 2000, preDay: 1000, subStyle: "style-orange" },
                { sl: "6", code: "SFG1010024", name: "Winding Armature 6 Circle 16mm", unit: "Pcs", qty: 0, preDay: 0, subStyle: "style-orange" },
                { sl: "7", code: "SFG1010026", name: "Winding Armature 7 Circle 15mm", unit: "Pcs", qty: 2000, preDay: 2000, subStyle: "style-orange" },
                { sl: "8", code: "SFG1010122", name: "Winding Armature 7 Circle 16mm", unit: "Pcs", qty: 0, preDay: 0, subStyle: "style-orange" },
                { sl: "13", code: "SFG1010027", name: "Complete Armature 5.5 Circle 16mm", unit: "Pcs", qty: 0, preDay: 0, subStyle: "style-lime" },
                { sl: "14", code: "SFG1010028", name: "Complete Armature 6 Circle 16mm", unit: "Pcs", qty: 0, preDay: 0, subStyle: "style-lime" },
                { sl: "15", code: "SFG1010030", name: "Complete Armature 7 Circle 15mm", unit: "Pcs", qty: 7000, preDay: 1800, subStyle: "style-lime" },
                { sl: "17", code: "SFG1010123", name: "Complete Armature 7 Circle 16mm -5607", unit: "Pcs", qty: 0, preDay: 0, subStyle: "style-lime" }
            ]
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_DAILY_PRODUCTION_PLAN };
}
