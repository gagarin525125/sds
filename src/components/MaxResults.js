/**
 * Pulldown list to set the maximum number of search results.
 */

import React from 'react';


export default class MaxResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: props.value};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <select value={this.state.value} onChange={this.handleChange}>
                <option value="10">10 results</option>
                <option value="20">20 results</option>
                <option value="30">30 results</option>
                <option value="40">40 results</option>
                <option value="50">50 results</option>
            </select>
        );
    }
}
