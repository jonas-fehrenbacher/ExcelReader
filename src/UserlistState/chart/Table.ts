namespace app.userlist
{
    export class Table
    {
        #htmlData:    string;
        #htmlElement: HTMLElement;
        #labels:      string[];

        constructor()
        {
            this.#htmlData    = "";
            this.#htmlElement = <HTMLElement>document.getElementById("excelDataTable");
            this.#labels      = [];
        }

        reset(): void
        {
            this.#htmlData              = "";
            this.#htmlElement.innerHTML = "";
            this.#labels                = [];
        }

        display(userlistStorage: Storage): void
        {
            // I expect each 'UserdataTable' to have the same excel / json format.
            this.#labels = [];
            for (const field of userlistStorage.data()[0].getJsonFormat().fields) {
                this.#labels.push(getFieldLabel(field.type));
            }

            // [1] Set table caption
            this.#htmlData = "<caption>Userlisten</caption>";

            // [1] Create table header
            this.#htmlData += "<thead><tr>";
            for (const label of this.#labels) {
                this.#htmlData += ("<th>" + label + "</th>");
            }
            this.#htmlData += "</tr></thead>";

            // [2] Create table body
            for (const userlist of userlistStorage.data())
            {
                this.#htmlData += "<tbody>";

                // [2.1] Add date
                this.#htmlData += '<tr >';
                let weekday: string = userlist.getDate().toLocaleDateString("de", { weekday: 'long' });
                this.#htmlData += ('<td class="table-dateCell" colspan="' + this.#labels.length + '">' + userlist.getDate().toLocaleString() + " (" + weekday + ")</td>");
                this.#htmlData += "</tr>";

                // [2.2] Add user data
                for (const userdata of userlist.getRows())
                {
                    this.#addRow(userdata);
                }

                // [2.3] Add sum
                // Here the sum of each specific column is displayed.
                // Note that using a css class has not enough priority, thats why I'm using a id.
                this.#addRow(userlist.getSumRow(), "table-summaryRow");

                this.#htmlData += "</tbody>";
            }

            // [3] Diaplay table
            this.#htmlElement.innerHTML = this.#htmlData;

            // this.#table.rows[this.#table.rows.length - 1].id = "table-summaryRow"; // show sum in green color
        }

        #addRow(userdata: any[], className: string = ""): void
        {
            this.#htmlData += "<tr>";
            let i: number = 0;
            for (const field of userdata) {
                let data: any = field;
                if (data instanceof Date) {
                    data = dateToHHMMString(data);
                }
                let dataLabel: string = this.#labels[i]; // This is for small screens (see css).
                if (data === "" && window.innerWidth <= 1000) { // note: 'screen.width' is the screen width, but 'window.innerWidth' is the with of the browser window.
                    data = 0; // Otherwise table cell would be really small and header could not be drawn into it (with td::before).
                } 
                this.#htmlData += ('<td class="' + className + '" data-label="' + dataLabel + '">' + data + "</td>");

                ++i;
            }

            this.#htmlData += "</tr>";
        }
    }
}