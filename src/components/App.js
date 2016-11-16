import React, {Component} from 'react';
import Search from 'react-search';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren, levelUp, fetchParent, organisationUnitLevels, fetchItem, itemFeatures
} from '../api';
import List from './List';
import Form from './Form';
import {Router, Route, IndexRout, hashHistory, browserHistory, Link} from 'react-router';
import { mapSetItems } from '../map';
import { addCallbackToItems, arraysEqual } from '../util';


/**
 * ES2015 class component
 * https://facebook.github.io/react/docs/reusable-components.html#es6-classes-and-react.createclass
 */
export default class App extends Component {
    constructor(props, context) {
        super(props, context);

        // Set some initial state variables that are used within the component
        this.state = {
            isSaving: false,
            isLoading: true,
            items: [],
            item: {},
            itemsToShow: [],
            coordinates: [],
            levels:{},
            toScreen: [],

        };

        // Bind the functions that are passed around to the component
        this.onItemClick = this.onItemClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.filterItems = this.filterItems.bind(this);
        this.handleLevelUpClick = this.handleLevelUpClick.bind(this);
        this.findElement = this.findElement.bind(this);
        this.onAlert = this.onAlert.bind(this);
    }

    componentDidMount() {
        console.log("componentDidMount");
        console.log(this.state.item);
        this.loadOrganisationUnits();
        this.loadOrganisationUnitLevels();

    }

    componentWillUpdate(_, nextState) {
        // Keep the map in sync with the unfiltered list of org.units.
        if (!arraysEqual(nextState.items, this.state.items)) {
            mapSetItems(addCallbackToItems(nextState.items, this.onItemClick));
        }
    }
 //-------------------------------------  part of componentDidMount ---------------
    loadOrganisationUnitLevels(){

     organisationUnitLevels()
     .then((result) => {console.log("Levels");
     console.log(result);
     this.setState({
          levels: result.pager.total,
                   });

          })
     .then(() => console.log(this.state.levels))

     .catch((error) => alert("Error loadOrganisationUnitLevels  App  ${error.message}"));
    }

//----------------------------------------  part of componentDidMount   --------------
   loadOrganisationUnits() {
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.
        loadOrganisationUnits()
            .then((organisationUnits) => {
                this.setState({
                    isLoading: false,
                    items: organisationUnits,
                    itemsToShow: organisationUnits,
                    item: organisationUnits[0].parent,

                });
            })
            .then(() => {this.loadItemRoot(this.state.item)
            })
            .catch((error) => alert(`Could not find children loadOrganisationUnits  App ${error.message}`)
            )

    }
    //--------------------------------------   part of componentDidMount    -----------------
    loadItemRoot(item){
       itemFeatures(item)
              .then((result) => {
                            this.setState({item:result})
                                  })
       .then(() => {
                 console.log("Parent id from start ");
                 console.log(this.state.item);
                })
    }

    //--------------------------------------------------------------------------------------------------------
      onItemClick(item) {
            console.log("this.state.item    App");
            console.log(this.state.item);
         let filteredItem = this.state.items;
         // actually , this search is not necessary
         filteredItem = filteredItem.filter(stuka => stuka.id.toLowerCase()
                                           .search(item.id.toLowerCase()) !== -1);
         console.log(this.state.levels);
         console.log(filteredItem[0].level)
         filteredItem[0].level === this.state.levels ? alert(`LAST level - no children `) :
                                       this.loadOrganisationUnitsChildren(item)
    }

 //-----------------------------------------------------------------------------------------------------

    findFeatureType(item) {
        console.log("findfeaturetype App");
        console.log(item);

        itemFeatures(item)
            .then((result) => {
            result.level !== 1 ? this.loadOrganisationUnitsLevelUp(item) : this.loadOrganisationUnits()
    })
    .catch((error) => alert(`Could not find children findFeatureType ${error}`))

    }
    //----------------------------------------------------------------------------------------------

