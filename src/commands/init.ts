import commander from "commander";
import inquirer from 'inquirer'
import fs from 'fs'

export function addInit(program: commander.Command) {
    program.command('init')
        .action(async() => {
            const folderQuestion = {
                type: 'input',
                name: 'modulesPath',
                message: `Please enter the path of the folder containing the packages or modules:\n`,
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

            let {modulesPath} = await inquirer.prompt([folderQuestion]) as {modulesPath: string};
            const moduleDirs = fs.readdirSync(`./${modulesPath}`, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(dirent => dirent.name)

            const modulesQuestion = [{
                type: 'checkbox',
                name: 'modules',
                message: 'Select folders to hook :',
                choices: moduleDirs,
            }];

            const {modules: selectedModules} = await inquirer.prompt(modulesQuestion)  as {modules: string[]};

            const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            packageJSON.mookme = {
                modulesPath,
                modules: selectedModules
            }

            const mookMeConfig = {
                modulesPath: `./${modulesPath}`,
                modules: selectedModules
            }

            console.log("The following configuration will be added into your package.json :")
            console.log("mookme: ", JSON.stringify(mookMeConfig, null, 2))

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
            }
        });
}