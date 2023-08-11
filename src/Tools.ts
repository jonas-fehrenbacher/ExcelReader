namespace app
{
    export function assert(condition: boolean, message?: string)
    {
        if (!condition) {
            throw new Error(message || "Assertion failed!");
        }
    }

    export function getUUID(): number
    {
        this.count = this.count || 0;
        return this.count++;
    }

    export function containsFlags(flagContainer: number[], flags: number): boolean
    {
        let foundFlags: number = 0;
        for (const flag of flagContainer)
            if ((flag & flags) == flag) {
                foundFlags |= flag;
            }
        if (foundFlags == flags) {
            return true;
        }
        return false;
    }
    
    /** Leading and trailing spaces are allowed. */
    export function isNumeric(n: any): boolean
    {
        // See: https://stackoverflow.com/a/52986361
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    export function excelDateToJSDate(excelDate: number): Date
    {
        // See: https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
        let date = new Date(Math.round((excelDate - 25569)*86400*1000));
        date.setHours(date.getHours() - 1); // probably UTC issue - do minus 1 hour
        return date;
    }

    /** @param excelSheetIndex A excel file can have multiple sheets (e.g. "Userlisten", "Konsolen"). */
    export function getJsonFromExcelFile(file: Blob, excelSheetIndex: number = 0): Promise<unknown[]>
    {
        // Note: If you return a Promise, then this function is automatically 'async' - no need for this keyword.

        return new Promise((resolve, reject) => {
            try {
                let reader: FileReader = new FileReader();
                reader.readAsBinaryString(file);
                reader.onload = function(e: ProgressEvent<FileReader>) {
                    let data: string | ArrayBuffer = <string | ArrayBuffer>e.target?.result;
                    let workbook: XLSX.WorkBook = XLSX.read(data, {
                        type : 'binary'
                    });
                    let firstSheetName: string = workbook.SheetNames[excelSheetIndex]; // a excel file can have multiple sheets (e.g. "Userlisten", "Konsolen")
                    // reading only first sheet data
                    let jsonData: unknown[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

                    // The parameter of 'resolve' is this functions return value if used like this: 'let jsonData = await getJsonFromExcelFile(files[0]);'.
                    resolve(jsonData);
                }
            }
            catch(e: any) {
                reject(e); // return 'e' on error..
            }
        });
    }

    export function getJson(file: Blob): any
    {
        // Note: If you return a Promise, then this function is automatically 'async' - no need for this keyword.

        return new Promise((resolve, reject) => {
            try {
                let reader: FileReader = new FileReader();
                reader.readAsText(file);
                reader.onload = function(e: ProgressEvent<FileReader>) {
                    let data: string = <string>e.target?.result;
                    let jsonData: any = JSON.parse(data);

                    // The parameter of 'resolve' is this functions return value if used like this: 'let jsonData = await getJsonFromExcelFile(files[0]);'.
                    resolve(jsonData);
                }
            }
            catch(e) {
                reject(e); // return 'e' on error..
            }
        });
    }

    /** @return date as string in hh:mm format. */
    export function dateToHHMMString(date: Date): string
    {
        let dateStr: string = date.toTimeString().split(' ')[0]; // Split string into an array (after every space is a new element) and take the first element (its time).
        let time: string[]  = dateStr.split(':'); // split hh:mm:ss into an array
        let timeStr: string = time[0] + ":" + time[1]; // take the first two elements (hh and mm) and create an time string.
        return timeStr;
    }

    /**
     * @note Just use sum.value / sum.count to get its average value. 
     */
    export interface Sum
    {
        value: number;
        count: number;
    }

    export function sumToNumber(sumArr: Sum[]): number[]
    {
        let values: number[] = [];
        for (let sum of sumArr) {
            values.push(sum.value);
        }
        return values;
    }

    export function avg(sum: Sum): number
    {
        return sum.count > 0 ? sum.value / sum.count : 0;
    }

    export function avgArr(sumArr: Sum[]): number[]
    {
        let avgs: number[] = [];
        for (let sum of sumArr) {
            avgs.push(avg(sum));
        }
        return avgs;
    }

    /** 
     * This ignores 'count' - only the sum is converted. 
     * @return array of sums
     */
    export function sumToNum(sumArr: Sum[])
    {
        let sums: number[] = [];
        for (let sum of sumArr) {
            sums.push(sum.value);
        }
        return sums;
    }

    export function avgNumArr(sumArr: number[], count: number): number[]
    {
        let avgs: number[] = [];
        for (let sum of sumArr) {
            avgs.push(sum / count);
        }
        return avgs;
    }
}