/**
 * CORS policy:
 * This was originally a json file, but I decided to use an javascript file. The advantage is, that I do
 * not need to use an webserver. 
 * Why does a json file require an webserver?: I need to load / fetch this file from local filepath and
 * this is impossible with javascript. Why is that? It is a big security risk, if a website would be able
 * to read all your on the C:/ drive. The code runs in the browser and it prohibits this, what can be turned
 * off, but I don't know how and it is a dangerous thing. You can install Addons which try to help, but they
 * are complicated to use. It's called CORS policy.
 * 
 * Date:
 * Note that in 'Date(year, month, day)' month is zero based (range: 0-11), so actual month is 'month - 1'.
 */

namespace app.userlist
{
    interface SalesCountChartJsonFormat
    {
        sellableItemsIndices: number[];
        colors:               string[];
    }

    export interface JsonFormat
    {
        date:            Date;
        fieldNames:      string[];
        dateFields:      number[];
        cardField:       number;
        pcField:         number;
        labels:          string[];
        pcNumbers:       number[];
        sellableItems:   number[];
        salesCountChart: SalesCountChartJsonFormat;
    }

    export const jsonFormats: JsonFormat[] = [
        {
            date: new Date(2023, 4 - 1, 18), // year, month, day; Date from when this is valid; -1 because month is zero based in javascript, see: https://stackoverflow.com/questions/1507619/javascript-date-utc-function-is-off-by-a-month

            // "'fieldNames' needs to have the same size and order as 'labels'.",
            fieldNames: [
                "Userliste", 
                "__EMPTY",   
                "__EMPTY_1", 
                "__EMPTY_2", 
                "__EMPTY_3", 
                "__EMPTY_4", 
                "__EMPTY_5", 
                "__EMPTY_6", 
                "__EMPTY_7", 
                "__EMPTY_8", 
                "__EMPTY_9", 
                "__EMPTY_10",
                "__EMPTY_11",
                "__EMPTY_12",
                "__EMPTY_13",
                "__EMPTY_14",
                "__EMPTY_15"
            ],
        
            // Index in 'fieldNames' data of type 'Date'.
            dateFields: [
                2, 3
            ],

            cardField: 0,

            pcField: 1,
        
            labels: [
                "BA\r\nNummer",
                "PC",
                "von",
                "bis",
                "Stunden",
                "Tee",
                "Wasser",
                "Kaffee",
                "Kaffee\r\nspezial/\r\nKakao",
                "Soft-\r\ndrink/\r\nSäfte",
                "Riegel\r\n1,00€",
                "Riegel\r\n1,50€",
                "Farbdruck",
                "Scan",
                "SW\r\nKopie",
                "Beratung",
                "Bemerkungen"
            ],

            pcNumbers: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
            ],

            sellableItems: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
        
            salesCountChart: {
                sellableItemsIndices: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ],
                colors: [ 
                    "#42aaf5", "#f9ffcc", "#2149fc", "#663a0a", "#b05f07", "#faf614",
                    "#f5d09d", "#665d4f", "#bf0a31", "#0abf0d", "#1f1f1f", "#c006c4"
                ]
            }
        }
    ];
}