import React, {Component} from 'react';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren,  organisationUnitLevels,liveSearch,updateOrganisationUnit} from '../api';
import List from './List';
import Form from './Form';
import { mapSetItems, mapSetCoordinatesCallback } from '../map';
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
            itemTo: {
                id: "0",
                displayName: 'empty',
                shortName: 'empty',
                openingDate: '1111-11-11',
                coordinates: 'empty',
                level: '0',
            },
            wantToChange: false,
            rigid: true,

        };

        // Bind the functions that are passed around to the component
        this.onItemClick = this.onItemClick.bind(this);
        this.onLevelDownClick = this.onLevelDownClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.filterItems = this.filterItems.bind(this);
        this.filterItems2 = this.filterItems2.bind(this);
        this.handleLevelUpClick = this.handleLevelUpClick.bind(this);
        this.findElement = this.findElement.bind(this);
        this.onAlert = this.onAlert.bind(this);
        this.onCoordinatesFromMap = this.onCoordinatesFromMap.bind(this);
        this.handleBackToRootClick = this.handleBackToRootClick.bind(this);
        this.resetItemToClick = this.resetItemToClick.bind(this);
    }

    componentDidMount() {
         console.log("componentDisMount");
        this.loadOrganisationUnits();
        this.loadOrganisationUnitLevels();
        mapSetCoordinatesCallback(this.onCoordinatesFromMap);
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

    loadOrganisationUnitsChildren(item) {
          // save in item to be the parent of future children
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
            .catch((error) => alert(`Error loadOrganisationUnitsChildren App  ${error.message}`))
    }
//---------------------------------------------------------------------------------------------
    onLevelDownClick(item){    // drill down
        if(item.level < this.state.levels){
/*
            item.coordinates = "not listed";
            this.setState({
                itemTo: item,
                rigid: true

            });
            this.findElement(item);*/
            this.resetItemToClick();
            this.loadOrganisationUnitsChildren(item);
        } else {
/*
            this.setState({
                itemTo: item,
                wantToChange : true,
                rigid: false
            });*/
            //this.findElement(item);
          //  this.resetItemToClick();
            alert(`Lowest Level`);
        }

    }
onItemClick(item) {  // show info
    if(item.level < this.state.levels){

        item.coordinates = "not listed";
        this.setState({
            itemTo: item,
            rigid: true

        });
        this.findElement(item);
    } else {

        this.setState({
            itemTo: item,
            wantToChange : true,
            rigid: false
        });
        this.findElement(item);
            }
}


    //----------------------------------------------------------------------------------------------

    onSubmit(formData) {
      //  if(!this.state.rigid){
        if (this.state.wantToChange) {
            let res = prompt(`want to change existing orgUnit? Y/no`, "no");
            if (res == null) {  // cancel
                console.log("hit - cancel");// something to add ?
            } else if (res.toLowerCase() === "no") {
                console.log("hit - no "); // something to add ?

            }
            else if (res.toLowerCase() === "") {
                console.log("hit - empty"); // something to add ?
            }
            else if (res.toLowerCase() === "y") {
                console.log("hit - yes ");
                this.setState({
                    isSaving: true,

                });
                this.updateOrganisationUnit(formData, this.state.itemTo);
                this.resetItemToClick();
            }
        } else {
            this.resetItemToClick();
            this.saveOrganisationUnit(formData,this.state.items[0].parent);

        }
        //}else{ alert(' cannot be changed ')}
    }
 //----------------------------------------------------------------------------------------------
    updateOrganisationUnit(formData,itemTo){
        updateOrganisationUnit(formData,itemTo )
            .then(() => this.loadOrganisationUnitsChildren(itemTo.parent))// update state with new born lazaret
            .catch(error => alert(`error updateOrganisationUnit App${error.message}`))
            .then(() => this.setState({
                isSaving: false,
            }) )
    }

    //--------------------------------------------------------------------------------------------
    // item - parent to listed ogrUnits
    saveOrganisationUnit(formData,parent){
        saveOrganisationUnit(formData, parent,this.state.levels )
            .then(() => this.loadOrganisationUnitsChildren(parent))// update state with new born lazaret
             .catch(error => alert(`error saveOrganisationUnit App${error.message}`))
               .then(() => this.setState({
                                  isSaving: false,
                     }) )
    }

    onCoordinatesFromMap(lat, lng) {
        console.log(`onCoordinatesFromMap(${lat}, ${lng})`);
    }
//----------------------------------------------------------------------------------------------
   /* rejectSaveOrganisationUnit(item){
        this.onAlert();
          this.setState({
                isSaving: false
                        });
          }*/
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


                    <input type="button" id="levelUp" name="levelUp" value="levelUp" onClick={this.handleLevelUpClick}/>
                    <input type="button" id="backToRoot" name="backToRoot" value="backToRoot"
                           onClick={this.handleBackToRootClick}/>

                    <input id="live" type="text" placeholder="livesearch" onChange={this.filterItems2}/>
                    < List items={this.state.items/*ToShow*/} onItemClick={this.onItemClick}
                                                              onLevelDownClick={this.onLevelDownClick}/>
                </div>
                <div className="second">
                    {/*<List onItemClick={this.onItemClick} items={this.state.items}/>*/}
                    {/*this.state.isSaving ? <div>Saving organisation unit</div> : <Form onSubmit={this.onSubmit}/>*/}
                    {<Form onSubmit={this.onSubmit} item={this.state.itemTo}
                           resetItemToClick={this.resetItemToClick}/> }
                    <div>

                            <h3>Here info should be listed</h3>


                    </div>

                </div>
            </div>

        );
    }

