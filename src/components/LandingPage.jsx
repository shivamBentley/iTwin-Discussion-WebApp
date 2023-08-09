import { Button, Header, Headline, Input, Label, ToggleSwitch } from '@itwin/itwinui-react';
import bcrypt from 'bcryptjs';
import React from 'react'
import { useState } from 'react';
import { validateToken } from '../helper/GitHubAPIs';

function LandingPage({ setMainPageAccess }) {

    const [token, setToken] = useState('');
    const [loginStatus, setLogin] = useState(false);
    const [loginDetails, setLoginDetails] = useState({
        username: '',
        password: ''
    });
    const [isError, setError] = useState(false);
    const [isLoginError, setLoginError] = useState(false)

    return (
        <div style={{
            height: "100vh",
            backgroundColor: 'lightcyan'
        }}>
            <div style={{ position: 'absolute', right: '40px', top: '40px', display: 'flex' }}>
                <Label style={{ fontSize: '1.2rem', fontWeight: 400, marginRight: '5px' }}>Enable Login</Label>
                <ToggleSwitch checked={loginStatus} onChange={() => {
                    setLogin(!loginStatus)
                }} />

            </div>
            <div  >
                <div style={{
                    // backgroundColor: 'lightcyan',
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Headline >Welcome to iTwin GitHub Query Analyzer</Headline>
                    {!loginStatus ?
                        <>
                            <div style={{
                                display: 'flex',
                                width: '50%',
                                marginTop: '30px'
                            }}>
                                <Input
                                    name="gitHubPersonalToken"
                                    value={token}
                                    placeholder='Enter you GitHub Personal Token'
                                    onChange={(e) => {
                                        setError(false)
                                        setToken(e.target.value)
                                    }}
                                    width='50px'

                                ></Input>
                                <Button
                                    styleType='high-visibility'
                                    onClick={async () => {
                                        // validate token 
                                        await validateToken(token).then((res) => {
                                            console.log(res)
                                            if (res.data) {
                                                localStorage.setItem('gitAccessToken', JSON.stringify(token));
                                                const checkTokeUpdated = setInterval(() => {
                                                    const currGitHubAccessToken = JSON.parse(localStorage.getItem('gitAccessToken'));
                                                    if (currGitHubAccessToken) {
                                                        setMainPageAccess(true)
                                                        clearInterval(checkTokeUpdated);
                                                    }
                                                }, 500);
                                            } else {
                                                setError(true)
                                            }
                                        })


                                    }}>Submit Token</Button>
                            </div>
                            {isError && <p style={{ color: 'red', fontWeight: '600' }}>Either token is not <strong>Valid</strong> or <strong>Expired</strong></p>}
                        </> : <div style={{ display: 'flex', flexDirection: 'column', width: '20vw', }}>
                            <Input
                                name="username"
                                type="text"
                                value={loginDetails.username}
                                placeholder='Enter username'
                                onChange={(e) => { setLoginError(false); setLoginDetails({ ...loginDetails, username: e.target.value }) }}
                                style={{ margin: '20px 0 0 0' }}

                            ></Input>
                            <Input
                                name="password"
                                type='password'
                                value={loginDetails.password}
                                placeholder='Enter password'
                                onChange={(e) => { setLoginError(false); setLoginDetails({ ...loginDetails, password: e.target.value }) }}
                                style={{ margin: '20px 0' }}

                            ></Input>
                            <Button
                                styleType='high-visibility'
                                onClick={async () => {
                                    // check username and password 
                                    const USERNAME = process.env.REACT_APP_USERNAME?.replace(/_/g, '$')
                                    const matchUsername = await bcrypt.compare(loginDetails.username, USERNAME);

                                    if (matchUsername) {
                                        // if username match, check password
                                        const PASSWORD = process.env.REACT_APP_PASSWORD?.replace(/_/g, '$')

                                        const matchPassword = await bcrypt.compare(loginDetails.password, PASSWORD);
                                        if (matchPassword) {
                                            // set userToken
                                            console.log('successfully loggedIn')
                                            localStorage.setItem('gitAccessToken', JSON.stringify(process.env.REACT_APP_ACCESS_TOKEN));
                                            const checkTokeUpdated = setInterval(() => {
                                                const currGitHubAccessToken = JSON.parse(localStorage.getItem('gitAccessToken'));
                                                if (currGitHubAccessToken) {
                                                    setMainPageAccess(true)
                                                    clearInterval(checkTokeUpdated);
                                                }
                                            }, 500);
                                        }
                                        else {
                                            setLoginError(true)
                                        }
                                    } else {
                                        setLoginError(true)
                                    }
                                }}>Login</Button>
                            {isLoginError && <p style={{ color: 'red', fontWeight: '600' }}>Incorrect username or password</p>}
                        </div>
                    }
                </div>
            </div>
            <div>
                {!loginStatus && <Header>
                    <strong style={{ color: 'brown' }}>Follow steps to generate token <span>&#187;</span></strong>
                    <span style={{ margin: '20px' }}><strong>STEP 1: </strong>GoTo This Page <strong><a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">Generate Token</a></strong></span>
                    <span style={{ margin: '20px' }}><strong>STEP 2: </strong>Set Note & Expiration date</span>
                    <span style={{ margin: '20px' }}><strong>STEP 3: </strong>Click on <strong>Generate Button</strong> & copy token and submit.</span>
                </Header>}
            </div>
        </div >
    )
}

export default LandingPage