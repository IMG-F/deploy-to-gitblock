import axios from "axios";
import {getGitblockAuth} from "./secret.js";

export default function ({
                             url,
                             method,
                             data,
                             headers = {},
                             params = {},
                             needAuth = true
                         }) {
    const {gitblockSessionId, gitblockAuth} = getGitblockAuth();
    if (needAuth) {
        if (!gitblockSessionId || !gitblockAuth) {
            throw new Error("no auth data!");
        }
        headers["Cookie"] = `gitblock-session-id=${gitblockSessionId}; gitblock-auth=${gitblockAuth}`;
    } else {
        headers["Cookie"] = '';
    }

    headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0';
    headers["Origin"] = 'https://gitblock.cn';
    return axios({
        url: url,
        method: method,
        data: data,
        headers: headers,
        params: params,
    }).then(response => {
        const data = response?.data;
        if (data?.code && data?.code !== "200") {
            throw new Error(data.message || "request error");
        }
        return {data, response};
    });
}