import React, { PropTypes } from 'react';

/**
 * A stateless function component
 * https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
 */
export default function List({ items = [], onItemClick,onLevelDownClick ,onShowMapClick,levels}) {
    // Create a list of li elements that make up the list of organisation units units
    // Each has a click handler for that specific item
    console.log("List");
    console.log({items}

    );
    const listItems = items
        .map(item => {
            if(item.level === levels ){
            return (

                            <li key={item.id} >
                                  {item.displayName}
                                  <button onClick={() => onItemClick(item)}> info </button>
                                  < button onClick={() => onLevelDownClick(item)}> drill down </button>
                            </li>

            );} else {
                return(
                    <li key={item.id} >
                        {item.displayName}
                        <button onClick={() => onItemClick(item)}> info </button>
                        < button onClick = {() => onShowMapClick(item)}>show map</button>
                    </li>
                        ) }
        });

    // Render the list with the items
    return (
        <div className="list">
            <ul>
                {listItems}
            </ul>
        </div>
    );
}

List.propTypes = {
    items: PropTypes.array,
    onItemClick: PropTypes.func.isRequired,
    onLevelDownClick: PropTypes.func.isRequired,

};

/*
*
*
 <li  onClick={() => onLevelDownClick(item)}>Level Down
 </li>
*
*
* */