import { HTTP_OK_RESPONSE_STATUS_CODE } from "../const";

export const checkHttpStatus = async (res) => {
    if (res.status !== HTTP_OK_RESPONSE_STATUS_CODE) {
        const {status} = res;
        return {status};
    }
    
    const data = await res.json();
    return data;
};