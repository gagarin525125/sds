import React, {Component} from 'react';

import {
    saveOrganisationUnit, loadOrganisationUnits, findChildren,
    organisationUnitLevels, liveSearch, updateOrganisationUnit,
    loadOrganisationUnit
} from '../api';

import List from './List';
import Form from './Form';
import {MaxResults, Infolist} from './components';
import {mapSetItems, mapAddItems, mapSelectItem, mapSetCoordinatesCallback} from '../map';
import {addCallbackToItems, arraysEqual} from '../util';


/**
 * ES2015 class component
 * https://facebook.github.io/react/docs/reusable-components.html#es6-classes-and-react.createclass
 */
export default class App extends Component {
    constructor(props, context) {
        super(props, context);

        // Set some initial state variables that are used within the component
        this.state = {

            itemTo: {
                id: "0",
                displayName: '',
                shortName: '',
                openingDate: ``,
                coordinates: ``,
                level: '',
            },
            isLoading: true,
            isTransition: true,
            items: [],
            itemsToKeep: [],
            parentItem: {},
            maxLevels: {},
            toScreenP: [],
            toScreenG: [],
            toScreenProg: [],
            wantToChange: false,
            searchMode: false,
            pageSize: 20,
            searchParam: 1,

        };

        // Bind the functions that are passed around to the component
        this.onItemClick = this.onItemClick.bind(this);
        this.onLevelDownClick = this.onLevelDownClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.liveSearch = this.liveSearch.bind(this);
        this.handleLevelUpClick = this.handleLevelUpClick.bind(this);
        this.findElement = this.findElement.bind(this);
        this.onCoordinatesFromMap = this.onCoordinatesFromMap.bind(this);
        this.handleBackToRootClick = this.handleBackToRootClick.bind(this);
        this.resetItemToClick = this.resetItemToClick.bind(this);
        this.onSelectClick = this.onSelectClick.bind(this);
        this.convertDate = this.convertDate.bind(this);
        this.resetItemToClickForm = this.resetItemToClickForm.bind(this);
        this.resetItemToClickChoice = this.resetItemToClickChoice.bind(this);
        this.setLiveSearchValue = this.setLiveSearchValue.bind(this);

    }

    componentDidMount() {
        this.loadOrganisationUnitMaxLevels();
        this.loadOrganisationUnits();
        this.resetItemToClick();
        mapSetCoordinatesCallback(this.onCoordinatesFromMap);
    }

    componentWillUpdate(_, nextState) {
        if (!nextState.isTransition)
            this.updateMap(nextState);
    }

    /* Keep the map in sync with the unfiltered list of org.units. */
    updateMap(nextState) {
        let needToUpdate = !arraysEqual(nextState.items, this.state.items);

        if (!needToUpdate || nextState.items.length == 0)
            return;

        if (nextState.searchMode) {
            mapSetItems(addCallbackToItems(nextState.items, this.onItemClick),
                false);
        }
        else {
            let atFacilityLevel = nextState.items[0].level ==
                this.state.maxLevels;

            let callback = atFacilityLevel ? this.onItemClick :
                this.onLevelDownClick;

            mapSetItems(addCallbackToItems(nextState.items, callback));

            // When displaying facilities, draw boundaries for the parent org.unit.
            if (atFacilityLevel) {
                let parentItem = this.state.parentItem;
                let name = parentItem.displayName;
                // This prevents the center marker from being added.
                parentItem.displayName = null;
                mapAddItems([parentItem]);
                parentItem.displayName = name;
            }
        }
    }

    //-------------------------------------  part of componentDidMount ---------------
    loadOrganisationUnitMaxLevels() {

        organisationUnitLevels()
            .then((result) => {
                this.setState({
                    maxLevels: result.pager.total,
                });
            })
            .catch((error) => alert(`Error loadOrgUnMaxLevels App  ${error.stack}`))
    }

//----------------------------------------  part of componentDidMount   --------------
    loadOrganisationUnits() {
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.

        loadOrganisationUnits()
            .then((organisationUnits) => {

                this.setState({
                    isLoading: false,
                    isTransition: false,
                    items: organisationUnits,
                    itemsToKeep: organisationUnits,
                });
            })
            .catch((error) => alert(`Error loadOrgUnits  App ${error.stack}`))
    }

    //--------------------------------------------------------------------------------------------------------
    loadOrganisationUnitsChildren(item) {
        // save in item to be the parent of future children
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.
        findChildren(item)
            .then((organisationUnits) => {
                this.setState({
                    isTransition: false,
                    isLoading: false,
                    items: organisationUnits,
                });
            })
            .catch((error) => alert(`Error loadOrgUnitsChildren App  ${error.stack}`))
    }

    //------------------------------------------------------------------------------------------
    onLevelDownClick(item) {    // drill down

        if (item.level < this.state.maxLevels) {
            let temp = Object.assign({}, this.state.itemTo);
            temp.openingDate = this.convertDate(new Date());
            this.setState({
                isTransition: true,
                itemTo: temp,
                parentItem: item,
                searchMode: false,
            });
            this.resetItemToClick();
            this.loadOrganisationUnitsChildren(item);
        } else {
            alert(`Lowest Level`);
        }
    }

