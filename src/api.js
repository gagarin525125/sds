/**
 * `serverUrl` contains the api location of the server. You would generally get the baseUrl from the manifest.webapp
 * as described here http://dhis2.github.io/dhis2-docs/master/en/developer/html/apps_creating_apps.html
 *
 * `basicAuth` contains the username and password to send with the request as the basic authentication token. This is only needed when you develop locally and need CORS support (https://developer.mozilla.org/en-US/docs/Web/HTTP).
 * You obviously should not do this for your production apps.
 */
//const serverUrl = 'http://localhost:8082/api/';
const serverUrl = 'https://play.dhis2.org/demo/api/';
//const serverUrl = 'https://play.dhis2.org/dev/api/';
//const serverUrl = 'https://play.dhis2.org/test/api/';
const basicAuth = `Basic ${btoa('admin:district')}`;

/* For app deployment */
/*$.getJSON( "manifest.webapp", function( json ) {
    var serverUrl = json.activities.dhis.href + "/api";
} );*/

/*fetch("index.html")
    .then(response => response.text())
    .then(s => {
        console.log("testFetch:");
        console.log(s);
    });*/

/**
 * Default options object to send along with each request
 */
const fetchOptions = {
    method: 'GET',
    headers: {
        Authorization: basicAuth,
        'Content-Type': 'application/json',
    },
};

/**
 * `fetch` will not reject the promise on the a http request that is not 2xx, as those requests could also return valid responses.
 * We will only treat status codes in the 200 range as successful and reject the other responses.
 */
function onlySuccessResponses(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(response);
}
export function organisationUnitLevels(){
return fetch(`${serverUrl}organisationUnitLevels`,fetchOptions)
        .then(onlySuccessResponses)
        // Parse the json responsee
        .then(response => response.json())
        // Log any errors to the console. (Should probably do some better error handling);
        .catch((error) => alert(`organisationUnitLevels api ${error.toString()}`));

}
export function saveOrganisationUnit(organisationUnit, parentOf, levels) {
    //-----------------------------------------------------------
    alert(`levels : ${levels}`);
    // POST the payload to the server to save the organisationUnit
    console.log("levels  " + levels);
    let toSend = {
        parent: {
            id: parentOf.id
        },
        name: organisationUnit.name,
        shortName: organisationUnit.shortName,
        openingDate: organisationUnit.openingDate,
        featureType: "POINT",
        coordinates: organisationUnit.coordinates,
        level: levels,
    };
    console.log("tosend  api ");
    console.log(JSON.stringify(toSend));
    let options = Object.assign({}, fetchOptions, {
        method: 'POST',
        body: JSON.stringify(toSend)
    });


    return fetch(`${serverUrl}/organisationUnits/`, options)
        .then(onlySuccessResponses)
        // Parse the json responsee
        .then(response => response.json())
        // Log any errors to the console. (Should probably do some better error handling);
        .catch((error) => alert(`saveOrganisationUnit api ${error}`));
}
//------------------------------------------------------------------------------------------------------

export function updateOrganisationUnit(formData,itemTo){
    console.log("update api");
    if(!itemTo.id)
        alert("something wrong with  Id ,updateOrgUnit   api  ");
      else if(!itemTo.parent)
          alert("something wrong with  Parent , updateOrgUnit   api");
    let toSend = {
        parent: {
            id: itemTo.parent.id
        },
        name: formData.name,
        shortName: formData.shortName,
        openingDate: formData.openingDate,
        coordinates: formData.coordinates,
        featureType: "POINT",
      //  featureType: itemTo.featureType,
        level: itemTo.level,
    };
    console.log("update org un api to send");
    console.log(JSON.stringify(toSend));
    let options = Object.assign({}, fetchOptions, {
        method: 'PUT',
        body: JSON.stringify(toSend)
          });
        return fetch(`${serverUrl}organisationUnits/${itemTo.id}?mergeMode=REPLACE`, options)
        .then(onlySuccessResponses)
        // Parse the json responsee
        .then(response => response.json())
        .catch((error) => alert(`updateOrganisationUnit api ${error}`));

}


