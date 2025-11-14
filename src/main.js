import unzipper from "unzipper";
import fs from "fs";
import archiver from "archiver";
import path from "path";
import {PassThrough} from "stream";
import {login} from "./public/login.js";
import {setGitblockAuth} from "./utils/secret.js";
import {uploadProject} from "./public/uploadProject.js";
import {uploadAssets} from "./public/uploadAssets.js";
import {updateTitle} from "./public/updateTitle.js";
import {updateTags} from "./public/updateTags.js";
import {updateDescp} from "./public/updateDescp.js";
import {publish} from "./public/publish.js";
import * as core from "@actions/core";


export function run() {
    return main({
        projectId: core.getInput("projectId"),
        sb3FilePath: core.getInput("sb3FilePath"),
        coverFilePath: core.getInput("coverFilePath"),
        title: core.getInput("title"),
        description: core.getInput("description"),
        tags: core.getInput("tags").split(",").map(tag => tag.trim()),
        username: core.getInput("username"),
        password: core.getInput("password")
    })
}

run().then(() => {
    console.log('Project publish completed successfully.');
}).catch(err => {
    console.error('Error during project publish: ', err);
    core.setFailed(err.message);
});

export function main({
                         projectId,
                         sb3FilePath,
                         coverFilePath,
                         title,
                         description,
                         tags,
                         username,
                         password
                     }) {
    return login({username, password})
        .then(({gitblockSessionId, gitblockAuth}) => {
            console.log("Login successful.");
            return setGitblockAuth({newSessionId: gitblockSessionId, newAuth: gitblockAuth});
        }).then(() => {
            console.log("Start upload sb3 file...");
            return uploadSb3File({projectId, sb3FilePath, coverFilePath})
        })
        .then(() => {
            console.log("Upload sb3 file completed. Start updating project info...");
            return Promise.all([
                updateTitle({projectId: projectId, title: title}),
                updateTags({projectId: projectId, tags: tags}),
                updateDescp({projectId: projectId, description: description})
            ]);
        })
        .then(() => {
            console.log("Project info updated. Start publishing project...");
            return publish({projectId: projectId});
        });
}

export async function uploadSb3File({projectId, sb3FilePath, coverFilePath}) {
    const directory = await unzipper.Open.file(sb3FilePath);

    const uploadPromises = [];
    for (const entry of directory.files) {
        if (entry.type === "Directory") continue;

        const filePath = entry.path;
        if (filePath.endsWith("project.json")) {
            const projectJsonBuffer = await entry.buffer();
            const coverBuffer = fs.createReadStream(coverFilePath);
            const archive = archiver("zip");

            archive.append(projectJsonBuffer, {name: "project.json"});
            archive.append(coverBuffer, {name: `thumb${path.extname(coverFilePath)}`});

            uploadPromises.push(
                uploadProject({
                    projectId: projectId,
                    projectZip: await createZipBase64(archive)
                })
            );
            console.log("Uploading project.json and cover as zip...");
        } else {
            uploadPromises.push(
                uploadAssets({
                    assetName: path.basename(filePath),
                    file: await entry.stream()
                })
            );
            console.log("Uploading asset:", path.basename(filePath));
        }
    }

    return Promise.all(uploadPromises);
}

function createZipBase64(archive) {
    return new Promise((resolve, reject) => {
        const stream = new PassThrough();
        const chunks = [];

        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const base64 = buffer.toString('base64');
            resolve(base64);
        });
        stream.on('error', reject);
        archive.on('error', reject);

        archive.pipe(stream);

        archive.finalize();
    });
}