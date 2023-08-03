import React, { useCallback } from 'react'
import { Button, Input, Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';
import { FilterModal } from './Filter/FilterModal';
import ExportToExcel from './ExportToExcel';
import './styles/HeaderComponent.scss'
import './styles/ExportToExcel.scss'
import { useState } from 'react';

function HeaderComponent({ filterKey, handleSearch, handleButtonClick, }) {

    const repoName = 'iTwin GitHub Query' //useSelector((state) => state.discussions.repositoryName);
    const lastUpdated = useSelector((state) => state.discussions.lastUpdated);
    const rateLimit = useSelector((state) => state.discussions.rateLimit)
    const discussionState = useSelector((state) => state.discussions);
    const sorting = useSelector((state) => state.discussions.sorting);
    const [selectedDateRange, setDateRange] = useState({
        isEnable: false,
        startDate: new Date(),
        endDate: new Date()
    })


    const downloadObjectAsJson = useCallback((objectData, filename) => {
        const jsonData = JSON.stringify(objectData, null, 2); // Convert object to formatted JSON string
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Clean up the URL and remove the anchor element
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, [])

    const createUserConfig = useCallback((state, selectedDateRange, sorting) => {
        const { filter, isDateRangeFilter, activeRepositories } = state;
        const userConfig = {
            isUserConfigEnable: true,
            userConfig: {
                filter: {
                    repositories: activeRepositories,
                    selectType: filter.typeFilterKey,
                    selectedDevelopers: filter.developerFilterKey,
                    selectInAll: filter.isSelectAllFilter,
                    dateRange: {
                        isEnable: isDateRangeFilter,
                        ...selectedDateRange
                    }
                },
                sorting
            }
        }

        downloadObjectAsJson(userConfig, 'userConfig.json')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className='header-main' >
            <div className='header-parent'>
                <Title className='header-title'>{repoName}</Title>
                <div className='header-child smart-search'>
                    <Button styleType='high-visibility' className='search-button'>Search</Button>
                    <Input className='search-input' placeholder='Ex. @col n: text' name={'inputFilter'} value={filterKey} onChange={(e) => handleSearch(e)} />
                </div>
                <div className='header-child refresh-button'><Button styleType={'cta'} onClick={() => handleButtonClick()}>Refresh</Button></div>
                <div className='header-child user-config-button'><Button styleType={''} onClick={() => createUserConfig(discussionState, selectedDateRange, sorting)}>User Config</Button></div>
                <div className='header-child filter-modal'><FilterModal setDateRangeForUserConfig={setDateRange} /></div>
                <div className='header-child download'><ExportToExcel /></div>
                <div className='header-child last-update'><>Last Updated: {new Date(lastUpdated).toLocaleString()}</></div>
                <div className='header-child remaining'><>Remaining Points: {rateLimit?.remaining}</></div>
                <div className='header-child reset-time'><>Reset Time: {new Date(rateLimit?.resetAt).toLocaleTimeString()}</></div>
            </div>
        </div>
    )
}

export default HeaderComponent