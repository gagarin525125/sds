import React, {Component} from 'react';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren, deleteOrganisationUnit, organisationUnitLevels,liveSearch,updateOrganisationUnit} from '../api';
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
         //   itemsToShow: [],
            parentItem: {},
            maxLevels: {},
            toScreenP: [],
            toScreenG: [],
            itemTo: {
                id: "0",
                displayName: '',
                shortName: '',
                openingDate:  ``,// this.convertDate(new Date()),//'1111-11-11',
                coordinates: ``,
                level: '4',
            },
            wantToChange: false,
            rigid: true,

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
        console.log("componentDisMount");
        this.loadOrganisationUnits();
        this.loadOrganisationUnitLevels();
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
    loadOrganisationUnitLevels(){

     organisationUnitLevels()
            .then((result) => {console.log("Levels");
                             //  console.log(result);
                                this.setState({
                                    maxLevels: result.pager.total,
                                              });

                      })

           .catch((error) => alert(`Error loadOrgUnLevels App  ${error.stack}`))
    }

//----------------------------------------  part of componentDidMount   --------------
   loadOrganisationUnits() {
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.
        loadOrganisationUnits()
            .then((organisationUnits) => {

                this.setState({
                    isLoading: false,
                    items: organisationUnits,

                                  });
            })
            .catch((error) => alert(`loadOrgUnits  App ${error.stack}`)
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
           // this.resetItemToClick();
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
            rigid: true

        });
        this.findElement(item);// show Parents and Groups
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
            if (confirm(`Click OK to save edits to ${this.state.itemTo.displayName}`)) {
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
        console.log("saveogun App levels");
        console.log(this.state.maxLevels);
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
            return <div><p/>Loading data...</div>;
        }

        // Render the app which includes the list component and the form component
        // We hide the form component when we are in the saving state.
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

                        <input id="live" type="search" className="form-control"
                               placeholder="live search"
                               onChange={this.liveSearch}/>
                    </div>

                    < List items={this.state.items/*ToShow*/} onItemClick={this.onItemClick}
                           onLevelDownClick={this.onLevelDownClick}
                            levels={this.state.maxLevels}
                           onSelectClick={this.onSelectClick}/>
                </div>
                <div className="info">
                    {/*<List onItemClick={this.onItemClick} items={this.state.items}/>*/}
                    {/*this.state.isSaving ? <div>Saving organisation unit</div> : <Form onSubmit={this.onSubmit}/>*/}
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

        console.log(" hit - find ");
        let elem = item;
        let infoP = [];

        infoP[0] = {name: "Parents"};

        for (let i = 0; i < item.ancestors.length; i++) {
            infoP.push({
                name: item.ancestors[i].displayName
            });
        }
        //--------------------------
        console.log("item.orgUnGroups");

       let infoG = [];
       if(item.organisationUnitGroups.length !== 0) { // to add ?
           let groups = item.organisationUnitGroups;
           console.log(groups);
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

//----------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------
    // not ready
    liveSearch(event){
        this.resetItemToClick();
        event.preventDefault();
        console.log(event.target.value);
        if(event.target.value === ''){

              /*  this.setState({
                    items/*ToShow*/ //: this.state.items
             //   }); */
              //  return;
    this.loadOrganisationUnits() ;
        }


        liveSearch(event.target.value.toLowerCase())

            .then(result => {
               // console.log(result);

                this.setState({
                    items/*ToShow*/: result.organisationUnits
                })
            })

            .catch((error) => alert(`Error liveSearch App  ${error.stack}`))

    }
//----------------------------------------------------------------------------------------------
    handleLevelUpClick() {
        console.log("this.state.item  handleLevelUp  App  ");
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
                openingDate: this.convertDate(new Date()),//'',
                coordinates: ``,
            },
            toScreenG : [],
            toScreenP: [],
            wantToChange : false,
            rigid: true,
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

        let list = this.props.toScreenP.map(function (name, i) {
            return <li key={i} style={{marginLeft: i + 'em'}}> {name.name} </li>;

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


/*   findOrganisationUnitGroups(groupId)
 .then((result) => {
 console.log("groupId result ");
 console.log(result);
 let grName = result.displayName;
 console.log(grName);
 info.push({name : grName});
 this.setState({
 isLoading: false,
 });
 })
 .catch((error) => alert(`Error findElement App  ${error.message}`));



 /* rejectSaveOrganisationUnit(item){
 this.onAlert();
 this.setState({
 isSaving: false
 });
 }*/
//----------------------------------------------------------------------------------------------


/*
 onAlert() {
 alert(`You cannot add org.unit here-not LAST level`);
 event.preventDefault();
 }
 */

/*
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
 */
/*
 //---------------------------------------------------------------------------------------------
 onShowMapClick(item){
 console.log("on show map click ");
 console.log(item);

 }
 */

