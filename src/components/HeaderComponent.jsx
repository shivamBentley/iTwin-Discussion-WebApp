import React from 'react'
import {  Input, Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';
import { FilterModal } from './Filter/FilterModal';
import ExportToExcel from './ExportToExcel';
import './styles/HeaderComponent.scss'
import './styles/ExportToExcel.scss'

function HeaderComponent({ filterKey, handleSearch }) {

    const repoName = useSelector((state) => state.discussions.repositoryName);
    const lastUpdated = useSelector((state) => state.discussions.lastUpdated);
    const rateLimit = useSelector((state) => state.discussions.rateLimit)

    return (
        <div className='header-main' >
            <div className='header-parent'>
                <Title className='header-title'>{repoName.charAt(0).toUpperCase() + repoName.slice(1)}</Title>
                <div className='header-child smart-search'>
                    <div size='small' className='search-button'>Search</div>
                    <Input className='search-input' size="small" placeholder='Ex. @col n: text' name={'inputFilter'} value={filterKey} onChange={(e) => handleSearch(e)} />
                </div>
                <div className='header-child filter-modal'><FilterModal /></div>
                <div className='header-child download'><ExportToExcel /></div>
                <div className='header-child last-update'><>Last Updated: {new Date(lastUpdated).toLocaleString()}</></div>
                <div className='header-child remaining'><>Remaining Points: {rateLimit.remaining}</></div>
                <div className='header-child reset-time'><>Reset Time: {new Date(rateLimit.resetAt).toLocaleString().substr(9, 12)}</></div>
            </div>
        </div>
    )
}

export default HeaderComponent