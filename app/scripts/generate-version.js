import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 获取当前目录
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.resolve(projectRoot, 'src', 'version.ts');

try {
  // 获取 git 提交信息
  const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const commitDate = execSync('git log -1 --pretty=format:"%ad" --date=iso', { encoding: 'utf8' }).trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  // 生成版本信息
  const versionContent = `// 自动生成的版本信息
// 构建时间: ${new Date().toISOString()}
export const VERSION_INFO = {
  commit: '${commitHash}',
  date: '${commitDate}',
  branch: '${branch}',
  buildTime: '${new Date().toISOString()}',
};
`;
  
  // 写入版本文件
  fs.writeFileSync(outputPath, versionContent);
  console.log('版本信息生成成功:', outputPath);
  console.log('版本信息:', {
    commit: commitHash,
    date: commitDate,
    branch: branch,
    buildTime: new Date().toISOString(),
  });
} catch (error) {
  console.error('生成版本信息失败:', error.message);
  // 生成默认版本信息
  const defaultContent = `// 自动生成的版本信息
// 构建时间: ${new Date().toISOString()}
export const VERSION_INFO = {
  commit: 'unknown',
  date: '${new Date().toISOString()}',
  branch: 'unknown',
  buildTime: '${new Date().toISOString()}',
};
`;
  fs.writeFileSync(outputPath, defaultContent);
  console.log('使用默认版本信息');
}
