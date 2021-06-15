# CLI & references

## `mookme init`

The main initialization command. It :

- prompts for one or multiple packages folder path
- asks you to select one or multiple package at each path
- creates the `.hooks` folder in each package where you can write **dedicated hooks !** that will be triggered only
when changes in this package occur
- creates a `.hooks` folder at the root of your project where you can write **project-wide hooks** that will be
triggered on every commit
- writes `.git/hooks` files

### Options

- `--only-hook` (optional)

Skip prompters and only write `.git/hooks` files. This is for installation in an already-configured project.

## `mookme add-pkg`

A helper for adding a new package to an existing configuration. It takes a required option `-p --pkg` which is the
package to add.

This will:

- push the new package in the package.json file
- create a `.hooks` folder in this package if needed

### Options

- `-p --pkg <pkg>` (required)

The relative path from the packages root to the package to add to the configuration

### Examples

````bash
# This will add the package at path $PROJECT_ROOT/$PACKAGES_ROOT/new-package
# Where $PROJECT_ROOT is where your package.json is
# $PACKAGES_ROOT is the packagesPath value in the mookme configuration

mookme add-pkg -p new-package
````

## `mookme run`

Mainly used for debugging and dry run :

`mookme run --type pre-commit -a "test arguments"`

### Options

- `-t --type` (required)

The type of hook to run, has to be one of `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit`.

- `-a --args` (optional)

The arguments that would be normally passed by git to the hook

- `-r --run-all` (optional)

Skip the selection of hooks to run based on git-staged files, and run hooks of every package for this type

## Hook files

With `mookme`, your hooks are stored in JSON files called `{hook-type}.json` where the hook type is one of the
available git hooks, eg :

- `pre-commit`
- `prepare-commit-msg`
- `commit-msg`
- `post-commit`

### Available options

- `steps`

The list of steps (commands) being executed by this hook. In a step you can define :

#### Step options

| Option        | Description           | Required  |
| ------------- | ------------- | ------|
| `name`      | The name that will be given to this step | yes |
| `cmd`      | The command invoked at this step |   yes |
| `onlyOn` | A shell wildcard conditioning the execution of the step based on modified files      |    no |

- `type`

A flag used mainly to tell `mookme` this is a python hook, and might need a virtual environment to be activated.

- `venvActivate`

A path to a `<venv>/bin/activate` script to execute before the command if the hook type is `python`
