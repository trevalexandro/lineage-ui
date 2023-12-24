import { ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME, HTTP_OK_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE } from "../const";
import { AES, enc } from "crypto-js";
import { checkHttpStatus } from "./base-service";

export const authenticate = async (code) => {    
    const bodyJson = JSON.stringify({code});
    const res = await fetch(`${process.env.REACT_APP_BFF_URL}/accessToken`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: bodyJson
    });

    const data = await res.json();
    const accessToken = AES.encrypt(data.access_token, process.env.REACT_APP_AES_KEY);
    sessionStorage.setItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME, accessToken);
};

export const getRepos = async (pageNumber, pageCount = 30) => {
  const accessToken = getDecryptedToken();
  const res = accessToken ? await fetch(`${process.env.REACT_APP_BFF_URL}/repos?pageNumber=${pageNumber}&pageCount=${pageCount}`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`
      }
  }) : new Response(undefined, {status: HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE});
  
  return await checkHttpStatus(res);
};

export const getFile = async (repoFullName, filePath, omitContent = false) => {
    const accessToken = getDecryptedToken();
    const res = accessToken ? await fetch(`${process.env.REACT_APP_BFF_URL}/repos/${repoFullName}/${filePath}?omitContent=${omitContent}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }) : new Response (undefined, {status: HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE});

    return await checkHttpStatus(res);
};

export const searchRepos = async (pageNumber, searchTerm, pageCount = 30) => {
    const accessToken = getDecryptedToken();
    
    const res = await fetch(`${process.env.REACT_APP_BFF_URL}/search?pageNumber=${pageNumber}&pageCount=${pageCount}&query=${searchTerm}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return await checkHttpStatus(res);
};

export const isHealthy = async (healthCheckEndpoint) => {
    try {
        let res = await fetch(healthCheckEndpoint);

        if (res.status !== HTTP_OK_RESPONSE_STATUS_CODE) {
            res = await fetch(healthCheckEndpoint);
        }
        return res.status === HTTP_OK_RESPONSE_STATUS_CODE;
    } catch {
        return false;
    }
}

const getDecryptedToken = () => {
    const encryptedVal = sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME);
    if (encryptedVal == null) {
        return undefined;
    }

    const accessToken = AES.decrypt(encryptedVal, process.env.REACT_APP_AES_KEY).toString(enc.Utf8);
    return accessToken;
};