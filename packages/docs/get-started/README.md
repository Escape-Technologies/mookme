# Get started

## Installation

```bash
npm install @escape.tech/mookme
```

### Requirements

`Mookme` requires Node.js to work properly.

## Configuration

Mookme will look automatically detect the `.hooks` folder across your repository and trigger the command related to your current VCS state.

Hence it only requires a very minimal configuration, as most of this is defined by where you place your `.hooks` folders, and what you put in them.

### First configuration

**Case 1 : You are the first to configure `Mookme` on your project**

```bash
npx mookme init
```

This will display a prompter to let you define how you want the hooks to behave when a file is changed during commit hooks, write the corresponding documentation in your `package.json`, and write your `.git/hooks` scripts.

Every step of this process is clearly shown and nothing will be written without asking you if you're okay with it :)

### Already-configured project

**Case 2 : Someone in your team already configured `Mookme`**

This will only write your `.git/hooks` scripts.

```bash
npx mookme init --only-hook
```

## Writing your hooks

### Global structure of your project hooks

`Mookme` is designed for monorepos, hence it assumes your project has a root folder where global hooks can be defined,
and multiple packages where you can define per-package hook.

::: tip
Hooks are written in a folder `.hooks` located at the root of your project and at the root of your packages' folders.

**When using `Mookme` in a monorepo, you will have a project structure following this :**

```bash
<root> # where your .git is located
|- .mookme.json
|- .hooks # will always be executed when you commit
|  |- pre-commit.json # will be executed with the pre-commit git hook
|  |- commit-msg.json  # will be executed with the commit-msg git hook
|  |- prepare-commit-msg.json
|  |- post-commit.json
|- packages
|  |- package A
|  |  |- .hooks # will be executed if you commit changes on package A
|  |  |  |- pre-commit.json 
|  |  |  |- post-commit.json
|  |- package A
|  |  |- .hooks # will be executed if you commit changes on package B
|  |  |  |- pre-commit.json
```

:::

With `mookme`, your hooks are stored in JSON files called `{hook-type}.json` where the hook type is one of the
available git hooks, eg :

- `pre-commit`
- `prepare-commit-msg`
- `commit-msg`
- `post-commit`
- `post-merge`
- `post-rewrite`
- `pre-rebase`
- `post-checkout`
- `pre-push`

::: warning
The exit behavior is only applied on pre-commit hook types: `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit`
:::

::: warning
If the command executed by a hook fails, it will prevent the git command to be executed. We recommend you to use the pre-receive hooks carefully, with relatively safe commands, otherwise you might prevent your team for doign stuff like `git pull` or `git fetch`.
:::

### Example of hook file

Your hooks are defined in simple json files.

- For complete reference, see the [JSON hooks reference](/references/#hook-files)
- For specific hook examples, see the [recipes](/examples)

A hook defines a list of `steps`, which are basically commands to run, with a name for proper display. A few
configuration option are available, but the minimal requirement is `name` and `command`.

Here is an example that will run your commit message using `commitlint`.

```js
# commit-msg.json
{
    "steps": [{
        "name": "commit lint",
        "command": "cat {args} | ./node_modules/@commitlint/cli/cli.js"
    }]
}
```

::: tip
When writing package-scoped hooks, the current working directory assumed by `Mookme` is the folder where this
package's `.hooks'` folder is located
:::

::: warning
`{args}` are replaced with the hook arguments when the command is executed. See [the  Git documentation on hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
:::

**More examples to [get you started](./docs/hooks-examples/index.md)**!
