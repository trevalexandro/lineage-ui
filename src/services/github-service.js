import { ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME, HTTP_OK_RESPONSE_STATUS_CODE, HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE } from "../const";
import { AES, enc } from "crypto-js";

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

export const getFile = async (owner, repoName, filePath) => {
    const accessToken = getDecryptedToken();
    const res = accessToken ? await fetch(`${process.env.REACT_APP_BFF_URL}/repos/${owner}/${repoName}/${filePath}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }) : new Response (undefined, {status: HTTP_UNAUTHORIZED_RESPONSE_STATUS_CODE});

    return await checkHttpStatus(res);
};

/*export const searchRepos = async (pageNumber, searchTerm, pageCount = 30) => {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME);
    
    const res = await fetch(`https://api.github.com/user/repos?page=${pageNumber}&q=${searchTerm}&per_page=${pageCount}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    return await checkAuthorization(res);
};*/

const checkHttpStatus = async (res) => {
    if (res.status !== HTTP_OK_RESPONSE_STATUS_CODE) {
        const {status} = res;
        return {status};
    }

    const data = await res.json();
    return data;
};

const getDecryptedToken = () => {
    const encryptedVal = sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME);
    if (encryptedVal == null) {
        return undefined;
    }

    const accessToken = AES.decrypt(encryptedVal, process.env.REACT_APP_AES_KEY).toString(enc.Utf8);
    return accessToken;
};