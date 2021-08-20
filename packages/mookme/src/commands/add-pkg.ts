import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import path from 'path';
import { loadProjectConfig } from '../config/loaders';
import { getPkgJSON, writePkgJSON } from '../utils/config';

export function addAddPkg(program: commander.Command): void {
  program
    .command('add-pkg')
    .requiredOption('-p, --pkg <pkg>', 'The path to the package you want to add')
    .description('Add a new package to an existing mookme configuration')
    .action(async ({ pkg }) => {
      const pkgJSON = getPkgJSON();
      const { packagesPath, packages } = loadProjectConfig();

      if (packages.includes(pkg)) {
        console.log(chalk.bold.yellow(`\nPackage ${pkg} is already registered, nothing will be done.\n`));
        process.exit(1);
      }

      const pkgPath = path.join(packagesPath, pkg);

      if (!fs.existsSync(pkgPath)) {
        console.log(chalk.bold.red(`Nothing found at path ${pkgPath}`));
        process.exit(1);
      }

      packages.push(pkg);
      pkgJSON.mookme.packages = packages;
      console.log(chalk.bold.green('\nThe following entry will be added to your package.json:'));
      console.log(`-> package.json -> mookme -> packages -> ${pkg}`);

      writePkgJSON(pkgJSON);

      const pkgHooksPath = path.join(pkgPath, '.hooks');
      if (!fs.existsSync(pkgHooksPath)) {
        console.log(chalk.bold(`\nInitializing .hooks dir at path ${pkgHooksPath}`));
        fs.mkdirSync(pkgHooksPath);
      }

      console.log(chalk.bold.green('All done !'));
    });
}
