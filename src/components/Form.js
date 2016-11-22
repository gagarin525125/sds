import React, { Component, PropTypes} from 'react';

export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            shortName: '',
            openingDate: '',
            coordinates: '[   ,   ]',
            allowance : false,//not in use
        };



        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.setName = this.setName.bind(this);
        this.setShortName = this.setShortName.bind(this);
        this.setOpeningDate = this.setOpeningDate.bind(this);
        this.setNewCoordinates = this.setNewCoordinates.bind(this);
        this.resetFormClick = this.resetFormClick.bind(this);
        this.checkPermition = this.checkPermition.bind(this);

    }
    componentWillReceiveProps(nextProps) {
            if(nextProps.item != this.props.item)
            this.loadData(nextProps.item);
    }
    loadData(item){
   //new one

        if (item.coordinates) {
            this.setState({
                name: item.displayName,
                shortName: item.shortName,
               openingDate: this.convertDate(item.openingDate),
                coordinates: item.coordinates,


            })
        } else {
            this.setState({
                name: item.displayName,
                shortName: item.shortName,
               openingDate: this.convertDate(item.openingDate),
                coordinates: "No coordinates",


            })
        }
    }
    onSubmitClick(event) {
        event.preventDefault();

        console.log("this.state Form ");
        console.log(this.state);
        this.props.onSubmit(this.state);
        this.setState({
            name: '',
            shortName: '',
            openingDate: '',
            coordinates: '[   ,   ]',
            allowance: false

        })
    }

    resetFormClick(event){
        event.preventDefault();
        this.setState({
            name: '',
            shortName: '',
            openingDate: '',
            coordinates: ``,//'[   ,   ]',

        });
      this.props.resetItemToClick();
    }

    setName(event) {
                this.setState({name: event.target.value});
    }

    setShortName(event) {
        this.setState({ shortName: event.target.value });
    }

    setOpeningDate(event) {
        this.setState({ openingDate: event.target.value });
    }

    isFormValid() {
        return !(this.state.name && this.state.shortName && this.state.openingDate && this.state.coordinates);
    }

    setNewCoordinates(event){
    this.setState({ coordinates: event.target.value });
    }

    render() {
        return (
            <div className="form">
                <form>
                    <div>
                        <label>
                            <span>Name</span>
                            <input type="text" value={this.state.name} onChange={this.setName} />
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Short name</span>
                            <input type="text" value={this.state.shortName} onChange={this.setShortName} />
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Opening date</span>
                            <input type="date" value={this.state.openingDate} onChange={this.setOpeningDate} />
                        </label>
                    </div>
                    <div>
                         <label>
                             <span>Location</span>
                             <input type="text"  value={this.state.coordinates}  placeholder="[ latitude , longitude ]"
                                onChange={this.setNewCoordinates}/>
                         </label>
                    </div>
                    <div>
                        <button style={{color: `red`}}  disabled={this.isFormValid()}    id="submit" onClick={this.onSubmitClick}>Submit</button>
                        <button id="empty_fields" onClick={this.resetFormClick}>empty fields/reset</button>
                    </div>

                </form>

               
            
            </div>
            
            
            
        );
    }

    convertDate(dateForm){
        let d = new Date(dateForm);
        let m = d.getMonth() + 1;
        if(m < 10) m = '0' + m;
        let day = d.getDate();
        if(day < 10) day = '0' + day;

        let newD =  `${d.getFullYear()}-${m}-${day}` ;
        return newD.toString();
    }
    // not in use
    checkPermition(){
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
                allowance : true

            });
            return true;
         //   this.updateOrganisationUnit(formData, this.state.itemTo);
         //   this.resetItemToClick();
        }
    }
    //-----------------   end class  ---------------
}

Form.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    item: PropTypes.object,
};

/*
    <input id="selection" type="button" value="add child" onClick={this.onSubmitClick}/>
                 <label><input type="radio" name="choice" value="A" onChange={this.handleClick}/>add child<br />
             <input type="radio" name="choice" value="A" onChange={this.handleClick}/>back to root</label>
 <input id="selection" type="button" id="back to root" onClick={this.onSubmitClick}/>BackToRoot



*/