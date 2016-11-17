import React, {Component} from 'react';
import Search from 'react-search';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren,  organisationUnitLevels, itemFeatures } from '../api';
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
            itemsToShow: [],
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
        this.handleBackToRootClick = this.handleBackToRootClick.bind(this);
    }

    componentDidMount() {
         console.log("componentDisMount");
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
                                  });
            })
            .catch((error) => alert(`Could not find children loadOrganisationUnits  App ${error.message}`)
            )

    }

    //--------------------------------------------------------------------------------------------------------
      onItemClick(item) {
           let filteredItem = this.state.items;
         // actually , this search is not necessary
         filteredItem = filteredItem.filter(stuka => stuka.id.toLowerCase()
                                           .search(item.id.toLowerCase()) !== -1);
         console.log(this.state.levels);
         console.log(filteredItem[0].level)
         filteredItem[0].level === this.state.levels ? alert(`LAST level - no children `) :
                                       this.loadOrganisationUnitsChildren(item)
    }


    //----------------------------------------------------------------------------------------------

    loadOrganisationUnitsChildren(item) {
          // save in item to be the parent of future children
          console.log("XXXXXXXXXXXXXXXXXXXXX");
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
                console.log("this.state.items load org child   App");
                console.log(this.state.items);
            })
            .catch((error) => alert(`Error loadOrganisationUnitsChildren App${error.message}`)
            )
    }
//----------------------------------------------------------------------------------------------
    onSubmit(formData) {
        console.log("onSubmit this state item   App");
         console.log(this.state.items[0]);
         let parent = this.state.items[0].parent;
        // Set the component state to saving
        this.setState({
            isSaving: true
        });
        //------------------------------

            this.state.items[0].level === this.state.levels ?
                                            this.saveOrganisationUnit(formData,parent)
                                            : this.rejectSaveOrganisationUnit(parent)
        //------------------------------
            }
 //----------------------------------------------------------------------------------------------
    // item - parent to listed ogrUnits
    saveOrganisationUnit(formData,parent){
        saveOrganisationUnit(formData, parent,this.state.levels )
            .then(() => this.loadOrganisationUnitsChildren(parent))
             .catch(error => alert(`error saveOrganisationUnit App${error.message}`))
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

                    <input type="button" id="backToRoot" name="backToRoot" value="backToRoot" onClick={this.handleBackToRootClick}/>
                     </li>
                        <List items={this.state.itemsToShow} onItemClick={this.onItemClick}/>
                </div>
                <div className="second">
                    {/*<List onItemClick={this.onItemClick} items={this.state.items}/>*/}
                    {/*this.state.isSaving ? <div>Saving organisation unit</div> : <Form onSubmit={this.onSubmit}/>*/}
                    {this.state.items[0].level === this.state.levels ?  <Form onSubmit={this.onSubmit} /> :  console.log()}
                   <div>
                       <h3>Here info should be listed</h3>
                       <li>{this.state.toScreen}</li>
                   </div>
                </div>
            </div>
        );
    }

//---------------------------------------------------------------------------------------------
    handleBackToRootClick(){
        this.loadOrganisationUnits();
    }


//----------------------------------------------------------------------------------------------
    findElement() {

        console.log(" hit - find ");
        var ill = this.state.itemsToShow;
        console.log(ill);
        let info = [];
            info[0] = ill[0].displayName;
            info[1] = "  - PARENT -  ";
            info[2] = ill[0].parent.displayName;
        this.setState({
                       toScreen : info,
                      })

    }

//----------------------------------------------------------------------------------------------
    onAlert() {
        alert(`You cannot add org.unit here-not LAST level`);
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
         let ancestors = this.state.items[0].ancestors;
                   let i = ancestors.length;
                  i === 1 ? alert(`You are on HIGHEST level`) ://this.loadOrganisationUnits() :
                                       this.loadOrganisationUnitsChildren(ancestors[i - 2])
     }

     //----------------------- end class ---------------------------------
  }
