import request from "../utils/request.js";

export function updateTitle({
                                projectId,
                                title
                            }) {
    return request({
        url: `https://gitblock.cn/WebApi/Projects/${projectId}/updateTitle`,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': `https://gitblock.cn/Projects/${projectId}`,
        },
        data: new URLSearchParams({
            title: title
        })
    })
}