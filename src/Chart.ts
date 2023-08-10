namespace app
{
    /** 
     * A 'Chart' displays a plotly chart with dropdown buttons bellow.
     * To your plotly chart you can add multiple dropdown buttons with which you can
     * for instance change the data which should be used and the chart type (pie, bar, ...).
     * All the user has to do is defining a 'Chart.ChangeDataFunc' function. This
     * function is called when the user selects a item of one of your dropdown buttons.
     * Within this function call 'getDropdownMenus()[<index>].getSelectedItemID()' to
     * get the item id you associated this element with (see constructor). A good idea is
     * to depend this ID to 'Chart.Data' or another enumeration to check which data should
     * be loaded. Use 'Chart::setData()' to load your data.
     * 
     * HTML structure:
     * <div class="chartBox"> (flex)
     *     ...
     *     <div class="plotlyChartWrapper">
     *         <div class="plotlyChart openBottom"></div>
     * 
     *         <div class="dropdownMenuWrapper">
     *             <div class="dropdownMenu">
     *                  <span class="dropdownMenu-title">Mein Menü</span>
     *                  <div class="dropdownMenu-content">
     *                      <div class="dropdownMenu-item">Item1</div>
     *                      <div class="dropdownMenu-item">Item2</div>
     *                      <div class="dropdownMenu-item">Item3</div>
     *                  </div>
     *              </div> 
     *         </div>
     * 
     *     </div>
     *     ...
     * </div>
     */
    export class Chart
    {
        #chartWrapper:        HTMLDivElement;
        #chart:               HTMLDivElement;
        #dropdownMenuWrapper: HTMLDivElement;
        #dropdownMenus:       DropdownMenu[];

        #changeData: Chart.ChangeDataFunc;
        #data:       Plotly.Data;
        #layout:     Partial<Plotly.Layout>
        #config:     Partial<Plotly.Config>;

        /** Expects the callbacks of all 'dropdownMenus' to be undefined. */
        constructor(buttonInfos: Chart.Item[][], changeData: Chart.ChangeDataFunc, htmlChartBox: HTMLElement, fillWidth: boolean = false)
        {
            // [1] Create dropdownMenus
            this.#dropdownMenus = [];
            for (const buttonInfo of buttonInfos) {
                let dropdownMenuItems: DropdownMenu.Item[] = [];
                for (const item of buttonInfo) {
                    dropdownMenuItems.push({ label: item.label, callback: this.#onClickEvent.bind(this), id: item.id });
                }
                this.#dropdownMenus.push(new DropdownMenu(dropdownMenuItems));
                this.#dropdownMenus.at(-1).get().classList.add("plotlyButton");
                this.#dropdownMenus.at(-1).show(false);
            }

            // [2] Create dropdown menu wrapper
            this.#dropdownMenuWrapper = document.createElement("div");
            this.#dropdownMenuWrapper.classList.add("dropdownMenuWrapper");
            this.#dropdownMenuWrapper.style.width = "0px"; /* required: Otherwise plotly will resize to the size of this button and 'width:100%' does not work. */
            for (const button of this.#dropdownMenus) {
                this.#dropdownMenuWrapper.appendChild(button.get());
            }

            // [3] Create html div element (for chart):
            this.#chart = document.createElement("div");
            this.#chart.classList.add("plotlyChart");
            if (this.#dropdownMenus.length > 0) {
                this.#chart.classList.add("openBottom"); // When 'dropdownMenuWrapper' has no children, then there is no background, so do not add this.
            }

            // [4] Create plotlyChart-wrapper
            this.#chartWrapper = document.createElement("div");
            this.#chartWrapper.classList.add("plotlyChartWrapper");
            if (fillWidth) {
                this.#chartWrapper.style.flexBasis = "100%"; /* IMPORTANT: Set 'flex-basis' instead of 'flex:1', because otherwise 'this.#chart.clientWidth 
                       returns a smaller size and the dropdown background would be smaller. */
            }
            this.#chartWrapper.appendChild(this.#chart);
            this.#chartWrapper.appendChild(this.#dropdownMenuWrapper);

            this.#changeData = changeData;
            //this.#changeData(this); // init data & layout
            htmlChartBox.appendChild(this.#chartWrapper);
        }

        #onClickEvent(id: number)
        {
            this.display();
        }

        reset()
        {
            this.#chart.innerHTML = "";
            for (const button of this.#dropdownMenus) {
                button.show(false);
            }
            this.#dropdownMenuWrapper.style.width = "0px";
        }

        async display(): Promise<void>
        {
            // [1] Show toggle button
            for (const button of this.#dropdownMenus) {
                button.show(true);
            }

            // [2] Set data
            this.#changeData(this);

            // [3] Create chart
            Plotly.newPlot(this.#chart, [this.#data], this.#layout, this.#config); //this.#htmlElement
            //window.addEventListener('resize', (function() { Plotly.Plots.resize(this.getHtmlElement()); }).bind(this));

            // [4] Set toggleBtnGrp wrapper size
            // It must be set after 'Plotly.newPlot', because the size of 'this.#htmlElement' is changed with it.
            // 'toggleBtnGrpWrapper' must have a width of 0px before 'Plotly.newPlot' is called, because otherwise
            // plotly will use the size of 'toggleBtnGrpWrapper' and the chart would be really small.
            // Even without chaninging teh size here the toggleBtnGrp would be still displayed, but its wrapper
            // would not be displayed (background-color, ..).
            // See: https://medium.com/nodesimplified/javascript-pass-by-value-and-pass-by-reference-in-javascript-fcf10305aa9c
            this.#dropdownMenuWrapper.style.width = this.#chart.clientWidth + "px";
        }

        /** Call this function in 'Chart::ChangeDataFunc'. */
        setData(data: Plotly.Data, layout: Partial<Plotly.Layout>, config: Partial<Plotly.Config> = {responsive: true}): void
        {
            this.#data   = data;
            this.#layout = layout;
            this.#config = config;
        }

        getChartWrapper(): HTMLDivElement
        {
            return this.#chartWrapper;
        }

        getChart(): HTMLDivElement
        {
            return this.#chart;
        }

        getDropdownMenuWrapper(): HTMLDivElement
        {
            return this.#dropdownMenuWrapper;
        }

        getDropdownMenus(): DropdownMenu[]
        {
            return this.#dropdownMenus;
        }
    }

    export namespace Chart // must be declared after the class
    {
        /**
         * User has to set 'Chart::#data' and 'Chart::#layout' via 'Chart::setData'.
         * Use 'getDropdownMenus()' and see what is selected and should be loaded.
         * 
         * @note that I can not pass 'this.#data' and 'this.#layout', because they would be passed by value,
         * so I have to either pass 'this' or the user has access to this object already (this can be achieved 
         * via binding: 'this.#changeData.bind(this)').
         */
        export interface ChangeDataFunc { (chart: Chart): void; };

        export interface Item
        {
            label: string;
            id:    number;
        }

        /** Use this in combination with 'DropdownMenu::Item::id' in 'DropdownMenu::Callback'. */
        export enum Data
        {
            /* Data type: */
            Sum,
            AvgDay,
            AvgWeek, // can only be used if the data of 7 userlists is used - same for everything else..
            AvgMonth,
            AvgYear,
            AvgCustomer, // sum / <all customers> (e.g. average of sold black-white-copies from all customers who visited.)
            AvgActiveCustomer, // sum / <all customers who consumed this item> (e.g. average of sold black-white-copies from all customers who bought a b/w copy.)
            
            /* Data representation / chart type: */
            PieChart,
            BarChart,

            Custom
        }

        export interface Info
        {
            maxWidth: number;
            bgcolor:  string;
        }
    }
}