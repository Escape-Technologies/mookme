# MookMe

*A simple and easy-to-use, yet powerful and language agnostic git hook for monorepos.*

- **[see the documentation](https://mookme.org)**
- **[see the *beta* documentation](https://beta.mookme.org)**

<img src="assets/banner.png" alt="demo" width="600"/>

## What you will find on this repository

- Description of the repository structure
- The entire source code associated with the Mookme project, including source code of CLI and the documentation page
- A [roadmap of the project](https://github.com/Escape-Technologies/mookme/projects) in a Github project [WIP]
- A list of [opened issues](https://github.com/Escape-Technologies/mookme/issues) and [merge requests](https://github.com/Escape-Technologies/mookme/pulls)
- Development guidelines and contribution guide [WIP]

## What you will not find on this page

- User documentation. See [the project's website](https://mookme.org)

## Repository structure

The Mookme project is architectured around this monorepo. Every packages are stored under the `packages` folder. These include:

- `/packages/mookme`: The NodeJs project for the CLI of Mookme
- `/packages/docs`: A vuepress website holding the code of the user's documentation

## Release channels

Mookme is released under a `main` channel and a `beta` channel. These both correspond to the `beta` and `main` branches of this repository.

Releases are manual for the `beta` channel, automated on the `main` channel.