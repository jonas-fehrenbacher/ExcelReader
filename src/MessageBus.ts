namespace app
{
    export enum Message
    {
        NavigationBarChanged,
        NoFilesSelected
    }

    export interface MessageReceiver { (message: Message): void; };

    export class MessageBus
    {
        #receivers: MessageReceiver[];

        constructor()
        {
            this.#receivers = [];
        }

        add(receiver: MessageReceiver): void
        {
            this.#receivers.push(receiver);
        }

        send(message: Message): void
        {
            for (let receiver of this.#receivers) {
                receiver(message);
            }
        }
    }
}