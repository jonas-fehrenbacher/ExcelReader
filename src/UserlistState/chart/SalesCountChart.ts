namespace app.userlist
{
    export class SalesCountChart
    {
        #userlistStorageRef: Storage;
        #chart:              Chart;
        #showLegend:         boolean;
        #chartInfo:          Chart.Info;

        constructor(htmlChartBox: HTMLElement, userlistStorage: Storage, chartInfo: Chart.Info)
        {
            this.#userlistStorageRef = userlistStorage;
            this.#showLegend         = true;
            this.#chartInfo          = chartInfo;
            this.#chart              = new Chart([ 
                [
                    { label: "Ø Tag", id: Chart.Data.AvgDay },
                    { label: "Ø Kunde", id: Chart.Data.AvgCustomer },
                    { label: "Ø Aktiver Kunde", id: Chart.Data.AvgActiveCustomer },
                    { label: "Summe", id: Chart.Data.Sum } 
                ]
                // add pie, bar chart
            ], this.#changeData.bind(this), htmlChartBox);
        }

        reset(): void
        {
            this.#chart.reset();
        }

        display(): void
        {
            this.#chart.display();
        }

        #changeData(chart: Chart): void
        {
            // See: https://plotly.com/javascript/

            if (this.#userlistStorageRef.getSellCounts().length == 0) {
                return;
            }

            // I expect every 'UserdataTable' to use the same json format.
            let sellableItems: number[] = jsonFormats[0].sellableItems;
            let colors: string[]        = jsonFormats[0].salesCountChart.colors;
            let dataIndices: number[]   = jsonFormats[0].salesCountChart.sellableItemsIndices;
            let allLabels: string[]     = jsonFormats[0].labels;

            // [1] Set labels
            let labels: string[] = [];
            for (const i of dataIndices) {
                labels.push(allLabels[ sellableItems[i] ]);
            }

            // [2] Set values
            let datatype: Chart.Data = this.#chart.getDropdownMenus()[0].getSelectedItemID();
            let title: string        = "";
            let values: number[]     = [];
            switch (datatype)
            {
                case Chart.Data.Sum: 
                    title = "Die Summe aller Verkäufe."; 
                    for (const i of dataIndices) values.push(this.#userlistStorageRef.getSellCounts()[i].value); 
                    break;
                case Chart.Data.AvgDay: 
                    title = "Durchschnittliche Anzahl der Verkäufe <br>(pro Tag)."; 
                    for (const i of dataIndices) values.push(this.#userlistStorageRef.getSellCounts()[i].value / this.#userlistStorageRef.getCount().day); 
                    break;
                case Chart.Data.AvgWeek: break;
                case Chart.Data.AvgMonth: break;
                case Chart.Data.AvgCustomer: // per sold item: avg(this.#userlistStorageRef.getSellCounts()[i]))
                    title = "Durchschnittliche Anzahl der Verkäufe <br>(pro Kunde)."; 
                    for (const i of dataIndices) values.push(this.#userlistStorageRef.getSellCounts()[i].value / this.#userlistStorageRef.getCount().customer); 
                    break;
                    case Chart.Data.AvgActiveCustomer: 
                    title = "Durchschnittliche Anzahl der Verkäufe <br>(pro activer Kunde)."; 
                    for (const i of dataIndices) values.push(avg(this.#userlistStorageRef.getSellCounts()[i])); 
                    break;
                default: assert(false); break;
            }

            // [3] Set pie chart data
            let data: Plotly.Data = {
                type: 'pie',
                values: values,
                labels: labels,
                //text: texts, // To each value, label pair can be shown a text (needs to have same size)
                textinfo: "label+percent", //label+text+value+percent
                textposition: "inside", // outside
                automargin: true,
                marker: { colors: colors },
                // title: { text: "Userliste - Daten", position: "top center", font: { size: 40 } }
            };

            // [4] Set pie chart layout
            // If 'width' and 'height' is used, then chart is not responsive!
            let layout: Partial<Plotly.Layout> = {
                title: title,
                //margin: {"t": 0, "b": 0, "l": 0, "r": 0},
                //font: {
                //    size: 20
                //},
                showlegend: this.#showLegend, // allows to disable and enable elements (click on a legend name).
                legend: {
                    //font: {
                    //    family: 'sans-serif',
                    //    size: 12,
                    //    color: '#000'
                    //}
                    //bgcolor: 'rgba(0,0,0,0.1)'
                },
                paper_bgcolor: this.#chartInfo.bgcolor
            };
            if (window.innerWidth > 700) {
                layout.width  = this.#chartInfo.maxWidth;
                layout.height = 550; // Show chart larger on desktop screens, because its otherwise to small.
            }
            
            // [5] Set config
            let modebarLegendBtn: Plotly.ModeBarButton = {
                name: 'legend toggler',
                title: "Legend",
                icon: Plotly.Icons.tooltip_basic,
                click: (function(gd: Plotly.PlotlyHTMLElement) {
                    this.#showLegend = !this.#showLegend;
                    //Plotly.update(this.#avgSumChart.getChart(), this.#avgSumChart.getData(), layout);
                    this.display();

                }).bind(this)
            }
            let config: Partial<Plotly.Config> = {
                responsive: true,
                modeBarButtonsToAdd: [ modebarLegendBtn ],
                modeBarButtonsToRemove: []
            }

            // [5] Update chart data
            chart.setData(data, layout, config);
        }
    }
}