export async function encryptData(data, password) {
    // Convert the password to a CryptoKey using the Web Crypto API
    const passwordBuffer = new TextEncoder().encode(password);
    const passwordKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey']);

    // Generate a salt and derive a key using PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 10000, // You can adjust the number of iterations as needed
            hash: 'SHA-256', // Use a strong hash function
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 }, // Use AES-GCM for symmetric encryption
        false,
        ['encrypt', 'decrypt']
    );

    // Convert the data to an ArrayBuffer
    const dataBuffer = new TextEncoder().encode(data);

    // Encrypt the data using AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        dataBuffer
    );

    // Convert the salt, IV, and encrypted data to Base64 strings
    const saltString = arrayBufferToBase64(salt);
    const ivString = arrayBufferToBase64(iv);
    const encryptedDataString = arrayBufferToBase64(new Uint8Array(encryptedData));

    return `${saltString}:${ivString}:${encryptedDataString}`;
}

export async function decryptData(encryptedDataString, password) {
    const [saltString, ivString, encryptedDataContent] = encryptedDataString.split(':');

    // Convert the Base64 strings back to ArrayBuffer
    const salt = base64ToArrayBuffer(saltString);
    const iv = base64ToArrayBuffer(ivString);
    const encryptedData = base64ToArrayBuffer(encryptedDataContent);

    // Convert the password to a CryptoKey
    const passwordBuffer = new TextEncoder().encode(password);
    const passwordKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey']);

    // Derive the key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 10000,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    // Decrypt the data using AES-GCM
    const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        encryptedData
    );

    // Convert the decrypted data to a string
    return new TextDecoder().decode(decryptedData);
}


// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    const binary = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...binary));
    return base64;
}

// Helper function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }
    return byteArray.buffer;
}
