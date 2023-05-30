const apiUrl = 'https://api.github.com/graphql';

/**
 * GitHub GraphQL API has limitation so if from on accessToke it's not loading data try with other Token;
 * 
 */
const variables = {
  accessToken: "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"
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
    
              author {
                DeveloperQuestioned: login
                DeveloperQuestionedGithubUrl: url
              }
    
              updatedAt
              createdAt
    
              category {
                categoryName: name
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
                  }
                    totalCount
                  }
    
                  author {
                    DeveloperCommented: login
                    DeveloperCommentedGitHubUrl: url
                  }
    
                  DeveloperReplyUrl: url
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


export const getAllDiscussionData = async (owner, repositoryName) => {
  let allDiscussionData = [];

  // First 100 data fetch ...
  let pageInfo;
  await getNext_100_DiscussionData(owner, repositoryName, `first:100, orderBy: { field:CREATED_AT, direction: DESC }`).then((data) => {
    allDiscussionData = allDiscussionData.concat(data.data.repository.discussions.nodes);
    pageInfo = data.data.repository?.discussions.pageInfo;
  });

  // Rest data fetching...
  while (pageInfo.hasNextPage) {
    const filter = `first:${100},after:"${pageInfo.endCursor}", orderBy: { field:CREATED_AT, direction: DESC }`
    await getNext_100_DiscussionData(owner, repositoryName,filter).then((data) => {
      allDiscussionData = allDiscussionData.concat(data.data.repository.discussions.nodes);
      pageInfo = data.data.repository?.discussions.pageInfo;
    })
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

export const getLocalStorageDiscussionData = () => {
  return JSON.parse(localStorage.getItem('iTwinDiscussionData'))
}