    loadOrganisationUnitsChildren(item) {
          // save in item to be the parent of future children
          this.setState({item: item});
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.
        findChildren(item)
            .then((organisationUnits) => {
                this.setState({
                    isLoading: false,
                    items: organisationUnits,
                    itemsToShow: organisationUnits,
                });
            })
            .then(() => {
                console.log("this.state.items  App");
                console.log(this.state.items);
            })
            .catch((error) => alert(`Error loadOrganisationUnitsChildren App${error.message}`)
            )
    }
//----------------------------------------------------------------------------------------------
    loadOrganisationUnitsLevelUp(item) {
        console.log("this.state.item level Up   App");
        console.log(this.state.item);
        fetchParent(item)
            .then((parent) => {
            levelUp(parent).then((organisationUnits) => {
            this.setState({
            isLoading: false,
            items: organisationUnits,
            itemsToShow: organisationUnits,
            item: parent,
        });
    })
    })

    .catch((error) => alert(`Level UpCould not find children loadOrganisationUntisLevelUp${error}`))

    }


//----------------------------------------------------------------------------------------------
    onSubmit(formData) {
        console.log("onSubmit this state item   App");
        console.log(this.state.item);
        console.log("onSubmit(formData) App");
        console.log(formData);
        // Set the component state to saving
        this.setState({
            isSaving: true
        });
        //------------------------------

            this.state.items[1].level === this.state.levels ?
                                            this.saveOrganisationUnit(formData,this.state.item)
                                            : this.rejectSaveOrganisationUnit(this.state.item)
        //------------------------------
            }
 //----------------------------------------------------------------------------------------------
    // item - parent to listed ogrUnits
    saveOrganisationUnit(formData,item){
        saveOrganisationUnit(formData, item,this.state.levels )
            .then(() => this.loadOrganisationUnitsChildren(item))
             .catch(error => alert(`error saveOrganisationUnit App${error}`))
               .then(() => this.setState({
                                  isSaving: false,
                     }) )
    }
//----------------------------------------------------------------------------------------------
    rejectSaveOrganisationUnit(item){
        this.onAlert();
          this.setState({
                isSaving: false
                        });
        // very dangerous call !!!
       // this.loadOrganisationUnitsChildren(item );

    }
    //----------------------------------------------------------------------------------------------
    render() {
        // If the component state is set to isLoading we hide the app and show a loading message
        if (this.state.isLoading) {
            return (
                <div> Loading data...
            </div >
        );
        }

        // Render the app which includes the list component and the form component
        // We hide the form component when we are in the saving state.
        return (
            <div className="app">
                <div className="search">
                    <li>
                    <input id="t" type="text" placeholder="Search" onChange={this.filterItems}/>
                    <input type="button" value="find" onClick={this.findElement}/>
                    <input type="button" id="levelUp" name="levelUp" value="levelUp" onClick={this.handleLevelUpClick}/>
                     </li>
                        <List items={this.state.itemsToShow} onItemClick={this.onItemClick}/>
                </div>
                <div className="second">
                    {/*<List onItemClick={this.onItemClick} items={this.state.items}/>*/}
                    {this.state.isSaving ? <div>Saving organisation unit</div> : <Form onSubmit={this.onSubmit}/>}
                   <div>
                       <h3>Here info should be listed</h3>
                       <li>{this.state.toScreen}</li>
                   </div>
                </div>
            </div>
        );
    }

//


//----------------------------------------------------------------------------------------------
    findElement() {

        console.log(" hit - find ");
        var ill = this.state.itemsToShow;
        console.log(ill);
        let info = ill[0].displayName;
        this.setState({
                       toScreen : info,
                      })

    }

//----------------------------------------------------------------------------------------------
    onAlert() {
        alert(`You cannot add org.unit here-not LAST level`);
        // dangerous call
        //  this.loadOrganisationUnits(this.state.item);
    }

//----------------------------------------------------------------------------------------------
    filterItems(event) {
        event.preventDefault();
        var updatedItems = this.state.items;
        updatedItems = updatedItems.filter(stuka =>
            stuka.displayName.toLowerCase().search(event.target.value.toLowerCase()) !== -1);

        this.setState({
            itemsToShow: updatedItems
                      });
        console.log("items filterItems");
        console.log(this.state.itemsToShow);
        console.log(this.state.items);

    }
//----------------------------------------------------------------------------------------------
    handleLevelUpClick() {
        console.log("this.state.item  handleLevelUp  App  ");
        console.log(this.state.item.level);
       itemFeatures(this.state.item)
                   .then((result) => {
                      result.level !== 1 ? this.loadOrganisationUnitsLevelUp(this.state.item) :
                                                this.loadOrganisationUnits()
            })
           .catch((error) => alert(`Error handleLevelUpClick ${error.message}`))

    }

}
//----------------------------------------------------------------------------------------------