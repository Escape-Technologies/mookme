# Examples

## `commitlint`

> This guide will help you in the setup of a hook a hook for linting your commits with [commitlint](https://github.com/conventional-changelog/commitlint)*

### Prerequisite

- You have installed `mookme`
- You have installed and configured [commitlint](https://github.com/conventional-changelog/commitlint)
- You have setup `mookme` using `mookme init` (see [get started](../../README.md) if needed)

### Hook

- In the global hooks folder of your project `<project-root>/.hooks/commit-msg.json` add the following configuration :

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

## `eslint`

> This guide will help you in the setup of a hook for linting your code with [eslint](https://eslint.org/)*

### Prerequisite

- You have installed `mookme`
- You have installed and configured [eslint](https://eslint.org/)
- You have setup `mookme` using `mookme init` (see [get started](../../README.md) if needed)

### Hook

- In the hooks folder of the package you want to lint with `eslint` `<project-root>/<package>/.hooks/commit-msg` add
the following configuration :

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

## `python`

> This guide will help you in the setup of a python-based hook*

### Prerequisite

- You have installed `mookme`
- You have setup `mookme` using `mookme init` (see [get started](../../README.md) if needed)
- You have a working virtual environment in your package

### Hook

- In the hooks folder of your package or in the global hooks folder `<project-root>/<package>/.hooks/pre-commit.json`
or `<project-root>/<package>/.hooks/pre-commit.json`, add the following configuration :

```js
{
    "type": "python",
    "venvActivate": "./<path>/<to>/<your>/<venv>/<activate>" // ./.venv/bin/activate for instance, this will be sourced
    "steps": [
    // ...
    // your other steps
    {
        "name": "some python stuff",
        "command": "mypy ."
    }
    // ...
    // your other steps
    ]
}
```
