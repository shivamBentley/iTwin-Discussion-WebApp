export function arrayUnion(arr1, arr2, equalityFunc) {
    var union = arr1.concat(arr2);

    for (var i = 0; i < union.length; i++) {
        for (var j = i + 1; j < union.length; j++) {
            if (equalityFunc(union[i], union[j])) {
                union.splice(j, 1);
                j--;
            }
        }
    }

    return union;
}

export function comparatorFunc(g1, g2) {
    return g1.DiscussionUrl === g2.DiscussionUrl;
}

export const sortByDate = (arr, type = 'ASC') => {
    switch (type) {
        case 'DSC':
            return arr.sort((b, a) => new Date(a.createdAt) - new Date(b.createdAt));
        default:
            return arr.sort((b, a) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}