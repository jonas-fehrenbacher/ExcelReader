namespace app.userlist
{
    export class WeekdayUserCountChart
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
                    { label: "Ø Aktiver Tag", id: Chart.Data.AvgDay }, 
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
            // [1] Set x-axis
            let x: string[] = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

            // [2] Select right data
            let datatype: Chart.Data = this.#chart.getDropdownMenus()[0].getSelectedItemID();
            let title: string        = "";
            let y: number[]          = new Array(x.length).fill(0);
            switch (datatype)
            {
                case Chart.Data.Sum: 
                    title = "Wie viele Kunden am PC waren."; 
                    for (const it of this.#userlistStorageRef.getWeekdayUserCount()) y[it.weekday - 1] = it.userCount; // sunday=0, ..
                    break;
                case Chart.Data.AvgDay: 
                    title = "Wie viele Kunden durchschnittlich am PC <br>waren (pro Tag)."; 
                    for (const it of this.#userlistStorageRef.getWeekdayUserCount()) y[it.weekday - 1] = it.userCount / it.dayCount; // sunday=0, ..
                    break;
                case Chart.Data.AvgWeek: break;
                case Chart.Data.AvgMonth: break;
                case Chart.Data.AvgCustomer: break;
                case Chart.Data.AvgActiveCustomer: break;
                default: assert(false); break;
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
                    title: 'Wochentag'
                },
                yaxis: {
                    title: "Kundenanzahl"
                },
                paper_bgcolor: this.#chartInfo.bgcolor
            }
            if (window.innerWidth > 700) {
                layout.width  = this.#chartInfo.maxWidth;
            }

            // [6] Update chart data
            chart.setData(data, layout);
        }

        display(): void
        {
            this.#chart.display();
        }
    }
}