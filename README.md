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
1. ACCESS_TOKEN:  Set access token. 
    
    if you don't have github access token create new access token by following below steps.
        
        You can create an access token from here link - https://github.com/settings/tokens

                 OR
    
        Go to : https://github.com
        step 1 : login
        step 2 : setting > developer setting > personal access token > Token(classic). You can choose (Fine grained token) also. 
        step 3 : Generate new Token OR Generate new token (classic)
        step 4 : Please copy token, you won't be able to see this generated token again.
        step 5 : Paste copied token below at line 15. 

2. TIME_TO_REFRESH_DATA: TIME_TO_REFRESH_DATA is a number in minute 
    
    This ensure if data is older than this much time when you refresh the page it will automatically download latest data and save in local storage.
    Default time is 60 Minute. 
    
3. AUTO_REFRESH:
 
   it is use to enable/disable the auto refresh data.
   
               AUTO_REFRESH: true - enable auto refreshing 
               AUTO_REFRESH: false - disable auto refresing

### local-databases.js ( /src/db/local-database.js)

1. iTwinDetails : This contain the information about the github account ( owner & repositories ) names for which you want to Analyze the discussion data.
owner: It's owner id 

   step 1: Go to anyone's github profile page. 
   
   step 2: copy name from URL. 
   
   Example - [https://github.com/iTwin](https://github.com/iTwin) This is iTwin github account. Name after (https://github.com/) is iTwin that is owner. 

repositories: It is array container repositories names.

    Example : 
        iTwinDetails = {
          primaryRepo: 'community',
          repositories: ['community', 'itwinjs-core', 'iTwinUI']
        }


2. Teams : This is used to select multiple developer to Analyze discussion data. This will help to create group by giving name and by giving GitHubLogin id's.

    Example:

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


## Run Application

Use [npm start](https://create-react-app.dev/docs/getting-started/#scripts) to run the project.

# Errors & Suggestion

## Note 
```diff
! Please clean 'iTwinDatta' from Local Storage if you have already used this webapp previously.

     follow steps to clean Local Storage data from browser.

        STEP 1: Open dev tool > Application > Local Stroage > http://localhost:3000/
        STEP 2: search key 'iTwinData'
        STEP 3: if iTwinData key is present > right click on it and delete the iTwinData key.
```
