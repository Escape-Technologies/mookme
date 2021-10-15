import commander from 'commander';
import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from '../display/logger';

export function addAddPkg(program: commander.Command): void {
  program
    .command('add-pkg')
    .requiredOption('-p, --pkg <pkg>', 'The path to the package you want to add')
    .description('Add a new package to an existing mookme configuration')
    .action(async ({ pkg }) => {
      config.init();

      const projectConfig = config.project;
      const { rootDir, packagesPath, packages } = config.project;

      if (packages.includes(pkg)) {
        logger.warning(`\nPackage ${pkg} is already registered, nothing will be done.\n`);
        process.exit(1);
      }

      const pkgPath = path.join(packagesPath, pkg);

      if (!fs.existsSync(pkgPath)) {
        logger.failure(`Nothing found at path ${pkgPath}. Exiting.`);
        process.exit(1);
      }

      packages.push(pkg);
      projectConfig.packages = packages;
      logger.success('\nThe following entry will be added to your package.json:');
      logger.log(`-> .mookme.json -> packages -> ${pkg}`);

      fs.writeFileSync(`${rootDir}/package.json`, JSON.stringify(projectConfig, null, 2));

      const pkgHooksPath = path.join(pkgPath, '.hooks');
      if (!fs.existsSync(pkgHooksPath)) {
        logger.info(`\nInitializing .hooks dir at path ${pkgHooksPath}`);
        fs.mkdirSync(pkgHooksPath);
      }

      logger.success("You're all set !");
    });
}
