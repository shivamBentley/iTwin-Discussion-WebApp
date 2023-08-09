import React, { useEffect, useState } from 'react'
import { iTwinDetails } from './db/local-database';
import SuperMainContainer from './components/SuperMainContainer';
import { createWordDictionary } from './helper/TrieClass';
import { createDictionaryOfTagsWithDeveloperListAndAddTags } from './helper/TrieClass';
import LandingPage from './components/LandingPage';

function App() {

    const [repoStatus, setRepoStatus] = useState(() => {
        const result = iTwinDetails.repositories.map((rep) => ({ status: 'informational', name: rep }))
        return (result);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [repositories, setRepositories] = useState(iTwinDetails.repositories);
    const [repositoriesData, setRepositoriesData] = useState([])
    const [mainPageAccess, setMainPageAccess] = useState(false);

    const removeRepoFromReposListAndUpdateITwindData = (repoName, repoData) => {
        const newRepoList = repositories.filter((rep) => rep !== repoName);
        setRepositories(newRepoList);

        const newRepoStatus = repoStatus.map((rep) => {
            if (rep.name === repoName) return { name: `${rep.name} downloaded successfully`, status: 'positive' }
            else return rep;
        })
        setRepoStatus(newRepoStatus);

        //updating localStorage data
        const newRepositoriesData = [...repositoriesData];
        newRepositoriesData.push(repoData)
        setRepositoriesData(newRepositoriesData);
        const currentTime = new Date().getTime();
        const newITwinData = {
            owner: iTwinDetails.owner,
            repositories: newRepositoriesData,
            lastUpdate: currentTime
        }
        if (repositories.length === 1)
            localStorage.setItem('iTwinData', JSON.stringify(newITwinData));
    }

    useEffect(() => {
        const currGitHubAccessToken = JSON.parse(localStorage.getItem('gitAccessToken'));

        if (currGitHubAccessToken) {
            //creating Word Dictionary
            createWordDictionary()
            setMainPageAccess(true)

            const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
            if (iTwinData) {
                iTwinData.repositories.forEach(repo => createDictionaryOfTagsWithDeveloperListAndAddTags(repo.discussionData));
            }
        }

    }, [mainPageAccess])


    return (
        <>
            {!mainPageAccess ?
                <LandingPage setMainPageAccess={setMainPageAccess} /> :
                <SuperMainContainer
                    removeRepoFromReposListAndUpdateITwindData={removeRepoFromReposListAndUpdateITwindData}
                    repositories={repositories}
                    repoStatus={repoStatus}
                    setRepoStatus={setRepoStatus}
                />}
        </>
    )
}

export default App