import { Button, Headline, Input, Label, ProgressLinear, Tooltip } from '@itwin/itwinui-react'
import React, { useCallback, useState } from 'react'
import { encryptData, decryptData } from '../helper/encryption.js'
import bcrypt from 'bcryptjs';

function EncryptDecrypt() {

    const [loginDetails, setLoginDetails] = useState({
        username: '',
        password: '',
        gitHubToken: ''
    });

    const [logPassVal, setLogpassVal] = useState({
        username: '',
        password: '',
    })
    const [hashedUserAndPass, setHashedLogPassVal] = useState(null)
    const [isLoading, setLoading] = useState(false);

    const hashLogAndPass = async (logPassVal) => {
        const { username, password } = logPassVal;


        try {
            setLoading(true);
            const passSalt = await bcrypt.genSalt(15);
            const hashedPassword = await bcrypt.hash(password, passSalt);
            const usernameSalt = await bcrypt.genSalt(15);
            const hashedUsername = await bcrypt.hash(username, usernameSalt);
            setHashedLogPassVal({ ENC_USERNAME: hashedUsername, ENC_PASSWORD: hashedPassword })
            setLoading(false);
        } catch (error) {
            throw error;
        }
    }

    const [encryptedToken, setEncryptedToken] = useState(null)

    const copyToClipboard = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Text copied to clipboard');
        } catch (err) {
            console.error('Unable to copy text: ', err);
        } finally {
            document.body.removeChild(textarea);
        }
    }

    const encryptToken = useCallback((loginDetails) => {
        const { gitHubToken, username, password } = loginDetails;
        if (gitHubToken.length === 0) {
            alert("Please enter your token")
            return;
        }
        else if (username.length === 0) {
            alert("Username can't be empty")
        }
        else if (password.length < 8) {
            alert("Please enter at least 8 character password")
        }
        encryptData(gitHubToken, username + password).then(encryptedData => {
            console.log('Encrypted Data:', encryptedData);
            setEncryptedToken(encryptedData)
            return decryptData(encryptedData, username + password);
        })
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'row', margin: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', margin: '8px', padding: '16px', backgroundColor: 'lightcyan', width: '60vw' }}>
                <Headline> PBKDF2 Encryption - Password-Based Key Derivation Function </Headline>
                <div style={{ maxWidth: '50vw' }}>
                    <Label for={"password"}>GitHub Token</Label>
                    <Input
                        placeholder='Enter your github token to encrypt'
                        name={'gitHubToken'}
                        style={{ margin: '0 0 20px 0' }}
                        onChange={(e) => { setLoginDetails({ ...loginDetails, gitHubToken: e.target.value }) }} />
                </div>
                <div style={{ maxWidth: '30vw' }}>
                    <Label for={"password"}>Username</Label>
                    <Input
                        name="username"
                        type="text"
                        value={loginDetails.username}
                        placeholder='Enter username'
                        onChange={(e) => { setLoginDetails({ ...loginDetails, username: e.target.value }) }}
                        style={{ margin: '0 0 20px 0' }}

                    ></Input>
                    <Label for={"password"}>Password</Label>
                    <Input
                        name="password"
                        type='password'
                        value={loginDetails.password}
                        placeholder='Enter password'
                        onChange={(e) => { setLoginDetails({ ...loginDetails, password: e.target.value }) }}
                        style={{ margin: '0 0 20px 0' }}

                    ></Input>

                    <Button styleType='high-visibility' onClick={() => encryptToken(loginDetails)}> Encrypt</Button>
                </div>
                {encryptedToken &&
                    <div style={{ marginTop: '64px' }}>
                        <Headline style={{ fontSize: '25px' }}> Your encrypted token</Headline>

                        <Tooltip content="Click to copy in clipboard" placement='bottom'>
                            <strong style={{ cursor: 'pointer', color: 'green' }} onClick={(e) => {
                                copyToClipboard(e.target.outerText)
                            }}>{encryptedToken} </strong>
                        </Tooltip>
                    </div>}

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', margin: '8px', padding: '16px', backgroundColor: 'lightcyan', width: '35vw' }}>
                <Headline> Hash Username & Password </Headline>

                <div style={{ maxWidth: '30vw' }}>
                    <Label for={"password"}>Username</Label>
                    <Input
                        name="username"
                        type="text"
                        value={logPassVal.username}
                        placeholder='Enter username'
                        onChange={(e) => { setLogpassVal({ ...logPassVal, username: e.target.value }) }}
                        style={{ margin: '0 0 20px 0' }}

                    ></Input>
                    <Label for={"password"}>Password</Label>
                    <Input
                        name="password"
                        type='password'
                        value={logPassVal.password}
                        placeholder='Enter password'
                        onChange={(e) => { setLogpassVal({ ...logPassVal, password: e.target.value }) }}
                        style={{ margin: '0 0 20px 0' }}

                    ></Input>

                    <Button styleType='high-visibility' onClick={() => hashLogAndPass(logPassVal)}> Hash</Button>
                </div>
                {isLoading && <div style={{ margin:'64px'}}>
                    <ProgressLinear indeterminate />
                    Hashing your data is in process please wait...</div>}
                {!isLoading && hashedUserAndPass &&
                    <div style={{ marginTop: '32px' }}>
                        <Headline style={{ fontSize: '25px' }}> Your hashed data</Headline>

                        <Label> Hashed username</Label>
                        <Tooltip content="Click to copy in clipboard" placement='bottom'>
                            <strong style={{ cursor: 'pointer', color: 'green' }} onClick={(e) => {
                                copyToClipboard(e.target.outerText)
                            }}> {hashedUserAndPass.ENC_USERNAME}</strong>
                        </Tooltip>
                        <br />
                        <Label style={{ marginTop: '16px' }}> Hashed password</Label>
                        <Tooltip content="Click to copy in clipboard" placement='bottom'>
                            <strong style={{ cursor: 'pointer', color: 'green' }} onClick={(e) => {
                                copyToClipboard(e.target.outerText)
                            }}>{hashedUserAndPass.ENC_PASSWORD}</strong>
                        </Tooltip>
                    </div>}

            </div>

        </div>
    )
}

export default EncryptDecrypt

