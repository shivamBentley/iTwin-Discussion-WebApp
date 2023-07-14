import { arrayUnion, comparatorFunc, insertObjInMap, sortByDate } from "./util";

export const filterDataByGithubLoginID = (discussionData, targetName) => {
    const filteredData = [];
    discussionData.forEach((obj) => {
        let status = false;

        //if any question asked by developer
        if (obj.author.DeveloperQuestioned === targetName) {
            status = true;
        }

        //if any reply by any bentley developer
        const answerBy = obj.answer?.author.DeveloperAnswered;
        if (answerBy === targetName) {
            status = true;
        }

        const comments = obj.comments?.nodes;
        if (comments && comments.length !== 0) {
            comments.forEach((comment) => {

                // if any comment by bentley developer
                const commentedBy = comment?.author.DeveloperCommented
                if (commentedBy && commentedBy === targetName) {
                    status = true;
                }

                // if any comment's reply by bentley developer
                const commentReplies = comment?.replies.nodes;
                if (commentReplies && commentReplies.length !== 0) {
                    commentReplies.forEach((reply) => {
                        const commentRepliesBy = reply?.author;
                        if (commentRepliesBy && commentRepliesBy === targetName) {
                            status = true;
                        }
                    })
                }
            })
        }
        if (status) {
            filteredData.push(obj);
        }
    })
    // console.log('FilteredDataByGithubLogin-', filteredData)
    return filteredData;
}

export const filterDiscussionDataByTeam = (discussionData, team) => {
    let discussionDataOfTeam = [];
    team.forEach((teamMember) => {
        const filteredDataByTeamMember = filterDataByGithubLoginID(discussionData, teamMember.GitHubLogin);
        discussionDataOfTeam = discussionDataOfTeam.concat(filteredDataByTeamMember)
    })

    // console.log('discussionDataOfTeam -', discussionDataOfTeam)
    return discussionDataOfTeam;
}

export const GetAnsweredData = (discussionData) => {
    const filteredData = discussionData.filter((obj) => {
        //if any reply by any bentley developer
        const answerBy = obj.answer?.author.DeveloperAnswered;
        return answerBy && answerBy !== "";
    })
    return filteredData;
}

export const GetUnAnsweredData = (discussionData) => {
    const filteredData = [];
    discussionData.forEach((obj) => {
        const answerBy = obj.answer?.isAnswer
        if (!answerBy) {
            filteredData.push(obj)
        }
    })
    // console.log('Unanswered filtered data', filteredData)
    return filteredData;
}

export const GetCommentedData = (discussionData) => {
    const filteredData = [];
    discussionData.forEach((obj) => {
        let status = false;
        const comments = obj.comments?.nodes;
        if (comments && comments.length !== 0) {
            status = true;
        }

        //if any reply by any bentley developer
        const answerBy = obj.answer?.isAnswer
        if (answerBy) status = false;

        if (status) {
            filteredData.push(obj);
        }
    })
    return filteredData;
}

export const getAllRepliedData = (discussionData) => {
    const filteredData = [];
    discussionData.forEach((obj) => {
        const comments = obj.comments?.nodes;
        if (comments && comments.length !== 0) {
            comments.forEach((comment) => {
                const replies = comment.replies;
                if (replies && replies.totalCount !== 0) {
                    filteredData.push(obj);
                }
            })
        }
    })
    return filteredData;
}

/**
 * 
 * @param {Array} discussionData 
 * @returns Data which has no comments
 */
export const GetNoRepliedData = (discussionData) => {
    const filteredData = [];
    discussionData.forEach((obj) => {
        const comments = obj.comments?.nodes;
        if (comments && comments.length === 0) {
            filteredData.push(obj)
        }
    })
    // console.log('No Replied data', filteredData)
    return filteredData;
}
/**
 * @param {Array} discussionData 
 * @returns {Set} All member login id. 
 */
export const getAllDevelopers = (discussionData) => {
    // console.log(discussionData)
    const members = new Set();
    discussionData.forEach((obj) => {
        const comments = obj.comments?.nodes;
        members.add(obj.author?.DeveloperQuestioned);
        if (comments && comments.length !== 0) {
            comments.forEach((comment) => {
                members.add(comment.author?.DeveloperCommented);
            })
        }
    })
    // console.log('Commented or replied member', members)
    return members;
}

export const getAskedDataByDeveloper = (discussionData, developerLoginId) => {

    const filteredData = [];
    discussionData.forEach((data) => {
        if (data?.author.DeveloperQuestioned === developerLoginId) {
            filteredData.push(data);
        }
    })

    return filteredData;
}

export const getRepliedDataByDeveloper = (discussionData, developerLoginId) => {
    const filteredData = [];
    discussionData.forEach((data) => {
        const comments = data?.comments;
        let isReplied = false;
        if (comments && comments.totalCount !== 0) {
            comments.nodes.forEach((comment) => {
                const replies = comment.replies;
                if (replies.totalCount !== 0) {
                    replies.nodes.forEach((rep) => {
                        if (rep.author.DeveloperRepliedToComment === developerLoginId)
                            isReplied = true;
                    })
                }
            })
        }
        if (isReplied)
            filteredData.push(data);
    })
    return filteredData;
}

export const getCommentedOnlyDataByDeveloper = (discussionData, developerLoginId) => {
    const filteredData = [];
    discussionData.forEach((data) => {
        const comments = data?.comments;
        let isCommented = false;
        if (comments.totalCount !== 0) {
            comments.nodes.forEach((comment) => {
                if (comment.author.DeveloperCommented === developerLoginId)
                    isCommented = true;
            })
        }

        if (isCommented && (data.answer?.author.DeveloperAnswered !== developerLoginId || !data.answer))
            filteredData.push(data);
    })
    return filteredData;

}

