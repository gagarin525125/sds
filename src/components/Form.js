import React, {Component, PropTypes} from 'react';

export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {

            element: {
                id: ``,
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

        console.log("receive props");
/*
        if (nextProps.item.id != this.state.element.id) {
            this.setState({
                isChanged: false,
            });
        }*/
        if (nextProps.item.id != this.state.element.id)
            this.loadData(nextProps.item,this.state.element);
        else

            this.keepData(this.state.element, nextProps.item.coordinates)

    }


    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    loadData(item,stateItem) {
        console.log("loadData");

        let temp = Object.assign({}, this.state.element);
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
    keepData(item, coord) {
        console.log("keepData");
        let temp = Object.assign({}, this.state.element);
        temp.id = item.id;
        temp.coordinates = coord ? coord : ``;
        this.setState({
            element: temp,
        });
    }

    //------------------
    onSubmitClick(event) {
        event.preventDefault();
        console.log("this.state Form element");
        console.log(this.state.element);
        this.props.onSubmit(this.state.element);
        this.resetFormClick2();
    }

    resetFormClick() {
        console.log("reset form");
        let temp = Object.assign({},this.state.element);
        temp.id = this.state.element.id;
        temp.name = ``;
        temp.shortName = ``;
        temp.openingDate = this.convertDate(new Date());
        temp.coordinates = ``;
        this.setState({
            element: temp,
             isChanged: false,
        });
        this.props.resetItemToClickChoice();

    }
    resetFormClick2() {
        console.log("reset form");
        let temp = Object.assign({},this.state.element);
        temp.id = `0`;
        temp.name = ``;
        temp.shortName = ``;
        temp.openingDate = this.convertDate(new Date());
        temp.coordinates = ``;
        this.setState({
            element: temp,
            isChanged: false,
        });

    }

    setName(event) {
        if (this.props.item.level !== this.props.maxLevels) {
            alert(`cannot change`);
            return;
        }

        let temp = Object.assign({},this.state.element);
        temp.name = event.target.value;
        this.setState({
            element: temp,
            isChanged: true,

        });
    }

    setShortName(event) {
        if (this.props.item.level !== this.props.maxLevels) {
            alert(`cannot change`);
            return;
        }

        let temp = this.state.element;
        temp.shortName = event.target.value;
        this.setState({
            element: temp,
            isChanged: true,

        });
    }

    setOpeningDate(event) {
        if (this.props.item.level !== this.props.maxLevels) {
            alert(`cannot change`);
            return;
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

    areCoordinatesValid() {
        let temp = this.state.element.coordinates;
        return temp.includes("[", 0) && temp.includes(",") && temp.includes("]");

    }

    setNewCoordinates(event) {
        if (this.props.item.level !== this.props.maxLevels) {
            alert(`cannot change`);
            return;
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
                            <input type="text" value={this.state.element.name} onChange={this.setName}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Short name</span>
                            <input type="text" value={this.state.element.shortName} onChange={this.setShortName}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Opening date</span>
                            <input type="date" value={this.state.element.openingDate} onChange={this.setOpeningDate}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span>Location</span>
                            <input type="text" value={this.state.element.coordinates}
                                   placeholder="[ latitude , longitude ] "
                                   onChange={this.setNewCoordinates}/>
                        </label>

                    </div>
                    <div>
                        (right click)
                        <button disabled={this.isFormValid()} id="submit" onClick={this.onSubmitClick}>Submit</button>

                    </div>


                </form>

                <div>
                    <button id="empty_fields" onClick={this.resetFormClick}>Clear Before Add </button>
                </div>

            </div>



        );
    }

    //-------------


    convertDate(dateForm) {
        let d = new Date(dateForm);
        let m = d.getMonth() + 1;
        if (m < 10) m = '0' + m;
        let day = d.getDate();
        if (day < 10) day = '0' + day;

        let newD = `${d.getFullYear()}-${m}-${day}`;
        return newD.toString();
    }

    //-----------------   end class  ---------------
}

Form.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    item: PropTypes.object,

};


