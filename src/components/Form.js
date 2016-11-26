import React, { Component, PropTypes} from 'react';

export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
               element: {
                         id: `0`,
                         name: '',
                         shortName: '',
                         openingDate: this.convertDate(new Date()),
                         coordinates: ``,
                         level: ``,
                         },
                isChanged: false,
        };



        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.setName = this.setName.bind(this);
        this.setShortName = this.setShortName.bind(this);
        this.setOpeningDate = this.setOpeningDate.bind(this);
        this.setNewCoordinates = this.setNewCoordinates.bind(this);
        this.resetFormClick = this.resetFormClick.bind(this);



    }
    componentWillReceiveProps(nextProps) {

          //
          //  console.log(this.props.item);


        /*    if(nextProps.item.displayName != this.state.element.name &&
            nextProps.item.shortname !== this.state.element.shortName &&
            nextProps.item.openingDate !== this.state.element.openingDate &&
            nextProps.item.coordinates !== this.state.element.coordinates){*/
               /* this.setState({
                    isChanged : false,
                }); */
           if(this.state.isChanged == false)
            this.loadData(nextProps.item);
           else{
              this.keepData(this.props.item);
           }

           }
    loadData(item){
       console.log("loadData");

        let temp = this.state.element;
        temp.id = item.id;
        temp.name = item.displayName;
        temp.shortName = item.shortName;
        temp.openingDate = this.convertDate(item.openingDate);
        temp.coordinates = item.coordinates ? item.coordinates : ``;
        temp.level = item.level;
        this.setState({
            element: temp,
        });
            }
    //------------------
    keepData(item){
        console.log("keepData");
        let temp = this.state.element;
        temp.coordinates = item.coordinates;
        this.setState({

            element: temp,
        });

    }
    //------------------
    onSubmitClick(event) {
        event.preventDefault();

        console.log("this.state Form ");
        console.log(this.state);
        this.props.onSubmit(this.state.element);
        this.resetFormClick();
    }

    resetFormClick(){
        let temp = {};
        temp.name = ``;
        temp.shortName = ``;
        temp.openingDate = this.convertDate(new Date());
        temp.coordinates = ``;

           this.setState({
            element: temp,
            isChanged: false,
               });
        this.props.resetItemToClick();
    }

    setName(event) {
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
    }
        let temp = this.state.element;
        temp.name = event.target.value;
                this.setState({
                    element: temp,
                    isChanged: true,
                           });
            }

    setShortName(event) {
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
        }
        let temp = this.state.element;
        temp.shortName = event.target.value;
        this.setState({
           element: temp,
            isChanged: true,
        });
    }

    setOpeningDate(event) {
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
        }
        let temp = this.state.element;
        temp.openingDate = event.target.value;
        this.setState({
            element: temp,
            isChanged: true,
        });
    }

    isFormValid() {
        return !(this.state.element.name && this.state.element.shortName && this.state.element.openingDate
        && this.areCoordinatesValid()  );
    }
    areCoordinatesValid(){
        let temp = this.state.element.coordinates;
        return temp.includes("[", 0) && temp.includes(",") && temp.includes("]");
    }
    setNewCoordinates(event){
        if (this.props.item.level !== this.props.maxLevels){
            alert(`cannot change`);return;
        }
        let temp = this.state.element;
        temp.coordinates = event.target.value;
    this.setState({
        element: temp,
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
                            <input type="text" value={this.state.element.name} onChange={this.setName} />
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Short name</span>
                            <input type="text" value={this.state.element.shortName} onChange={this.setShortName} />
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Opening date</span>
                            <input type="date" value={this.state.element.openingDate} onChange={this.setOpeningDate} />
                        </label>
                    </div>
                    <div>
                         <label>
                             <span>Location</span>
                             <input type="text"  value={this.state.element.coordinates}  placeholder="[ latitude , longitude ]"
                                onChange={this.setNewCoordinates}/>
                         </label>
                    </div>
                    <div>
                        <button disabled={this.isFormValid()}    id="submit" onClick={this.onSubmitClick}>Submit</button>

                    </div>


                </form>

               <div>
                   <button id="empty_fields" onClick={this.resetFormClick}>Clear/add new</button>
               </div>
            
            </div>
            
            
            
        );
    }
    //-------------




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

/*
    removed from reset
*  // this.props.resetItemToClick();
*
* ---------------------
 let temp = this.state.element;
 //  temp.id = item.id;
 temp.name = item.displayName;
 temp.shortName = item.shortName;
 temp.openingDate = this.convertDate(item.openingDate);
 temp.coordinates = item.coordinates ? item.coordinates : ``;
 // temp.level = item.level;

 if(!this.state.isChanged) {

 this.setState({
 element : temp,
 })

 } else{
 let newTemp = this.state.element;
 newTemp.coordinates = item.coordinates;
 this.setState({
 element : newTemp,
 })
 }
    */