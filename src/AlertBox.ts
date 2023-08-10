namespace app
{
    export class AlertBox
    {
        #htmlElement:       HTMLDivElement;
        #htmlAlertBoxesRef: HTMLDivElement;
        #isDisplayed:       boolean;

        constructor(type: AlertBox.Type, message: string, htmlAlertBoxesRef: HTMLDivElement)
        {
            this.#htmlAlertBoxesRef = htmlAlertBoxesRef;
            this.#isDisplayed = false;

            // [1] Create text node
            // [1.1] Label
            let labelNode: HTMLSpanElement = document.createElement("span"); // 'Text' has no css style, so I use 'span'.
            labelNode.classList.add("alertBox-label");
            labelNode.textContent = this.getLabel(type) + ": ";
            // [1.2] Text
            let textNode: Text = document.createTextNode(message);
            // [1.3] Text box
            let textBox: HTMLDivElement = <HTMLDivElement>document.createElement("div");
            textBox.appendChild(labelNode);
            textBox.appendChild(textNode);

            // [2] Create Close btn
            //let closeBtn: HTMLImageElement = document.createElement("img");
            //closeBtn.classList.add("closeBtn");
            //closeBtn.src = "assets/close3.svg";
            //closeBtn.alt = "Close";
            let closeBtnUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            closeBtnUse.setAttribute('href', "#close"); // closeBtnUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#close");
            let closeBtn: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            closeBtn.classList.add("closeBtn");
            closeBtn.style.width = "40"; // it is required to set width and height otherwise 'svg' is large and 'use' is small.
            closeBtn.style.height = "40";
            closeBtn.appendChild(closeBtnUse);

            // [4] Listen to events
            closeBtn.addEventListener("click", this.#onClickEvent.bind(this), false);

            // [3] Create alert box
            this.#htmlElement = document.createElement("div");
            this.#htmlElement.classList.add("alertBox", type);
            this.#htmlElement.appendChild(textBox);
            this.#htmlElement.appendChild(closeBtn);
        }

        display(): void
        {
            if (!this.#isDisplayed) {
                this.#htmlAlertBoxesRef.appendChild(this.#htmlElement);
                this.#isDisplayed = true;
            }
        }

        #onClickEvent(ev: MouseEvent): void
        {
            this.#htmlElement.style.opacity = "0";
            setTimeout((function(){ 
                this.#htmlAlertBoxesRef.removeChild(this.#htmlElement);
                this.#isDisplayed = false;
                // this.#htmlElement.style.opacity = "1";
            }).bind(this), 400); /* needs to have the same time as in CSS 'transition' (0.6s => 600ms). */
        }

        close()
        {
            if (this.#isDisplayed) {
                this.#htmlAlertBoxesRef.removeChild(this.#htmlElement);
                this.#isDisplayed = false;
                // this.#htmlElement.style.opacity = "1";
            }
        }

        getLabel(type: AlertBox.Type): string
        {
            let label: string = "";
            switch(type)
            {
                case AlertBox.Type.Success: label = "Erfolg"; break;
                case AlertBox.Type.Info:    label = "Info"; break;
                case AlertBox.Type.Warning: label = "Warnung"; break;
                case AlertBox.Type.Error:   label = "Fehler"; break;
            }
            return label;
        }

        isDisplayed()
        {
            return this.#isDisplayed;
        }
    }

    export namespace AlertBox
    {
        export enum Type
        {
            Success = "success",
            Info    = "info",
            Warning = "warning",
            Error   = "error"
        }
    }
}