//---------------------------------------------------------------------------------------------
    handleBackToRootClick(event){
        event.preventDefault();
        this.loadOrganisationUnits() ;
    }


//----------------------------------------------------------------------------------------------
    findElement(item) {

        console.log(" hit - find ");
        let ill = item;
        console.log(ill);
        let info = [];
        for(let i = 0; i < ill.ancestors.length;i++){
            info.push({
         name:    ill.ancestors[i].displayName
            });
        }

/*      //{this.state.toScreen}
        this.setState({
                       toScreen : [],
                      });*/
        this.setState({
            toScreen : info,
        })

    }

//----------------------------------------------------------------------------------------------
    onAlert() {
        alert(`You cannot add org.unit here-not LAST level`);
        event.preventDefault();
            }

//----------------------------------------------------------------------------------------------
    filterItems(event) {
        event.preventDefault();
        let updatedItems = this.state.items;
        updatedItems = updatedItems.filter(stuka =>
            stuka.displayName.toLowerCase().search(event.target.value.toLowerCase()) !== -1);

        this.setState({
            itemsToShow: updatedItems
                      });
        console.log("items filterItems");
        console.log(this.state.itemsToShow);
        console.log(this.state.items);

    }
    //-----------------------------------------------------------------------------------------
    // not ready
    filterItems2(event){
        this.resetItemToClick();
        event.preventDefault();
        if(event.target.value === ''){

                this.setState({
                    items/*ToShow*/: this.state.items
                });
                return;
        }


        liveSearch(event.target.value.toLowerCase())

            .then(result => {
                console.log(result);

                this.setState({
                    items/*ToShow*/: result.organisationUnits
                })
            })

            .catch((error) => alert(`Error filterItems2 App  ${error.message}`))

    }
//----------------------------------------------------------------------------------------------
    handleLevelUpClick() {
        console.log("this.state.item  handleLevelUp  App  ");
        let ancestors = this.state.items[0].ancestors;
        let i = ancestors.length;
       if( i === 1) {alert(`You are on HIGHEST level`); this.resetItemToClick(); }//this.loadOrganisationUnits() :
                  else {
           this.loadOrganisationUnitsChildren(ancestors[i - 2]);
           this.resetItemToClick();
       }
    }
     //---------------------------------------------------------------------------------------


     //----------------------------------------------------------------------------------------
    resetItemToClick() {
        this.setState({
            itemTo: {
                id: "0",
                displayName: '',
                shortName: '',
                openingDate: '',
                coordinates: '[   ,   ]',
            },
            wantToChange : false,
            rigid: true,
        })
    }

     //----------------------- end class ---------------------------------
  }
/*
 {this.state.items[0].level === this.state.levels ?  <Form onSubmit={this.onSubmit}
 item={this.state.itemTo}   /> :  console.log()}

 <input id="search" type="text" placeholder="Search" onChange={this.filterItems}/>
 <input type="button" value="find" onClick={this.findElement}/>
 <input type="button" value="find" onClick={this.findElement}/>


 this.state.items[0].level === this.state.levels ?
 this.saveOrganisationUnit(formData,parent)
 : this.rejectSaveOrganisationUnit(parent);



 //  console.log("onItemClick  levels App");
 // console.log(this.state.itemTo);
 /*


 let filteredItem = this.state.items;
 // actually , this search is not necessary
 filteredItem = filteredItem.filter(stuka => stuka.id.toLowerCase()
 .search(item.id.toLowerCase()) !== -1);
 console.log(this.state.levels);
 console.log(filteredItem[0].level);



 //  if (filteredItem[0].level < this.state.levels) {

 <button id="reset"  onClick={this.resetItemToClick}>reset</button>
 */


