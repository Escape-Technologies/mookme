import path from 'path';
import wcmatch from 'wildcard-match';

export function getMatchedFiles(
  pattern: string,
  packagePath: string,
  stagedFiles: string[] | undefined,
  rootDir: string,
): string[] {
  const matcher = wcmatch(pattern);

  return (stagedFiles || [])
    .map((fPath: string) => path.join(rootDir, fPath))
    .filter((fPath: string) => {
      return fPath.includes(packagePath);
    })
    .map((fPath: string) => fPath.replace(`${packagePath}/`, ''))
    .filter((rPath: string) => matcher(rPath));
}

export function resolvePackagePath(rootDir: string, packagesPath: string, packageName: string): string {
  return packageName === '__global' ? rootDir : path.join(packagesPath, packageName);
}

export function computeExecutedCommand(command: string, type?: string, venvActivate?: string): string {
  return type === 'python' && venvActivate ? `source ${venvActivate} && ${command} && deactivate` : command;
}