export const getAnsweredDataByDeveloper = (discussionData, developerLoginId) => {
    const filteredData = [];
    discussionData.forEach((data) => {
        const answer = data?.answer;
        if (answer && answer.totalCount !== 0) {
            if (answer?.author.DeveloperAnswered === developerLoginId) {
                filteredData.push(data);
            }
        }
    })
    return filteredData;
}

export const getFilteredDataOnFilter = (discussionData, devFilter, typeFilter) => {

    if (devFilter.length === 0 && typeFilter.length === 0) return [];

    // devFilter and type filter 
    else if (devFilter.length !== 0 && typeFilter.length !== 0) {
        let resultFilteredData = [];

        devFilter.forEach((devLoginId) => {

            let dataForCurrentMember = [];
            typeFilter.forEach((type) => {
                let filteredTypeData = [];
                switch (type) {
                    case 'answer':
                        filteredTypeData = getAnsweredDataByDeveloper(discussionData, devLoginId);
                        break;

                    case 'replies':
                        filteredTypeData = getRepliedDataByDeveloper(discussionData, devLoginId);
                        break;

                    case 'comments':
                        filteredTypeData = getCommentedOnlyDataByDeveloper(discussionData, devLoginId);
                        break;

                    case 'asked':
                        filteredTypeData = getAskedDataByDeveloper(discussionData, devLoginId);
                        break;

                    default:
                        break;
                }

                dataForCurrentMember = arrayUnion(dataForCurrentMember, filteredTypeData, comparatorFunc);
            })

            resultFilteredData = arrayUnion(resultFilteredData, dataForCurrentMember, comparatorFunc);
        })

        return sortByDate(resultFilteredData);
    }


    // only dev filter ....
    else if (devFilter.length === 0 && typeFilter.length !== 0) {
        let resultData = [];
        typeFilter.forEach((type) => {
            let filteredTypeData = [];
            switch (type) {
                case 'answer':
                    filteredTypeData = GetAnsweredData(discussionData);
                    break;

                case 'replies':
                    filteredTypeData = getAllRepliedData(discussionData);
                    break;

                case 'comments':
                    filteredTypeData = GetCommentedData(discussionData);
                    break;

                case 'asked':
                    filteredTypeData = discussionData;
                    break;

                default:
                    break;
            }
            resultData = arrayUnion(resultData, filteredTypeData, comparatorFunc);
        })
        return sortByDate(resultData);
    }

    // only dev filter ....
    else if (devFilter.length !== 0 && typeFilter.length === 0) {
        let resultData = [];
        devFilter.forEach((devLoginId) => {
            resultData = arrayUnion(resultData, filterDataByGithubLoginID(discussionData, devLoginId), comparatorFunc)
        })

        return sortByDate(resultData);
    }

    else return sortByDate(discussionData);
}

/**
 * @param {Object} A discussion data object 
 * @returns {developerList {level_0 : new Set(), level_1:new Set()}} All developer categorize of types { commented , answered , replied , questioned}. 
 */
export const getTypeOfDeveloperInvolve = (discussionObject) => {
    const developerAnswered = discussionObject.answer?.author.DeveloperAnswered;
    const developerQuestioned = discussionObject.author?.DeveloperQuestioned;

    const developerMap = new Map();
    const uniqueDevList = new Set();
    // extracting developer commented or replied on comment
    const comments = discussionObject?.comments;
    if (comments.totalCount !== 0) {
        comments.nodes.forEach((comment) => {

            // verify developer, if this is same who asked the question the skip
            if (comment.author.DeveloperCommented !== developerQuestioned && comment.author.DeveloperCommented !== developerAnswered) {
                // check developer exist in uniqueDevList 
                const devName = comment.author.DeveloperCommented;
                const isDevFound = uniqueDevList.has(devName);
                if (!isDevFound) {
                    insertObjInMap(developerMap, {
                        developerName: devName,
                        answeredUrl: new Set(),
                        otherUrl: new Set([comment.DeveloperCommentedUrl])
                    })
                    uniqueDevList.add(devName);
                }
            }

            // Developer Replied 
            const replies = comment.replies;
            if (replies.totalCount !== 0) {
                replies.nodes.forEach((rep) => {

                    // verify developer, if this is same who asked the question the skip
                    if (rep.author.DeveloperRepliedToComment !== developerQuestioned && comment.author.DeveloperCommented !== developerAnswered) {
                        // check developer exist in uniqueDevList 
                        const devName = rep.author.DeveloperRepliedToComment
                        const isDevFound = uniqueDevList.has(devName);
                        if (!isDevFound) {
                            insertObjInMap(developerMap, {
                                developerName: devName,
                                answeredUrl: new Set(),
                                otherUrl: new Set([rep.DeveloperCommentsRepliedUrl])
                            })
                            uniqueDevList.add(devName);
                        }
                    }
                })
            }
        })
    }

    //clearing the set 
    uniqueDevList.clear();

    return {
        level_0: developerAnswered ? new Map([[developerAnswered, {
            developerName: developerAnswered,
            answeredUrl: new Set([discussionObject.answer.AnswerUrl]),  // only answered url 
            otherUrl: new Set()
        }]]) : new Set(),
        level_1: developerMap
    }
} 
export const filteredDiscussionDataByDateRange = (discussionData, start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Filter the array based on the date range
    const filteredData = discussionData.filter(data => {
        const itemDate = new Date(data.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
    });

    return filteredData;
}
