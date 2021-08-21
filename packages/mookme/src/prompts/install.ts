// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const packageQuestion = (packages: string[]) => ({
  type: 'list',
  name: 'packageName',
  message: 'Choose a package where to install the step:',
  choices: packages,
  filter(packageName: string) {
    return packageName === '@root' ? '.' : packageName;
  },
});
