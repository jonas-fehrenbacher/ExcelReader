namespace app.userlist
{
    export class TableDragBar
    {
        #htmlElement: HTMLElement;
        #isDragging:  boolean;
        #height:      number;

        constructor()
        {
            this.#htmlElement = <HTMLElement>document.getElementById("tableBox-dragbar");
            this.#isDragging  = false;
            this.#height = 50; // must be same value as in CSS

            // Listen to events:
            document.addEventListener('mousemove', this.#onMouseMoveEvent.bind(this)); // Important: You have to make mousemove event from 'document'. On 'htmlElement' its rarely called.
            this.#htmlElement.addEventListener('mousedown', this.#onMouseDownEvent.bind(this)); // only triggered if mouse is clicked on this element (no need to check 'event.target').
            document.addEventListener('mouseup', this.#onMouseUpEvent.bind(this)); // Stop event always when mouse is released. Sometimes this does not trigger, when cursor has stop sign..

            // Hide drag bar:
            this.#htmlElement.style.display = "none";
        }

        reset(): void
        {
            this.#htmlElement.style.display = "none";
        }

        display(): void
        {
            this.#htmlElement.style.display = "block";
        }

        #onMouseMoveEvent(event: MouseEvent): void
        {
            event.preventDefault(); // prevent default event - what would normally happen.

            // Check if element is dragged.
            if (!this.#isDragging) {
                return;
            }

            // Note: The client area is the current window.
            // event.clientY: returns the vertical client coordinate of the mouse pointer when a mouse event occurs.
            // y axis top is 0.
            let tableBox: HTMLElement = <HTMLElement>document.getElementById("tableBox");
            let boundingBox: DOMRect  = this.#htmlElement.getBoundingClientRect(); // position of all sides
            let height: number        = boundingBox.bottom - boundingBox.top;
            let positionY: number     = boundingBox.bottom - height / 2; // position with origin center
            let distance: number      = event.clientY - positionY; // vector between mouse and drag bar; distance < 0 is top

            if (event.clientY < positionY)
            {
                // ..dragged to the top
                this.#height -= 1;
            }
            else
            {
                // ..dragged to the bottom
                this.#height += 1;
            }

            tableBox.style.height = this.#height + "vh";
        }

        #onMouseDownEvent(event: MouseEvent): void
        {
            this.#isDragging = true;
        }

        #onMouseUpEvent(event: MouseEvent): void
        {
            this.#isDragging = false;
        }
    }
}