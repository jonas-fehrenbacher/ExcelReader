namespace app
{
    export class DropdownMenu
    {
        #htmlElement:  HTMLDivElement;
        #titleElement: HTMLSpanElement;
        #selected:     number; //< index of the selected item
        #items:        DropdownMenu.Item[];

        constructor(items: DropdownMenu.Item[], selected = 0)
        {
            /*
             * HTML structure:
             * <div class="dropdownMenu">
             *     <span class="dropdownMenu-title">Mein Menü</span>
             *     <div class="dropdownMenu-content">
             *         <div class="dropdownMenu-item">Item1</div>
             *         <div class="dropdownMenu-item">Item2</div>
             *         <div class="dropdownMenu-item">Item3</div>
             *     </div>
             * </div>
            */

            // [1] Expected parameters
            assert(selected >= 0 && selected < items.length);

            // [2] Create html:
            this.#items = items;
            this.#selected = selected;
            this.#htmlElement = document.createElement("div");
            this.#htmlElement.classList.add("dropdownMenu");
            this.#htmlElement.innerHTML = `
                <span class="dropdownMenu-title">${items[this.#selected].label}</span>
                <div class="dropdownMenu-content">
                    ${(function(): string { 
                        let html = "";
                        for (const item of items)
                            html += `<div class="dropdownMenu-item">${item.label}</div>`;
                        return html;
                    })()}
                </div>
            `;
            this.#titleElement = <HTMLSpanElement>this.#htmlElement.getElementsByClassName("dropdownMenu-title")[0];

            // [3] Listen to events:
            let htmlItems: HTMLCollectionOf<Element> = this.#htmlElement.getElementsByClassName("dropdownMenu-item");
            for (let i = 0; i < htmlItems.length; ++i) {
                htmlItems[i].addEventListener("click", this.#onClickEvent.bind(this, i)); // user should have bound 'this'.
            }

            // [4] Calculate button size
            // The button size should be as large as the largest item. Otherwise button gets smaller or bigger depending on the selected item.
            // [4.1] Get largest label length
            let maxLabelLength: number = 0;
            for (const item of items) {
                if (item.label.length > maxLabelLength) {
                    maxLabelLength = item.label.length;
                }
            }
            maxLabelLength += 4; // " ▼" + 2 chars for padding
            // [4.2] Set button size
            // '.clientWidth', '.getBoundingClientRect().width' and 'offsetWidth' returns 0
            //this.#titleElement.innerText = new Array(maxLabelLength).join("x"); // set a text with max possible length
            //this.#titleElement.innerText = this.#labels[this.#selected]; // set old text
            this.#htmlElement.style.width = (maxLabelLength * 0.65) + "rem"; // TODO: there is probably a better way of doing this.
        }

        #onClickEvent(itemIndex: number)
        {
            // [1] Set state
            // This must be set before callback is called, so I can access selected item.
            this.#selected = itemIndex;
            this.#titleElement.innerText = this.#items[itemIndex].label;

            // [2] Call callback
            if (this.#items[itemIndex].callback) {
                this.#items[itemIndex].callback(this.#items[itemIndex].id);
            }
        }

        show(show: boolean)
        {
            this.#htmlElement.style.display = show ? "inline-block" : "none"
        }

        get(): HTMLDivElement
        {
            return this.#htmlElement;
        }

        /** Is the same as the title and can be called in 'DropdownMenu.Callback' to have a ID of the currently selected item. */
        getSelectedItemID()
        {
            return this.#items[this.#selected].id;
        }
    }

    export namespace DropdownMenu
    {
        export interface Callback { (id: number): void; };

        export interface Item
        {
            label:     string;
            callback?: Callback;
            id:        number;
        }
    }
}