/// <reference path="./Storage.ts" />
/// <reference path="./chart/Table.ts" />
/// <reference path="./chart/SalesCountChart.ts" />
/// <reference path="./chart/PCTimeChart.ts" />
/// <reference path="./chart/CardCountChart.ts" />
/// <reference path="./chart/TableDragBar.ts" />
/// <reference path="./chart/WeekdayUserCountChart.ts" />
/// <reference path="./chart/DateUserCountChart.ts" />

namespace app.userlist
{
    export class State
    {
        #userlistStorage:        Storage;
        #table:                  Table;
        #tableDragBar:           TableDragBar;
        #salesCountChart:        SalesCountChart;
        #pcTimeChart:            PCTimeChart;
        #cardCountChart:         CardCountChart;
        #weekdayUserCountChart:  WeekdayUserCountChart;
        #dateUserCountChart:     DateUserCountChart
        #htmlAlertBoxesRef:      HTMLDivElement;
        #successAlertBox:        app.AlertBox;
        #messageBusRef:          MessageBus;
        #fileUploadField:        FileUploadField;

        constructor(htmlChartBox: HTMLElement, htmlAlertBoxesRef: HTMLDivElement, messageBusRef: MessageBus, plotlyChartInfo: Chart.Info)
        {
            this.#htmlAlertBoxesRef = htmlAlertBoxesRef;
            this.#messageBusRef     = messageBusRef;
            this.#userlistStorage   = new Storage(htmlAlertBoxesRef); //< can hold many 'UserData' objects.
            this.#table             = new Table();
            this.#tableDragBar      = new TableDragBar();
            this.#successAlertBox   = new app.AlertBox(app.AlertBox.Type.Success, "Die ausgewählten Userlisten wurden erfolgreich geladen.", this.#htmlAlertBoxesRef);
            this.#fileUploadField   = new FileUploadField(messageBusRef, htmlAlertBoxesRef);

            // Order here determines render order:
            this.#dateUserCountChart    = new DateUserCountChart(htmlChartBox, this.#userlistStorage, plotlyChartInfo);
            this.#salesCountChart       = new SalesCountChart(htmlChartBox, this.#userlistStorage, plotlyChartInfo);
            this.#pcTimeChart           = new PCTimeChart(htmlChartBox, this.#userlistStorage, plotlyChartInfo);
            this.#cardCountChart        = new CardCountChart(htmlChartBox, this.#userlistStorage, plotlyChartInfo);
            this.#weekdayUserCountChart = new WeekdayUserCountChart(htmlChartBox, this.#userlistStorage, plotlyChartInfo);

            this.#messageBusRef.add(this.#onMessage.bind(this));
        }

        reset(): void
        {
            this.#fileUploadField.reset();
            this.#userlistStorage.reset();
            this.#table.reset();      
            this.#tableDragBar.reset();
            this.#salesCountChart.reset();       
            this.#pcTimeChart.reset();
            this.#cardCountChart.reset();
            this.#weekdayUserCountChart.reset();
            this.#dateUserCountChart.reset();
        }

        async load(hasFileInputChanged: boolean): Promise<boolean>
        {
            // [1] Load selected files
            if (!this.#fileUploadField.load(hasFileInputChanged)) {
                return false;
            }

            // [2] Push user data from file
            if (!await this.#userlistStorage.init(this.#fileUploadField.getFiles(), this.#htmlAlertBoxesRef, hasFileInputChanged)) {
                // ..error
                this.#successAlertBox.close();
                return false;
            }
            
            // [3] Render objects
            this.#fileUploadField.display();
            this.#successAlertBox.display();
            this.#table.display(this.#userlistStorage);
            this.#tableDragBar.display();
            this.#dateUserCountChart.display();
            this.#salesCountChart.display();
            this.#pcTimeChart.display();
            this.#cardCountChart.display();
            this.#weekdayUserCountChart.display();

            return true;
        }

        #onMessage(message: Message): void
        {
            if (message == Message.NoFilesSelected)
            {
                this.#successAlertBox.close();
            }
        }
    }
}