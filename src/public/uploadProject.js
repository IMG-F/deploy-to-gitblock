import request from "../utils/request.js";

/**
 * 上传项目
 * @param projectId 项目ID
 * @param projectZip 项目压缩包 base64 文本, 包含 project.json 和封面 thumb.png
 */
export function uploadProject({
                                  projectId,
                                  projectZip
                              }) {
    return request({
        url: `https://gitblock.cn/WebApi/Projects/${projectId}/Upload`,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': `https://gitblock.cn/Projects/${projectId}/Editor`,
        },
        data: new URLSearchParams({
            file: projectZip,
            isRemix: false
        }),
    });
}