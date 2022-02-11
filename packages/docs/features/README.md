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

## Uncommited steps (gitignore)

Mookme steps are shared by default. The point of the tool is to provide a shared git hooks configuration. However we understand that sometimes, one would like to have a custom mookme configuration.

You can use {hook-type}.local.json` files that are located and formatted in the very same way that shared hook files are.

For instance, with the following configuration:

```json
// package1/.hooks/pre-commit.json
{
  "steps": [
    {
      "name": "common hook",
      "command": "npm run lint:fix"
    }
  ]
}
```

```json
// package1/.hooks/pre-commit.local.json
{
  "steps": [
    {
      "name": "local hook",
      "command": "npm test"
    }
  ]
}
```

You will run both setps when committing. The difference between these two files is that `package1/.hooks/pre-commit.local.json` is git-ignored by default through the command-line project initialization.
