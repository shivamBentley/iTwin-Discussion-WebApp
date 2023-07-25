import React from 'react'
import { Button, Input, Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';
import { FilterModal } from './Filter/FilterModal';
import ExportToExcel from './ExportToExcel';
import './styles/HeaderComponent.scss'
import './styles/ExportToExcel.scss'

function HeaderComponent({ filterKey, handleSearch, handleButtonClick }) {

    const repoName = useSelector((state) => state.discussions.repositoryName);
    const lastUpdated = useSelector((state) => state.discussions.lastUpdated);
    const rateLimit = useSelector((state) => state.discussions.rateLimit)

    return (
        <div className='header-main' >
            <div className='header-parent'>
                <Title className='header-title'>{repoName.charAt(0).toUpperCase() + repoName.slice(1)}</Title>
                <div className='header-child smart-search'>
                    <Button styleType='high-visibility' className='search-button'>Search</Button>
                    <Input className='search-input' placeholder='Ex. @col n: text' name={'inputFilter'} value={filterKey} onChange={(e) => handleSearch(e)} />
                </div>
                <div className='header-child refresh-button'><Button styleType={'cta'} onClick={() => handleButtonClick()}>Refresh</Button></div>
                <div className='header-child filter-modal'><FilterModal /></div>
                <div className='header-child download'><ExportToExcel /></div>
                <div className='header-child last-update'><>Last Updated: {new Date(lastUpdated).toLocaleString()}</></div>
                <div className='header-child remaining'><>Remaining Points: {rateLimit?.remaining}</></div>
                <div className='header-child reset-time'><>Reset Time: {new Date(rateLimit?.resetAt).toLocaleTimeString()}</></div>
            </div>
        </div>
    )
}

export default HeaderComponent