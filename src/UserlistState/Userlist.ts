namespace app.userlist
{
    /** A userdata table represents the user data of one excel file, thus all user data from one day. */
    export class Userlist
    {
        #data:          any[][];
        #date:          Date;
        #sum:           any[];
        #jsonFormat:    JsonFormat;

        constructor()
        {
            this.#data          = []; // [row][column] (I don't use a 'User' object, because this is much more flexible, when supporting multiple excel formats)
            this.#date          = new Date();
            this.#sum           = [];
            this.#jsonFormat;
        }

        reset(): void
        {
            // Needed if user wants to upload different data.
            this.#data          = [];
            this.#date          = new Date();
            this.#sum           = [];
            this.#jsonFormat;
        }

        load(jsonData: any[], htmlAlertBoxes: HTMLDivElement, hasFileInputChanged: boolean): void
        {
            // TODO: support also older "Userlisten" excel formats and check here which version to use (see 'date')
            this.#jsonFormat = jsonFormats[0];

            // [1] Check json
            if(jsonData.length <= 0) {
                if (hasFileInputChanged) {
                    // This was already printed, because nothing changed (its a window resize or nav item change)
                    let alertBox: app.AlertBox = new app.AlertBox(app.AlertBox.Type.Warning, "Eine Excel-Datei ist leer oder ungültig!", htmlAlertBoxes);
                    alertBox.display();
                }
                return; 
            }

            // [2] Add date
            this.#date = excelDateToJSDate(jsonData[0]["Userliste"]);

            // [3] Check if json format supports this excel file
            if (this.#date < this.#jsonFormat.date) {
                if (hasFileInputChanged) {
                    // This was already printed, because nothing changed (its a window resize or nav item change)
                    let alertBox: app.AlertBox = new app.AlertBox(app.AlertBox.Type.Warning, "Eine ausgewählte Userliste ist zu alt und wird nicht unterstützt. Unterstützt werden Userlisten ab dem " + this.#jsonFormat.date.toLocaleString(), htmlAlertBoxes);
                    alertBox.display();
                }
                return;
            }

            // [4] Get valid rows
            let jsonRowIndices: number[] = [];
            for(let i: number = 2; i < jsonData.length; i++)
            {
                // jsonData[0] is the date
                // jsonData[1] are header names

                let row: any = jsonData[i];

                // [4.1] Filter out empty rows
                // Note that the "von" column after the last userlist entry has sometimes only a white space - rest is empty. If thats 
                // the case, then discard this row. Otherwise there would be a small empty table row at the end. 
                let isEmpty = true;
                for (const field of this.#jsonFormat.fields) 
                {
                    let value: any = row[field.name];
                    if (typeof value === "string") {
                        value = value.replace(/\s/g, ''); // remove all whitespaces - a value with only whitespaces is a empty value.
                    }
                    if (value !== undefined && value !== "") {
                        isEmpty = false;
                        continue;
                    }
                }
                if (isEmpty) {
                    continue;
                }

                jsonRowIndices.push(i);
            }

            // [5] Add sum:
            this.#sum = this.#createUserdata_fromJsonRow(jsonData[ <number>jsonRowIndices.at(-1) ], this.#jsonFormat); // hand last valid json row
            jsonRowIndices.pop(); // erase last json row

            // [6] Add data
            for (const i of jsonRowIndices) 
            {
                let row: any = jsonData[i];
                let newUserdata: any[] = this.#createUserdata_fromJsonRow(row, this.#jsonFormat);
                this.#data.push(newUserdata);
            }
        }

        #createUserdata_fromJsonRow(row: any, jsonFormat: JsonFormat): any[]
        {
            // [1] Get row data
            let rowData: any[] = [];
            for (const field of jsonFormat.fields) 
            {
                // [1.1] Use empty string for undefined fields
                let data: any = (row[field.name] === undefined) ? "" : row[field.name];

                // [1.2] Check if fieldname is of date type
                let isDateType: boolean = false;
                if (field.type == Fields.From || field.type == Fields.Until) {
                    isDateType = true;
                }

                // [1.2] Convert excel date to js date
                if (isNumeric(data) && isDateType) { // typeof Number(data); isNumeric(data); typeof str != "string"
                    // ..is date
                    data = excelDateToJSDate(Number(data));
                }

                // [1.3] Convert float to int
                if (isNumeric(data) && !isDateType) {
                    data = Math.floor(Number(data));
                }

                // [1.4] Push data
                rowData.push(data);
            }
            // It is necessary to cast string to int, otherwise class member will change its datatype (e.g. 'userdata.tea += 1' would be something completly different)!

            return rowData;
        }

        getRows(): any[][]
        {
            return this.#data;
        }

        getSumRow(): any[]
        {
            return this.#sum;
        }

        getDate(): Date
        {
            return this.#date;
        }

        getJsonFormat(): JsonFormat
        {
            return this.#jsonFormat;
        }
    }
}