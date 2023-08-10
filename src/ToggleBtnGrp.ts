namespace app
{
    export interface ToggleBtCallback { (button: HTMLButtonElement): void; };

    export class ToggleBtnGrp
    {
        #htmlElement: HTMLDivElement;

        constructor(labels: string[], callbacks: ToggleBtCallback[])
        {
            // [1] Expected parameters
            assert(labels.length > 0 && callbacks.length > 0 && labels.length == callbacks.length);

            // [2.1] Create items
            let items: HTMLButtonElement[] = [];
            for (let i = 0; i < labels.length; ++i)
            {
                items.push(document.createElement("button"));
                items.at(-1).classList.add("toggleBtnGrp-item");
                items.at(-1).innerText = labels[i];
                items.at(-1).addEventListener("click", this.#onClickEvent.bind(this, items.at(-1), callbacks[i]));
            }
            // [2.2] Make first active
            items[0].classList.add("active");

            // [3.1] Create group element
            this.#htmlElement = <HTMLDivElement>document.createElement("div");
            this.#htmlElement.classList.add("toggleBtnGrp");
            // [3.2] Append buttons
            for (const item of items) {
                this.#htmlElement.appendChild(item);
            }
        }

        #onClickEvent(button: HTMLButtonElement, callback: ToggleBtCallback)
        {
            for (const item of this.#htmlElement.getElementsByClassName("toggleBtnGrp-item"))
            {
                item.classList.remove("active");
            }
            button.classList.add("active");

            callback(button);
        }

        show(show: boolean)
        {
            this.#htmlElement.style.display = show ? "inline-flex" : "none"
        }

        get(): HTMLDivElement
        {
            return this.#htmlElement;
        }
    }
}