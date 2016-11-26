import React, {Component} from 'react';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren,
     organisationUnitLevels,liveSearch,updateOrganisationUnit} from '../api';
import List from './List';
import Form from './Form';
import { mapSetItems, mapAddItems, mapClearAll, mapSelectItem, mapSetCoordinatesCallback } from '../map';
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
            itemsToKeep: [],
            parentItem: {},
            maxLevels: {},
            toScreenP: [],
            toScreenG: [],
            itemTo: {
                id: "0",
                displayName: '',
                shortName: '',
                openingDate:  ``,
                coordinates: ``,
                level: '',
            },
            wantToChange: false,
          //  rigid: true,

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
    }

    componentDidMount() {

        this.loadOrganisationUnits();

        this.loadOrganisationUnitMaxLevels();
        this.resetItemToClick();
        mapSetCoordinatesCallback(this.onCoordinatesFromMap);
    }

    componentWillUpdate(_, nextState) {
        // Keep the map in sync with the unfiltered list of org.units.
        if (nextState.items.length == 0) {
            mapClearAll();
        }
        else if (!arraysEqual(nextState.items, this.state.items)) {
            let atFacilityLevel = nextState.items[0].level ==
                                                this.state.maxLevels;
            /*
            let callback = atFacilityLevel ? this.onItemClick :
                                             this.onLevelDownClick;
            */
            let callback;
            if(atFacilityLevel){
                callback = this.onItemClick;
            }else{
                callback = this.onLevelDownClick;
            }
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
    loadOrganisationUnitMaxLevels(){

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
        console.log("load org units ");
       loadOrganisationUnits()
            .then((organisationUnits) => {

                this.setState({
                    isLoading: false,
                    items: organisationUnits,
                    itemsToKeep: organisationUnits,

                                  });
            })
            .catch((error) => alert(`loadOrgUnits  App ${error.stack}`))

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
                             });
            })
            .catch((error) => alert(`Error loadOrgUnitsChildren App  ${error.stack}`))
    }

    //------------------------------------------------------------------------------------------
    onLevelDownClick(item){    // drill down
        if(item.level === this.state.maxLevels-1){
            let temp = this.state.itemTo;
            temp.level = this.state.maxLevels ;
            temp.openingDate = this.convertDate(new Date());
            this.setState({
                itemTo: temp,
                parentItem: item
            });
            this.loadOrganisationUnitsChildren(item);
        }
      else  if(item.level < this.state.maxLevels){
            let temp = this.state.itemTo;
            temp.openingDate = this.convertDate(new Date());
            this.setState({
                itemTo: temp,
                parentItem: item
            });
            this.resetItemToClick();
            this.loadOrganisationUnitsChildren(item);
        } else {
            alert(`Lowest Level`);
        }

    }
onItemClick(item) {  // show info
    if(!item) return;
    mapSelectItem(item.id);
    if(item.level < this.state.maxLevels){

        item.coordinates = "not listed";
        this.setState({
            itemTo: item,
            wantedToChange: false,
                });
        this.findElement(item);// show Parents and Groups
    } else {

        this.setState({
            itemTo: item,
            wantToChange : true,
                   });
       this.findElement(item);
            }
}


    //----------------------------------------------------------------------------------------------

    onSubmit(formData) {

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
            this.saveOrganisationUnit(formData, this.state.items[0].parent);

        }
    }

    //------------------------------------------------------------------------------------------
    onSelectClick(item) {

        let temp = this.state.itemTo;
        temp.level = this.state.maxLevels;
        this.setState({
            itemTo: temp,
            parentItem: item
        });
        this.loadOrganisationUnitsChildren(item.parent);
    }
 //----------------------------------------------------------------------------------------------
    updateOrganisationUnit(formData,itemTo){
        updateOrganisationUnit(formData,itemTo )
            .then(() => this.loadOrganisationUnitsChildren(itemTo.parent))// update state with new born lazaret

            .then(() => {
                let temp = this.state.itemTo;
                temp.level = this.state.maxLevels ;
                this.setState({
                    isSaving: false,
                    itemTo: temp,
                })}
            )
            .catch(error => alert(`error updateOrganisationUnit App${error.message}`))
    }

    //--------------------------------------------------------------------------------------------
    // item - parent to listed ogrUnits
    saveOrganisationUnit(formData,parent){

        saveOrganisationUnit(formData, parent, this.state.maxLevels)
            .then(() => this.loadOrganisationUnitsChildren(parent))// update state with new born lazaret
            .then(() => {
                let temp = this.state.itemTo;
                temp.level = this.state.maxLevels ;
                              this.setState({
                                       isSaving: false,
                                       itemTo: temp,
            })}
            )
            .catch(error => alert(`error saveOrganisationUnit App${error.message}`))
    }

