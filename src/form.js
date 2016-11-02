export function getDataFromForm() {
    // Get the values from the input fields on the form
    return {
        name: document.querySelector('#name').value,
        shortName: document.querySelector('#shortName').value,
        openingDate: document.querySelector('#openingDate').value,
    }
}

export function registerSubmitHandler(callback) {
    // Attach an event handler to the element with the id `submit` and when that element is clicked
    // Prevent the default action and call the callback that was passed to this function.
    document
        .querySelector('#submit')
        .addEventListener('click', (event) => {
            // Prevent the default action from happening, which is in this case submitting the form as a form post, because of it being the single button in the form.
            // We want to prevent the default from happening because we want to use our own handler to deal with the submit.
            event.preventDefault();

            // Fire the received handler with the event object
            callback(event);
        });
}