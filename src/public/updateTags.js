import request from "../utils/request.js";

export function updateTags({projectId, tags = []}) {
    return request({
        url: `https://gitblock.cn/WebApi/Projects/${projectId}/UpdateTags`,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': `https://gitblock.cn/Projects/${projectId}`,
        },
        data: new URLSearchParams(tags.map(t => ['tags', t]))
    })
}