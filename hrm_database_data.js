/**
 * HRM Database Data & State Management
 * Default 107 Enterprise Employee Records
 */
(function(window) {
    'use strict';

    const HRM_STORAGE_KEY = 'mep_hrm_employees_data';
    const HRM_LOGS_KEY = 'mep_hrm_audit_logs';

    const DEFAULT_HRM_EMPLOYEES = [
    {
        "sl": 1,
        "id": "855",
        "name": "Md.Kausar Hossain Poran",
        "designation": "Senior Operator",
        "doj": "1-Dec-15",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 2,
        "id": "910",
        "name": "Sumi Begum",
        "designation": "Helper",
        "doj": "13-Oct-16",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 3,
        "id": "924",
        "name": "Md.Nesar Uddin",
        "designation": "Assistant Technical Man",
        "doj": "22-Mar-16",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 4,
        "id": "927",
        "name": "Md.Saiful Islam",
        "designation": "Senior Technical Man",
        "doj": "15-Nov-16",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 5,
        "id": "1377",
        "name": "Md.Rakib Mirda",
        "designation": "Assistant Operator",
        "doj": "1-Apr-18",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 6,
        "id": "1442",
        "name": "Sahanaj Akter",
        "designation": "Assistant Operator",
        "doj": "6-May-18",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 7,
        "id": "2917",
        "name": "Nilu Rani",
        "designation": "Operator",
        "doj": "01-Jan-1995",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 8,
        "id": "3098",
        "name": "Piynka Sarkar",
        "designation": "Assistant Operator",
        "doj": "12-Sep-18",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 9,
        "id": "3142",
        "name": "Rohomot Mollah",
        "designation": "Senior Technical Man",
        "doj": "9-Sep-18",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 10,
        "id": "7332",
        "name": "Namita Rani",
        "designation": "Assistant Operator",
        "doj": "14-Nov-20",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 11,
        "id": "7571",
        "name": "Bithi Rani Das",
        "designation": "Sub-Assistant Engineer",
        "doj": "01-Jan-2019",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 12,
        "id": "7752",
        "name": "Md.Halim Howlader",
        "designation": "Operator",
        "doj": "2-Sep-19",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 13,
        "id": "7766",
        "name": "Mijanur Rohman",
        "designation": "Operator",
        "doj": "2-Mar-19",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 14,
        "id": "7819",
        "name": "Sree Kartik Pande",
        "designation": "Assistant Operator",
        "doj": "2-Oct-19",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 15,
        "id": "7951",
        "name": "Md.Sanaullah Hosen",
        "designation": "Operator",
        "doj": "01-Jan-2020",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 16,
        "id": "10574",
        "name": "Ovijit Saha",
        "designation": "Assistant Operator",
        "doj": "19-Dec-20",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 17,
        "id": "10616",
        "name": "Mst.Moni Akter",
        "designation": "Helper",
        "doj": "14-Jan-21",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 18,
        "id": "10619",
        "name": "Mst.Shilpy Begum",
        "designation": "Helper",
        "doj": "6-Jan-21",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 19,
        "id": "10676",
        "name": "Md. Sayful Islam",
        "designation": "Senior Supervisor",
        "doj": "1-Feb-21",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 20,
        "id": "11853",
        "name": "Md. Mijanur Rahman",
        "designation": "Assistant Operator",
        "doj": "3-Jun-21",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 21,
        "id": "12136",
        "name": "Adiba islam Keya",
        "designation": "Assistant Operator",
        "doj": "22-Aug-21",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 22,
        "id": "12419",
        "name": "Md.Sakil Hossain",
        "designation": "Assistant Operator",
        "doj": "13-Oct-21",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 23,
        "id": "12500",
        "name": "Elme Akter",
        "designation": "Helper",
        "doj": "16-Jan-22",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 24,
        "id": "13384",
        "name": "Rubina Akter",
        "designation": "Helper",
        "doj": "20-Aug-22",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 25,
        "id": "14093",
        "name": "Md Rajon",
        "designation": "Helper",
        "doj": "27-May-23",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 26,
        "id": "14142",
        "name": "Rubaiya",
        "designation": "Helper",
        "doj": "3-Jun-23",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 27,
        "id": "14393",
        "name": "Rabeya Akter Bisty",
        "designation": "Helper",
        "doj": "5-Aug-23",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 28,
        "id": "14471",
        "name": "Pakhi Akter",
        "designation": "Helper",
        "doj": "19-Aug-23",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 29,
        "id": "14874",
        "name": "Sumi Akther",
        "designation": "Helper",
        "doj": "11-Nov-23",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 30,
        "id": "14955",
        "name": "Jhumur Akther",
        "designation": "Helper",
        "doj": "6-Dec-23",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 31,
        "id": "15030",
        "name": "Mst. Ashshia Akter",
        "designation": "Helper",
        "doj": "2-Jan-24",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 32,
        "id": "15062",
        "name": "Md. Hridoy Howlader",
        "designation": "Operator",
        "doj": "10-Jan-24",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 33,
        "id": "15120",
        "name": "Shita Rani",
        "designation": "Helper",
        "doj": "5-Feb-24",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 34,
        "id": "15121",
        "name": "Shika Rani Roy",
        "designation": "Helper",
        "doj": "5-Feb-24",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 35,
        "id": "15266",
        "name": "Sanjida Akter",
        "designation": "Helper",
        "doj": "5-May-24",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 36,
        "id": "15278",
        "name": "Shrin Akter",
        "designation": "Helper",
        "doj": "6-May-24",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 37,
        "id": "15366",
        "name": "Lima Akter",
        "designation": "Helper",
        "doj": "26-May-24",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 38,
        "id": "15387",
        "name": "Arif Ahmed Anik",
        "designation": "Assistant Engineer",
        "doj": "2-Jun-24",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 39,
        "id": "15595",
        "name": "Zumur Begum",
        "designation": "Helper",
        "doj": "13-Jul-24",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 40,
        "id": "15852",
        "name": "Rupa Akter",
        "designation": "Helper",
        "doj": "8-Sep-24",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 41,
        "id": "16003",
        "name": "Md.Rayhan",
        "designation": "Helper",
        "doj": "18-Sep-24",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 42,
        "id": "16696",
        "name": "Mss Dalim Begum",
        "designation": "Helper",
        "doj": "8-Jan-25",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 43,
        "id": "16744",
        "name": "Md Abdur Rouf",
        "designation": "Helper",
        "doj": "15-Jan-25",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 44,
        "id": "16749",
        "name": "Mst Nafija Islam",
        "designation": "Junior Engineer",
        "doj": "18-Jan-25",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 45,
        "id": "16976",
        "name": "Md Takbir Hossain",
        "designation": "Assistant Engineer",
        "doj": "3-May-25",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 46,
        "id": "17142",
        "name": "Ismail Hossain",
        "designation": "Delivery Assistant",
        "doj": "8-Sep-25",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 47,
        "id": "17172",
        "name": "Md Yesin Mirdha",
        "designation": "Delivery Assistant",
        "doj": "15-Sep-25",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 48,
        "id": "17189",
        "name": "Md Jahid",
        "designation": "Operator",
        "doj": "26-Sep-25",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 49,
        "id": "17190",
        "name": "Asif Hasan",
        "designation": "Operator",
        "doj": "26-Sep-25",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 50,
        "id": "17249",
        "name": "Angoan Kumar das",
        "designation": "Helper",
        "doj": "6-Oct-25",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 51,
        "id": "17251",
        "name": "Mst Sadia Akter",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 52,
        "id": "17253",
        "name": "Ayesha Akter",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 53,
        "id": "17254",
        "name": "Sahajadi Akter Pakhi",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 54,
        "id": "17256",
        "name": "Purnima Das",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 55,
        "id": "17270",
        "name": "Israt Jahan Mitu",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 56,
        "id": "17281",
        "name": "Mst Aleya Begum",
        "designation": "Helper",
        "doj": "11-Oct-25",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 57,
        "id": "17291",
        "name": "Mst Asha",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 58,
        "id": "17294",
        "name": "Shanta Akter",
        "designation": "Helper",
        "doj": "11-Oct-25",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 59,
        "id": "17297",
        "name": "Mst Bithi",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 60,
        "id": "17314",
        "name": "Md Rayhan",
        "designation": "Operator",
        "doj": "15-Oct-25",
        "section": "Armature Winding",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 61,
        "id": "17340",
        "name": "Takbir Hossain Rabbi",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 62,
        "id": "17351",
        "name": "Fatema Tuz Gahora",
        "designation": "Helper",
        "doj": "18-Oct-25",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 63,
        "id": "17363",
        "name": "Md Usope Hossain",
        "designation": "Operator",
        "doj": "1-Nov-25",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 64,
        "id": "17373",
        "name": "Tamanna Akter",
        "designation": "Helper",
        "doj": "19-Oct-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 65,
        "id": "17482",
        "name": "Prinka",
        "designation": "Helper",
        "doj": "10-Nov-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 66,
        "id": "17488",
        "name": "Sharin",
        "designation": "Helper",
        "doj": "10-Nov-25",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 67,
        "id": "17504",
        "name": "Urmi Akter",
        "designation": "Helper",
        "doj": "12-Nov-25",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 68,
        "id": "17566",
        "name": "urmi Akter Mim",
        "designation": "Helper",
        "doj": "29-Nov-25",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 69,
        "id": "17622",
        "name": "Mst Mukta Akter",
        "designation": "Helper",
        "doj": "9-Dec-25",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 70,
        "id": "17848",
        "name": "Bithe Akter",
        "designation": "Helper",
        "doj": "1-Apr-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 71,
        "id": "17856",
        "name": "Eti Khatun",
        "designation": "Helper",
        "doj": "4-Apr-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 72,
        "id": "17857",
        "name": "Elma Akter Mou",
        "designation": "Helper",
        "doj": "4-Apr-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 73,
        "id": "17889",
        "name": "Habiba",
        "designation": "Helper",
        "doj": "7-Apr-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 74,
        "id": "17914",
        "name": "Laki Akter",
        "designation": "Helper",
        "doj": "9-Apr-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 75,
        "id": "17918",
        "name": "Sumaya Akter",
        "designation": "Helper",
        "doj": "9-Apr-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 76,
        "id": "17930",
        "name": "Urmy Akter",
        "designation": "Helper",
        "doj": "12-Apr-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 77,
        "id": "17971",
        "name": "Lamiya",
        "designation": "Helper",
        "doj": "20-Apr-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 78,
        "id": "17998",
        "name": "Molina Biswas",
        "designation": "Helper",
        "doj": "27-Apr-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 79,
        "id": "18016",
        "name": "Khadija Akter",
        "designation": "Helper",
        "doj": "30-Apr-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 80,
        "id": "18095",
        "name": "Eti Halder",
        "designation": "Helper",
        "doj": "13-May-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 81,
        "id": "18140",
        "name": "Mim Akter",
        "designation": "Helper",
        "doj": "7-Jun-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 82,
        "id": "18170",
        "name": "Md. Zihad Gazi",
        "designation": "Helper",
        "doj": "9-Jun-26",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 83,
        "id": "18180",
        "name": "Mim Akter",
        "designation": "Helper",
        "doj": "10-Jun-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 84,
        "id": "18203",
        "name": "Daliya Akter",
        "designation": "Helper",
        "doj": "13-Jun-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 85,
        "id": "18212",
        "name": "Fatema Akter Mita",
        "designation": "Helper",
        "doj": "13-Jun-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 86,
        "id": "18213",
        "name": "Fatema",
        "designation": "Helper",
        "doj": "13-Jun-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 87,
        "id": "18228",
        "name": "Suparna Roy",
        "designation": "Helper",
        "doj": "14-Jun-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 88,
        "id": "18291",
        "name": "Nur e Jannat",
        "designation": "Helper",
        "doj": "21-Jun-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 89,
        "id": "18311",
        "name": "Parveen Akter",
        "designation": "Helper",
        "doj": "27-Jun-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 90,
        "id": "18312",
        "name": "Hafsa Akter",
        "designation": "Helper",
        "doj": "27-Jun-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 91,
        "id": "18313",
        "name": "Mst. Shathi Akter",
        "designation": "Helper",
        "doj": "27-Jun-96",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 92,
        "id": "18330",
        "name": "Mst. Sharmin Akter",
        "designation": "Helper",
        "doj": "26-Jun-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 93,
        "id": "18331",
        "name": "Ali Hasan",
        "designation": "Helper",
        "doj": "26-Jun-26",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 94,
        "id": "18494",
        "name": "Tanju Begum",
        "designation": "Helper",
        "doj": "12-Jul-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 95,
        "id": "18494",
        "name": "Tanju Begum",
        "designation": "Helper",
        "doj": "12-Jul-26",
        "section": "Armature Winding",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 96,
        "id": "18548",
        "name": "Beilkis Begum",
        "designation": "Helper",
        "doj": "19-Jul-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 97,
        "id": "18562",
        "name": "Rupali Akter",
        "designation": "Helper",
        "doj": "20-Jul-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 98,
        "id": "18574",
        "name": "Sathi Rani Sikder",
        "designation": "Helper",
        "doj": "21-Jul-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 99,
        "id": "18577",
        "name": "Mst. Raihana Ritu",
        "designation": "Helper",
        "doj": "26-Jul-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 100,
        "id": "18595",
        "name": "Tisa Akter",
        "designation": "Helper",
        "doj": "26-Jul-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 101,
        "id": "18608",
        "name": "Robiul Hasan Mia",
        "designation": "Delivery Assistant",
        "doj": "1-Aug-26",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 102,
        "id": "18658",
        "name": "Rupa Akter",
        "designation": "Helper",
        "doj": "1-Aug-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 103,
        "id": "18674",
        "name": "Mst. Halima Begum",
        "designation": "Helper",
        "doj": "1-Aug-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 104,
        "id": "18675",
        "name": "Md. Tahmid",
        "designation": "Helper",
        "doj": "1-Aug-26",
        "section": "Replacement",
        "gender": "Male",
        "status": "Active"
    },
    {
        "sl": 105,
        "id": "18694",
        "name": "Baishakhi Halder",
        "designation": "Helper",
        "doj": "2-Aug-26",
        "section": "Dimmar & Blade",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 106,
        "id": "18816",
        "name": "Sabina Akter",
        "designation": "Helper",
        "doj": "18-Aug-26",
        "section": "Assemble Line",
        "gender": "Female",
        "status": "Active"
    },
    {
        "sl": 107,
        "id": "18837",
        "name": "Al-Amin",
        "designation": "Helper",
        "doj": "19-Aug-26",
        "section": "Assemble Line",
        "gender": "Male",
        "status": "Active"
    }
];

    const HRM_DATA_VERSION_KEY = 'mep_hrm_data_version_tag';
    const HRM_CURRENT_VERSION = 'v2_gender_sync';

    /**
     * Get list of employees from localStorage or defaults
     */
    function getStoredEmployees() {
        try {
            const version = localStorage.getItem(HRM_DATA_VERSION_KEY);
            if (version !== HRM_CURRENT_VERSION) {
                const raw = localStorage.getItem(HRM_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const defaultMap = new Map();
                        DEFAULT_HRM_EMPLOYEES.forEach(emp => defaultMap.set(String(emp.id).trim(), emp.gender));
                        parsed.forEach(emp => {
                            if (defaultMap.has(String(emp.id).trim())) {
                                emp.gender = defaultMap.get(String(emp.id).trim());
                            }
                        });
                        saveStoredEmployees(parsed);
                        localStorage.setItem(HRM_DATA_VERSION_KEY, HRM_CURRENT_VERSION);
                        return parsed;
                    }
                }
                saveStoredEmployees(DEFAULT_HRM_EMPLOYEES);
                localStorage.setItem(HRM_DATA_VERSION_KEY, HRM_CURRENT_VERSION);
                return [...DEFAULT_HRM_EMPLOYEES];
            }

            const raw = localStorage.getItem(HRM_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch(e) {
            console.error('Error reading HRM stored employees:', e);
        }
        return [...DEFAULT_HRM_EMPLOYEES];
    }

    /**
     * Save employees to localStorage
     */
    function saveStoredEmployees(data) {
        try {
            localStorage.setItem(HRM_STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch(e) {
            console.error('Error saving HRM stored employees:', e);
            return false;
        }
    }

    /**
     * Reset to default 107 records
     */
    function resetToDefaultEmployees() {
        saveStoredEmployees(DEFAULT_HRM_EMPLOYEES);
        return [...DEFAULT_HRM_EMPLOYEES];
    }

    /**
     * Add a new employee
     */
    function addEmployee(employee) {
        const list = getStoredEmployees();
        const maxSl = list.reduce((max, it) => Math.max(max, Number(it.sl) || 0), 0);
        const newRecord = {
            sl: maxSl + 1,
            id: String(employee.id || '').trim(),
            name: String(employee.name || '').trim(),
            designation: String(employee.designation || '').trim(),
            doj: String(employee.doj || '').trim(),
            section: String(employee.section || '').trim(),
            gender: String(employee.gender || 'Male').trim(),
            status: String(employee.status || 'Active').trim(),
            created_at: new Date().toISOString()
        };
        list.push(newRecord);
        saveStoredEmployees(list);
        logHrmAction('ADD', 'Added employee ' + newRecord.name + ' (ID: ' + newRecord.id + ')');
        return newRecord;
    }

    /**
     * Update an existing employee by internal index / SL / ID
     */
    function updateEmployee(sl, updatedFields) {
        const list = getStoredEmployees();
        const idx = list.findIndex(it => Number(it.sl) === Number(sl));
        if (idx === -1) return null;

        const oldRecord = list[idx];
        const updatedRecord = {
            ...oldRecord,
            id: updatedFields.id !== undefined ? String(updatedFields.id).trim() : oldRecord.id,
            name: updatedFields.name !== undefined ? String(updatedFields.name).trim() : oldRecord.name,
            designation: updatedFields.designation !== undefined ? String(updatedFields.designation).trim() : oldRecord.designation,
            doj: updatedFields.doj !== undefined ? String(updatedFields.doj).trim() : oldRecord.doj,
            section: updatedFields.section !== undefined ? String(updatedFields.section).trim() : oldRecord.section,
            gender: updatedFields.gender !== undefined ? String(updatedFields.gender).trim() : oldRecord.gender,
            status: updatedFields.status !== undefined ? String(updatedFields.status).trim() : oldRecord.status,
            updated_at: new Date().toISOString()
        };

        list[idx] = updatedRecord;
        saveStoredEmployees(list);
        logHrmAction('EDIT', 'Updated employee ' + updatedRecord.name + ' (SL: ' + sl + ', ID: ' + updatedRecord.id + ')');
        return updatedRecord;
    }

    /**
     * Replace an existing employee
     * When an employee is replaced:
     * - old employee is marked as 'Replaced' (or replaced with new person)
     * - new employee takes over position with new ID, Name, and DOJ
     */
    function replaceEmployee(sl, newPersonData, reason) {
        const list = getStoredEmployees();
        const idx = list.findIndex(it => Number(it.sl) === Number(sl));
        if (idx === -1) return null;

        const outgoing = { ...list[idx] };
        const incoming = {
            ...outgoing,
            id: String(newPersonData.id || outgoing.id).trim(),
            name: String(newPersonData.name || '').trim(),
            designation: String(newPersonData.designation || outgoing.designation).trim(),
            doj: String(newPersonData.doj || '').trim(),
            section: String(newPersonData.section || outgoing.section).trim(),
            gender: String(newPersonData.gender || outgoing.gender).trim(),
            status: 'Active',
            replaced_from: {
                id: outgoing.id,
                name: outgoing.name,
                date: new Date().toLocaleDateString('en-GB'),
                reason: reason || 'Position Replacement'
            },
            updated_at: new Date().toISOString()
        };

        list[idx] = incoming;
        saveStoredEmployees(list);
        logHrmAction('REPLACE', 'Replaced ' + outgoing.name + ' (ID: ' + outgoing.id + ') with ' + incoming.name + ' (ID: ' + incoming.id + ') in ' + incoming.section);
        return incoming;
    }

    /**
     * Delete an employee by SL
     */
    function deleteEmployee(sl) {
        const list = getStoredEmployees();
        const idx = list.findIndex(it => Number(it.sl) === Number(sl));
        if (idx === -1) return false;

        const deleted = list.splice(idx, 1)[0];
        // Re-index SL sequentially
        list.forEach((item, index) => {
            item.sl = index + 1;
        });
        saveStoredEmployees(list);
        logHrmAction('DELETE', 'Deleted employee ' + deleted.name + ' (ID: ' + deleted.id + ')');
        return true;
    }

    /**
     * Compute real-time dashboard KPI metrics from current employee database
     */
    function computeHrmStats() {
        const list = getStoredEmployees();
        const active = list.filter(it => it.status !== 'Inactive');
        const inactive = list.filter(it => it.status === 'Inactive');
        const male = active.filter(it => it.gender === 'Male');
        const female = active.filter(it => it.gender === 'Female');

        // Section counts
        const sections = {};
        active.forEach(it => {
            const sec = it.section || 'General';
            sections[sec] = (sections[sec] || 0) + 1;
        });

        // Designation counts
        const designations = {};
        active.forEach(it => {
            const des = it.designation || 'General';
            designations[des] = (designations[des] || 0) + 1;
        });

        return {
            total: list.length,
            activeCount: active.length,
            inactiveCount: inactive.length,
            maleCount: male.length,
            femaleCount: female.length,
            presentToday: active.length, // default 100% present in office unless marked absent
            absentToday: 0,
            leaveRequestsLast30: 0,
            leaveApproved7Days: 0,
            leavePending7Days: 0,
            nextHoliday: 'Friday',
            sections: sections,
            designations: designations
        };
    }

    /**
     * Audit log recorder
     */
    function logHrmAction(action, details) {
        try {
            const logs = JSON.parse(localStorage.getItem(HRM_LOGS_KEY) || '[]');
            logs.unshift({
                timestamp: new Date().toISOString(),
                user: 'Sayful Islam',
                action: action,
                details: details
            });
            if (logs.length > 200) logs.pop();
            localStorage.setItem(HRM_LOGS_KEY, JSON.stringify(logs));
        } catch(e) {}
    }

    // Export module
    window.HRM_DATABASE = {
        DEFAULT_EMPLOYEES: DEFAULT_HRM_EMPLOYEES,
        getStoredEmployees: getStoredEmployees,
        saveStoredEmployees: saveStoredEmployees,
        resetToDefaultEmployees: resetToDefaultEmployees,
        addEmployee: addEmployee,
        updateEmployee: updateEmployee,
        replaceEmployee: replaceEmployee,
        deleteEmployee: deleteEmployee,
        computeHrmStats: computeHrmStats,
        logHrmAction: logHrmAction
    };

})(window);
