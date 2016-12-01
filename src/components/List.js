import React, {PropTypes} from 'react';
import {mapHighlightItem} from '../map';

/**
 * A stateless function component
 * https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
 */
export default function List({items = [], onItemClick, onLevelDownClick, onSelectClick, levels, zoomButton}) {
    // Create a list of li elements that make up the list of organisation units units
    // Each has a click handler for that specific item

    const listItems = items
        .map(item => {
            if (item.level == levels) {
                return <ListItem key={item.id} item={item}
                                 onClick={onItemClick}
                                 buttonText={zoomButton ? "Zoom" : null}
                                 onButtonClick={onSelectClick}/>;
            }
            else {
                return <ListItem key={item.id} item={item}
                                 onClick={onItemClick}
                                 buttonText="Drill Down"
                                 onButtonClick={onLevelDownClick}/>;
            }
        });

    // Render the list with the items
    return <ul>{listItems}</ul>;
}

List.propTypes = {
    items: PropTypes.array,
    onItemClick: PropTypes.func.isRequired,
    onLevelDownClick: PropTypes.func.isRequired,
    onSelectClick: PropTypes.func.isRequired,
    levels: PropTypes.number.isRequired,
    zoomButton: PropTypes.bool.isRequired,
};

function ListItem({item, onClick, buttonText, onButtonClick}) {
    return (
        <li     onMouseEnter={() => mapHighlightItem(item.id, true)}
                onMouseLeave={() => mapHighlightItem(item.id, false)}
                onClick={() => onClick(item)}>
            {item.displayName}
            {buttonText ?
                <button onClick={e => { e.stopPropagation();
                                        onButtonClick(item)
                                }}>
                    {buttonText}
                </button> : null}
        </li>
    )
}
