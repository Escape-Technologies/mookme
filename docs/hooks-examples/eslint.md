# `commitlint`

*This guide will help you in the setup of a hook for linting your code with [https://eslint.org/](eslint)*

## Prerequisite

- You have installed `mookme`
- You have installed and configured [eslint](https://eslint.org/)
- You have setup `mookme` using `mookme init` (see [get started](../../README.md) if needed)

## Hook

- In the hooks folder of the package you want to lint with `eslint` `<project-root>/<package>/.hooks/commit-msg` add the following configuration :

```js
{
    "steps": [
    // ...
    // your other steps
    {
        "name": "eslint",
        "command": "./node_modules/eslint/bin/eslint.js ."
    }
    // ...
    // your other steps
    ]
}
```

*Alternative : setup a `npm` script and directly invoke `eslint` in the command field :*

```js
{
    "steps": [
    // ...
    // your other steps
    {
        "name": "eslint",
        "command": "npm run lint" // npm run lint -> eslint . in your package.json
    }
    // ...
    // your other steps
    ]
}
```