namespace app.userlist
{
    export class DateUserCountChart
    {
        #userlistStorageRef: Storage;
        #chart:              Chart;
        #chartInfo:          Chart.Info;

        constructor(htmlChartBox: HTMLElement, userlistStorage: Storage, chartInfo: Chart.Info)
        {
            this.#userlistStorageRef = userlistStorage;
            this.#chartInfo          = chartInfo;
            this.#chart              = new Chart([], this.#changeData.bind(this), htmlChartBox, true);
        }

        #changeData(chart: Chart)
        {
            // [1] Set x-axis
            // For the time series plot the data needs to be in reverse order, so that it is displayed from left to right.
            let x: string[] = []; // Note: Website loads endlessly if I use 'Date[]'.
            for (let i = this.#userlistStorageRef.data().length-1; i >= 0; --i) {
                x.push(this.#userlistStorageRef.data()[i].getDate().toDateString());
            }

            // [2] Set chart data
            // For the time series plot the data needs to be in reverse order, so that it is displayed from left to right.
            let y: number[] = [];
            for (let i = this.#userlistStorageRef.data().length-1; i >= 0; --i) {
                y.push(this.#userlistStorageRef.data()[i].getSumRow()[jsonFormats[0].pcField]);
            }

            // [3] Set data
            let data: Plotly.Data  = {
                type: 'scatter',
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
                title: "PC Benutzer Anzahl im Laufe der Zeit.",
                xaxis: {
                    //tickmode: "linear",
                    dtick: 1,
                    title: '' // Datum
                },
                yaxis: {
                    title: "Kundenanzahl"
                },
                paper_bgcolor: this.#chartInfo.bgcolor,
                margin: {
                    b: 120 // bottom margin, default 80
                  }
            }

            // [5] Update chart data
            chart.setData(data, layout, {responsive: true/*, scrollZoom: true*/});
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