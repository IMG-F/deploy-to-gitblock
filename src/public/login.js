import request from "../utils/request.js";
import CryptoJS from "crypto-js";

export function login({username, password}) {
    const securitySalt = "DUE$DEHFYE(" + "YRUEHD*&";
    const t = (new Date).getTime() + 2592000000 + 30000;
    const x = `/WebApi/Users/Login?username=${username}&password=${password}${securitySalt}&t=${t}`;
    const signature = CryptoJS.SHA1(x).toString();

    return request({
        url: 'https://gitblock.cn/WebApi/Users/Login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': 'https://gitblock.cn',
        },
        data: new URLSearchParams({
            username: username,
            password: password,
            t: t.toString(),
            s: signature
        }),
        needAuth: false
    }).then(res => {
        const cookies = res.response.headers['set-cookie'];
        let gitblockSessionId;
        let gitblockAuth;
        for (let cookie of cookies) {
            if (cookie.startsWith('gitblock-session-id=')) {
                gitblockSessionId = cookie.split(';')[0].split('=')[1];
            } else if (cookie.startsWith('gitblock-auth=')) {
                gitblockAuth = cookie.split(';')[0].split('=')[1];
            }
        }
        return {
            gitblockSessionId,
            gitblockAuth
        };
    })
}