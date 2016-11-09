import React, { Component } from 'react';
import Search from 'react-search';
import { saveOrganisationUnit, loadOrganisationUnits, findChildren, levelUp, fetchParent ,fetchItem, apiFeatureType} from '../api';
import List from './List';
import Form from './Form';
import { Router, Route, IndexRout, hashHistory, browserHistory, Link } from 'react-router';


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
            coordinates:[],

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
    }

    componentDidMount() {
        console.log("componentDidMount");
        this.loadOrganisationUnits();

    }

    showChildren(item) {
        this.loadOrganisationUnitsChildren(item)
    }

    loadOrganisationUnits() {
        // Loads the organisation units from the api and sets the loading state to false and puts the items onto the component state.
        loadOrganisationUnits()
            .then((organisationUnits) => {
                this.setState({
                    isLoading: false,
                    items: organisationUnits,
                    itemsToShow: organisationUnits,
                });

            });
    }
    
    findFeatureType(item){
        
        apiFeatureType(item)
                        .then((featureType) =>{
                         featureType !== "NONE" ? this.loadOrganisationUnitsLevelUp(item) : this.loadOrganisationUnitsChildren(item) 
                                              })
                         .catch((error) => alert(`Could not find children to  organisation unit ${error}`))
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
                console.log("this.state.item App");
                console.log(this.state.item);
            })
            .catch((error) => alert(`Could not find children to  organisation unit ${error}`))
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

        .catch(() => alert(`Level UpCould not find children to  organisation unit ${item.displayName}`))

    }

    onItemClick(item) {
        // Remove the item from the local list.
        // This will make it seem like it was deleted while we wait for the actual delete to complete.
        /*
        this.setState({
            items: this.state.items
                .filter(organisationUnit => item.id !== organisationUnit.id)
        });
        */
        // Delete the organisationUnit from the server. If it fails show a message to the user.
        //   deleteOrganisationUnit(item)
        //  .catch(() => alert(`Could not delete organisation unit ${item.displayName}`))
        // In all cases (either success or failure) after deleting reload the list.
        //   .then(() => this.loadOrganisationUnits2());

        this.state.item = item;
        console.log("this.state.item  App");
        console.log(this.state.item);
        console.log("addShow");
        console.log(this.state.addShow);

        this.state.addShow ? this.showChildren(item) : console.log(" do nothing");

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

        // Save the organisation unit to the api
        saveOrganisationUnit(formData, this.state.item)
            .then(() => this.loadOrganisationUnits())
            .catch(() => alert(`Could save organisation unit ${item.displayName}`))
            .then(() => this.setState({
                isSaving: false,
                item: null
            })); // After either success or failure set the isSaving state to false
    }
    
    loadThisItem(item){
         console.log("going to find coordinates of this item " ); console.log(item);
        fetchItem(item)
                      .then((coordinates) => {
                          this.setState({
                    isLoading: false,
                    coordinates: coordinates,
                                       });
                                             })
                     .catch((error) => alert(`Could not find coordinates to  organisation unit ${error}`))
        console.log("coordinates App");
        console.log(this.state.coordinates);
    }

    render() {
        // If the component state is set to isLoading we hide the app and show a loading message
        if (this.state.isLoading) {
            return (
                <div>Loading data...</div>
            );
        }

        // Render the app which includes the list component and the form component
        // We hide the form component when we are in the saving state.
        return (
            <div className="app">
            
                <div>
                    <div>
                        <input type="radio" name="choice" value="A" onChange={this.handleClickAdd}/>add child<br/>
                        <input type="radio" name="choice" value="A" onChange={this.handleClickShow}/>show children<br/>
                        <input type="button" id="levelUp" name="levelUp"  value="levelUp" onClick={this.handleBackClick}/>
                    </div>

                    <List onItemClick={this.onItemClick} items={this.state.items}/>
                    {this.state.isSaving ? <div>Saving organisation unit</div>: <Form onSubmit={this.onSubmit} />}
                </div>
            <div>
                <div className="search">
                   <input id="t" type="text" placeholder="Search" onChange={this.filterItems}/>
                   <input type="button"  value="find" onClick= {this.findElement}/>
                   <ListOverItems stukas = {this.state.itemsToShow}/>
                 
                 </div>
                
                          <div>
                                  <h3>Coordinates</h3>
                                  <p>{this.state.coordinates}</p>
                          </div>
             
             </div>
            </div>
        );
    }
    
   onPick(item){
       console.log("onPick");
   }
    
    findElement(){
       
       console.log("find hit ");
        var ill = this.state.itemsToShow;
        console.log(ill);
        this.loadThisItem(ill);
       
   
    }
    
    
    handleClickAdd(event) {
        // event.preventDefault;
        console.log(" click updated ");
        this.setState({
            addShow: false
        });
        console.log("addShow : " + this.state.addShow);
    }

    handleClickShow() {
        event.preventDefault;
        this.setState({
            addShow: true
        });
        console.log("addShow : " + this.state.addShow);
    }

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
    handleBackClick() {
        console.log("this.state.item App button Back ");
        console.log(this.state.item);
        this.findFeatureType(this.state.item);

    }

}
//----------------------------------------------------------------------

 //  var Autocomplete = require('pui-react-autocomplete').Autocomplete;







var ListOverItems = React.createClass({
    render() {
        return (
            
            <ul>
                {this.props.stukas.map((stuka) => {return (<li key={stuka.id} >{stuka.displayName}</li>)})  }
            </ul>
                        
        );
    }

})
