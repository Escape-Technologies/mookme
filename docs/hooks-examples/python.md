# `commitlint`

*This guide will help you in the setup of a python-based hook

## Prerequisite

- You have installed `mookme`
- You have setup `mookme` using `mookme init` (see [get started](../../README.md) if needed)
- You have a working virtual environment in your package

## Hook

- In the hooks folder of your package or in the global hooks folder `<project-root>/<package>/.hooks/pre-commit.json` or `<project-root>/<package>/.hooks/pre-commit.json`, add the following configuration :

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
