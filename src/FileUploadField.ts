namespace app
{
    /**
     * HTML structure:
     * <div id="fileUploadBox">
     *     <p>
     *         <span id="fileUploadBox-title">Wähle Userlisten aus</span>
     *         <span id="fileUploadBox-note">(Userlisten seit dem 18.04.2023 werden unterstützt.)</span>
     *     </p>
     *     <!-- Input element to upload an excel file -->
     *     <input type="file" id="fileUpload" multiple> <!-- Note: No closing slash may be used, otherwise 'multiple' fails. -->
     *     <button onclick="app_.load()">Load</button>  
     * </div>
     */
    export class FileUploadField
    {
        #htmlElement:       HTMLDivElement;
        #htmlParentElement: HTMLDivElement;
        #htmlInputElement:  HTMLInputElement;
        #files:             FileList; //< store previous selected 'files', because user can load them and afterwards deselected all, which prevents me from recreating everything on window resize events.
        #messageBus:        MessageBus;
        #htmlAlertBoxes:    HTMLDivElement;
        #id:                number;

        constructor(messageBus: MessageBus, htmlAlertBoxes: HTMLDivElement)
        {
            this.#id                    = getUUID();
            this.#messageBus            = messageBus;
            this.#htmlAlertBoxes        = htmlAlertBoxes;
            this.#htmlParentElement     = <HTMLDivElement>document.getElementById("fileUploadBox");

            this.#htmlElement           = document.createElement("div");
            this.#htmlElement.innerHTML = `
                <p>
                    <span id="fileUploadBox-title">Wähle Userlisten aus</span>
                    <span id="fileUploadBox-note">(Userlisten seit dem 18.04.2023 werden unterstützt.)</span>
                </p>
                <input type="file" id="fileUploadField${this.#id}" multiple> <!-- Note: No closing slash may be used, otherwise 'multiple' fails. -->
                <button onclick="app_.load()">Laden</button>
            `;
            this.#htmlParentElement.appendChild(this.#htmlElement);

            this.#htmlInputElement      = <HTMLInputElement>document.getElementById("fileUploadField" + this.#id);
            this.#files                 = <FileList>this.#htmlInputElement.files;
        }

        load(hasFileInputChanged: boolean = true): boolean
        {
            // [1] Get all selected files
            let files: FileList = <FileList>this.#htmlInputElement.files;

            // [2] Check if a file was selected
            if(files.length == 0 && hasFileInputChanged) {
                let alertBox: app.AlertBox = new app.AlertBox(app.AlertBox.Type.Warning, "Es wurden keine Excel-Dateien ausgewählt!", this.#htmlAlertBoxes);
                alertBox.display();
                this.#messageBus.send(app.Message.NoFilesSelected);
                return false;
            }
            else if (files.length > 0 && hasFileInputChanged) {
                this.#files = files;
            }
            // else use the previous selected 'files'.

            if (this.#files.length == 0) {
                // ..never was anything selected (either in current or previous calls)
                // Can be entered on browser window resize and if there was never a file selected.
                return false;
            }

            return true;
        }

        display()
        {
            this.#htmlElement.style.display = "block";
        }

        reset()
        {
            this.#htmlElement.style.display = "none";
        }

        getFiles(): FileList
        {
            return this.#files;
        }
    }
}