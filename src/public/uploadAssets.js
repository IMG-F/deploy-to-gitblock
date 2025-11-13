import request from "../utils/request.js";

export function uploadAssets({
                                 assetName,
                                 file
                             }) {
    return request({
        url: `https://asset.gitblock.cn/Project/UploadAsset?name=${assetName}`,
        method: "POST",
        headers: {
            'Referer': `https://gitblock.cn/`,
            'Priority': 'u=0',
        },
        data: file,
        needAuth: false
    });
}