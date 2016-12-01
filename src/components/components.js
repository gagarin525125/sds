/**
 *  Some small, stateless components.
 */
import React from 'react';

/** Pulldown list to set the maximum number of search results. */
export function MaxResults({value, onChange}) {
    return (
        <select value={value}
                onChange={ev => onChange(ev.target.value)}>
            <option value="10">10 results</option>
            <option value="20">20 results</option>
            <option value="30">30 results</option>
            <option value="40">40 results</option>
            <option value="50">50 results</option>
        </select>
    );
}

/** A list where the first item is used as the header. */
export function Infolist({items, increasingIndent=false}) {
    if (items.length == 0)
        return null;

    let contents;

    if (increasingIndent) {
        contents = items.map((item, i) => (
            <li key={item.id} style={{marginLeft: i + 'em'}}>{item.name}</li>
        ));
    }
    else {
        contents = items.map((item, i) => (
            <li key={item.id} style={{marginLeft: (i == 0 ? 0 : 1) + 'em'}}>
                {item.name}
            </li>
        ));
    }
    return <ul className="list_with_header">{contents}</ul>
}
