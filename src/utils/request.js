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
    return new Promise(async (resolve, reject) => {
        const {gitblockSessionId, gitblockAuth} = getGitblockAuth();
        if (needAuth) {
            if (!gitblockSessionId || !gitblockAuth) {
                return reject("no auth data!");
            }
            headers["Cookie"] = `gitblock-session-id=${gitblockSessionId}; gitblock-auth=${gitblockAuth}`;
        } else {
            headers["Cookie"] = '';
        }

        headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0';
        headers["Origin"] = 'https://gitblock.cn';

        axios({
            url: url,
            method: method,
            data: data,
            headers: headers,
            params: params,
        }).then(response => {
            const data = response?.data;
            if (data?.code && data?.code !== "200") {
                return reject(data?.message || "request error");
            }
            resolve(data);
        }).catch(error => {
            let message;
            if (error.response) {
                message = error.response.data.message || "request error";
            } else {
                message = error.message;
            }
            reject(message);
        })
    });
}