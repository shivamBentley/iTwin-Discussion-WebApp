import React, { useState } from 'react'
import { iTwinDetails } from './db/local-database';
import SuperMainContainer from './components/SuperMainContainer';

function App() {

    const [repoStatus, setRepoStatus] = useState(() => {
        const result = iTwinDetails.repositories.map((rep) => ({ status: 'informational', name: rep }))
        return (result);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [repositories, setRepositories] = useState(iTwinDetails.repositories);
    const [repositoriesData, setRepositoriesData] = useState([])

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

    return (<>
        {/* {JSON.stringify(repoStatus)} */}
        <SuperMainContainer
            removeRepoFromReposListAndUpdateITwindData={removeRepoFromReposListAndUpdateITwindData}
            repositories={repositories}
            repoStatus={repoStatus}
            setRepoStatus={setRepoStatus}
        />
    </>
    )
}

export default App