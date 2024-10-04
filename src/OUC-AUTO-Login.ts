import * as dayjs from 'dayjs';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { login, checkNet, log, ask } from './tools';
import { userInfo, hostname } from 'os';
import { execSync } from 'child_process';
import { join, resolve } from 'path';
import { crontabData } from './crontab';
import { blue, green, red } from 'chalk';
import { createInterface } from 'readline';
import { platform } from 'os';
import * as cron from 'node-cron';

(async () => {
  const version = '1.0.6';
  console.log(`OUC-AUTO-Login ${blue(`v${version}`)} By ${green('HCLonely')}\n`);
  if (!existsSync('logs')) {
    mkdirSync('logs');
  }
  // 获取传入的参数
  const ARGV: {
    [name: string]: string
  } = {};

  Object.entries(process.env || {}).forEach(([name, value]) => {
    // const [name, value] = e.split('=');
    if (['username', 'password', 'interval'].includes(name.toLowerCase())) {
      ARGV[name.toLowerCase()] = `${value}`;
      return;
    }
  });
  process.argv.forEach((e: string) => {
    const [name, value] = e.split('=');
    if (name && value) {
      ARGV[name] = value;
      return;
    }
  });

  if (Object.keys(ARGV).length === 0) {
    if (platform() === 'win32') {
      const status = execSync('chcp 437 && schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
      execSync('chcp 936');
      console.log(`OUC-AUTO-Login ${blue(`v${version}`)} By ${green('HCLonely')}\n`);
      if (status?.includes('Ready') || status?.includes('Running')) {
        console.log(`计划任务${green('OUC-AUTO-Login')}已存在！`);

        const rl = createInterface({
          input: process.stdin,
          output: process.stdout
        });
        const select = await ask(rl, `输入0删除计划任务${green('OUC-AUTO-Login')}, 输入其他内容退出本程序:`, true);
        if (existsSync('OUC-AUTO-Login.xml')) {
          unlinkSync('OUC-AUTO-Login.xml');
        }
        if (select === '0') {
          execSync(`chcp 437 && schtasks /delete /tn "OUC-AUTO-Login" /f`);
          const status = execSync('schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
          execSync('chcp 936');
          if (status?.includes('Ready') || status?.includes('Running')) {
            console.log(red(`计划任务${green('OUC-AUTO-Login')}删除失败，请尝试自行删除！`));
            execSync("start taskschd.msc");
          } else {
            console.log(green(`计划任务${blue('OUC-AUTO-Login')}删除成功！`));
          }
        } else {
          process.exit(0);
        }
        const keep = setInterval(() => { }, 3600000);
        console.log('按任意键关闭此窗口...');
        process.stdin.setRawMode(true);
        process.stdin.on('data', () => {
          clearInterval(keep);
          process.exit(0);
        });
        return;
      }
    } else if (platform() === 'linux') {
      console.log(`OUC-AUTO-Login ${blue(`v${version}`)} By ${green('HCLonely')}\n`);
      let cronText = '';
      if (existsSync('/etc/crontab')) {
        cronText += readFileSync('/etc/crontab').toString();
      } else {
        return console.log(red(`File ${blue('/etc/crontab')} Not Found`));
      }
      if (cronText.includes('OUC-AUTO-Login')) {
        console.log(`计划任务${green('OUC-AUTO-Login')}已存在！`);

        let cronTextArr = cronText.split('\n');
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout
        });
        const select = await ask(rl, `输入0删除计划任务${green('OUC-AUTO-Login')}, 输入其他内容退出本程序:`, true);
        if (select === '0') {
          cronTextArr = cronTextArr.filter((e) => !e.includes('OUC-AUTO-Login'));
          writeFileSync('/etc/crontab', cronTextArr.join('\n'));
          const cronTextNew = readFileSync('/etc/crontab').toString();
          if (cronTextNew.includes('OUC-AUTO-Login')) {
            console.log(red(`计划任务${green('OUC-AUTO-Login')}删除失败，请尝试自行删除！`));
            console.log(`输入 ${blue('sudo vi /etc/crontab')} 后删除含有 ${green('OUC-AUTO-Login')} 的一行`);
          } else {
            console.log(green(`计划任务${blue('OUC-AUTO-Login')}删除成功！`));
          }
        }
        process.exit(0);
      }
    }
  }

  if (!ARGV.username && !ARGV.password) {
    if (platform() === 'win32') {
      const PCUsername = `${hostname()}\\${userInfo().username}`;
      const PCUserSid = Object.fromEntries(execSync('whoami /user').toString().split(/(\r?\n)+/).map((data) => data.trim().split(/[\s]+/)))[PCUsername.toLowerCase()];
      const workDir = process.cwd();
      const filePath = join(workDir, 'OUC-AUTO-Login-win.exe');

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });
      const username = await ask(rl, '请输入校园网帐号（学号）:', true);
      const password = await ask(rl, '请输入校园网密码:');
      const interval = await ask(rl, '请输入多久检测一次（单位：分钟）:', true) || '15';
      const PCUserPass = await ask(rl, `请输入当前计算机用户[${PCUsername}]的密码（用于创建计划任务）:`);
      rl.close();
      writeFileSync('OUC-AUTO-Login.xml', crontabData(PCUserSid, workDir, filePath, username, password, interval));

      console.log(`正在创建定时计划...`);
      let cmdLogs = `请输入校园网帐号（学号）:${username}\n请输入校园网密码:${password}\n请输入多久检测一次（单位：分钟）:${interval}\n请输入当前计算机用户[${PCUsername}]的密码（用于创建计划任务）:${PCUserPass}\n正在创建定时计划...\n\n`;
      try {
        cmdLogs += execSync(`chcp 437 && schtasks /create /xml "${join(workDir, 'OUC-AUTO-Login.xml')}" /tn "OUC-AUTO-Login" /ru "${PCUsername.toLowerCase()}" /rp "${PCUserPass}"`).toString();
      } catch (e) {
        cmdLogs += e;
      }

      const status = execSync('schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
      execSync('chcp 936');
      console.log(`OUC-AUTO-Login ${blue(`v${version}`)} By ${green('HCLonely')}\n`);
      console.log(cmdLogs);
      if (status?.includes('Ready') || status?.includes('Running')) {
        console.log(green(`计划任务${blue('OUC-AUTO-Login')}创建成功！`));
      } else {
        execSync("start taskschd.msc");
        console.log(red(`计划任务${blue('OUC-AUTO-Login')}创建失败！`));
        console.log(blue(`请自行导入${green(join(workDir, 'OUC-AUTO-Login.xml'))}文件\n或删除${green(join(workDir, 'OUC-AUTO-Login.xml'))}文件后重新运行本程序！`));
      }

      const keep = setInterval(() => { }, 3600000);
      console.log('点击右上角关闭此窗口...');
      process.stdin.setRawMode(true);
      process.stdin.on('data', () => {
        clearInterval(keep);
        process.exit(0);
      });
    } else if (platform() === 'linux') {
      const workDir = process.cwd();

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });
      const username = await ask(rl, '请输入校园网帐号（学号）:', true);
      const password = await ask(rl, '请输入校园网密码:');
      const interval = await ask(rl, '请输入多久检测一次（单位：分钟）:', true);
      rl.close();
      console.log(`正在创建定时计划...`);
      appendFileSync('/etc/crontab', `\n0/${interval} * * * * cd ${resolve(workDir)} && ./OUC-AUTO-Login-linux username=${username} password=${password}\n`);

      const cronTextNew = readFileSync('/etc/crontab').toString();
      if (cronTextNew.includes('OUC-AUTO-Login')) {
        console.log(green(`计划任务${blue('OUC-AUTO-Login')}创建成功！`));
      } else {
        console.log(red(`计划任务${blue('OUC-AUTO-Login')}创建失败！`));
        console.log(`输入 ${blue('sudo vi /etc/crontab')} 后新增一行 ${`0/${interval} * * * * cd ${resolve(workDir)} && ./OUC-AUTO-Login-linux username=${username} password=${password}`}`);
      }
      process.exit(0);
    }
    return;
  }

  if (existsSync('OUC-AUTO-Login.xml') && !ARGV.username && !ARGV.password) {

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

  await checkStart();
  if (ARGV.interval) {
    log(`计划任务已启用，每${ARGV.interval}分钟检测一次`);
    cron.schedule(`*/${ARGV.interval} * * * *`, () => {
      checkStart();
    });
  }
  async function checkStart() {
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
  }
})();