    onItemClick(item) {  // show info

        mapSelectItem(item.id);

        let temp = Object.assign({}, item);

        if (item.level < this.state.maxLevels) {

            temp.coordinates = "N/A";
            this.setState({
                itemTo: temp,
                wantToChange: false,
                parentItem: item.parent,
            });
            this.findElement(item);// show Parents , Groups and Programs
        } else {

            this.setState({
                itemTo: temp,
                wantToChange: true,
            });
            this.findElement(item);
        }
    }

    //----------------------------------------------------------------------------------------------
    onSubmit(formData) {

        if (this.state.wantToChange) {
            let temp = Object.assign({}, this.state.itemTo);
            if (confirm(`Click OK to save edits to ${this.state.itemTo.displayName}`)) {


                this.setState({
                    isTransition: true,

                });
                this.updateOrganisationUnit(formData, this.state.itemTo);
                this.resetItemToClick();
            } else {
                alert(`not confirmed`);
                this.setState({
                    itemTo:temp,
                })
            }
        } else {
            this.setState({
                isTransition: true,

            });
            this.resetItemToClick();
            this.saveOrganisationUnit(formData, this.state.items[0].parent);

        }
    }

    //--
    //------------------------------------------------------------------------------------------
    onSelectClick(item) {  // zoom


        let a = new CustomEvent(` `);         //  trying to pass empty string
        this.liveSearch(a);

        this.resetItemToClickChoice(item);
        let temp = Object.assign({}, this.state.itemTo);
        this.setState({
            isTransition: true,
            itemTo: temp,
            parentItem: item.parent,
            searchMode: false,
        });
        loadOrganisationUnit(item.parent.id)
            .then(ou => {
                this.setState({
                    parentItem: ou,
                });
                this.loadOrganisationUnitsChildren(item.parent)
            });
    }

    //----------------------------------------------------------------------------------------------
    updateOrganisationUnit(formData, itemTo) {
        this.setState({
            isTransition: true,
            searchMode: false,

        });
        updateOrganisationUnit(formData, itemTo)
            .then(() => this.loadOrganisationUnitsChildren(itemTo.parent))

            .then(() => {
                    let temp = Object.assign({}, this.state.itemTo);
                    this.setState({
                        isTransition: false,
                        itemTo: temp,
                    })
                }
            )
            .catch(error => alert(`Error updateOrgUnit App ${error.stack}`))
    }

    //--------------------------------------------------------------------------------------------
    // item - parent to listed ogrUnits
    saveOrganisationUnit(formData, parent) {
        saveOrganisationUnit(formData, parent, this.state.maxLevels)
            .then(() => this.loadOrganisationUnitsChildren(parent))
            .then(() => {
                    let temp = Object.assign({}, this.state.itemTo);
                    temp.level = this.state.maxLevels;
                    this.setState({
                        isTransition: false,
                        itemTo: temp,
                    })
                }
            )
            .catch(error => alert(`Error saveOrgUnit App ${error.stack}`))
    }

//---------------------------------------------------------------------------------------
    onCoordinatesFromMap(lat, lng) {

        let longitude = lng.toFixed(4);
        let latitude = lat.toFixed(4);
        let temp = Object.assign({}, this.state.itemTo);
        temp.coordinates = `[ ${longitude}, ${latitude} ]`;
        this.setState({
            itemTo: temp,
            wantedToChange: false,
        });
    }

//---------------------------------------------------------------------------------------------
    handleBackToRootClick(event) {
        event.preventDefault();
        this.setState({
            isTransition: true,
        });
        this.resetItemToClick();
        this.loadOrganisationUnits();
    }

//----------------------------------------------------------------------------------------------
    findElement(item) {
        let infoP = [];
        infoP[0] = {name: "Parents"};
        for (let i = 0; i < item.ancestors.length; i++) {
            infoP.push({
                name: item.ancestors[i].displayName
            });
        }
        //--------------------------
        let infoG = [];
        if (item.organisationUnitGroups.length !== 0) {
            let groups = item.organisationUnitGroups;
            infoG[0] = {name: "Organisation Groups"};
            for (let i = 0; i < groups.length; i++) {
                infoG.push({
                    name: groups[i].name
                });
            }
        }
        //--------------------------
        let infoProg = [];
        if (item.programs.length !== 0) {
            let groups = item.programs;
            infoProg[0] = {name: "Programs "};
            for (let i = 0; i < groups.length; i++) {
                infoProg.push({
                    name: groups[i].displayName
                });
            }
        }
        //--------------------------
        this.setState({
            toScreenP: infoP,
            toScreenG: infoG,
            toScreenProg: infoProg,
        })
    }

