import React, {Component} from 'react';
import Search from 'react-search';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren, levelUp, fetchParent, fetchItem, apiFeatureType
} from '../api';
import List from './List';
import Form from './Form';
import {Router, Route, IndexRout, hashHistory, browserHistory, Link} from 'react-router';
import {mapAddPolygon, mapClearPolygons, mapAddMarkers} from '../map';


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
            addShow: true,
            item: {},
            itemsToShow: [],
            coordinates: [],

        };

        // Bind the functions that are passed around to the component
        this.onItemClick = this.onItemClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.showChildren = this.showChildren.bind(this);
        this.handleClickAdd = this.handleClickAdd.bind(this);
        this.handleClickShow = this.handleClickShow.bind(this);
        this.filterItems = this.filterItems.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.findElement = this.findElement.bind(this);
        this.onPick = this.onPick.bind(this);
        this.loadThisItem = this.loadThisItem.bind(this);
        this.onAlert = this.onAlert.bind(this);
    }

    componentDidMount() {
        console.log("componentDidMount");
        console.log(this.state.item);
        this.loadOrganisationUnits();

    }

    loadThisItem(item) {
        console.log("going to find coordinates of this item ");
        console.log(item);
        fetchItem(item)
            .then((coordinates) => {
            this.setState({
            isLoading: false,
            coordinates: coordinates,
        });

        var coords = JSON.parse(coordinates);

        if (coords.length == 2) {
            console.log([{ lat: coords[1], lng: coords[0]}]);
            mapAddMarkers([{ lat: coords[1], lng: coords[0], title: "Test" }])
        }
        else {
            // kan vi putte f.eks. et eller annet hardkoded tre-firekant her
            // for a se  ?
            console.log(coords);console.log(" drawing map ");
            // Test border drawing, only works for featureType = "POLYGON"
          //  currently
            mapAddPolygon(coords);
        }
    })
    .catch((error) => alert(`${item.displayName}Can't find coord to organisation unit ${error}`))
        console.log("coordinates App");
        //console.log(this.state.coordinates);
    }
    //---------------------------------------------------------------------------------------------------------
    drawMap(organisationUnits){
        console.log("drawMap App");
        console.log(organisationUnits);
        for(let i = 0; i < organisationUnits.length;i++) {
            let coordinates = organisationUnits[i].coordinates;
            var coords = JSON.parse(coordinates);
            mapAddPolygon(coords);
        }
    }
    //-------------------------------------------------------------------------------------------------------
    showChildren(item) {
        apiFeatureType(item)
            .then((featureType) => {
            featureType === "POINT" ? alert(`LAST level- no children `) : this.loadOrganisationUnitsChildren(item)
                 })
    .catch((error) => alert(`error clickOnItem => showchildren App${error}`) )

    }

    loadOrganisationUnits() {
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.
        loadOrganisationUnits()
            .then((organisationUnits) => {
            this.setState({
            isLoading: false,
            items: organisationUnits,
            itemsToShow: organisationUnits,
            item: organisationUnits[0].parent
        });


    })
        .then(() => {console.log("Parent id from start "); console.log(this.state.item.id);})
    . catch((error) => alert(`Could not find children loadOrganisationUnits  App ${error}`)
    )
    }

    findFeatureType(item) {
        console.log("findfeaturetype App");
        console.log(item);

        apiFeatureType(item)
            .then((featureType) => {
            featureType !== "NONE" ? this.loadOrganisationUnitsLevelUp(item) : this.loadOrganisationUnits()
    })
    .catch((error) => alert(`Could not find children findFeatureType ${error}`)
    )

    }



    loadOrganisationUnitsChildren(item) {
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
        this.drawMap(this.state.items);
    })
    .catch((error) => alert(`Error loadOrganisationUnitsChildren App${error.toLocaleString()}`)
    )
    }

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

    .catch((error) => alert(`Level UpCould not find children loadOrganisationUntisLevelUp${error}`)
    )

    }

    onItemClick(item) {
        this.setState({item: item});
        console.log("this.state.item  App");
        console.log(this.state.item);
        console.log("addShow");
        console.log(this.state.addShow);

         this.showChildren(item) ;
 // this.state.addShow ?  console.log(" do nothing")
    }

    onSubmit(formData) {
        console.log("item-onSubmit.App");
        console.log(this.state.item);
        console.log("formData.App");
        console.log(formData);
        // Set the component state to saving
        this.setState({
            isSaving: true
        });
        //------------------------------
        apiFeatureType(this.state.items[2])
            .then((featureType) => {
            featureType === "POINT" ? this.saveOrganisationUnit(formData,this.state.item) : this.rejectSaveOrganisationUnit(this.state.item)
                  })
            .catch((error) => alert(`Error onSubmit App ${error}`) )
        //------------------------------
            }
    // item - parent to listed ogrUnits
    saveOrganisationUnit(formData,item){

        saveOrganisationUnit(formData, item)
            .then(() => this.loadOrganisationUnitsChildren(item))
    .catch(error => alert(`error saveOrganisationUnit App${error}`))
    .then(() => this.setState({
            isSaving: false,
        }) )
    }

    rejectSaveOrganisationUnit(item){
      //  this.onAlert();
        this.setState({
            isSaving: false
        });

        this.loadOrganisationUnitsChildren(item );

    }
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
               <div>
                    <div>

                         <input type="button" id="levelUp" name="levelUp" value="levelUp" onClick={this.handleBackClick}/>
                     </div>
                  <List onItemClick={this.onItemClick} items={this.state.items}/>
                  {this.state.isSaving ? <div>Saving organisation unit</div> : <Form onSubmit={this.onSubmit}/>}
               </div>
               <div>
                    <div className="search">
                         <input id="t" type="text" placeholder="Search" onChange={this.filterItems}/>
                         <input type="button" value="find" onClick={this.findElement}/>
                         <ListOverItems stukas={this.state.itemsToShow}/>
                    </div>
               </div>
            </div>
    );
    }


    onPick(item) {
        console.log("onPick");
    }

    findElement() {

        console.log("find hit ");
        var ill = this.state.itemsToShow;
        console.log(ill);
        this.loadThisItem(ill);


    }


    handleClickAdd(event) {
        // event.preventDefault;
        this.state.items[0].featureType !== "POINT" ? this.onAlert() :
            this.setState({
                addShow: false
            });
        console.log("addShow ");
        console.log(this.state.addShow);
    }

    onAlert() {
        alert(`You cannot add org.unit here-not LAST level`);
        //  this.loadOrganisationUnits(this.state.item);
    }

    handleClickShow() {
        //  event.preventDefault;
        this.setState({
            addShow: true
        });
        console.log("addShow : ");
        console.log(this.state.addShow);
    }

    filterItems(event) {
        event.preventDefault();
        var updatedItems = this.state.items;
        updatedItems = updatedItems.filter(stuka =>
            stuka.displayName.toLowerCase().search(event.target.value.toLowerCase()) !== -1
    )
        ;

        this.setState({
            itemsToShow: updatedItems
        });
        console.log("items filterItems");
        console.log(this.state.itemsToShow);
        console.log(this.state.items);

    }

    handleBackClick() {
        console.log("this.state.item App button Back ");
        console.log(this.state.item);
        this.findFeatureType(this.state.item);

    }

}
//----------------------------------------------------------------------

// var Autocomplete = require('pui-react-autocomplete').Autocomplete;


var ListOverItems = React.createClass({
    render() {
        return (

            <ul>
            {this.props.stukas.map((stuka) => {return (<li key={stuka.id} >{stuka.displayName}</li>)})  }
    </ul>

    );
    }

})


/*
 // Save the organisation unit to the api
 fetchParent(this.state.item)
 .then((parent) => {
 saveOrganisationUnit(formData, this.state.item, parent)
 .then(() => this.loadOrganisationUnitsChildren())
 .catch(error => alert(`Could save organisation unit onSubmit App${error}`))
 .then(() => this.setState({
 isSaving: false,
 item: null
 })
 ); // After either success or failure set the isSaving state to false
 })


 <input type="radio" name="choiceA" value="A" onChange={this.handleClickShow}/>
 show children<br/>


 <input type="radio" name="choiceA" value="A" onChange={this.handleClickAdd}/>
 addchild<br/>
 */