# Getting Started with iTwin-Discussion-WebApp

This App is designed to Analyze Discussion Data on Github Account. 

## Setup with Tech Stack

### Prerequisite
1. [Node.js](https://nodejs.org/en)
2. [git](https://git-scm.com/)

### Clone the Repository
Clone the Repository from here: [https://github.com/shivamBentley/iTwin-Discussion-WebApp](https://github.com/shivamBentley/iTwin-Discussion-WebApp).

### Install dependencies
To install packages or dependencies use the npm command: [npm install](https://docs.npmjs.com/cli/v8/commands/npm-install). If you get errors while installing dependencies follow steps - 

    STEP 1: Delete packgae-lock.json from repository if available.
    STEP 2: Run Command : npm install --force  

## Setting up with files

There two file to setup 

### Config.js ( /src/db/Config.js)

1. ACCESS_TOKEN:

    if you don't have github access token create new access token by following below steps.
        
        You can create an access token from here link - https://github.com/settings/tokens

                 OR
    
        Go to : https://github.com
        step 1 : login
        step 2 : setting > developer setting > personal access token > Token(classic). You can choose (Fine grained token) also. 
        step 3 : Generate new Token OR Generate new token (classic)
        step 4 : Please copy token, you won't be able to see this generated token again.
        step 5 : Paste copied token below at line 15. 

    ``` js
        ACCESS_TOKEN: "ghp_3S1gvYbnEaJc2vmP934RVEf92A0YVW3DKcVD", // this is sample token not valid token.
    ``` 

2.  TIME_TO_REFRESH_DATA:

     This ensure if data is older than this much time when you refresh the page it will automatically download latest data and save in local storage.Default time is 60 Minute. 
    ``` js
         TIME_TO_REFRESH_DATA: 15, //it's number in minute
    ```
    
3. AUTO_REFRESH:
 
   it is use to enable/disable the auto refresh data.
    ``` js
        AUTO_REFRESH: true, // enable auto refreshing 
        AUTO_REFRESH: false, // disable auto refresing
    ```

4. DATA_DOWNLOAD_DATE_RANGE:
    
    it is use to download data in with a date range, if you are running this Application first time or you have cleared you local-storage ( cache ). by setting this filed you will be able to download fresh date within a date range.
    ``` js
        DATA_DOWNLOAD_DATE_RANGE: {
            STATUS: false,
            DATE_RANGE: {
            START_DATE: "2022-11-24",
            END_DATE: "2024-08-03"
            }
        },

    // NOTE: Data will be downloaded if only STATUS: true else it will download all data, and may take bit longer time.
    ```
   

5. FIND_MATCH:

   it is use to enable/disable intellisense for finding similar query by comparing specific tags included in query.
     ``` js
        FIND_MATCH: true, // enable intellisense and provide a match button in each query.
        FIND_MATCH: false, // disable intellisense and remove match button in each query.   
    ``` 
### local-databases.js ( /src/db/local-database.js)

1. iTwinDetails : This contain the information about the github account ( owner & repositories ) names for which you want to Analyze the discussion data.

    A. owner: It's owner id 

        step 1: Go to anyone's github profile page.
        step 2: copy name from URL.   
        
        Example - [https://github.com/iTwin](https://github.com/iTwin) This is iTwin github account. Name after (https://github.com/) is iTwin that is owner. 
    B. primaryRepo : select a repos from repositories and make on of them primaryRepo

    C. repositories: It is array container repositories names.

    ``` js
        iTwinDetails = {
            owner: 'iTwin',
            primaryRepo: 'community',
            repositories: ['community', 'itwinjs-core', 'iTwinUI']
        }
        // Note : Insure if you are assigning primaryRepo, it must present in repositories list.

    ```


2. Teams : This is used to select multiple developer to Analyze discussion data. This will help to create group by giving name and by giving GitHubLogin id's.

    
``` js 
    Teams = [
            {
                teamName: 'Team 1',
                teamMembers: [
                    { GitHubLogin: "pratikshan85" },
                    { GitHubLogin: "NancyMcCallB" }
                ]
            },
            {
                teamName: 'Team 2',
                teamMembers: [
                    { GitHubLogin: "neuralmax" }
                ]
            }
        ]
```

## Run Application

Use [npm start](https://create-react-app.dev/docs/getting-started/#scripts) to run the project.

# Errors & Suggestion


```diff
! Please clean 'iTwinDatta' from Local Storage if you have already used this webapp previously.

     follow steps to clean Local Storage data from browser.

        STEP 1: Open dev tool > Application > Local Stroage > http://localhost:3000/
        STEP 2: search key 'iTwinData'
        STEP 3: if iTwinData key is present > right click on it and delete the iTwinData key.
```
