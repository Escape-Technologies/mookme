import fs from 'fs';
import path from 'path';

export function getRootDir(): string {
  let isRoot = false;
  let rootDir = process.cwd();
  while (!isRoot) {
    isRoot = fs.existsSync(`${rootDir}/.git`);
    if (!isRoot) {
      rootDir = `${rootDir}/..`;
    }
  }

  return path.resolve(rootDir);
}
