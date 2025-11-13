let gitblockSessionId = "";
let gitblockAuth = "";

export function setGitblockAuth({newSessionId, newAuth}) {
    gitblockSessionId = newSessionId;
    gitblockAuth = newAuth;
}

export function getGitblockAuth() {
    return { gitblockSessionId, gitblockAuth };
}