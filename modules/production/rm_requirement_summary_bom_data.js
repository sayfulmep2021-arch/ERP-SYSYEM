/**
 * MEP FAN LTD. - RM Requirement Summary (BOM) Master Data
 * Source: Master BOM Dataset linked with Production Plan
 * Allows ADMIN to Add, Edit, Delete, Replace, and Save Master Ratios
 */

const FAN_MODELS_CONFIG = [
    { key: "CF5601/CF5601IV", sfgCode: "SFG1010079", label: "56 Inch Premium", short: "CF5601" },
    { key: "CF5602/CF5602IV", sfgCode: "SFG1010080", label: "56 Inch Speed King", short: "CF5602" },
    { key: "CF5603/CF5603IV", sfgCode: "SFG1010097", label: "56 Inch Premium Gold", short: "CF5603" },
    { key: "CF5606/CF5606IV", sfgCode: "SFG1010137", label: "56 Inch Premium Plus", short: "CF5606" },
    { key: "CF5607/CF5607IV", sfgCode: "SFG1010135", label: "56 Inch Crown", short: "CF5607" },
    { key: "CF4801/CF4801IV", sfgCode: "SFG1010078", label: "48 Inch Popular", short: "CF4801" },
    { key: "CF3601/CF3601IV", sfgCode: "SFG1010077", label: "36 Inch Hero", short: "CF3601" },
    { key: "CF2401/CF2401IV", sfgCode: "SFG1010076", label: "24 Inch Super", short: "CF2401" }
];

