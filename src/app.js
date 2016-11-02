import { getDataFromForm, registerSubmitHandler } from './form';
import { saveOrganisationUnit, loadOrganisationUnits, deleteOrganisationUnit } from './api';
import { populateList, registerClickHandlerForItems } from './list';

function loadOrganisationUnitsIntoList() {
    loadOrganisationUnits()
        .then(populateList)
        .catch(function (e) {
            alert(e.message);
        });
}

// Call loadOrganisationUnits once to load the initial list
// We will call this function again later to reload the list
loadOrganisationUnitsIntoList();

// Register a handler that should fire when the submit button is clicked
registerSubmitHandler(function () {
    saveOrganisationUnit(getDataFromForm())
        .then(loadOrganisationUnitsIntoList)
        .catch(() => alert('could not load list'));
});

registerClickHandlerForItems(function (element) {
    const organisationUnitId = element.dataset.id;

    // Set the element's HTML to show a temporary 'Deleting <name>'
    element.innerHTML = `Deleting ${element.innerHTML}`;

    deleteOrganisationUnit(organisationUnitId)
        .catch(() => alert('delete failed!'))
        // Reload the list
        .then(loadOrganisationUnitsIntoList);
});