//---------------------------------------------------------------------------------------
    onCoordinatesFromMap(lat, lng) {

        let longitude = lng.toFixed(4);
        let latitude = lat.toFixed(4);
        const nova = this.state.itemTo;
        nova.coordinates = `[ ${longitude}, ${latitude} ]`;
        this.setState({
            itemTo: nova,
            wantedToChange: false,
        });
    }
    //-----------------------------------------------------------------------------------------

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
                    <input type="button" id="backToRoot" name="backToRoot" value="Top level"
                           onClick={this.handleBackToRootClick}/>
                    <input type="button" id="levelUp" name="levelUp" value="One level up" onClick={this.handleLevelUpClick}/>

                    <input id="live" type="search" className="form-control" placeholder="live search" onChange={this.liveSearch}/>

                    < List items={this.state.items} onItemClick={this.onItemClick}
                           onLevelDownClick={this.onLevelDownClick}
                            levels={this.state.maxLevels}
                           onSelectClick={this.onSelectClick}/>
                </div>
                <div className="info">

                    {<Form onSubmit={this.onSubmit} item={this.state.itemTo}
                           resetItemToClick={this.resetItemToClick}
                           maxLevels={this.state.maxLevels}/> }
                    <div>
                        <InfoP toScreenP={this.state.toScreenP}/>
                        <InfoG toScreenG={this.state.toScreenG}/>
                    </div>

                </div>
            </div>

        );
    }
  //
//---------------------------------------------------------------------------------------------
    handleBackToRootClick(event){
        event.preventDefault();
       this.loadOrganisationUnits() ;
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
       if(item.organisationUnitGroups.length !== 0) { // to add ?
           let groups = item.organisationUnitGroups;

           infoG[0] = {name: "Organisation Groups"};
           for (let i = 0; i < groups.length; i++) {
               infoG.push({
                   name: groups[i].name
               });
           }
       }
        //--------------------------
        this.setState({
            toScreenP : infoP,
            toScreenG : infoG,
        })

    }


    //-----------------------------------------------------------------------------------------
    // not ready
    liveSearch(event){
        this.resetItemToClick();
        event.preventDefault();

        if(event.target.value === ''){

               this.setState({
                    items: this.state.itemsToKeep,
               });
                return;
  //  this.loadOrganisationUnits() ;
        }


        liveSearch(event.target.value.toLowerCase())

            .then(result => {

                this.setState({
                    items: result.organisationUnits,

                })
            })

            .catch((error) => alert(`Error liveSearch App  ${error.stack}`))

    }
//----------------------------------------------------------------------------------------------
    handleLevelUpClick() {

        let ancestors = this.state.items[0].ancestors;
        let i = ancestors.length;
       if( i === 1) {alert(`You are on HIGHEST level`); this.resetItemToClick(); }
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
                openingDate: this.convertDate(new Date()),
                coordinates: ``,
                level: ``,
            },
            toScreenG : [],
            toScreenP: [],
            wantToChange : false,

        })
    }
    convertDate(){
        let d = new Date();
        let m = d.getMonth() + 1;
        if(m < 10) m = '0' + m;
        let day = d.getDate();
        if(day < 10) day = '0' + day;

        let newD =  `${d.getFullYear()}-${m}-${day}` ;
        return newD.toString();
    }
     //----------------------- end class ---------------------------------
  }

class InfoP extends React.Component {

    render() {
        if (this.props.toScreenP.length == 0)
            return null;

        let list = this.props.toScreenP.map(function (stuka, i) {
            return <li key={i} style={{marginLeft: i + 'em'}}> {stuka.name} </li>;

        });
        return <ul className="list_with_header">{list}</ul>
    }
}
//-------------------------------------------------------
class InfoG extends React.Component {

    render() {
        if (this.props.toScreenG.length == 0)
            return null;

        let list = this.props.toScreenG.map(function (stuka, i) {
            return  <li key={i} style={{marginLeft: i + 'em'}}> {stuka.name} </li>;

        });
        return <ul className="list_with_header">{list}</ul>
    }
}

  //--------------------------------------------------------

/*
 //---------------------------------------------------------------------------------------------
 onShowMapClick(item){
 console.log("on show map click ");
 console.log(item);

 }
 */

/*
 </div>
 <div className="info">
 {/*<List onItemClick={this.onItemClick} items={this.state.items}/>*/
/*this.state.isSaving ? <div>Saving organisation unit</div> : <Form onSubmit={this.onSubmit}/>}
{<Form onSubmit={this.onSubmit} item={this.state.itemTo}
       resetItemToClick={this.resetItemToClick}
       maxLevels={this.state.maxLevels}/> }
<div>
    <InfoP toScreenP={this.state.toScreenP}/>
    <InfoG toScreenG={this.state.toScreenG}/>
</div>

</div>
    */