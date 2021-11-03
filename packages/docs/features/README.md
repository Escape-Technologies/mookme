# Features

## Reusable steps

`Mookme` provides you with step-sharing features, allowing you to declare shared step example, and to use them in your steps.

Given a project directory such as this:

```sh
project-root
|--- .mookme.json
|--- .hooks
    |--- shared
        |--- flake8.json
|--- packages
    |--- some-package
        |--- .hooks
            |--- pre-commit.json
```

::: tip
The `<project-root>/.hooks/shared` is automatically generated with a `.gitkeep` file by `mookme init`.
:::

You can declare a step in `/.hooks/shared/flake8.json`…

```json
{
  "name": "Ensure Style (flake8)",
  "command": "flake8 $(python-module) --ignore E203,W503 --max-line-length 90",
  "onlyOn": "**/*.py"
}
```



… and then re-use it in `some-package/.hooks/pre-commit.json` with the `from` keyword:

```json
{
  "steps": [
    {
      "from": "flake8"
    },
    ... // some other steps
  ]
}
```

## Writing and using utils scripts

It is possible to declare some scripts in the project root `Mookme` configuration, and then use them directly in the commands invoked by the steps.

Given a project directory such as this:

```sh
project-root
|--- .mookme.json
|--- .hooks
    |--- partials
        |--- pylint-changed-files
 |--- packages
    |--- some-package
        |--- .hooks
            |--- pre-commit.json
```

*Here is how the `python-changed-files` script looks like*

```bash
#!/usr/bin/env bash
git --no-pager diff --cached --name-only --diff-filter=AM --relative -- "***.py" | tr '\n' '\0' | xargs -0 "$@"
```

::: tip
The `<project-root>/.hooks/partials` is automatically generated with a `.gitkeep` file by `npx mookme init`.
:::

One can declare a script in flake8 (don't forget to `chmod+x`) and then re-use it in `some-package/.hooks/pre-commit.json` by directly invoking the script's name:

```json
{
  "steps": [
    {
      "name": "Run pylint but only on changed files",
      "command": "python-changed-files pylint"
    },
    ... // some other steps
  ]
}
```
