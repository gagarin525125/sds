import React, { Component, PropTypes } from 'react';

export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            shortName: '',
            openingDate: '',
            item: {} ,
            coordinates: '',
        };



        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.setName = this.setName.bind(this);
        this.setShortName = this.setShortName.bind(this);
        this.setOpeningDate = this.setOpeningDate.bind(this);
    }
    componentWillReceiveProps(){
        console.log("will mount");

        this.setCoordinates(this.props.item);
        console.log(this.state.item)
    }

    setCoordinates(item){
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

        console.log("this.state");
        console.log(this.state);
        this.props.onSubmit(this.state);
    }

    setName(event) {
        this.setState({ name: event.target.value });
    }

    setShortName(event) {
        this.setState({ shortName: event.target.value });
    }

    setOpeningDate(event) {
        this.setState({ openingDate: event.target.value });
    }

    isFormValid() {
        return !(this.state.name && this.state.shortName && this.state.openingDate);
    }
    convertDate(dateForm){
        let d = new Date(dateForm);

       let newD =  `${d.getFullYear()}-${d.getMonth() + 1 }-${d.getDate()}` ;
       console.log(newD);
       return newD;
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

                    <label>
                        <span>Location</span>
                        <input type="text"  value={this.state.coordinates} placeholder="[ latitude , longitude ]"  required="true"/>
                    </label>
                    <div>
                        <button disabled={this.isFormValid()} id="submit" onClick={this.onSubmitClick}>Submit</button>
                    </div>

                </form>
                
               
            
            </div>
            
            
            
        );
    }
}

Form.propTypes = {
    onSubmit: PropTypes.func,
    coordinates: PropTypes.object,
};

/*
    <input id="selection" type="button" value="add child" onClick={this.onSubmitClick}/>
                 <label><input type="radio" name="choice" value="A" onChange={this.handleClick}/>add child<br />
             <input type="radio" name="choice" value="A" onChange={this.handleClick}/>back to root</label>
 <input id="selection" type="button" id="back to root" onClick={this.onSubmitClick}/>BackToRoot



*/