export function deleteOrganisationUnit(organisationUnit) {
    // Send DELETE request to the server to delete the organisation unit
    return fetch(
        `${serverUrl}/organisationUnits/${organisationUnit.id}`,
        {
            headers: fetchOptions.headers,
            method: 'DELETE',
        }
    )
    .then(onlySuccessResponses)
    .catch((error) => alert(`error delete org.unit api ${error}`));
}

export function findChildren(organisationUnit) {
    console.log("findChildren  api");

    console.log(organisationUnit);

    let a = fetch(`${serverUrl}/organisationUnits/${organisationUnit.id}
    ?paging=false&level=1&fields= 
    id,displayName,featureType,coordinates,level,
    openingDate,ancestors[id,displayName],shortName,parent[id,displayName,level,ancestors,coordinates],
    organisationUnitGroups[id,name]`, fetchOptions)

    .then(onlySuccessResponses)
        .then(response => {
            if (response.status === 404) {
                alert(`Something wrong , children query`);
             //   console.error("error");

            }
            console.log("findchildren api response");
          //  console.log(response);
            let a = response.json();
          //  console.log(a);
            return a;
        })
        .then(({ organisationUnits }) => {
         //   console.log("children");
        //    console.log(organisationUnits);
            return organisationUnits;
        })
        .catch((error) => alert(`findChildren api ${error}`));

    return a;
}

export function loadOrganisationUnits() {
    // Load the organisation units but only the first level and the do not use paging
    // return fetch(`${serverUrl}/organisationUnits?paging=false&level=1`, fetchOptions)
    return fetch(`${serverUrl}/organisationUnits?paging=false&level=2&fields=
    id,displayName,featureType,coordinates,level,
    openingDate,ancestors[id,displayName],shortName,parent[id,displayName,level,ancestors,coordinates],
    organisationUnitGroups[id,name]`, fetchOptions)
        .then(onlySuccessResponses)
        .then(response => response.json())
        // pick the organisationUnits property from the payload
        .then(({organisationUnits}) => {
           // console.log("organisationUnits children   api");
          //  console.log(organisationUnits);
            return organisationUnits;
        })
        .catch((error) => alert(`loadOrganisationUnits api ${error}`));
}

export function liveSearch(searchString) {
    console.log("searchString api");
    console.log(searchString);
     if (searchString === '') return null;

    // paging=false
    return fetch(`${serverUrl}/organisationUnits?paging=true&fields=
    id,displayName,featureType,coordinates,level,
    openingDate,ancestors[id,displayName],shortName,parent[id,displayName,level,ancestors,coordinates],
    organisationUnitGroups[id,name]
    &filter=name:ilike:${searchString}`, fetchOptions)
        .then(onlySuccessResponses)
        .then(response => response.json())
        .catch((error) => alert(`liveSearch api ${error}`));

}

export function  findOrganisationUnitGroups(groupId) {

    return fetch(`${serverUrl}/organisationUnitGroups/${groupId}`, fetchOptions)
        .then(onlySuccessResponses)
        .then(response => response.json())
        .catch((error) => alert(`findOrgUnitGroups api ${error}`));

}

/*
export function itemFeatures(item){

     return fetch(`${serverUrl}organisationUnits/${item.id}`, fetchOptions)
        .then(onlySuccessResponses)
        .then(response => response.json())
        .catch((error) => alert(`itemFeatures api ${error}`))
    }

*/



 /*level=1&*/

/*
 let check = fetch(`${serverUrl}/organisationUnits/${organisationUnit.id}`,fetchOptions)
 .then(response => {
 if (response.status === 200) {
 alert(`this unit exists,want to replace ?`);
 }
 let a = response.json();
 return a;
 })
 .catch((error) => alert(`saveOrgUnits check api ${error}`));
 */
//-----------------------------------------------------------