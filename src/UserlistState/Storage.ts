namespace app.userlist
{
    export interface PCTime
    {
        number:   number;
        duration: number;
    }

    /** Javascript 'Date.getDay()' returns 0 for sunday etc. */
    export enum Weekday
    {
        Sunday = 0,
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday
    }

    export interface WeekdayUserCount
    {
        userCount: number;
        weekday:   Weekday;
        dayCount:  number; //< for avg
    }

    export interface TotalPCTime
    {
        min:     number;
        average: number;
        max:     number;
    }

    /** Is used to calculate average value. */
    export interface Count
    {
        customer: number;
        day:      number;
        week:     number;
        month:    number;
    }

    export interface SellCount
    {
        sum:  Sum;
        type: Fields;
    }

    /**
     * Sell count chart:
     * - Sum, Ø<time>, ØCustomer, ØActiveCustomer
     * PC time chart:
     * - Sum, Ø<time>, ØCustomer, ØActiveCustomer (e.g. how long does a customer sitting on PC 5 sit there on average?)
     * Card count chart:
     * - Sum, Ø<time>, ØCustomer (percent)
     * Weekday user count chart:
     * - Sum, ØActiveDay
     * weekday user time chart: (TODO)
     * - Sum, Ø<time>, ØCustomer
     * total pc time: (TODO)
     * - (nothing)
     * short print count chart: (TODO)
     * - Sum, Ø<time>
     * 
     * (Ø<time>: ØDay, ØWeek, ØMonth, ..)
     */
    export class Storage
    {
        #htmlAlertBoxesRef:        HTMLDivElement;
        #userlists:                Userlist[];
        #count:                    Count;

        #sellCounts:               SellCount[]; //< Must be of type 'Sum', because I need an custom average - 'Count' is not enough. Thats because I want to count how many customers sold item x.
        #pcDurations:              Sum[];
        #customerWithCardCount:    number;
        #customerWithoutCardCount: number;
        #weekdayUserCount:         WeekdayUserCount[];
        #totalPCTime:              TotalPCTime;

        constructor(htmlAlertBoxesRef: HTMLDivElement)
        {
            this.#htmlAlertBoxesRef        = htmlAlertBoxesRef;
            this.#userlists                = new Array();
            this.#sellCounts               = [];
            this.#pcDurations              = [];
            this.#customerWithCardCount    = 0;
            this.#customerWithoutCardCount = 0;
            this.#weekdayUserCount         = [];
            this.#totalPCTime              = { min: 0, average: 0, max: 0 };
            this.#count                    = { customer: 0, day: 0, week: 0, month: 0 };
        }

        reset(): void
        {
            this.#userlists                = new Array();
            this.#sellCounts               = [];
            this.#pcDurations              = [];
            this.#customerWithCardCount    = 0;
            this.#customerWithoutCardCount = 0;
            this.#weekdayUserCount         = [];
            this.#totalPCTime              = { min: 0, average: 0, max: 0 };
            this.#count                    = { customer: 0, day: 0, week: 0, month: 0 };
        }

        /** @return true on success else false. */
        async init(files: FileList, htmlAlertBoxes: HTMLDivElement, hasFileInputChanged: boolean): Promise<boolean>
        {
            // [1] Check if there are files
            if (files.length == 0) {
                return true;
            }

            // [2] Check file extention
            let success: boolean = true;
            for (const file of files) {
                let filename: string = file.name;
                let extension: string = filename.substring(filename.lastIndexOf(".")).toUpperCase();
                if (extension != '.XLS' && extension != '.XLSX') {
                    if (hasFileInputChanged) {
                        let alertBox: app.AlertBox = new app.AlertBox(app.AlertBox.Type.Error, "Ungültiges Dateiformat '" + extension + "' von '" + filename + "'! Erlaubt sind .xls und .xlsx Dateien.", htmlAlertBoxes);
                        alertBox.display();
                    }
                    success = false;
                }
            }
            if (!success) {
                return false;
            }

            // [3] Push items
            for (const file of files) {
                await this.#push(file, hasFileInputChanged);
            }

            // [4] Count customers
            for (const userlist of this.#userlists) {
                // ..next day
                this.#count.customer += userlist.getRows().length; // each row is a customer
            }
            this.#count.day   = this.#userlists.length;
            this.#count.week  = this.#userlists.length / 7;
            this.#count.month = this.#userlists.length / 30.5;

            // [5] Calculate sell count (sum & avg)
            // Is calculated from all selected days 
            // (only for sellable items specified with 'jsonFormat')
            {
                // [5.1] Init sell counts
                for (let i = 0; i < SellableItems.length; ++i) {
                    this.#sellCounts.push({ sum: {value: 0, count: 0}, type: SellableItems[i] });
                }
                //this.#sellCounts = Array(sellableItems.length).fill({ value: 0, count: 0 }); // Why does this not work with interface arrays (every item has the same value) - pointer?

                // [5.2] Set sell counts data
                for (const userlist of this.#userlists) 
                {
                    // ..new day
                    for (const customer of userlist.getRows())
                    {
                        // ..new customer
                        let sumI: number = 0;
                        for (let i = 0; i < userlist.getJsonFormat().fields.length; ++i)
                        {
                            let field: Field = userlist.getJsonFormat().fields[i];
                            if (containsFlags(SellableItems, field.type) && customer[i] !== "") { // note that 'field.type' may contain multiple types.
                                // ..this field is not undefined / empty
                                for (const sellCount of this.#sellCounts) {
                                    if (sellCount.type == field.type) {
                                        sellCount.sum.value += Number(customer[i]);
                                        ++sellCount.sum.count; // count how many customers bought this item.
                                        break;
                                    }
                                }
                            }
                            ++sumI;
                        }
                    }
                }
                console.log(this.#sellCounts);
            }            

            // [6] PC durations (sum & avg)
            {
                let pcTimeList: PCTime[]    = [];

                for (const userlist of this.#userlists) 
                {
                    // [6.1] Get format information
                    let fromFieldIndex: number  = getFieldIndex(userlist.getJsonFormat().fields, Fields.From);
                    let untilFieldIndex: number = getFieldIndex(userlist.getJsonFormat().fields, Fields.Until);
                    let pcFieldIndex: number    = getFieldIndex(userlist.getJsonFormat().fields, Fields.PC);

                    // [6.2] Store all pcs and their duration
                    for (const row of userlist.getRows())
                    {
                        let duration: number = 0; // ms
                        if (row[ fromFieldIndex ] !== "" && row[ untilFieldIndex ] !== "") {
                            // ..time field was not left empty
                            duration = Math.abs(row[ untilFieldIndex ] - row[ fromFieldIndex ]); // duration is in milliseconds; duration cannot be negativ
                        }
                        pcTimeList.push({ number: row[ pcFieldIndex ], duration: duration });
                    }
                }

                // [6.3] Calculate 'Sum'
                for (const pcNumber of PCNumbers) {
                    let sum: Sum = { value: 0, count: 0 };
                    for (const pcTime of pcTimeList)
                    {
                        if (pcTime.number == pcNumber) {
                            ++sum.count;
                            sum.value += pcTime.duration;
                        }
                    }
                    this.#pcDurations.push(sum); // in ms; Maybe use 'Math.ceil(sum)'
                }
            }

            // [7] Calculate card count
            {
                for (const userlist of this.#userlists)
                {
                    let cardField: number = getFieldIndex(userlist.getJsonFormat().fields, Fields.Card);

                    for (const row of userlist.getRows()) {
                        if (row[cardField] === "") {
                            ++this.#customerWithoutCardCount;
                        }
                        else {
                            ++this.#customerWithCardCount;
                        }
                    }
                }
            }

            // [8] Calculate weekday user count
            {
                // [6.1] Default initialize
                if (this.#weekdayUserCount.length == 0) {
                    for (let weekday = Weekday.Monday; weekday <= Weekday.Saturday; ++weekday) {
                        this.#weekdayUserCount.push({ userCount: 0, weekday: weekday, dayCount: 0 });
                    }
                }

                // [8.2] Calculate count
                for (const userlist of this.#userlists)
                {
                    for (const it of this.#weekdayUserCount)
                    {
                        if (it.weekday == userlist.getDate().getDay()) {
                            it.userCount += userlist.getRows().length; // userlist.getSumRow()[jsonFormats[0].pcField];
                            ++it.dayCount;
                        }
                    }
                }
            }
            
            // TODO:
            // [9] Calculate total pc time
            {
                for (const userlist of this.#userlists)
                {
                    for (const it of this.#weekdayUserCount)
                    {
                        if (it.weekday == userlist.getDate().getDay()) {
                            
                        }
                    }
                }
            }

            return true;
        }

        async #push(file: File, hasFileInputChanged: boolean): Promise<void>
        {
            // [1] Excel to json
            let jsonData: any[] = await getJsonFromExcelFile(file);

            // [2] Json to 'UserdataTable'
            let item: Userlist = new Userlist();
            item.load(jsonData, this.#htmlAlertBoxesRef, hasFileInputChanged);

            // [3] Push
            this.#userlists.push(item);
        }

        /** 
         * Note that method overloading is not available in javascript (it causes an error).
         * @param i Specify nothing to get all elements. 
         */
        data() : Userlist[]
        {
            return this.#userlists;
        }

        /** @return sellCounts includes everything from 'userlist.SellableItems'. */
        getSellCounts(): SellCount[]
        {
            return this.#sellCounts;
        }

        /**
         * @return pcDurations Corresponds with 'userdataJsonFormats::pcNumbers'. Time is in ms. 
         */
        getPCDurations(): Sum[]
        {
            return this.#pcDurations;
        }

        getCustomerWithCardCount(): number
        {
            return this.#customerWithCardCount;
        }

        getCustomerWithoutCardCount(): number
        {
            return this.#customerWithoutCardCount;
        }
        
        getWeekdayUserCount(): WeekdayUserCount[]
        {
            return this.#weekdayUserCount;
        }

        getTotalPCTime(): TotalPCTime
        {
            return this.#totalPCTime;
        }

        getCount(): Count
        {
            return this.#count;
        }
    }
}