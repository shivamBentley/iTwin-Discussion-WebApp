export const Config = {
    /**
     * Your gitHub AccessToke
     * You can create an access token from here link - https://github.com/settings/tokens
     *                  OR
     * Go to : https://github.com
     *  step 1 : login
     *  step 2 : setting > developer setting > personal access token > Token(classic). You can choose (Fine grained token) also. 
     *  step 3 : Generate new Token OR Generate new token (classic)
     *  step 4 : Please copy token, you won't be able to see this generated token again.
     *  step 5 : Paste copied token below at line 15. 
     */

    ACCESS_TOKEN: "your token",

    /**
     * TIME_TO_REFRESH_DATA is a number in minute 
     * This ensure if data is older that this much time when you refresh the page it will automatically download latest data and save in local storage.
     * Default time is 60 Minute. 
     */
    TIME_TO_REFRESH_DATA: 60
}