import React from 'react'
import { Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';
import { FilterModal } from './Filter/FilterModal';
import ExportToExcel from './ExportToExcel';
import './styles/ExportToExcel.scss'

function HeaderComponent({ title }) {

    const repoName = useSelector((state) => state.discussions.repositoryName);
    const lastUpdated = useSelector((state) => state.discussions.lastUpdated);
    const rateLimit = useSelector((state) => state.discussions.rateLimit)
    return (
        <div style={{ position: 'relative', height: '100%' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: 'lightgray',
                padding: '10px 0 0 0'
            }}>

                <Title style={{ fontSize: '2rem', fontWeight: '400' }}>{repoName}</Title>

                <div style={{ position: 'absolute', bottom: '10px', right: '100px' }}>
                    <FilterModal />
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                    <ExportToExcel />
                </div>
                <div style={{ 
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    border: '1px solid white',
                    borderRadius: '3px',
                    padding: '1px 10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    backgroundColor: 'green',
                    color: '#d8fafa'
                    }}>
                    <>{new Date(lastUpdated).toLocaleString()}</>
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    border: '1px solid white',
                    borderRadius: '3px',
                    padding: '1px 10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    backgroundColor: 'red',
                    color: '#d8fafa'
                }}>
                    <>Remaining Points: {rateLimit.remaining}</>
                </div>
            </div>
        </div>
    )
}

export default HeaderComponent