const DEFAULT_RM_REQUIREMENT_BOM_DATA = [
    {
        "category":  "Raw Material",
        "sl":  1,
        "code":  "3101010135",
        "name":  "Ball Bearing 6202 (C\u0026U)",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  2,
        "code":  "3101010032",
        "name":  "Ball Bearing 6202 (HCH-V2+)",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  3,
        "code":  "3101010136",
        "name":  "Ball Bearing 6203 (C\u0026U)",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  4,
        "code":  "3101010033",
        "name":  "Ball Bearing 6203 (HCH-V2+)",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  5,
        "code":  "3101010125",
        "name":  "Blade Show Cap - 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  3,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  6,
        "code":  "3101010077",
        "name":  "Blade/Body Screw 12.7x6mm,H=10mm (220/kg)",
        "unit":  "KG",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0.036,
                    "CF5602/CF5602IV":  0.024,
                    "CF5603/CF5603IV":  0.024,
                    "CF5606/CF5606IV":  0.036,
                    "CF5607/CF5607IV":  0.032,
                    "CF4801/CF4801IV":  0.024,
                    "CF3601/CF3601IV":  0.0363,
                    "CF2401/CF2401IV":  0.048
                }
    },
    {
        "category":  "Raw Material",
        "sl":  7,
        "code":  "3101010076",
        "name":  "Body Screw 15x6mm,H=10mm (230/kg)",
        "unit":  "KG",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0.016,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  8,
        "code":  "3101010075",
        "name":  "Body Screw 18x6mm,H=10mm (200/kg)",
        "unit":  "KG",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0.016,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0.016,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  9,
        "code":  "3101010130",
        "name":  "Body screw- 3/16` x 35mm",
        "unit":  "KG",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0.013,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  10,
        "code":  "3101010109",
        "name":  "Body Show Cap - 5603",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  11,
        "code":  "3101010124",
        "name":  "Body Show Cap - 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  12,
        "code":  "3101010078",
        "name":  "Canopy Big",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  2,
                    "CF5602/CF5602IV":  2,
                    "CF5603/CF5603IV":  2,
                    "CF5606/CF5606IV":  2,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  2,
                    "CF3601/CF3601IV":  2,
                    "CF2401/CF2401IV":  2
                }
    },
    {
        "category":  "Raw Material",
        "sl":  13,
        "code":  "3101010086",
        "name":  "Canopy Rubber Ring",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  2,
                    "CF5602/CF5602IV":  2,
                    "CF5603/CF5603IV":  2,
                    "CF5606/CF5606IV":  2,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  2,
                    "CF3601/CF3601IV":  2,
                    "CF2401/CF2401IV":  2
                }
    },
    {
        "category":  "Raw Material",
        "sl":  15,
        "code":  "3101010123",
        "name":  "Canopy with Ring - 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  2,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  16,
        "code":  "3101010035",
        "name":  "Capacitor 2.2 uF",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  17,
        "code":  "3101010034",
        "name":  "Capacitor 2.5 uF (BM)",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  18,
        "code":  "3101010138",
        "name":  "MEP Capacitor 2.5 uF (450VAC)",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  19,
        "code":  "3101010080",
        "name":  "Capacitor Cover",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  20,
        "code":  "3101010126",
        "name":  "Capacitor Support- 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  2,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  21,
        "code":  "3101010129",
        "name":  "Decorative Nut Bolt - 5607",
        "unit":  "Set",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  3,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  22,
        "code":  "3101010037",
        "name":  "Deko Paint Green Lim",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0.001,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  23,
        "code":  "3101010066",
        "name":  "Down Pipe Nut 8mm (190/kg)",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.015,
                    "CF5602/CF5602IV":  0.01,
                    "CF5603/CF5603IV":  0.015,
                    "CF5606/CF5606IV":  0.015,
                    "CF5607/CF5607IV":  0.01,
                    "CF4801/CF4801IV":  0.015,
                    "CF3601/CF3601IV":  0.01,
                    "CF2401/CF2401IV":  0.01
                }
    },
    {
        "category":  "Raw Material",
        "sl":  24,
        "code":  "3101010121",
        "name":  "Down Pipe - 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  25,
        "code":  "3101010071",
        "name":  "Down Pipe Bolt 8mm x 1.5\u0027\u0027 (50/kg)",
        "unit":  "Pcs",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  3,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  3,
                    "CF5606/CF5606IV":  3,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  3,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  26,
        "code":  "3101010072",
        "name":  "Down Pipe Bolt 8mm x 2\u0027\u0027 (45/kg)",
        "unit":  "Pcs",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  27,
        "code":  "3101010127",
        "name":  "Down Pipe Sira Pin (Big)",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  28,
        "code":  "3101010073",
        "name":  "Down Pipe Sira Pin(Fan)",
        "unit":  "Pcs",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  3,
                    "CF5602/CF5602IV":  2,
                    "CF5603/CF5603IV":  3,
                    "CF5606/CF5606IV":  3,
                    "CF5607/CF5607IV":  3,
                    "CF4801/CF4801IV":  3,
                    "CF3601/CF3601IV":  2,
                    "CF2401/CF2401IV":  2
                }
    },
    {
        "category":  "Raw Material",
        "sl":  29,
        "code":  "3101010023",
        "name":  "FAN Ampere Tube-04 no",
        "unit":  "Mtr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.16,
                    "CF5602/CF5602IV":  0.16,
                    "CF5603/CF5603IV":  0.16,
                    "CF5606/CF5606IV":  0.16,
                    "CF5607/CF5607IV":  0.16,
                    "CF4801/CF4801IV":  0.16,
                    "CF3601/CF3601IV":  0.16,
                    "CF2401/CF2401IV":  0.16
                }
    },
    {
        "category":  "Raw Material",
        "sl":  30,
        "code":  "3101010112",
        "name":  "Flaxible Cable 14x0.0076 - Black",
        "unit":  "Mtr",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0.61,
                    "CF5602/CF5602IV":  0.61,
                    "CF5603/CF5603IV":  0.61,
                    "CF5606/CF5606IV":  0.61,
                    "CF5607/CF5607IV":  0.61,
                    "CF4801/CF4801IV":  0.61,
                    "CF3601/CF3601IV":  0.61,
                    "CF2401/CF2401IV":  0.61
                }
    },
    {
        "category":  "Raw Material",
        "sl":  31,
        "code":  "3101010090",
        "name":  "Flaxible Cable 14x0.0076 - Red",
        "unit":  "Mtr",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0.61,
                    "CF5602/CF5602IV":  0.61,
                    "CF5603/CF5603IV":  0.61,
                    "CF5606/CF5606IV":  0.61,
                    "CF5607/CF5607IV":  0.61,
                    "CF4801/CF4801IV":  0.61,
                    "CF3601/CF3601IV":  0.61,
                    "CF2401/CF2401IV":  0.61
                }
    },
    {
        "category":  "Raw Material",
        "sl":  32,
        "code":  "3101010038",
        "name":  "Doco Paint (Golden-98191) Kangaroo",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.0001,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0.0001,
                    "CF5606/CF5606IV":  0.0001,
                    "CF5607/CF5607IV":  0.0001,
                    "CF4801/CF4801IV":  0.0001,
                    "CF3601/CF3601IV":  0.0001,
                    "CF2401/CF2401IV":  0.0001
                }
    },
    {
        "category":  "Raw Material",
        "sl":  33,
        "code":  "3101010085",
        "name":  "Insulation Rubber",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  34,
        "code":  "3101010070",
        "name":  "Ms Washer 3/16 (1910/kg)",
        "unit":  "KG",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0.0006,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0.0006,
                    "CF5606/CF5606IV":  0.0006,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.0006,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  35,
        "code":  "3101010108",
        "name":  "NC / ABC Thinner",
        "unit":  "Ltr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.001,
                    "CF5602/CF5602IV":  0.001,
                    "CF5603/CF5603IV":  0.001,
                    "CF5606/CF5606IV":  0.001,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.001,
                    "CF3601/CF3601IV":  0.001,
                    "CF2401/CF2401IV":  0.001
                }
    },
    {
        "category":  "Raw Material",
        "sl":  36,
        "code":  "3101010122",
        "name":  "Neck - 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  37,
        "code":  "3101010107",
        "name":  "Nice Regulator Small White(FAN)",
        "unit":  "Pcs",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  38,
        "code":  "3101010054",
        "name":  "Paint Clear",
        "unit":  "Ltr.",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.0005,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0.0005,
                    "CF5606/CF5606IV":  0.0005,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.0005,
                    "CF3601/CF3601IV":  0.0005,
                    "CF2401/CF2401IV":  0.0005
                }
    },
    {
        "category":  "Raw Material",
        "sl":  39,
        "code":  "3101010084",
        "name":  "Plastic XL Cap",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  40,
        "code":  "3101010059",
        "name":  "Premium Gold Blade Showcap",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  3,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  41,
        "code":  "3101010119",
        "name":  "Promotional Gang Regulator White (P512)",
        "unit":  "Pcs",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  42,
        "code":  "3101010065",
        "name":  "Rubber Bend (5000/kg)",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.00118,
                    "CF5602/CF5602IV":  0.001,
                    "CF5603/CF5603IV":  0.0012,
                    "CF5606/CF5606IV":  0.0012,
                    "CF5607/CF5607IV":  0.0012,
                    "CF4801/CF4801IV":  0.0012,
                    "CF3601/CF3601IV":  0.001,
                    "CF2401/CF2401IV":  0.0011
                }
    },
    {
        "category":  "Raw Material",
        "sl":  43,
        "code":  "3101010083",
        "name":  "Rubber Gasket (2401,3601)",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  3,
                    "CF2401/CF2401IV":  4
                }
    },
    {
        "category":  "Raw Material",
        "sl":  44,
        "code":  "3101010110",
        "name":  "Rubber Gasket (5602)",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  3,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  45,
        "code":  "3101010081",
        "name":  "Rubber Gasket (56` 48`)",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  3,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  3,
                    "CF5606/CF5606IV":  3,
                    "CF5607/CF5607IV":  3,
                    "CF4801/CF4801IV":  3,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  46,
        "code":  "3101010067",
        "name":  "Safety Lock Nut 3/16 (1200/kg)",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  7,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  6,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  47,
        "code":  "3101010060",
        "name":  "Safety Wire",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  48,
        "code":  "3101010074",
        "name":  "Shaft/XL /Safity lock Screw 3/16x3/8\u0027\u0027 (400/kg)",
        "unit":  "KG",
        "type":  "MEP Screw",
        "bom":  {
                    "CF5601/CF5601IV":  0.004,
                    "CF5602/CF5602IV":  0.002,
                    "CF5603/CF5603IV":  0.004,
                    "CF5606/CF5606IV":  0.004,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.004,
                    "CF3601/CF3601IV":  0.002,
                    "CF2401/CF2401IV":  0.002
                }
    },
    {
        "category":  "Raw Material",
        "sl":  49,
        "code":  "3101010056",
        "name":  "Show Cap-Plastic",
        "unit":  "Pcs",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  50,
        "code":  "3101010057",
        "name":  "Show Cap-Steel (Big)-50mm",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  51,
        "code":  "3101010058",
        "name":  "Show Cap-Steel(small)-42mm",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  52,
        "code":  "3101010061",
        "name":  "Silika Gel",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Raw Material",
        "sl":  53,
        "code":  "3101010094",
        "name":  "Soldering Wire",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.0005,
                    "CF5602/CF5602IV":  0.0005,
                    "CF5603/CF5603IV":  0.0005,
                    "CF5606/CF5606IV":  0.0005,
                    "CF5607/CF5607IV":  0.0005,
                    "CF4801/CF4801IV":  0.0005,
                    "CF3601/CF3601IV":  0.0005,
                    "CF2401/CF2401IV":  0.0005
                }
    },
    {
        "category":  "Raw Material",
        "sl":  54,
        "code":  "3101010068",
        "name":  "Spiring Washer 6mm 1400/kg)",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.004,
                    "CF5602/CF5602IV":  0.004,
                    "CF5603/CF5603IV":  0.004,
                    "CF5606/CF5606IV":  0.004,
                    "CF5607/CF5607IV":  0.004,
                    "CF4801/CF4801IV":  0.004,
                    "CF3601/CF3601IV":  0.004,
                    "CF2401/CF2401IV":  0.006
                }
    },
    {
        "category":  "Raw Material",
        "sl":  55,
        "code":  "3101010069",
        "name":  "Spiring Washer 8mm (880/kg)",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.003,
                    "CF5602/CF5602IV":  0.0018,
                    "CF5603/CF5603IV":  0.003,
                    "CF5606/CF5606IV":  0.003,
                    "CF5607/CF5607IV":  0.002,
                    "CF4801/CF4801IV":  0.003,
                    "CF3601/CF3601IV":  0.0018,
                    "CF2401/CF2401IV":  0.0018
                }
    },
    {
        "category":  "Raw Material",
        "sl":  56,
        "code":  "3101010030",
        "name":  "XL/Shaft (Big)-144mm",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  57,
        "code":  "3202010001",
        "name":  "HDPE Poly (L=22`, W=18`, T=0.025mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0.015,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Raw Material",
        "sl":  58,
        "code":  "3202010007",
        "name":  "PP Band Fita",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.001,
                    "CF5602/CF5602IV":  0.0009,
                    "CF5603/CF5603IV":  0.002,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0.002,
                    "CF4801/CF4801IV":  0.0009,
                    "CF3601/CF3601IV":  0.0008,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  1,
        "code":  "3201010058",
        "name":  "Blade Carton - Crown (5607)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  2,
        "code":  "3201010036",
        "name":  "Blade Carton -Hero (3601)-400x120x29mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  3,
        "code":  "3201010035",
        "name":  "Blade Carton -Popular (4801)-528x144x32mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  4,
        "code":  "3201010034",
        "name":  "Blade Carton -Speed king (5602)-622x127x30mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  5,
        "code":  "3201010030",
        "name":  "Blade Carton-Premium (5601)-622x153x34mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  6,
        "code":  "3201010031",
        "name":  "Blade Carton-Premium Gold (5603)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  7,
        "code":  "3201010032",
        "name":  "Blade Carton-Premium Plus (5606)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  8,
        "code":  "3201010040",
        "name":  "HDPE Poly (L=18`, W=7`, T=0.035mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0.008,
                    "CF2401/CF2401IV":  0.008
                }
    },
    {
        "category":  "Packing Item",
        "sl":  9,
        "code":  "3201010039",
        "name":  "HDPE Poly (L=27`, W=8`, T=0.035mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0.009,
                    "CF5602/CF5602IV":  0.009,
                    "CF5603/CF5603IV":  0.009,
                    "CF5606/CF5606IV":  0.009,
                    "CF5607/CF5607IV":  0.009,
                    "CF4801/CF4801IV":  0.008,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  10,
        "code":  "3201010057",
        "name":  "Body Carton - Crown (5607)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  11,
        "code":  "3201010028",
        "name":  "Body Carton -Hero (3601)-195x195x230mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  12,
        "code":  "3201010027",
        "name":  "Body Carton -Popular (4801)-264x262x200mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  13,
        "code":  "3201010022",
        "name":  "Body Carton -Premium (5601)-263x264x213mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  14,
        "code":  "3201010026",
        "name":  "Body Carton -Speed king (5602) -220x220x208mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  15,
        "code":  "3201010029",
        "name":  "Body Carton -Super (2401)-185x185x267mm",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Packing Item",
        "sl":  16,
        "code":  "3201010023",
        "name":  "Body Carton Premium Gold (5603)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  17,
        "code":  "3201010024",
        "name":  "Body Carton Premium Plus (5606)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  18,
        "code":  "3201010038",
        "name":  "HDPE Poly (L=14`, W=12`,T=0.035mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0.01,
                    "CF2401/CF2401IV":  0.01
                }
    },
    {
        "category":  "Packing Item",
        "sl":  19,
        "code":  "3201010037",
        "name":  "HDPE Poly (L=15`, W=15`, T=0.035mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0.01,
                    "CF5602/CF5602IV":  0.013,
                    "CF5603/CF5603IV":  0.01,
                    "CF5606/CF5606IV":  0.01,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.01,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  20,
        "code":  "3201010059",
        "name":  "Body Sticker (5607)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  21,
        "code":  "3201010005",
        "name":  "Body Sticker-Premium Plus(5606)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  22,
        "code":  "3201010051",
        "name":  "Body Sticker - 5603",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  23,
        "code":  "3201010006",
        "name":  "Body Sticker Speed King",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  24,
        "code":  "3201010009",
        "name":  "Body Sticker-2401",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Packing Item",
        "sl":  25,
        "code":  "3201010008",
        "name":  "Body Sticker-3601",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  26,
        "code":  "3201010007",
        "name":  "Body Sticker-4801",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  27,
        "code":  "3201010004",
        "name":  "Body Sticker-5601",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  28,
        "code":  "3201010041",
        "name":  "HDPE Poly (L=9`, W=9`, T=0.025mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0.003,
                    "CF5602/CF5602IV":  0.003,
                    "CF5603/CF5603IV":  0.003,
                    "CF5606/CF5606IV":  0.003,
                    "CF5607/CF5607IV":  0.006,
                    "CF4801/CF4801IV":  0.003,
                    "CF3601/CF3601IV":  0.003,
                    "CF2401/CF2401IV":  0.003
                }
    },
    {
        "category":  "Packing Item",
        "sl":  29,
        "code":  "3201010011",
        "name":  "Canopy Sticker Speed King",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  2,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  30,
        "code":  "3201010046",
        "name":  "Carton Tape - (W=60mm,L=200m, MEP Print)",
        "unit":  "Mtr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  1.5,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1.5,
                    "CF5606/CF5606IV":  0.8,
                    "CF5607/CF5607IV":  1.6,
                    "CF4801/CF4801IV":  1.3,
                    "CF3601/CF3601IV":  1.2,
                    "CF2401/CF2401IV":  0.7
                }
    },
    {
        "category":  "Packing Item",
        "sl":  31,
        "code":  "3201010061",
        "name":  "Cork Sheet - 5607",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  32,
        "code":  "3201010021",
        "name":  "Cork Sheet -2401/3601",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Packing Item",
        "sl":  33,
        "code":  "3201010019",
        "name":  "Cork Sheet -5601\u0027\u0027/4801\u0027\u0027",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  34,
        "code":  "3201010020",
        "name":  "Cork Sheet -5602\u0027\u0027",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  35,
        "code":  "3201010043",
        "name":  "PP Poly (L=5`, W=5`, T=0.045mm) With Logo Print",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0.00123,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0.00123,
                    "CF5606/CF5606IV":  0.00123,
                    "CF5607/CF5607IV":  0.00123,
                    "CF4801/CF4801IV":  0.00123,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  36,
        "code":  "3201010042",
        "name":  "HDPE Poly (L=13`, W=4`, T=0.035mm)",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0.003,
                    "CF5602/CF5602IV":  0.003,
                    "CF5603/CF5603IV":  0.003,
                    "CF5606/CF5606IV":  0.003,
                    "CF5607/CF5607IV":  0.003,
                    "CF4801/CF4801IV":  0.003,
                    "CF3601/CF3601IV":  0.003,
                    "CF2401/CF2401IV":  0.003
                }
    },
    {
        "category":  "Packing Item",
        "sl":  37,
        "code":  "3201010055",
        "name":  "Fan Without Down Pipe Sticker",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  38,
        "code":  "3201010010",
        "name":  "Fan Canopy Sticker",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  2,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  2,
                    "CF5606/CF5606IV":  2,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  2,
                    "CF3601/CF3601IV":  2,
                    "CF2401/CF2401IV":  2
                }
    },
    {
        "category":  "Packing Item",
        "sl":  39,
        "code":  "3201010013",
        "name":  "Fan Down Pipe Sticker",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  40,
        "code":  "3201010014",
        "name":  "Fan QC Sticker",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Packing Item",
        "sl":  41,
        "code":  "3201010002",
        "name":  "FAN Shank Paper",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  3,
                    "CF5602/CF5602IV":  3,
                    "CF5603/CF5603IV":  3,
                    "CF5606/CF5606IV":  3,
                    "CF5607/CF5607IV":  3,
                    "CF4801/CF4801IV":  3,
                    "CF3601/CF3601IV":  3,
                    "CF2401/CF2401IV":  2
                }
    },
    {
        "category":  "Packing Item",
        "sl":  42,
        "code":  "3201010054",
        "name":  "Fan Without Regulator Sticker",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  43,
        "code":  "3201010060",
        "name":  "Guarantee Card - Crown (5607)",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  44,
        "code":  "3201010018",
        "name":  "Guarantee Card -2401,3601",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Packing Item",
        "sl":  45,
        "code":  "3201010016",
        "name":  "Guarantee Card -4801",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  46,
        "code":  "3201010015",
        "name":  "Guarantee Card -5601",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  47,
        "code":  "3201010064",
        "name":  "Guarantee Card -5603",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  48,
        "code":  "3201010017",
        "name":  "Guarantee Card Speed King",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  49,
        "code":  "3201010062",
        "name":  "MEP Hologram Sticker",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Packing Item",
        "sl":  50,
        "code":  "3201010053",
        "name":  "Roll Poly - 4`",
        "unit":  "KG",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  51,
        "code":  "3201010052",
        "name":  "Speed King Hologram Sticker",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Packing Item",
        "sl":  52,
        "code":  "3201010003",
        "name":  "Tissue Paper",
        "unit":  "Pcs",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  1.52,
                    "CF5602/CF5602IV":  1.52,
                    "CF5603/CF5603IV":  1.52,
                    "CF5606/CF5606IV":  1.52,
                    "CF5607/CF5607IV":  2,
                    "CF4801/CF4801IV":  1.52,
                    "CF3601/CF3601IV":  1.04,
                    "CF2401/CF2401IV":  1.04
                }
    },
    {
        "category":  "Packing Item",
        "sl":  53,
        "code":  "3201010056",
        "name":  "With Gang Regulator Sticker",
        "unit":  "Pcs",
        "type":  "P\u0026P",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Armature",
        "sl":  1,
        "code":  "3101010062",
        "name":  "Armature Coton Tap",
        "unit":  "Mtr",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0.5,
                    "CF2401/CF2401IV":  0.5
                }
    },
    {
        "category":  "Armature",
        "sl":  3,
        "code":  "3101010137",
        "name":  "MEP Cable Tie -2.5 x100mm",
        "unit":  "Pcs",
        "type":  "MEP Plastic",
        "bom":  {
                    "CF5601/CF5601IV":  1,
                    "CF5602/CF5602IV":  1,
                    "CF5603/CF5603IV":  1,
                    "CF5606/CF5606IV":  1,
                    "CF5607/CF5607IV":  1,
                    "CF4801/CF4801IV":  1,
                    "CF3601/CF3601IV":  1,
                    "CF2401/CF2401IV":  1
                }
    },
    {
        "category":  "Armature",
        "sl":  4,
        "code":  "3101010037",
        "name":  "Deko Paint Green Lim",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0.00035,
                    "CF5607/CF5607IV":  0.00035,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Armature",
        "sl":  5,
        "code":  "3101010036",
        "name":  "Deko Paint Oxford Blue",
        "unit":  "KG",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.00035,
                    "CF5602/CF5602IV":  0.0003,
                    "CF5603/CF5603IV":  0.00035,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.0003,
                    "CF3601/CF3601IV":  0.0003,
                    "CF2401/CF2401IV":  0.0003
                }
    },
    {
        "category":  "Armature",
        "sl":  6,
        "code":  "3101010091",
        "name":  "FAN Ampere Tube-01 no",
        "unit":  "Mtr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.15,
                    "CF5602/CF5602IV":  0.15,
                    "CF5603/CF5603IV":  0.15,
                    "CF5606/CF5606IV":  0.15,
                    "CF5607/CF5607IV":  0.15,
                    "CF4801/CF4801IV":  0.15,
                    "CF3601/CF3601IV":  0.1516,
                    "CF2401/CF2401IV":  0.1516
                }
    },
    {
        "category":  "Armature",
        "sl":  7,
        "code":  "3101010022",
        "name":  "FAN Ampere Tube-03 no",
        "unit":  "Mtr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.19,
                    "CF5602/CF5602IV":  0.19,
                    "CF5603/CF5603IV":  0.19,
                    "CF5606/CF5606IV":  0.19,
                    "CF5607/CF5607IV":  0.19,
                    "CF4801/CF4801IV":  0.19,
                    "CF3601/CF3601IV":  0.19,
                    "CF2401/CF2401IV":  0.19
                }
    },
    {
        "category":  "Armature",
        "sl":  8,
        "code":  "3101010024",
        "name":  "FAN Ampere Tube-08 no",
        "unit":  "Mtr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.046,
                    "CF5602/CF5602IV":  0.046,
                    "CF5603/CF5603IV":  0.046,
                    "CF5606/CF5606IV":  0.046,
                    "CF5607/CF5607IV":  0.046,
                    "CF4801/CF4801IV":  0.046,
                    "CF3601/CF3601IV":  0.046,
                    "CF2401/CF2401IV":  0.046
                }
    },
    {
        "category":  "Armature",
        "sl":  9,
        "code":  "3101010112",
        "name":  "Flaxible Cable 14x0.0076 - Black",
        "unit":  "Mtr",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0.305,
                    "CF5602/CF5602IV":  0.305,
                    "CF5603/CF5603IV":  0.305,
                    "CF5606/CF5606IV":  0.305,
                    "CF5607/CF5607IV":  0.305,
                    "CF4801/CF4801IV":  0.305,
                    "CF3601/CF3601IV":  0.305,
                    "CF2401/CF2401IV":  0.305
                }
    },
    {
        "category":  "Armature",
        "sl":  10,
        "code":  "3101010090",
        "name":  "Flaxible Cable 14x0.0076 - Red",
        "unit":  "Mtr",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0.305,
                    "CF5602/CF5602IV":  0.305,
                    "CF5603/CF5603IV":  0.305,
                    "CF5606/CF5606IV":  0.305,
                    "CF5607/CF5607IV":  0.305,
                    "CF4801/CF4801IV":  0.305,
                    "CF3601/CF3601IV":  0.305,
                    "CF2401/CF2401IV":  0.305
                }
    },
    {
        "category":  "Armature",
        "sl":  11,
        "code":  "3101010111",
        "name":  "Flaxible Cable 14x0.0076 - Yellow",
        "unit":  "Mtr",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0.305,
                    "CF5602/CF5602IV":  0.305,
                    "CF5603/CF5603IV":  0.305,
                    "CF5606/CF5606IV":  0.305,
                    "CF5607/CF5607IV":  0.305,
                    "CF4801/CF4801IV":  0.305,
                    "CF3601/CF3601IV":  0.305,
                    "CF2401/CF2401IV":  0.305
                }
    },
    {
        "category":  "Armature",
        "sl":  12,
        "code":  "3101010019",
        "name":  "Insulation Fiber 20 mm x 0.35mm",
        "unit":  "KG",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0.0035,
                    "CF5602/CF5602IV":  0.003,
                    "CF5603/CF5603IV":  0.0035,
                    "CF5606/CF5606IV":  0.0035,
                    "CF5607/CF5607IV":  0.0035,
                    "CF4801/CF4801IV":  0.003,
                    "CF3601/CF3601IV":  0.002,
                    "CF2401/CF2401IV":  0.002
                }
    },
    {
        "category":  "Armature",
        "sl":  13,
        "code":  "3101010020",
        "name":  "Insulation Fiber 27 mm x 0.190mm",
        "unit":  "KG",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0.009,
                    "CF5602/CF5602IV":  0.008,
                    "CF5603/CF5603IV":  0.009,
                    "CF5606/CF5606IV":  0.009,
                    "CF5607/CF5607IV":  0.009,
                    "CF4801/CF4801IV":  0.008,
                    "CF3601/CF3601IV":  0.007,
                    "CF2401/CF2401IV":  0.007
                }
    },
    {
        "category":  "Armature",
        "sl":  14,
        "code":  "3101010021",
        "name":  "Lather Fiber 10 mm",
        "unit":  "KG",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0.001,
                    "CF5602/CF5602IV":  0.001,
                    "CF5603/CF5603IV":  0.001,
                    "CF5606/CF5606IV":  0.001,
                    "CF5607/CF5607IV":  0.001,
                    "CF4801/CF4801IV":  0.001,
                    "CF3601/CF3601IV":  0.001,
                    "CF2401/CF2401IV":  0.001
                }
    },
    {
        "category":  "Armature",
        "sl":  15,
        "code":  "3101010108",
        "name":  "NC / ABC Thinner",
        "unit":  "Ltr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.0015,
                    "CF5602/CF5602IV":  0.0015,
                    "CF5603/CF5603IV":  0.0025,
                    "CF5606/CF5606IV":  0.001,
                    "CF5607/CF5607IV":  0.001,
                    "CF4801/CF4801IV":  0.0015,
                    "CF3601/CF3601IV":  0.0015,
                    "CF2401/CF2401IV":  0.0015
                }
    },
    {
        "category":  "Armature",
        "sl":  16,
        "code":  "3101010026",
        "name":  "Solven",
        "unit":  "Ltr",
        "type":  "Local",
        "bom":  {
                    "CF5601/CF5601IV":  0.018,
                    "CF5602/CF5602IV":  0.018,
                    "CF5603/CF5603IV":  0.018,
                    "CF5606/CF5606IV":  0.018,
                    "CF5607/CF5607IV":  0.018,
                    "CF4801/CF4801IV":  0.018,
                    "CF3601/CF3601IV":  0.025,
                    "CF2401/CF2401IV":  0.025
                }
    },
    {
        "category":  "Armature",
        "sl":  17,
        "code":  "3101010016",
        "name":  "Super Wire (SWG 33) / 0.253mm",
        "unit":  "KG",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0.33,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0.33,
                    "CF5606/CF5606IV":  0.355,
                    "CF5607/CF5607IV":  0.355,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Armature",
        "sl":  18,
        "code":  "3101010017",
        "name":  "Super Wire (SWG 34) / 0.233mm",
        "unit":  "KG",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0.293,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0.293,
                    "CF3601/CF3601IV":  0,
                    "CF2401/CF2401IV":  0
                }
    },
    {
        "category":  "Armature",
        "sl":  19,
        "code":  "3101010018",
        "name":  "Super Wire (SWG 35) / 0.213mm",
        "unit":  "KG",
        "type":  "MEP",
        "bom":  {
                    "CF5601/CF5601IV":  0,
                    "CF5602/CF5602IV":  0,
                    "CF5603/CF5603IV":  0,
                    "CF5606/CF5606IV":  0,
                    "CF5607/CF5607IV":  0,
                    "CF4801/CF4801IV":  0,
                    "CF3601/CF3601IV":  0.235,
                    "CF2401/CF2401IV":  0.235
                }
    },
    {
        "category":  "Armature",
        "sl":  20,
        "code":  "3101010027",
        "name":  "Vernish-1132",
        "unit":  "Ltr",
        "type":  "Imp",
        "bom":  {
                    "CF5601/CF5601IV":  0.018,
                    "CF5602/CF5602IV":  0.018,
                    "CF5603/CF5603IV":  0.018,
                    "CF5606/CF5606IV":  0.018,
                    "CF5607/CF5607IV":  0.018,
                    "CF4801/CF4801IV":  0.018,
                    "CF3601/CF3601IV":  0.025,
                    "CF2401/CF2401IV":  0.025
                }
    }
];

if (typeof window !== 'undefined') {
    window.FAN_MODELS_CONFIG = FAN_MODELS_CONFIG;
    window.DEFAULT_RM_REQUIREMENT_BOM_DATA = DEFAULT_RM_REQUIREMENT_BOM_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FAN_MODELS_CONFIG, DEFAULT_RM_REQUIREMENT_BOM_DATA };
}