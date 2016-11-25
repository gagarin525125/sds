import React, { Component, PropTypes} from 'react';

export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: `0`,
            name: '',
            shortName: '',
            openingDate: this.convertDate(new Date()),//`1111-11-11`,
            coordinates: ``,
            isChanged: false,
            level: ``,
        };



        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.setName = this.setName.bind(this);
        this.setShortName = this.setShortName.bind(this);
        this.setOpeningDate = this.setOpeningDate.bind(this);
        this.setNewCoordinates = this.setNewCoordinates.bind(this);
        this.resetFormClick = this.resetFormClick.bind(this);


    }
    componentWillReceiveProps(nextProps) {

            console.log("this props");
          //  console.log(this.props.item);


            if(nextProps.item !== this.state){
                this.setState({
                    isChanged : false,
                });

            this.loadData(nextProps.item);
            }else{
                this.setState({
                    isChanged : true,
                })

            }
           }
    loadData(item){
   //new one


        console.log("next props");
     //   console.log(item);
       if(!this.state.isChanged) {
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
                   coordinates: ``,
               })
           }
       }else{
           let a = this.state;
           this.setState({
               name: a.name,
               shortName: a.shortName,
               openingDate: a.openingDate,
               coordinates: item.coordinates,

           })
       }

    }
    onSubmitClick(event) {
        event.preventDefault();

        console.log("this.state Form ");
        console.log(this.state);
        this.props.onSubmit(this.state);
        this.resetFormClick();
    }

    resetFormClick(){
           this.setState({
            name: '',
            shortName: '',
            openingDate: this.convertDate(new Date()),//'',
            coordinates: ``,
            isChanged: false,

        });
     // this.props.resetItemToClick();
    }

    setName(event) {
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
    }
                this.setState({
                    name: event.target.value,
                    isChanged: true,
                           });
            }

    setShortName(event) {
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
        }
        this.setState({
            shortName: event.target.value,
            isChanged: true,
        });
    }

    setOpeningDate(event) {
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
        }
        this.setState({
            openingDate: event.target.value ,
            isChanged: true,
        });
    }

    isFormValid() {
        return !(this.state.name && this.state.shortName && this.state.openingDate
        && this.areCoordinatesValid()  );
    }
    areCoordinatesValid(){
        let a = this.state.coordinates;
        return a.includes("[", 0) && a.includes(",") && a.includes("]");
    }
    setNewCoordinates(event){
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
        }
    this.setState({
        coordinates: event.target.value,
        isChanged: true,
    });
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
                        <button disabled={this.isFormValid()}    id="submit" onClick={this.onSubmitClick}>Submit</button>
                        <button id="empty_fields" onClick={this.resetFormClick}>Clear</button>
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
/*
 checkPermission(){
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
 }*/