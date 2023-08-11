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
    /**
     * A field can contain multiple things (e.g. coffee special / cocoa), so its a flag.
     */
    export enum Fields
    {
        None           = 0,
        Card           = 1 << 0,
        PC             = 1 << 1,
        From           = 1 << 2,
        Until          = 1 << 3,
        Hours          = 1 << 4,
        Tea            = 1 << 5,
        Water          = 1 << 6,
        Coffee         = 1 << 7,
        CoffeeSpecial  = 1 << 8,
        Cocoa          = 1 << 9,
        Softdrink      = 1 << 10,
        Juices         = 1 << 11,
        Bar1           = 1 << 12,
        Bar1_50        = 1 << 13,
        ColorPrint     = 1 << 14,
        Scan           = 1 << 15,
        BWCopy         = 1 << 16,
        Advice         = 1 << 17,
        Note           = 1 << 18
    }

    export interface Field
    {
        name: string; //< json variable / field name
        type: Fields;
    }

    export interface JsonFormat
    {
        date:   Date;
        fields: Field[];
    }

    /**
     * This is to support multiple userlist formats. 
     * 
     * If you display data from multiple user lists (in table, pie, bar), then you have to decide what data
     * you want to use. For instance there were no bars, now there are and vice versa - what should be shown?
     * 
     * @param date Since when this format is valid. No older userlists may be loaded.
     * @param fields.name Names of the json variables which store user data. The names are probably always 
     * the same excpet there may be more or less fields. Either way, each userlist will have its own field names.
     * @param fields.type The type of this field. For example field '__EMPTY_11' is in one userlist "Riegel 1,50€"
     * and in another "Scan".
     */
    export const jsonFormats: JsonFormat[] = [
        {
            date: new Date(2023, 4 - 1, 18), // year, month, day; Date from when this is valid; -1 because month is zero based in javascript, see: https://stackoverflow.com/questions/1507619/javascript-date-utc-function-is-off-by-a-month

            fields: [
                { name: "Userliste", type: Fields.Card }, 
                { name: "__EMPTY", type: Fields.PC }, 
                { name: "__EMPTY_1", type: Fields.From }, 
                { name: "__EMPTY_2", type: Fields.Until }, 
                { name: "__EMPTY_3", type: Fields.Hours }, 
                { name: "__EMPTY_4", type: Fields.Tea }, 
                { name: "__EMPTY_5", type: Fields.Water }, 
                { name: "__EMPTY_6", type: Fields.Coffee }, 
                { name: "__EMPTY_7", type: Fields.CoffeeSpecial | Fields.Cocoa }, 
                { name: "__EMPTY_8", type: Fields.Softdrink | Fields.Juices }, 
                { name: "__EMPTY_9", type: Fields.Bar1 }, 
                { name: "__EMPTY_10", type: Fields.Bar1_50 }, 
                { name: "__EMPTY_11", type: Fields.ColorPrint }, 
                { name: "__EMPTY_12", type: Fields.Scan }, 
                { name: "__EMPTY_13", type: Fields.BWCopy }, 
                { name: "__EMPTY_14", type: Fields.Advice }, 
                { name: "__EMPTY_15", type: Fields.Note }
            ]
        }
    ];

    export const PCNumbers: number[] = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
    ];

    /**
     * This could be one flag, but I'm using a list because its needed in that way.
     * User can use 'containsFlags(SellableItems, types)' to check if a item is sellable.
     */
    export const SellableItems: Fields[] = [
        Fields.Hours,        
        Fields.Tea,          
        Fields.Water,        
        Fields.Coffee,       
        Fields.CoffeeSpecial | Fields.Cocoa,
        Fields.Softdrink | Fields.Juices,
        Fields.Bar1,         
        Fields.Bar1_50,      
        Fields.ColorPrint,   
        Fields.Scan,         
        Fields.BWCopy,       
        Fields.Advice
    ];

    /**
     * 'Userlist' stores its data in 'any[<row>][<column>]' and its order is identical to 'JsonFormat::fields'. By getting
     * the index of type x in 'JsonFormat::fields', you also get the index to its data in 'Userlist::getRows()'. 
     * @param fields The fields of the userlists json format.
     * @param type Of which field type you want an index.
     * @returns Index of the first occurence of the specified type is returned.
     */
    export function getFieldIndex(fields: Field[], type: Fields): number
    {
        for (let i = 0; i < fields.length; ++i) {
            let field: Field = fields[i];
            if (field.type == type) {
                return i;
            }
        }
        assert(false);
        return -1;
    }

    export function getFieldColor(type: Fields): string
    {
        let color: string = "";
        let colors: string[] = [ 
            "#42aaf5", "#f9ffcc", "#2149fc", "#663a0a", "#b05f07", "#faf614",
            "#f5d09d", "#665d4f", "#bf0a31", "#0abf0d", "#1f1f1f", "#c006c4"
        ];
        switch (type) {
            case Fields.Hours:                        color = colors[0]; break;        
            case Fields.Tea:                          color = colors[1]; break;          
            case Fields.Water:                        color = colors[2]; break;        
            case Fields.Coffee:                       color = colors[3]; break;       
            case Fields.CoffeeSpecial | Fields.Cocoa: color = colors[4]; break;
            case Fields.Softdrink | Fields.Juices:    color = colors[5]; break;
            case Fields.Bar1:                         color = colors[6]; break;         
            case Fields.Bar1_50:                      color = colors[7]; break;      
            case Fields.ColorPrint:                   color = colors[8]; break;   
            case Fields.Scan:                         color = colors[9]; break;         
            case Fields.BWCopy:                       color = colors[10]; break;       
            case Fields.Advice:                       color = colors[11]; break;      
            default: assert(false);
        }
        return color;
    }

    export function getFieldLabel(type: Fields): string
    {
        let label: string = "";
        switch (type) {
            case Fields.Card:                         label = "BA\r\nNummer"; break;           
            case Fields.PC:                           label = "PC"; break;                 
            case Fields.From:                         label = "von"; break;               
            case Fields.Until:                        label = "bis"; break;              
            case Fields.Hours:                        label = "Stunden"; break;              
            case Fields.Tea:                          label = "Tee"; break;                
            case Fields.Water:                        label = "Wasser"; break;              
            case Fields.Coffee:                       label = "Kaffee"; break;             
            case Fields.CoffeeSpecial | Fields.Cocoa: label = "Kaffee\r\nspezial/\r\nKakao"; break;
            case Fields.Softdrink | Fields.Juices:    label = "Soft-\r\ndrink/\r\nSäfte"; break;   
            case Fields.Bar1:                         label = "Riegel\r\n1,00€"; break;               
            case Fields.Bar1_50:                      label = "Riegel\r\n1,50€"; break;            
            case Fields.ColorPrint:                   label = "Farbdruck"; break;         
            case Fields.Scan:                         label = "Scan"; break;               
            case Fields.BWCopy:                       label = "SW\r\nKopie"; break;             
            case Fields.Advice:                       label = "Beratung"; break;             
            case Fields.Note:                         label = "Bemerkungen"; break;      
            default: assert(false); break;         
        }
        return label;
    }
}