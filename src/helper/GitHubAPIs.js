import { Config } from "../db/Config";

const apiUrl = 'https://api.github.com/graphql';

/**
 * GitHub GraphQL API has limitation so if from on accessToke it's not loading data try with other Token;
 * 
 */
const variables = {
  accessToken: Config.ACCESS_TOKEN
};

// Query for RateLimit
const rateLimitQuery = (filter) => {
  return `
     query {
      rateLimit {
        limit
        cost
        remaining
        resetAt
        nodeCount
        used
      }
     }
    `;
}

// Query for total discussion data count 
const discussionCountQuery = (filter) => {
  return `
     query {
      repository(name: "itwinjs-core", owner: "itwin") {
        discussions {
          totalCount
        }
      }
     }
    `;
}

//Query to fetch discussion data 
const createQuery = (owner, repositoryName, filter) => {
  return `
    query {
        repository(owner: "${owner}", name: "${repositoryName}") {
            discussions(${filter}){
            totalCount
    
            pageInfo{
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
    
            nodes {
    
              DiscussionUrl: url
              title
              bodyText
              author {
                DeveloperQuestioned: login
                DeveloperQuestionedGithubUrl: url
              }
    
              updatedAt
              createdAt
    
              category {
                categoryName: name
                emojiHTML
              }
    
              answer {
                author {
                  DeveloperAnswered: login
                  DeveloperAnsweredGithubUrl: url
                }
                AnswerCreatedAt: createdAt
                AnswerUrl: url
                isAnswer
              }
    
              comments(last: 20) {
                totalCount
                nodes {
                  replies (last: 10) {
                    nodes {
                      author {
                        DeveloperRepliedToComment: login
                        DeveloperRepliedToCommentGithubUrl: url
                      }

                      DeveloperCommentsRepliedUrl: url
                  }
                    totalCount
                  }
    
                  author {
                    DeveloperCommented: login
                    DeveloperCommentedGitHubUrl: url
                  }

                  DeveloperCommentedUrl: url
                }
              }
            }
          }
        }
      }
    `;
}

const getNext_100_DiscussionData = (owner, repositoryName, filter) => {
  const query = createQuery(owner, repositoryName, filter);
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${variables.accessToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(response => response.json())
    .catch(error => {
      console.error('Error:', error);
    });
}


export const getAllDiscussionData = async (owner, repositoryName, DateRange) => {
  let allDiscussionData = [];
  let START_DATE = '2019-01-01', END_DATE = new Date().toJSON().slice(0, 10);

  if (Config.DATA_DOWNLOAD_DATE_RANGE.STATUS) {
    START_DATE = Config.DATA_DOWNLOAD_DATE_RANGE.DATE_RANGE.START_DATE;
    END_DATE = Config.DATA_DOWNLOAD_DATE_RANGE.DATE_RANGE.END_DATE;

  }

  if (DateRange) {
    START_DATE = DateRange.START_DATE;
    END_DATE = DateRange.END_DATE;
  }

  // First 100 data fetch ...
  let pageInfo;
  let FindNext = true;
  let currentData;

  await getNext_100_DiscussionData(owner, repositoryName, `first:${100}, orderBy: { field:CREATED_AT, direction: DESC }`).then((data) => {
    currentData = data.data.repository?.discussions
    pageInfo = data.data.repository?.discussions.pageInfo
  });

  // if DATA_DOWNLOAD_DATE_RANGE.STATUS = true -> check fetched data falls under the dateRange
  if (DateRange || Config.DATA_DOWNLOAD_DATE_RANGE.STATUS) {
    const startDate = new Date(START_DATE)
    const endDate = new Date(END_DATE)
    const dataWithinRange = currentData.nodes.filter((dataObj) => {
      const currentDataCreatedDate = new Date(dataObj.createdAt)
      const isWithinRange = currentDataCreatedDate <= endDate && currentDataCreatedDate >= startDate;
      if (isWithinRange) return true;
      else return false
    })
    if (dataWithinRange.length !== currentData.nodes.length) {
      FindNext = false;
    }
    allDiscussionData = allDiscussionData.concat(dataWithinRange);
  } else {
    allDiscussionData = allDiscussionData.concat(currentData.nodes);
  }

  // Rest data fetching...
  while (pageInfo.hasNextPage && FindNext) {
    const filter = `first:${100},after:"${pageInfo.endCursor}", orderBy: { field:CREATED_AT, direction: DESC }`

    // eslint-disable-next-line
    await getNext_100_DiscussionData(owner, repositoryName, filter).then((data) => {
      currentData = data.data.repository.discussions
      pageInfo = data.data.repository?.discussions.pageInfo
    })

    // if DATA_DOWNLOAD_DATE_RANGE.STATUS = true -> check fetched data falls under the dateRange
    if (DateRange || Config.DATA_DOWNLOAD_DATE_RANGE.STATUS) {
      const startDate = new Date(START_DATE)
      const endDate = new Date(END_DATE)
      const dataWithinRange = currentData.nodes.filter((dataObj) => {
        const currentDataCreatedDate = new Date(dataObj.createdAt)
        const isWithinRange = currentDataCreatedDate <= endDate && currentDataCreatedDate >= startDate;
        if (isWithinRange) return true;
        else return false
      })
      if (dataWithinRange.length !== currentData.nodes.length) {
        FindNext = false;
      }
      allDiscussionData = allDiscussionData.concat(dataWithinRange);
    } else {
      allDiscussionData = allDiscussionData.concat(currentData.nodes);
    }

  }
  return allDiscussionData;
}

export const getRateLimitData = () => {
  const query = rateLimitQuery();
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${variables.accessToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(response => response.json())
    .catch(error => {
      console.error('Error:', error);
    });
}


export const getTotalDiscussionCount = () => {
  const query = discussionCountQuery();
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${variables.accessToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(response => response.json())
    .catch(error => {
      console.error('Error:', error);
    });
}

