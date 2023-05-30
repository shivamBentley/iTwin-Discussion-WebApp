import React from 'react'
import { Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';
import { FilterModal } from './Filter/FilterModal';
import ExportToExcel from './ExportToExcel';
import './styles/ExportToExcel.scss'

function HeaderComponent({ title }) {

    const repoName = useSelector((state) => state.discussions.repositoryName)
    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '8vh',
                backgroundColor: 'lightgray',
                padding: '10px 0 0 0'
            }}>
                <div>
                    <Title>{repoName}</Title>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: '10px', right: '100px' }}>
                <FilterModal />
            </div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <ExportToExcel />
            </div>
        </div>
    )
}

export default HeaderComponent