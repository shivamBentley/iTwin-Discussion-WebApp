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
