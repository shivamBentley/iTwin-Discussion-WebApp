export const Teams = [
    {
        id: 1,
        teamName: 'iTwinPlatformDeveloperSuccess',
        teamMembers: [
            { GitHubLogin: "tamanud" },
            { GitHubLogin: "pratikshan85" },
            { GitHubLogin: "ArnabGogoi" },
        ]
    },
    {
        id: 2,
        teamName: 'Team A',
        teamMembers: [
            { GitHubLogin: "NancyMcCallB" }
        ]
    },
    {
        id: 3,
        teamName: 'Team B',
        teamMembers: [
            { GitHubLogin: "pmconne" }
        ]
    }
]

export const iTwinDetails = {
    owner: 'iTwin',
    // Insure if you are assigning primaryRepo, it must present in repositories list.
    primaryRepo: 'community',
    repositories: ['community', 'itwinjs-core', 'iTwinUI']
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
