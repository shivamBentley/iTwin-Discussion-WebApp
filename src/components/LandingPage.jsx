import { Button, Header, Headline, Input, Label, ProgressLinear, ToggleSwitch } from '@itwin/itwinui-react';
import bcrypt from 'bcryptjs';
import React from 'react'
import { useState } from 'react';
import { validateToken } from '../helper/GitHubAPIs';
import { decryptData } from '../helper/encryption';

function LandingPage({ setMainPageAccess }) {
    
    const ENC_ACCESS_TOKEN = ''
    const ENC_USERNAME = ''
    const ENC_PASSWORD = ''

    const [token, setToken] = useState('');
    const [loginStatus, setLogin] = useState(false);
    const [loginDetails, setLoginDetails] = useState({
        username: '',
        password: ''
    });
    const [isError, setError] = useState(false);
    const [isLoginError, setLoginError] = useState(false);
    const [isLoading, setLoading] = useState(false);



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
                    height: '90vh',
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
                            <Label for={"password"}>Username</Label>
                            <Input
                                name="username"
                                type="text"
                                value={loginDetails.username}
                                placeholder='Enter username'
                                onChange={(e) => { setLoginError(false); setLoginDetails({ ...loginDetails, username: e.target.value }) }}
                                style={{ margin: '0 0 20px 0' }}

                            ></Input>
                            <Label for={"password"}>Password</Label>
                            <Input
                                name="password"
                                type='password'
                                value={loginDetails.password}
                                placeholder='Enter password'
                                onChange={(e) => { setLoginError(false); setLoginDetails({ ...loginDetails, password: e.target.value }) }}
                                style={{ margin: '0 0 20px 0' }}

                            ></Input>
                            <Button
                                styleType='high-visibility'
                                onClick={async () => {
                                    setLoading(true);
                                    const matchUsername = await bcrypt.compare(loginDetails.username, ENC_USERNAME);

                                    if (matchUsername) {
                                        const matchPassword = await bcrypt.compare(loginDetails.password, ENC_PASSWORD);
                                        if (matchPassword) {
                                            // set userToken
                                            console.log('successfully loggedIn')
                                            // decrypt token to save ...
                                            decryptData(ENC_ACCESS_TOKEN, loginDetails.username + loginDetails.password).then(decryptedData => {
                                                localStorage.setItem('gitAccessToken', JSON.stringify(decryptedData));
                                            })
                                            const checkTokeUpdated = setInterval(() => {
                                                const currGitHubAccessToken = JSON.parse(localStorage.getItem('gitAccessToken'));
                                                if (currGitHubAccessToken) {
                                                    setMainPageAccess(true)
                                                    setLoading(false);
                                                    clearInterval(checkTokeUpdated);
                                                }
                                            }, 500);
                                        }
                                        else {
                                            setLoginError(true)
                                            setLoading(false);
                                        }
                                    } else {
                                        setLoginError(true)
                                        setLoading(false);
                                    }
                                }}>Login</Button>
                            {isLoginError && <p style={{ color: 'red', fontWeight: '600' }}>Incorrect username or password</p>}
                            {isLoading && <div style={{ margin: '32px 0' }}> <ProgressLinear indeterminate /> Validating username & password</div>}
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