import React, { useCallback } from 'react'
import { Button, DropdownButton, Input, MenuItem, Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';
import { FilterModal } from './Filter/FilterModal';
import ExportToExcel from './ExportToExcel';
import './styles/HeaderComponent.scss'
import './styles/ExportToExcel.scss'
import { useState } from 'react';
import userConfiguration from '../db/userConfig.json'
import { getLastNthMonthDate } from '../helper/util';
import { DateRangePicker } from './DateRangePicker';
import { ReportModel } from './ReportModel';

function HeaderComponent({ filterKey, handleSearch, handleButtonClick, }) {

    const repoName = 'iTwin GitHub Query' //useSelector((state) => state.discussions.repositoryName);
    const lastUpdated = useSelector((state) => state.discussions.lastUpdated);
    const rateLimit = useSelector((state) => state.discussions.rateLimit)
    const discussionState = useSelector((state) => state.discussions);
    const sorting = useSelector((state) => state.discussions.sorting);
    const [dateRangeToRefreshData, setDateRangeToRefreshData] = useState({
        START_DATE: new Date().toJSON().slice(0, 10),
        END_DATE: new Date().toJSON().slice(0, 10)
    })
    const [selectedDateRange, setDateRange] = useState(() => userConfiguration.userConfig ? userConfiguration.userConfig.filter.dateRange : {
        isEnable: false,
        startDate: new Date(),
        endDate: new Date()
    })
    const [showReport, ] = useState(false);

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

    // updating date range
    const onDateRangeChange = useCallback((startDate, endDate) => {
        const newDateRange = {
            START_DATE: startDate,
            END_DATE: endDate
        }
        setDateRangeToRefreshData(newDateRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const RefreshButionMenuItem = (close) => {
        return [
            <MenuItem size="small" key={0} onClick={() => {

            }}>
                <DateRangePicker
                    textVisible={true}
                    startD={new Date(dateRangeToRefreshData.START_DATE)}
                    endD={new Date(dateRangeToRefreshData.END_DATE)}
                    onChange={onDateRangeChange}
                    handleDownloadLatestData={() => {
                        handleButtonClick(dateRangeToRefreshData)
                        close();
                    }}
                />
            </MenuItem>,
            <MenuItem size="small" key={1} onClick={() => {
                let { START_DATE, END_DATE } = dateRangeToRefreshData;
                START_DATE = getLastNthMonthDate(3).toJSON().slice(0, 10);
                handleButtonClick({ START_DATE, END_DATE })
                close();
            }}>Last 3 Month</MenuItem>,
            <MenuItem size="small" key={2} onClick={() => {
                let { START_DATE, END_DATE } = dateRangeToRefreshData;
                START_DATE = getLastNthMonthDate(6).toJSON().slice(0, 10);
                handleButtonClick({ START_DATE, END_DATE })
                close();
            }}>Last 6 Month</MenuItem>,
            <MenuItem size="small" key={3} onClick={() => {
                let { START_DATE, END_DATE } = dateRangeToRefreshData;
                START_DATE = getLastNthMonthDate(12).toJSON().slice(0, 10);
                handleButtonClick({ START_DATE, END_DATE })
                close();
            }}>Last 1 Year</MenuItem>,
            <MenuItem size="small" key={4} onClick={() => {
                let { START_DATE, END_DATE } = dateRangeToRefreshData;
                START_DATE = new Date("2018-01-01").toJSON().slice(0, 10);
                handleButtonClick({ START_DATE, END_DATE })
                close();
            }}>All</MenuItem>

        ]
    }

    return (
        <div className='header-main' >
            <div className='header-parent'>
                <Title className='header-title'>{repoName}</Title>
                <div className='header-child smart-search'>
                    <Button styleType='high-visibility' className='search-button'>Search</Button>
                    <Input className='search-input' placeholder='Ex. @col n: text' name={'inputFilter'} value={filterKey} onChange={(e) => handleSearch(e)} />
                </div>
                <div className='header-child refresh-button'>
                    <DropdownButton styleType="ctx" menuItems={(close) => RefreshButionMenuItem(close)}>
                        Refresh
                    </DropdownButton>
                </div>
                <div className='header-child save-config-button'><Button styleType={''} onClick={() => createUserConfig(discussionState, selectedDateRange, sorting)}>Save Config</Button></div>
                <div className='header-child filter-modal'><FilterModal setDateRangeForUserConfig={setDateRange} /></div>
                <div className='header-child download'><ExportToExcel /></div>
                <div className='header-child last-update'><>Last Updated: {new Date(lastUpdated).toLocaleString()}</></div>
                <div className='header-child remaining'><>Remaining Points: {rateLimit?.remaining}</></div>
                <div className='header-child reset-time'><>Reset Time: {new Date(rateLimit?.resetAt).toLocaleTimeString()}</></div>
                <div className='header-child report'><> <ReportModel showReport={showReport} />  </></div>
            </div>
        </div>
    )
}

export default HeaderComponent