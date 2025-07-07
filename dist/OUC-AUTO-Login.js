"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs = require("dayjs");
const fs_1 = require("fs");
const tools_1 = require("./tools");
const os_1 = require("os");
const child_process_1 = require("child_process");
const path_1 = require("path");
const crontab_1 = require("./crontab");
const chalk_1 = require("chalk");
const readline_1 = require("readline");
const os_2 = require("os");
const cron = require("node-cron");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const version = '1.1.1';
    console.log(`OUC-AUTO-Login ${(0, chalk_1.blue)(`v${version}`)} By ${(0, chalk_1.green)('HCLonely')}\n`);
    // 获取传入的参数
    const ARGV = {};
    Object.entries(process.env || {}).forEach(([name, value]) => {
        // const [name, value] = e.split('=');
        if (['username', 'password', 'interval'].includes(name)) {
            ARGV[name] = `${value}`;
            return;
        }
    });
    process.argv.forEach((e) => {
        const [name, value] = e.split('=');
        if (name && value) {
            ARGV[name] = value;
            return;
        }
    });
    if (ARGV.workDir && (0, fs_1.existsSync)(ARGV.workDir)) {
        process.chdir(ARGV.workDir); // for mac
    }
    if (!(0, fs_1.existsSync)('logs')) {
        (0, fs_1.mkdirSync)('logs');
        (0, fs_1.chmodSync)('logs', 0o777);
    }
    if (Object.keys(ARGV).length === 0) {
        if ((0, os_2.platform)() === 'win32') {
            const status = (0, child_process_1.execSync)('chcp 437 && schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
            (0, child_process_1.execSync)('chcp 936');
            console.log(`OUC-AUTO-Login ${(0, chalk_1.blue)(`v${version}`)} By ${(0, chalk_1.green)('HCLonely')}\n`);
            if ((status === null || status === void 0 ? void 0 : status.includes('Ready')) || (status === null || status === void 0 ? void 0 : status.includes('Running'))) {
                console.log(`计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}已存在！`);
                const rl = (0, readline_1.createInterface)({
                    input: process.stdin,
                    output: process.stdout
                });
                const select = yield (0, tools_1.ask)(rl, `输入0删除计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}, 输入其他内容退出本程序:`, true);
                if ((0, fs_1.existsSync)('OUC-AUTO-Login.xml')) {
                    (0, fs_1.unlinkSync)('OUC-AUTO-Login.xml');
                }
                if (select === '0') {
                    (0, child_process_1.execSync)(`chcp 437 && schtasks /delete /tn "OUC-AUTO-Login" /f`);
                    const status = (0, child_process_1.execSync)('schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
                    (0, child_process_1.execSync)('chcp 936');
                    if ((status === null || status === void 0 ? void 0 : status.includes('Ready')) || (status === null || status === void 0 ? void 0 : status.includes('Running'))) {
                        console.log((0, chalk_1.red)(`计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}删除失败，请尝试自行删除！`));
                        (0, child_process_1.execSync)("start taskschd.msc");
                    }
                    else {
                        console.log((0, chalk_1.green)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}删除成功！`));
                    }
                }
                else {
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
        }
        else if ((0, os_2.platform)() === 'linux') {
            let cronText = '';
            if ((0, fs_1.existsSync)('/etc/crontab')) {
                cronText += (0, fs_1.readFileSync)('/etc/crontab').toString();
            }
            else {
                return console.log((0, chalk_1.red)(`File ${(0, chalk_1.blue)('/etc/crontab')} Not Found`));
            }
            if (cronText.includes('OUC-AUTO-Login')) {
                console.log(`计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}已存在！`);
                let cronTextArr = cronText.split('\n');
                const rl = (0, readline_1.createInterface)({
                    input: process.stdin,
                    output: process.stdout
                });
                const select = yield (0, tools_1.ask)(rl, `输入0删除计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}, 输入其他内容退出本程序:`, true);
                if (select === '0') {
                    cronTextArr = cronTextArr.filter((e) => !e.includes('OUC-AUTO-Login'));
                    (0, fs_1.writeFileSync)('/etc/crontab', cronTextArr.join('\n'));
                    const cronTextNew = (0, fs_1.readFileSync)('/etc/crontab').toString();
                    if (cronTextNew.includes('OUC-AUTO-Login')) {
                        console.log((0, chalk_1.red)(`计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}删除失败，请尝试自行删除！`));
                        console.log(`输入 ${(0, chalk_1.blue)('sudo vi /etc/crontab')} 后删除含有 ${(0, chalk_1.green)('OUC-AUTO-Login')} 的一行`);
                    }
                    else {
                        console.log((0, chalk_1.green)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}删除成功！`));
                    }
                }
                process.exit(0);
            }
        }
        else if ((0, os_2.platform)() === 'darwin') {
            const plistPath = `/Library/LaunchDaemons/com.hclonely.oucautologin.plist`;
            if ((0, fs_1.existsSync)(plistPath)) {
                console.log(`计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}已存在！`);
                const rl = (0, readline_1.createInterface)({
                    input: process.stdin,
                    output: process.stdout
                });
                const select = yield (0, tools_1.ask)(rl, `输入0删除计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}, 输入其他内容退出本程序:`, true);
                if (select === '0') {
                    try {
                        (0, child_process_1.execSync)(`launchctl unload ${plistPath}`);
                    }
                    catch (e) { }
                    try {
                        (0, child_process_1.execSync)(`launchctl remove com.hclonely.oucautologin`);
                    }
                    catch (e) { }
                    if ((0, fs_1.existsSync)(plistPath)) {
                        (0, fs_1.unlinkSync)(plistPath);
                    }
                    if ((0, fs_1.existsSync)(plistPath)) {
                        console.log((0, chalk_1.red)(`计划任务${(0, chalk_1.green)('OUC-AUTO-Login')}删除失败，请尝试自行删除！`));
                    }
                    else {
                        console.log((0, chalk_1.green)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}删除成功！`));
                    }
                }
                else {
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
        }
    }
    if (!ARGV.username) {
        (0, tools_1.log)((0, chalk_1.red)('未传入用户名(学号)'));
    }
    if (!ARGV.password) {
        (0, tools_1.log)((0, chalk_1.red)('未传入密码'));
    }
    if (!ARGV.username || !ARGV.password) {
        if ((0, os_2.platform)() === 'win32') {
            const PCUsername = `${(0, os_1.hostname)()}\\${(0, os_1.userInfo)().username}`;
            const PCUserSid = Object.fromEntries((0, child_process_1.execSync)('whoami /user').toString().split(/(\r?\n)+/).map((data) => data.trim().split(/[\s]+/)))[PCUsername.toLowerCase()];
            const workDir = process.cwd();
            const filePath = (0, path_1.join)(workDir, 'OUC-AUTO-Login-win.exe');
            const rl = (0, readline_1.createInterface)({
                input: process.stdin,
                output: process.stdout
            });
            const username = yield (0, tools_1.ask)(rl, '请输入校园网帐号（学号）:', true);
            const password = yield (0, tools_1.ask)(rl, '请输入校园网密码:');
            const interval = (yield (0, tools_1.ask)(rl, '请输入多久检测一次（单位：分钟）:', true)) || '15';
            const PCUserPass = yield (0, tools_1.ask)(rl, `请输入当前计算机用户[${PCUsername}]的密码（用于创建计划任务）:`);
            rl.close();
            (0, fs_1.writeFileSync)('OUC-AUTO-Login.xml', (0, crontab_1.crontabData)(PCUserSid, workDir, filePath, username, password, interval));
            console.log(`正在创建定时计划...`);
            let cmdLogs = `请输入校园网帐号（学号）:${username}\n请输入校园网密码:${password}\n请输入多久检测一次（单位：分钟）:${interval}\n请输入当前计算机用户[${PCUsername}]的密码（用于创建计划任务）:${PCUserPass}\n正在创建定时计划...\n\n`;
            try {
                cmdLogs += (0, child_process_1.execSync)(`chcp 437 && schtasks /create /xml "${(0, path_1.join)(workDir, 'OUC-AUTO-Login.xml')}" /tn "OUC-AUTO-Login" /ru "${PCUsername.toLowerCase()}" /rp "${PCUserPass}"`).toString();
            }
            catch (e) {
                cmdLogs += e;
            }
            const status = (0, child_process_1.execSync)('schtasks /query').toString().split(/(\r?\n)+/).find((data) => data.includes('OUC-AUTO-Login'));
            (0, child_process_1.execSync)('chcp 936');
            console.log(`OUC-AUTO-Login ${(0, chalk_1.blue)(`v${version}`)} By ${(0, chalk_1.green)('HCLonely')}\n`);
            console.log(cmdLogs);
            if ((status === null || status === void 0 ? void 0 : status.includes('Ready')) || (status === null || status === void 0 ? void 0 : status.includes('Running'))) {
                console.log((0, chalk_1.green)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}创建成功！`));
            }
            else {
                (0, child_process_1.execSync)("start taskschd.msc");
                console.log((0, chalk_1.red)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}创建失败！`));
                console.log((0, chalk_1.blue)(`请自行导入${(0, chalk_1.green)((0, path_1.join)(workDir, 'OUC-AUTO-Login.xml'))}文件\n或删除${(0, chalk_1.green)((0, path_1.join)(workDir, 'OUC-AUTO-Login.xml'))}文件后重新运行本程序！`));
            }
            const keep = setInterval(() => { }, 3600000);
            console.log('点击右上角关闭此窗口...');
            process.stdin.setRawMode(true);
            process.stdin.on('data', () => {
                clearInterval(keep);
                process.exit(0);
            });
        }
        else if ((0, os_2.platform)() === 'linux') {
            const workDir = process.cwd();
            const rl = (0, readline_1.createInterface)({
                input: process.stdin,
                output: process.stdout
            });
            const username = yield (0, tools_1.ask)(rl, '请输入校园网帐号（学号）:', true);
            const password = yield (0, tools_1.ask)(rl, '请输入校园网密码:');
            const interval = yield (0, tools_1.ask)(rl, '请输入多久检测一次（单位：分钟）:', true);
            rl.close();
            console.log(`正在创建定时计划...`);
            (0, fs_1.appendFileSync)('/etc/crontab', `\n0/${interval} * * * * cd ${(0, path_1.resolve)(workDir)} && ./OUC-AUTO-Login-linux username=${username} password=${password}\n`);
            const cronTextNew = (0, fs_1.readFileSync)('/etc/crontab').toString();
            if (cronTextNew.includes('OUC-AUTO-Login')) {
                console.log((0, chalk_1.green)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}创建成功！`));
            }
            else {
                console.log((0, chalk_1.red)(`计划任务${(0, chalk_1.blue)('OUC-AUTO-Login')}创建失败！`));
                console.log(`输入 ${(0, chalk_1.blue)('sudo vi /etc/crontab')} 后新增一行 ${`0/${interval} * * * * cd ${(0, path_1.resolve)(workDir)} && ./OUC-AUTO-Login-linux username=${username} password=${password}`}`);
            }
            process.exit(0);
        }
        else if ((0, os_2.platform)() === 'darwin') {
            const workDir = process.cwd();
            const plistPath = `/Library/LaunchDaemons/com.hclonely.oucautologin.plist`;
            const filePath = (0, path_1.join)(workDir, 'OUC-AUTO-Login-macos');
            const rl = (0, readline_1.createInterface)({
                input: process.stdin,
                output: process.stdout
            });
            const username = yield (0, tools_1.ask)(rl, '请输入校园网帐号（学号）:', true);
            const password = yield (0, tools_1.ask)(rl, '请输入校园网密码:');
            const interval = (yield (0, tools_1.ask)(rl, '请输入多久检测一次（单位：分钟）:', true)) || '15';
            rl.close();
            (0, fs_1.writeFileSync)(plistPath, (0, crontab_1.crontabDataMac)(workDir, filePath, username, password, `${parseInt(interval, 10) * 60}`));
            console.log(`正在创建定时计划...`);
            (0, child_process_1.execSync)(`launchctl load ${plistPath}`);
            const status = (0, child_process_1.execSync)(`launchctl list | grep com.hclonely.oucautologin`).toString();
            if (status.includes('com.')) {
                console.log((0, chalk_1.green)(`计划任务${(0, chalk_1.blue)('com.hclonely.oucautologin')}创建成功！`));
                process.exit(0);
            }
            const keep = setInterval(() => { }, 3600000);
            console.log('点击左上角关闭此窗口...');
            process.stdin.setRawMode(true);
            process.stdin.on('data', () => {
                clearInterval(keep);
                process.exit(0);
            });
        }
        return;
    }
    if ((0, fs_1.existsSync)('OUC-AUTO-Login.xml') && !ARGV.username && !ARGV.password) {
    }
    // 清除昨天之前的日志
    if ((0, fs_1.existsSync)('logs')) {
        (0, fs_1.readdirSync)('logs').forEach((filename) => {
            if (![`log-${dayjs().format('YYYY-MM-DD')}.txt`, `log-${dayjs().add(-1, 'day').format('YYYY-MM-DD')}.txt`].includes(filename)) {
                (0, fs_1.unlinkSync)(`logs/${filename}`);
            }
        });
    }
    yield checkStart();
    if (ARGV.interval) {
        (0, tools_1.log)(`计划任务已启用，每${ARGV.interval}分钟检测一次`);
        cron.schedule(`*/${ARGV.interval} * * * *`, () => {
            checkStart();
        });
    }
    function checkStart() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, tools_1.log)('正在检测网络...');
            if (yield (0, tools_1.checkNet)()) {
                (0, tools_1.log)('网络已连接');
                return true;
            }
            (0, tools_1.log)('网络未连接，尝试登录中...');
            if (yield (0, tools_1.login)(ARGV.username, ARGV.password, ARGV.area || 'xihaian')) {
                return (0, tools_1.log)('登陆成功!');
            }
            (0, tools_1.log)('登陆失败!');
        });
    }
}))();
