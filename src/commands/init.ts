import commander from "commander";
import inquirer from 'inquirer'
import fs from 'fs'

import {hookTypes} from '../types/hook.types'

export function addInit(program: commander.Command) {
    program.command('init')
        .action(async() => {
            const folderQuestion = {
                type: 'input',
                name: 'packagesPath',
                message: `Please enter the path of the folder containing the packages:\n`,
                validate: function (rpath: string) {
                    let pass
                    console.log({rpath})
                    try {
                        pass = fs.lstatSync(`./${rpath}`).isDirectory() 
                    } catch(err) {
                        pass = false
                    } 
                    if (pass) {
                        return true;
                    }
                    return `Path ./${rpath} is not a valid folder path`;
                },
                transformer: (val: string) => `./${val}`,
            }

            let {packagesPath} = await inquirer.prompt([folderQuestion]) as {packagesPath: string};
            const moduleDirs = fs.readdirSync(`./${packagesPath}`, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(dirent => dirent.name)

            const packagesQuestion = [{
                type: 'checkbox',
                name: 'packages',
                message: 'Select folders to hook :',
                choices: moduleDirs,
            }];

            const {packages: selectedPackages} = await inquirer.prompt(packagesQuestion)  as {packages: string[]};

            const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            packageJSON.mookme = {
                packagesPath,
                packages: selectedPackages
            }

            const mookMeConfig = {
                packagesPath: `.` + (packagesPath ? `/${packagesPath}`: ''),
                packages: selectedPackages
            }

            const packagesHooksDirPaths = selectedPackages.map(mod => `${mookMeConfig.packagesPath}/${mod}/.hooks`)

            console.log("\nThe following configuration will be added into your package.json:")
            console.log("mookme: ", JSON.stringify(mookMeConfig, null, 2))

            console.log('\nThe following directories will also be created:')
            packagesHooksDirPaths.forEach(hookDir => console.log(`- ${hookDir}`))

            const {confirm} = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: 'Do you confirm ?',
                default: false
            }])  as {confirm: boolean};

            if(confirm) {
                console.log('Writing configuration...')
                packageJSON.mookme = mookMeConfig
                fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2))
                console.log('Done.')
                
                console.log('Initializing hooks folders...')
                fs.mkdirSync('.hooks');
                packagesHooksDirPaths.forEach(hookDir => {
                    if (!fs.existsSync(hookDir)){
                        fs.mkdirSync(hookDir);
                    }
                })
            }
        });
}