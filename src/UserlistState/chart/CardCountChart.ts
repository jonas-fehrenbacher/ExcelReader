namespace app.userlist
{
    export class CardCountChart
    {
        #userlistStorageRef: Storage;
        #chart:              Chart;
        #chartInfo:          Chart.Info;

        constructor(htmlChartBox: HTMLElement, userlistStorage: Storage, chartInfo: Chart.Info)
        {
            this.#userlistStorageRef = userlistStorage;
            this.#chartInfo           = chartInfo;
            this.#chart      = new Chart([ 
                [
                    { label: "Ø Tag", id: Chart.Data.AvgDay }, 
                    { label: "Ø Kunde", id: Chart.Data.AvgCustomer },
                    { label: "Summe", id: Chart.Data.Sum },
                ]
                // add pie, bar chart
            ], this.#changeData.bind(this), htmlChartBox);
        }

        reset(): void
        {
            this.#chart.reset();
        }

        #changeData(chart: Chart)
        {
            // [1] Select right data
            let datatype: Chart.Data = this.#chart.getDropdownMenus()[0].getSelectedItemID();
            let title: string        = "";
            let y: number[]      = [];
            switch (datatype)
            {
                case Chart.Data.Sum: 
                    title = "Wie viele Kunden eine Bibliothekskarte haben."; 
                    y = [ this.#userlistStorageRef.getCustomerWithoutCardCount(), this.#userlistStorageRef.getCustomerWithCardCount() ];
                    break;
                case Chart.Data.AvgDay: 
                    title = "Wie viele Kunden durchschnittlich eine <br>Bibliothekskarte haben (pro Tag)."; 
                    y = [ this.#userlistStorageRef.getCustomerWithoutCardCount() / this.#userlistStorageRef.getCount().day, this.#userlistStorageRef.getCustomerWithCardCount() / this.#userlistStorageRef.getCount().day ];
                    break;
                case Chart.Data.AvgWeek: break;
                case Chart.Data.AvgMonth: break;
                case Chart.Data.AvgCustomer:
                    title = "Wie viele Kunden durchschnittlich eine <br>Bibliothekskarte haben (pro Kunde)."; 
                    y = [ this.#userlistStorageRef.getCustomerWithoutCardCount() / this.#userlistStorageRef.getCount().customer, this.#userlistStorageRef.getCustomerWithCardCount() / this.#userlistStorageRef.getCount().customer ];
                    break;
                case Chart.Data.AvgActiveCustomer: break;
                default: assert(false); break;
            }

            // [2] Set x-axis
            let x: string[] = ["Keine Karte", "Karte"];

            // [3] Set data
            let data: Plotly.Data  = {
                type: 'bar',
                x: x,
                y: y,
                marker: {
                    //color: '#C8A2C8',
                    //line: {
                    //    width: 2.5
                    //}
                }
            };

            // [4] Set layout
            let layout: Partial<Plotly.Layout> = {
                title: title,
                xaxis: {
                    //tickmode: "linear",
                    dtick: 1,
                    title: 'Kunden'
                },
                yaxis: {
                    title: "Kartenanzahl"
                },
                paper_bgcolor: this.#chartInfo.bgcolor
            }
            if (window.innerWidth > 700) {
                layout.width  = this.#chartInfo.maxWidth;
            }

            // [5] Update chart data
            chart.setData(data, layout);
        }

        display(): void
        {
            this.#chart.display();
        }
    }
}