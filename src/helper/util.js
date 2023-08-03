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

export const validateSmartKey = (key) => {

    const keyWithoutSpaces = key.replace(/^\s+|\s+$/gm, '');
    let targetCol = keyWithoutSpaces.split(':')[0];
    let searchKey = keyWithoutSpaces.split(':')[1]

    // validate smart key
    const isSmartKey = targetCol.substr(0, 1) === '@' && targetCol.substr(1, 3).toLowerCase() === 'col' && Number.isInteger(parseInt(targetCol.substr(4)))
    if (isSmartKey) {
        //remove start and end spaces in search key
        searchKey = searchKey?.replace(/^\s+|\s+$/gm, '');
        targetCol = 'col' + parseInt(targetCol.substr(4));

        if (targetCol && searchKey)
            return {
                targetCol,
                searchKey
            }
        return null

    } else return null
}

export const smartFilter = (data, key) => {
    let filteredData = [];
    // validate smart key or not
    const smartKey = validateSmartKey(key);
    if (smartKey) {
        switch (smartKey.targetCol) {

            case 'col2':
                filteredData = data.filter((obj) => {
                    return obj.title.toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            case 'col3':
                filteredData = data.filter((obj) => {
                    return obj.author.DeveloperQuestioned.toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            case 'col4':
                filteredData = data.filter((obj) => {
                    const totalComment = obj.comments.nodes.length;
                    return totalComment.toString().toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            case 'col5':
                filteredData = data.filter((obj) => {
                    let totalReplies = 0;
                    obj.comments.nodes.forEach(comment => {
                        totalReplies += comment.replies.totalCount;
                    });
                    return totalReplies.toString().toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            case 'col6':
                filteredData = data.filter((obj) => {
                    const totalComment = obj.comments.nodes.length;
                    const answeredBy = obj.answer?.author.DeveloperAnswered;
                    const status = obj.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")
                    return status.toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            case 'col7':
                filteredData = data.filter((obj) => {
                    const answeredCreatedAt = new Date(obj.answer?.AnswerCreatedAt).toLocaleString();
                    return answeredCreatedAt.toString().toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });

                break;

            case 'col8':
                filteredData = data.filter((obj) => {
                    const createdAt = new Date(obj.createdAt).toLocaleString();
                    return createdAt.toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            case 'col9':
                filteredData = data.filter((obj) => {
                    const updatedAt = new Date(obj.updatedAt).toLocaleString();
                    return updatedAt.toLowerCase().includes(smartKey.searchKey.toLowerCase())
                });
                break;

            default:
                filteredData = globalFilter(data, smartKey.searchKey)
                break;
        }

        return filteredData
    }


    return globalFilter(data, key);

}

const globalFilter = (data, key) => {
    const filteredData = data.filter((obj) => {
        const totalComment = obj.comments.nodes.length;

        let totalReplies = 0;
        obj.comments.nodes.forEach(comment => {
            totalReplies += comment.replies.totalCount;
        })

        const answeredBy = obj.answer?.author.DeveloperAnswered;
        const status = obj.answer ? answeredBy : (totalComment !== 0 ? 'Commented' : "No Reply")

        const answeredCreatedAt = new Date(obj.answer?.AnswerCreatedAt).toLocaleString();
        const createdAt = new Date(obj.createdAt).toLocaleString();
        const updatedAt = new Date(obj.updatedAt).toLocaleString();



        if (obj.title.toLowerCase().includes(key.toLowerCase())) return true;
        else if (obj.author.DeveloperQuestioned.toLowerCase().includes(key.toLowerCase())) return true;
        else if (totalComment.toString().toLowerCase().includes(key.toLowerCase())) return true;
        else if (totalReplies.toString().toLowerCase().includes(key.toLowerCase())) return true;
        else if (status.toLowerCase().includes(key.toLowerCase())) return true;
        else if (answeredCreatedAt.toString().toLowerCase().includes(key.toLowerCase())) return true;
        else if (createdAt.toLowerCase().includes(key.toLowerCase())) return true;
        else if (updatedAt.toLowerCase().includes(key.toLowerCase())) return true;
        else return false;

    });

    return filteredData;
}

export const insertObjInMap = (map, data) => {
    if (!map) return map;
    // check data key exist in map or not 
    const key = data.developerName;
    const found = map.get(key);
    if (found) {

        map.set(key, {
            ...found,
            // eslint-disable-next-line
            ['answeredUrl']: new Set([...found['answeredUrl'], ...data['answeredUrl']]),
            // eslint-disable-next-line
            ['otherUrl']: new Set([...found['otherUrl'], ...data['otherUrl']])
        })
    } else {
        map.set(data.developerName, data);
    }
}

export const mergeObjectMap = (mapA, mapB) => {
    const result = new Map(mapA);
    for (const data of mapB.values()) {
        insertObjInMap(result, data);
    }
    return result;
}

export const sortFunc = (arr, key, order, type) => {
    if (order === 'ASC') {
        arr.sort((a, b) => {
            if (type === 'string') {
                const keyA = a[key].toUpperCase();
                const keyB = b[key].toUpperCase();

                if (keyA < keyB) {
                    return -1;
                }
                if (keyA > keyB) {
                    return 1;
                }
                return 0;
            }
            else if (type === 'number') {
                return (a[key] - b[key]);
            }
            //type === 'date'
            else {
                if (key === 'closeDate') {
                    const dateA = a[key] === '' ? new Date() : new Date(a[key])
                    const dateB = b[key] === '' ? new Date() : new Date(b[key])
                    return dateA - dateB
                }
                return (new Date(a[key]) - new Date(b[key]));
            }
        });
        return arr;
    }
    else {
        arr.sort((a, b) => {
            if (type === 'string') {
                const keyA = a[key].toUpperCase();
                const keyB = b[key].toUpperCase();

                if (keyA > keyB) {
                    return -1;
                }
                if (keyA < keyB) {
                    return 1;
                }
                return 0;
            }
            else if (type === 'number') {
                return (b[key] - a[key]);
            }
            // type === 'date'
            else {
                if (key === 'closeDate') {
                    const dateA = a[key] === '' ? new Date() : new Date(a[key])
                    const dateB = b[key] === '' ? new Date() : new Date(b[key])
                    return dateB - dateA
                } else
                    return (new Date(b[key]) - new Date(a[key]));
            }
        });
        return arr;
    }
}

export const sortDataAscOrDsc = (arr, key, order) => {
    switch (key) {
        case 'title':
        case 'repoName':
        case 'developerQuestioned':
        case 'category':
        case 'status':
            return sortFunc(arr, key, order, 'string')

        case 'totalComment':
        case 'totalReplies':
            return sortFunc(arr, key, order, 'number')

        case 'closeDate':
        case 'updatedAt':
        case 'createdAt':
            return sortFunc(arr, key, order, 'date')

        default:
            return arr;
    }


}