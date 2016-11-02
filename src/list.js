export function populateList(organisationUnits) {
    const fragment = document.createDocumentFragment();

    // Loop over the organisationUnits and add them to the fragment
    organisationUnits
        .forEach(function (organisationUnit) {
            const element = document.createElement('li');

            // Save the id onto the element so we can use it later to identify which organisationUnit it belongs to
            element.dataset.id = organisationUnit.id;
            element.appendChild(document.createTextNode(organisationUnit.displayName));

            // Add child organisation units to a nested list
            if (organisationUnit.children.length > 0) {
                const childList = document.createElement('ul');
                const children = organisationUnit.children;
                for (var i = 0; i < children.length; i++) {
                    const childElement = document.createElement("li");
                    childElement.dataset.id = children[i].id;
                    childElement.appendChild(document.createTextNode(children[i].displayName));
                    childList.appendChild(childElement);
                }
                element.appendChild(childList);
            }

            return fragment.appendChild(element);
        });

    const listElement = document.querySelector('.list ul');

    // Clear out the old content
    // This makes sure we don't append to the list and end up with duplicates
    listElement.innerHTML = '';

    // Add the newly created fragement to the listElement
    listElement.appendChild(fragment);
}

/**
 * Registers a handler to be fired when one of the elements is clicked.
 * We register the eventhander on the ul of the list, so that it will work for the
 * li elements that are dynamically added later, without having to register a handler for
 * each li element separately.
 *
 * See http://stackoverflow.com/questions/4616694/what-is-event-bubbling-and-capturing for more info.
 */
export function registerClickHandlerForItems(callback) {
    document.querySelector('.list ul')
        .addEventListener('click', function (event) {
            // We only care about LI elements
            if (event.target.tagName === 'LI') {
                callback(event.target);
            }
        });
}
