# `commitlint`

*This guide will help you in the setup of a hook a hook for linting your commits with [https://github.com/conventional-changelog/commitlint](commitlint)*

## Prerequisite

- You have installed `mookme`
- You have installed and configured [commitlint](https://github.com/conventional-changelog/commitlint)
- You have setup `mookme` using `mookme init` (see [get started](../../README.md) if needed)

## Hook

- In the global hooks folder of your project `<project-root>/.hooks/commit-msg` add the following configuration :

```js
{
    "steps": [
    // ...
    // your other steps
    {
        "name": "commit lint",
        "command": "cat {args} | ./node_modules/@commitlint/cli/cli.js"
    }
    // ...
    // your other steps
    ]
}
```
