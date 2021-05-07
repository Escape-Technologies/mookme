export enum HookType {
    preCommit = "pre-commit",
    prepareCommit = "prepare-commit-msg",
    commitMsg = "commit-msg",
    postCommit = "post-commit",
}

export const hookTypes = Object.values(HookType)