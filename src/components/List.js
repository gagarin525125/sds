import React, {PropTypes} from 'react';
import {mapHighlightItem} from '../map';

/**
 * A stateless function component
 * https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
 */
export default function List({items = [], onItemClick, onLevelDownClick, onSelectClick, levels}) {
    // Create a list of li elements that make up the list of organisation units units
    // Each has a click handler for that specific item

    let bol = true;
    for (let i = 0; i < items.length - 1; i++) {

        if (items[i].parent.id === items[i + 1].parent.id) {
            bol = bol && true;
        } else {
            bol = bol && false;
        }
        if (bol == false) break;
    }

    const listItems = items
        .map(item => {
            if (item.level === levels) {
                return (
                    <li key={item.id}
                        onMouseEnter={() => mapHighlightItem(item.id, true)}
                        onMouseLeave={() => mapHighlightItem(item.id, false)}
                        onClick={() => onItemClick(item)}>
                        {item.displayName}
                        <button hidden={bol}
                                onClick={e => {
                                    e.stopPropagation();
                                    onSelectClick(item)
                                }}>
                            Zoom
                        </button>
                    </li>
                )
            } else {
                return (

                    <li key={item.id}
                        onMouseEnter={() => mapHighlightItem(item.id, true)}
                        onMouseLeave={() => mapHighlightItem(item.id, false)}
                        onClick={() => onItemClick(item)}>
                        {item.displayName}
                        <button onClick={e => {
                            e.stopPropagation();
                            onLevelDownClick(item)
                        }}>
                            Drill down
                        </button>
                    </li>

                );
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
};

