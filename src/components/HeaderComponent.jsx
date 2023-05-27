import React from 'react'
import { Title } from '@itwin/itwinui-react';
import { useSelector } from 'react-redux';

function HeaderComponent({ title }) {

    const repoName = useSelector((state) => state.discussions.repositoryName)
    return (
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
    )
}

export default HeaderComponent