const apiUrl = 'https://api.github.com/graphql';

/**
 * GitHub GraphQL API has limitation so if from on accessToke it's not loading data try with other Token;
 * 
 */
const variables = {
  accessToken: process.env.ACCESS_TOKEN
};

const createQuery = (filter) => {
  return `
    query {
        repository(owner: "iTwin", name: "itwinjs-core") {
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

const getNext_100_DiscussionData = (filter) => {
  const query = createQuery(filter);
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


export const getAllDiscussionData = async () => {
  let allDiscussionData = [];

  // First 100 data fetch ...
  let pageInfo;
  await getNext_100_DiscussionData(`first:100, orderBy: { field:CREATED_AT, direction: DESC }`).then((data) => {
    allDiscussionData = allDiscussionData.concat(data.data.repository.discussions.nodes);
    pageInfo = data.data.repository?.discussions.pageInfo;
  });

  // Rest data fetching...
  while (pageInfo.hasNextPage) {
    const filter = `first:${100},after:"${pageInfo.endCursor}", orderBy: { field:CREATED_AT, direction: DESC }`
    await getNext_100_DiscussionData(filter).then((data) => {
      allDiscussionData = allDiscussionData.concat(data.data.repository.discussions.nodes);
      pageInfo = data.data.repository?.discussions.pageInfo;
    })
  }

  return allDiscussionData;
}
