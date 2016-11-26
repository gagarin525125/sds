import React, { PropTypes } from 'react';

/**
 * A stateless function component
 * https://facebook.github.io/react/docs/reusable-components.html#stateless-functions
 */
export default function List({ items = [], onItemClick,onLevelDownClick ,onSelectClick,levels}) {
    // Create a list of li elements that make up the list of organisation units units
    // Each has a click handler for that specific item



    //   this doesnt work
    // let bol =  items.every((val,i,arr) => val == arr[0].parent.id);
       let bol = true;
      for(let i = 0;i < items.length - 1;i++){
          if(items[i].parent.id === items[i+1].parent.id){
              bol = bol && true;
          }else {
              bol = bol && false;
          }

      }

    const listItems = items
        .map(item => {
            if(item.level === levels ){
                return(
                    <li key={item.id} >
                        {item.displayName}
                        <button className="info_button" onClick={() => onItemClick(item)}>Info</button>
                        <button className="select_button" disabled={bol} onClick={() => onSelectClick(item)}>Zoom</button>
                    </li>
                ) } else {
                return (

                    <li key={item.id} >
                        {item.displayName}
                        <button className="info_button" onClick={() => onItemClick(item)}>Info</button>
                        <button onClick={() => onLevelDownClick(item)}>Drill down</button>
                    </li>

                );}
        });

    // Render the list with the items
    return <ul>{listItems}</ul>;
}

List.propTypes = {
    items: PropTypes.array,
    onItemClick: PropTypes.func.isRequired,
    onLevelDownClick: PropTypes.func.isRequired,
    onSelectClick: PropTypes.func.isRequired,
    //levels: PropTypes.number,

};

/*
*
*
 <li  onClick={() => onLevelDownClick(item)}>Level Down
 </li>
*
*   < button onClick = {() => onShowMapClick(item)}>show map</button>
* */
