
/** Add callback to each item. */
export function addCallbackToItems(items, callback) {
    return items.map(item =>
                     Object.assign(item, { callback: () => callback(item) }));
}

/** Returns true if arrays a and b have the same contents, false if not. */
export function arraysEqual(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
