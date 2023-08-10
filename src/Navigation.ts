namespace app
{
    export enum NavItem
    {
        Userlists,
        InventoryList,
        TimeTracking,
        DrinkList,
        Consoles
    };

    export class Navigation
    {
        #navItems:   HTMLCollectionOf<Element>;
        #selected:   NavItem;
        #messageBus: MessageBus;

        constructor(messageBus: MessageBus)
        {
            this.#navItems   = document.getElementsByClassName("nav-item");
            this.#selected   = NavItem.Userlists;
            this.#messageBus = messageBus;

            // [1] Selected current open item
            this.#navItems[0].classList.add("nav-item-active");

            // [2] Add onClick events
            let i: number = 0; /* of type 'NavItem'. */
            for (const navItem of this.#navItems)
            {
                navItem.addEventListener('click', this.#onClickEvent.bind(this, navItem, i++), false);
            }
        }

        #onClickEvent(navItem: Element, type: NavItem): void
        {
            // [1] Remove all active items
            if (this.#navItems) {
                for (let it of this.#navItems) {
                    it.classList.remove("nav-item-active");
                }
            }

            // [2] Set selected item active
            navItem.classList.add("nav-item-active");
            this.#selected = type;

            this.#messageBus.send(Message.NavigationBarChanged);
        }

        /** @return 'NavItem' */
        getSelected(): NavItem
        {
            return this.#selected;
        }
    }
}