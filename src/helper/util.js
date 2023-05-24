export const filterDataByGithubLoginID = (discussionData, targetName) => {
    const filteredData = [];
    discussionData.forEach((obj) => {
        let status = false;

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
 * 
 * @param {Array} discussionData 
 * @returns {Set} All member login id. 
 */
export const getAllDevelopers = (discussionData) => {
    console.log(discussionData)
    const members = new Set();
    discussionData.forEach((obj) => {
        const comments = obj.comments?.nodes;
        members.add(obj.author?.DeveloperQuestioned);
        if (comments && comments.length != 0) {
            comments.forEach((comment) => {
                members.add(comment.author?.DeveloperCommented);
            })
        }
    })
    // console.log('Commented or replied member', members)
    return members;
}


/**
 * @param {Array<string>} Array of login id name;
 * @returns { Array<Object> } Array of Discussion data
 */
export const getFilteredDataByDeveloperAndStatusType = (discussionData, gitHubLoginIds, filterType) => {

    //filter by filterType - { commented, replies, answer }
    let filterByType = [];
    if (filterType.length === 0) {
        filterByType = filterByType.concat(discussionData);
    } else {
        discussionData.forEach((data) => {
            filterType.forEach((filter) => {
                if (filter === 'comments') {
                    if (data.comments && data.comments.totalCount !== 0 && !data.answer?.isAnswer)
                        filterByType.push(data);
                }
                else if (filter === 'answer') {
                    if (data.answer && data.answer.totalCount !== 0)
                        filterByType.push(data);
                }
                else if (filter === 'replies') {
                    const commentsData = data.comments?.nodes;
                    if (commentsData && commentsData.totalCount !== 0) {
                        commentsData.forEach((commentObj) => {
                            if (commentObj.replies?.totalCount !== 0)
                                filterByType.push(data);
                        })
                    }
                }
            })
        })
    }

    let filteredDataByLoginIds = [];

    // filter by loginIds 
    if (gitHubLoginIds.length === 0) { filteredDataByLoginIds = filteredDataByLoginIds.concat(filterByType); }
    else {
        filterByType.forEach((data) => {

            let answeredBy = '';
            let commentsBy = [];
            let repliedBy = [];

            // check answer by developer exist
            const answer = data.answer;
            if (answer && answer.isAnswer) {
                answeredBy = answer.author?.DeveloperAnswered
            }

            // developer commented 
            const comments = data.comments.nodes;
            if (comments && data.comments.totalCount !== 0) {
                comments.forEach((comment) => {
                    commentsBy.push(comment.author?.DeveloperCommented);

                    //developer replied on comments
                    const replies = comment.nodes;
                    if (replies && comment.totalCount) {
                        repliedBy.push(replies.author.DeveloperRepliedToComment);
                    }

                })
            }

            // if any gitHubLoginIds matches with answeredBy, commentsBy or repliedBy
            gitHubLoginIds.forEach((loginId) => {
                if (loginId === answeredBy) filteredDataByLoginIds.push(data);
                else if (commentsBy.length !== 0) {
                    commentsBy.forEach((commentBy) => {
                        if (commentBy === loginId) filteredDataByLoginIds.push(data);
                    })
                }

                else if (repliedBy.length !== 0) {
                    repliedBy.forEach((replyBy) => {
                        if (replyBy === loginId) filteredDataByLoginIds.push(data);
                    })
                }
            })
        })
    }

    return filteredDataByLoginIds;
}