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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const version = '1.0.6';
    console.log(`OUC-AUTO-Login ${(0, chalk_1.blue)(`v${version}`)} By ${(0, chalk_1.green)('HCLonely')}\n`);
    // 获取传入的参数
    const ARGV = {};
    process.argv.forEach((e) => {
        const [name, value] = e.split('=');
        if (name && value) {
            ARGV[name] = value;
            return e;
        }
        return e;
    });
    if (Object.keys(ARGV).length === 0) {
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
    if (!ARGV.username && !ARGV.password) {
        const PCUsername = `${(0, os_1.hostname)()}\\${(0, os_1.userInfo)().username}`;
        const PCUserSid = Object.fromEntries((0, child_process_1.execSync)('whoami /user').toString().split(/(\r?\n)+/).map((data) => data.trim().split(/[\s]+/)))[PCUsername.toLowerCase()];
        const workDir = process.cwd();
        const filePath = (0, path_1.join)(workDir, 'OUC-AUTO-Login.exe');
        const rl = (0, readline_1.createInterface)({
            input: process.stdin,
            output: process.stdout
        });
        const username = yield (0, tools_1.ask)(rl, '请输入校园网帐号（学号）:', true);
        const password = yield (0, tools_1.ask)(rl, '请输入校园网密码:');
        const interval = yield (0, tools_1.ask)(rl, '请输入多久检测一次（单位：分钟）:', true);
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
        return;
    }
    if ((0, fs_1.existsSync)('OUC-AUTO-Login.xml') && !ARGV.username && !ARGV.password) {
    }
    if (!ARGV.username) {
        (0, tools_1.log)((0, chalk_1.red)('未传入用户名(学号)'));
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
        (0, tools_1.log)((0, chalk_1.red)('未传入密码'));
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
    if ((0, fs_1.existsSync)('logs')) {
        (0, fs_1.readdirSync)('logs').forEach((filename) => {
            if (![`log-${dayjs().format('YYYY-MM-DD')}.txt`, `log-${dayjs().add(-1, 'day').format('YYYY-MM-DD')}.txt`].includes(filename)) {
                (0, fs_1.unlinkSync)(`logs/${filename}`);
            }
        });
    }
    (0, tools_1.log)('正在检测网络...');
    if (yield (0, tools_1.checkNet)()) {
        (0, tools_1.log)('网络已连接');
        return true;
    }
    (0, tools_1.log)('网络未连接，尝试登录中...');
    if (yield (0, tools_1.login)(ARGV.username, ARGV.password)) {
        return (0, tools_1.log)('登陆成功!');
    }
    (0, tools_1.log)('登陆失败!');
}))();
