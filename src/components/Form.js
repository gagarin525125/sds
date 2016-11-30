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
            bol: false,
            tempName: ``,
        };

        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.setName = this.setName.bind(this);
        this.setShortName = this.setShortName.bind(this);
        this.setOpeningDate = this.setOpeningDate.bind(this);
        this.setNewCoordinates = this.setNewCoordinates.bind(this);
        this.resetFormClick = this.resetFormClick.bind(this);
        this.resetFormClickLocal = this.resetFormClickLocal.bind(this);

    }

    componentWillReceiveProps(nextProps) {


        if (nextProps.item.id != this.state.element.id) {

            this.loadData(nextProps.item);
            this.setState({
                bol: false,
                tempName: ``,
            })
        }
        else

            this.keepData(this.state.element, nextProps.item.coordinates)

    }

    loadData(item) {

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

    keepData(item, coord) {
        let temp = Object.assign({}, this.state.element);
        temp.id = item.id;
        temp.coordinates = coord ? coord : ``;
        this.setState({
            element: temp,
            bol: true,
        });
    }

    onSubmitClick(event) {
        event.preventDefault();
        this.props.onSubmit(this.state.element);
        this.resetFormClickLocal();
    }

    resetFormClick() {
        let temp = Object.assign({}, this.state.element);
        temp.id = this.state.element.id;
        temp.name = ``;
        temp.shortName = ``;
        temp.openingDate = this.convertDate(new Date());
        temp.coordinates = ``;
        this.setState({
            element: temp,
        });
        this.props.resetItemToClickChoice();

    }

    resetFormClickLocal() {

        let temp = Object.assign({}, this.state.element);
        temp.id = `0`;
        temp.name = ``;
        temp.shortName = ``;
        temp.openingDate = this.convertDate(new Date());
        temp.coordinates = ``;
        this.setState({
            element: temp,
            bol: false,
            tempName: ``,
        });

    }

    setName(event) {
        let rem = Object.assign({},this.state.element.name);
        let temp = Object.assign({}, this.state.element);
        temp.name = event.target.value;

        this.setState({
            element: temp,
            bol: true,
            tempName: temp.name,
        });
    }

    setShortName(event) {
        let temp = this.state.element;
        temp.shortName = event.target.value;
        this.setState({
            element: temp,
            bol: true,
        });
    }

    setOpeningDate(event) {
        let temp = this.state.element;
        temp.openingDate = event.target.value;
        this.setState({
            element: temp,
            bol: true,
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
        let temp = this.state.element;
        temp.coordinates = event.target.value;
        this.setState({
            element: temp,
            bol: true,
        });

    }

    render() {

        return (
            <div className="form">
                <form>
                    <fieldset disabled={this.props.item.level != this.props.maxLevels}>
                        {this.state.bol ? <h4> Editing {this.state.tempName}</h4> : console.log("")}
                        <label>
                            <span>Name</span>
                            <input type="text" value={this.state.element.name} onChange={this.setName}/>
                        </label>
                        <label>
                            <span>Short name</span>
                            <input type="text" value={this.state.element.shortName} onChange={this.setShortName}/>
                        </label>
                        <label>
                            <span>Opening date</span>
                            <input type="date" value={this.state.element.openingDate} onChange={this.setOpeningDate}/>
                        </label>
                        <label>
                            <span>Location</span>(right click)
                            <input type="text" value={this.state.element.coordinates}
                                   placeholder="[ latitude , longitude ] "
                                   onChange={this.setNewCoordinates}/>
                        </label>
                        <div>

                            <button disabled={this.isFormValid()} id="submit" onClick={this.onSubmitClick}>Submit
                            </button>

                        </div>
                    </fieldset>
                </form>

                <button id="empty_fields" onClick={this.resetFormClick}
                        disabled={this.props.searchMode /* || (this.props.item.level != this.props.maxLevels)*/}>
                    Add new
                </button>

            </div>
        );
    }

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


