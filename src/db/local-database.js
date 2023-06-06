export const Teams = [
    {
        id: 1,
        teamName: 'iTwinPlatformDeveloperSuccess',
        teamMembers: [
            { GitHubLogin: "pratikshan85" },
            { GitHubLogin: "NancyMcCallB" }
        ]
    },
    {
        id: 2,
        teamName: 'TestOne',
        teamMembers: [
            { GitHubLogin: "NancyMcCallB" }
        ]
    },
    {
        id: 3,
        teamName: 'TestTwo',
        teamMembers: [
            { GitHubLogin: "neuralmax" }
        ]
    }
]

export const iTwinDetails = {
    owner: 'iTwin',
    repositories: ['itwinjs-core', 'iTwinUI', 'viewer']
}

/**
 * This is the format we are using to store data in localStorage of web browser.
    const iTwinData = {
        owner: 'iTwin',
        repositories: [
            {
                repositoryName: 'itwinjs-core',
                discussionData: [],
                totalCount: '',
                lastUpdate: ''
            },
            {
                repositoryName: 'iTwin-UI',
                discussionData: [],
                totalCount: '',
                lastUpdate: ''
            }
        ],
        lastUpdate:''
    }
 */