    //-----------------------------------------------------------------------------------------
    liveSearch(event) {
        console.log("livesearch app");
        console.log(event); // complex when hit 'x'
        if (event == null) return;

       // event.preventDefault();
        this.setState({
            isTransition: true,
            searchMode: true,
        });
        this.resetItemToClick();
        if (event.target == null || event.target.value === '' || event.target.value.length < this.state.searchParam) {

            this.setState({
                isTransition: false,
                items: this.state.itemsToKeep,
                searchMode: false,
            });
            return;
        }
        liveSearch(event.target.value.toLowerCase().trim(), this.state.pageSize)
            .then(result => {
                if (result.organisationUnits.length == 0) {
                    this.setState({
                        isTransition: true,
                    })
                } else {
                    this.setState({
                        isTransition: false,
                        items: result.organisationUnits,
                        parentItem: {},
                        searchMode: true,
                    });
                }
            })
            .catch((error) => alert(`Error liveSearch App  ${error.stack}`))
    }

//----------------------------------------------------------------------------------------------
    handleLevelUpClick() {
        this.setState({
            isTransition: true,
        });
        let ancestors = this.state.items[0].ancestors;
        let i = ancestors.length;
        if (i === 1) {
            this.setState({
                isTransition: false,
            });
            this.resetItemToClick();
        }
        else {
            this.loadOrganisationUnitsChildren(ancestors[i - 2]);
            this.resetItemToClick();
        }
    }

    //---------------------------------------------------------------------------------------
    resetItemToClickChoice(item) {
        if (!item) {
            if (this.state.items[0].level < this.state.maxLevels) {
                this.resetItemToClick();
            } else {
                this.resetItemToClickForm();
            }
        } else {
           // if (item.level < this.state.maxLevels) {
                this.resetItemToClick();
          //  } else {
         //       this.resetItemToClickForm();
          //  }
        }
    }

    //----------------------------------------------------------------------------------------
    resetItemToClick() {
        console.log("resetitemclick");
        this.setState({
            itemTo: {
                id: "0",
                displayName: '',
                shortName: '',
                openingDate: this.convertDate(new Date()),
                coordinates: ``,
                level: ``,
            },
            toScreenG: [],
            toScreenP: [],
            toScreenProg: [],
            wantToChange: false,
        })
    }

    //----------------------------------
    resetItemToClickForm() {
        let temp = Object.assign({}, this.state);
        temp.itemTo.id = `0`;
        temp.itemTo.displayName = ``;
        temp.itemTo.shortName = ``;
        temp.itemTo.openingDate = this.convertDate(new Date());
        temp.itemTo.coordinates = ``;
        temp.itemTo.level = this.state.maxLevels;
        temp.toScreenP = [];
        temp.toScreenG = [];
        temp.toScreenProg = [];
        temp.wantToChange = false;
        this.setState({
            itemTo: temp.itemTo,
            toScreenG: temp.toScreenG,
            toScreenP: temp.toScreenP,
            toScreenProg: temp.toScreenProg,
            wantToChange: temp.wantToChange,
        })
    }

    convertDate(date) {

        let d = date ? date : new Date();
        let m = d.getMonth() + 1;
        if (m < 10) m = '0' + m;
        let day = d.getDate();
        if (day < 10) day = '0' + day;
        let newD = `${d.getFullYear()}-${m}-${day}`;
        return newD.toString();
    }

    //--------------
    setLiveSearchValue(value) {
        this.setState({
            pageSize: value
        });
    }

    //----------------------------------------------------------------------------------------------
    render() {

        // If the component state is set to isLoading we hide the app and show a loading message
        if (this.state.isLoading) {
            return <div><p/>Loading data...</div>;
        }

        return (
            <div className="app">
                <div className="search">
                    <div className="search_controls">
                        <input type="button" id="backToRoot" name="backToRoot"
                               value="Top level"
                               onClick={this.handleBackToRootClick}/>
                        <input type="button" id="levelUp" name="levelUp"
                               value="One level up"
                               onClick={this.handleLevelUpClick}/>
                        <br/>
                        <input id="live" type="search" className="form-control"
                               placeholder="Type to search"
                               onChange={this.liveSearch}/>
                        <MaxResults value={this.state.pageSize}
                                    onChange={this.setLiveSearchValue}/>
                    </div>
                    {this.state.isTransition ? <div>Searching ...</div> :
                        <List items={this.state.items}
                              onItemClick={this.onItemClick}
                              onLevelDownClick={this.onLevelDownClick}
                              levels={this.state.maxLevels}
                              onSelectClick={this.onSelectClick}
                              zoomButton={this.state.searchMode}/>}
                </div>

                <div className="info">
                    {this.state.isTransition ? <div>Searching ...</div> :
                        <Form onSubmit={this.onSubmit} item={this.state.itemTo}
                              maxLevels={this.state.maxLevels}
                              resetItemToClickChoice={this.resetItemToClickChoice}
                              searchMode={this.state.searchMode}
                              items={this.state.items}
                        />}
                    <div>
                        <Infolist items={this.state.toScreenP}
                                  increasingIndent={true}/>
                        <Infolist items={this.state.toScreenG}/>
                        <Infolist items={this.state.toScreenProg}/>
                    </div>
                </div>

            </div>

        );

    }

    //----------------------- end class ---------------------------------
}
