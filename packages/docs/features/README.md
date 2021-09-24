# Features

## Reusable steps

`Mookme` provides you with step-sharing features, allowing you to declare shared step example, and to use them in your steps.

Given a project directory such as this:

```=shell
project-root
 |------- .hooks
     |------- shared
            |------- flake8.json
 |------- package.json
 |------- packages
      |------- some-package
            |------- .hooks
                   |------- pre-commit.json
```

::: tip
The `<project-root>/.hooks/shared` is automatically generated with a `.gitkeep` file by `mookme init`.
:::

You can declare a step in `flake8.json` and then re-use it in `some-package/.hooks/pre-commit.json` with the `from` keyword:

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
 |------- .hooks
     |------- partials
            |------- pylint-changed-files
 |------- package.json
 |------- packages
      |------- some-package
            |------- .hooks
                   |------- pre-commit.json
```

*Here is how the `changed-files` script looks like*

```bash
#!/usr/bin/env bash
git diff --cached --name-only --relative | while read line; do [ ! -f \"$line\" ] || printf \"%s\\n\" \"$line\"; done | grep -P '\\.py$' | xargs -d '\\n' $@
```

::: tip
The `<project-root>/.hooks/partials` is automatically generated with a `.gitkeep` file by `mookme init`.
:::

One can declare a script in flake8 (don't forget to chmod+x) and then re-use it in some-package/.hooks/pre-commit.json by directly invoking the script's name:

```json
{
  "steps": [
    {
      "name": "Run pylint but only on changed files",
      "command": "changed-files pylint"
    },
    ... // some other steps
  ]
}
```
