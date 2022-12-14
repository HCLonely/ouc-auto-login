import * as dayjs from 'dayjs';
import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { login, checkNet, log, ask } from './tools';
import { userInfo, hostname } from 'os';
import { execSync } from 'child_process';
import { join } from 'path';
import { crontabData } from './crontab';
import { blue, green, red } from 'chalk';
import { createInterface } from 'readline';

(async () => {
  console.log(`OUC-AUTO-Login By ${green('HCLonely')}\n`);
  // 获取传入的参数
  const ARGV: {
    [name: string]: string
  } = {};
  process.argv.forEach((e: string) => {
    const [name, value] = e.split('=');
    if (name && value) {
      ARGV[name] = value;
      return e;
    }
    return e;
  });

  if (Object.keys(ARGV).length === 0) {
    const status = execSync('chcp 437 && schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
    execSync('chcp 936');
    if (status?.includes('Ready') || status?.includes('Running')) {
      log(`计划任务${green('OUC-AUTO-Login')}已存在！`);
      const keep = setInterval(() => { }, 3600000);
      console.log('按任意键关闭此窗口...');
      process.stdin.setRawMode(true);
      process.stdin.on('data', () => {
        clearInterval(keep);
        process.exit(0);
      });
      return;
    }
  }

  if (!existsSync('OUC-AUTO-Login.xml') && !ARGV.username && !ARGV.password) {
    const PCUsername = `${hostname()}\\${userInfo().username}`;
    const PCUserSid = Object.fromEntries(execSync('whoami /user').toString().split(/(\r?\n)+/).map((data) => data.trim().split(/[\s]+/)))[PCUsername.toLowerCase()];
    const workDir = process.cwd();
    const filePath = join(workDir, 'OUC-AUTO-Login.exe');

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const username = await ask(rl, '请输入校园网帐号（学号）:', true);
    const password = await ask(rl, '请输入校园网密码:');
    const interval = await ask(rl, '请输入多久检测一次（单位：分钟）:', true);
    rl.close();
    writeFileSync('OUC-AUTO-Login.xml', crontabData(PCUserSid, workDir, filePath, username, password, interval));

    execSync(`start cmd /k "echo 正在创建定时计划，请输入计算机密码 && schtasks /create /xml ^"${join(workDir, 'OUC-AUTO-Login.xml')}^" /tn ^"OUC-AUTO-Login^" /ru ^"${PCUsername.toLowerCase()}^""`);
    execSync("start taskschd.msc");
    console.log(blue(`请确认是否成功创建计划任务${green('OUC-AUTO-Login')}！`));
    console.log(blue(`如果计划任务为创建，请自行导入${green(join(workDir, 'OUC-AUTO-Login.xml'))}文件！`));

    const keep = setInterval(() => { }, 3600000);
    console.log('按任意键关闭此窗口...');
    process.stdin.setRawMode(true);
    process.stdin.on('data', () => {
      clearInterval(keep);
      process.exit(0);
    });
    return;
  }

  if (!ARGV.username) {
    log(red('未传入用户名(学号)'));
    const keep = setInterval(() => { }, 3600000);
    console.log('按任意键关闭此窗口...');
    process.stdin.setRawMode(true);
    process.stdin.on('data', () => {
      clearInterval(keep);
      process.exit(0);
    });
    return;
  }
  if (!ARGV.password) {
    log(red('未传入密码'));
    const keep = setInterval(() => { }, 3600000);
    console.log('按任意键关闭此窗口...');
    process.stdin.setRawMode(true);
    process.stdin.on('data', () => {
      clearInterval(keep);
      process.exit(0);
    });
    return;
  }

  // 清除昨天之前的日志
  if (existsSync('logs')) {
    readdirSync('logs').forEach((filename) => {
      if (![`log-${dayjs().format('YYYY-MM-DD')}.txt`, `log-${dayjs().add(-1, 'day').format('YYYY-MM-DD')}.txt`].includes(filename)) {
        unlinkSync(`logs/${filename}`);
      }
    })
  }

  log('正在检测网络...');
  if (await checkNet()) {
    log('网络已连接');
    return true;
  }
  log('网络未连接，尝试登录中...');
  if (await login(ARGV.username, ARGV.password)) {
    return log('登陆成功!');
  }
  log('登陆失败!');
})();
