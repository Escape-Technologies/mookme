import path from 'path';
import fs from 'fs';

export function getRootDir(target: string): string | undefined {
  let isRoot = false;
  let rootDir = process.cwd();
  let i = 0;
  while (!isRoot && i < 20) {
    isRoot = fs.existsSync(`${rootDir}/${target}`);
    if (!isRoot) {
      rootDir = `${rootDir}/..`;
    }
    i++;
  }
  if (!isRoot) {
    return undefined;
  }

  return path.resolve(rootDir);
}
