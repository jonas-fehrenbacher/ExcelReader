/// <reference path="UserlistState/State.ts" />
/// <reference path="AlertBox.ts" />

// See: https://javacodepoint.com/display-excel-data-in-html-table-using-sheetjs-in-javascript/

/**
 * TS:
 * const: binds an objects (but object can still be modified), see: https://stackoverflow.com/a/44604534
 * readonly: object can not be modified (e.g. 'const names: readonly string[] = ["Dylan"];').
 */

/** TODO
 * - Other states:
 * Do pie chart of "Getränkeverkauf"
 * Do pie chart of "Bestandsliste"
 * Calculate time of "Zeiterfassung" for each month
 * "Userlisten" does have a "Konsolen" tab, read its data
 * - Userlist state:
 * DayUserCountChart: x-axis: 10:00 - 19:00, y-axis: user count 
 * WeekdayTimeChart: x-axis: weekday, y-axis: duration (min)
 * Balkendiagram: Niedrigste, höchste und durchschnitt wie lange die Leute da sind.
 * Wie viele Drucken kurz?
 */

class App
{
    #isPlotlyResizeEvent:  boolean;
    #messageBus:           app.MessageBus;
    #navigation:           app.Navigation;
    #userlistState:        app.userlist.State;
    #htmlChartBox:         HTMLElement;
    #htmlAlertBoxes:       HTMLDivElement;
    #plotlyChartInfo:      app.Chart.Info;

    constructor()
    {
        this.#isPlotlyResizeEvent  = false;
        this.#htmlChartBox         = <HTMLElement>document.getElementById("chartBox");
        this.#htmlAlertBoxes       = <HTMLDivElement>document.getElementById("alertBoxes");
        this.#plotlyChartInfo      = { maxWidth: 600, bgcolor: "rgb(244, 244, 244)" }; // title line character size may not be larger as 40 (then line break), otherwise title is cut on mobile devices.
        this.#messageBus           = new app.MessageBus();
        this.#navigation           = new app.Navigation(this.#messageBus);
        this.#userlistState        = new app.userlist.State(this.#htmlChartBox, this.#htmlAlertBoxes, this.#messageBus, this.#plotlyChartInfo);

        // Listen to window resize events
        // Required for desktop screens, because when window is resized larger, plotly does not adjust to that 
        // change. It response only when the screen gets smaller, so everything needs to be recreated.
        window.addEventListener('resize', (function() { this.load(false); }).bind(this));

        this.#messageBus.add(this.#onMessage.bind(this));
    }

    #reset(): void
    {
        this.#userlistState.reset();
    }

    /**
     * Load a valid excel file.
     * 
     * Window resize:
     * Call 'load()' on window resize event, so that everything is recreated when the size changes.
     * This is required, because if window size is small and made larger, then plotly does not
     * adjust to the larger size. It can only adjust if the size gets smaller.
     */
    async load(hasFileInputChanged: boolean = true): Promise<void>
    {
        // [1] Window resize event was called, so that plotly adjusts its charts - do nothing.
        if (this.#isPlotlyResizeEvent) {
            this.#isPlotlyResizeEvent = false;
            return;
        }

        // [2] reset all values:
        // Do this here - before it is checked if a file was selected, because if no file was selected and 'Load'
        // was pressed, then everything drawn before will be erased. Thats because here I reset all 'innerHTML'
        // values.
        this.#reset();

        // [3] Load selected state
        let success: boolean = false;
        switch (this.#navigation.getSelected())
        {
            case app.NavItem.Userlists: success = await this.#userlistState.load(hasFileInputChanged); break;
            case app.NavItem.InventoryList:  break;
            case app.NavItem.TimeTracking:  break;
            case app.NavItem.DrinkList:  break;
            case app.NavItem.Consoles:  break;
        }
        if (!success) {
            return;
        }

        // [4] Resize window once
        // This is needed for mobile devices, so that plotly resizes all its charts. It's everytime needed, 
        // because 'load()' creates every plotly chart new. We set 'isPlotlyResizeEvent', so that the next
        // call to 'load()' is ignored (load is called on window resize events).
        // You cannot call this only if 'hasFileInputChanged' is true, because if the navigation item
        // is changed, everything craeted anew, then this here is needed!
        this.#isPlotlyResizeEvent = true;
        window.dispatchEvent(new Event('resize'));
    }

    #onMessage(message: app.Message): void
    {
        if (message == app.Message.NavigationBarChanged)
        {
            this.#reset();
            this.load(false); // Load from the previously selected files ('this.#files').
        }
    }
}

let app_: App = new App();

