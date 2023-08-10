/// <reference path="../Format.json.ts" />

namespace app.userlist
{
    /** x-axis: pc number; y-axis: average time of the day */
    export class PCTimeChart
    {
        #userlistStorageRef: Storage;
        #chart:              Chart;
        #chartInfo:          Chart.Info;

        constructor(htmlChartBox: HTMLElement, userlistStorage: Storage, chartInfo: Chart.Info)
        {
            this.#userlistStorageRef = userlistStorage;
            this.#chartInfo          = chartInfo;
            this.#chart              = new Chart([ 
                [
                    { label: "Ø Tag", id: Chart.Data.AvgDay }, 
                    { label: "Ø Kunde", id: Chart.Data.AvgCustomer },
                    { label: "Ø Aktiver Kunde", id: Chart.Data.AvgActiveCustomer },
                    { label: "Summe", id: Chart.Data.Sum },
                ]
                // add pie, bar chart
            ], this.#changeData.bind(this), htmlChartBox);
        }

        #changeData(chart: Chart)
        {
            // [1] Select right data
            let datatype: Chart.Data = this.#chart.getDropdownMenus()[0].getSelectedItemID();
            let title: string        = "";
            let yInMS: number[]      = [];
            switch (datatype)
            {
                case Chart.Data.Sum: 
                    title = "Zeit der PC Nutzung in Summe."; 
                    yInMS = sumToNum(this.#userlistStorageRef.getPCDurations()); 
                    break;
                case Chart.Data.AvgDay: 
                    title = "Durchschnittliche Zeit der PC Nutzung <br>(pro Tag)."; 
                    yInMS = avgNumArr(sumToNum(this.#userlistStorageRef.getPCDurations()), this.#userlistStorageRef.getCount().day); 
                    break;
                case Chart.Data.AvgWeek: break;
                case Chart.Data.AvgMonth: break;
                case Chart.Data.AvgCustomer:
                    title = "Durchschnittliche Zeit der PC Nutzung <br>(pro Kunde)."; 
                    yInMS = avgNumArr(sumToNum(this.#userlistStorageRef.getPCDurations()), this.#userlistStorageRef.getCount().customer); 
                    break;
                case Chart.Data.AvgActiveCustomer: 
                    title = "Durchschnittliche Zeit der PC Nutzung <br>(pro activer Kunde).";
                    for (const sum of this.#userlistStorageRef.getPCDurations()) yInMS.push(avg(sum));
                    break;
                default: assert(false); break;
            }

            // [2] Set x-axis
            let x: number[] = jsonFormats[0].pcNumbers; // TODO: maybe do not use this global here...

            // [3] Set chart data
            let y: number[] = [];
            for (const duration of yInMS) {
                y.push(duration / 1000 / 60); // in minutes; Math.ceil()
            }

            // [4] Set data
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

            // [5] Set layout
            let layout: Partial<Plotly.Layout> = {
                title: title,
                xaxis: {
                    //tickmode: "linear",
                    dtick: 1,
                    title: 'PC Nummern'
                },
                yaxis: {
                    title: "Minuten"
                },
                paper_bgcolor: this.#chartInfo.bgcolor
            }
            if (window.innerWidth > 700) {
                layout.width  = this.#chartInfo.maxWidth;
            }

            // [6] Update chart data
            chart.setData(data, layout);
        }

        reset(): void
        {
            this.#chart.reset();
        }

        display(): void
        {
            this.#chart.display();
        }
    }
}