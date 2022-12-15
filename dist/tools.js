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
exports.ask = exports.log = exports.checkNet = exports.login = void 0;
const axios_1 = require("axios");
const child_process_1 = require("child_process");
const chalk_1 = require("chalk");
const dayjs = require("dayjs");
const fs_1 = require("fs");
const util_1 = require("util");
const log = (data, debug = false) => {
    if (!debug) {
        console.log(`${(0, chalk_1.gray)(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)} ${(0, util_1.format)(data)}`);
    }
    if (!(0, fs_1.existsSync)('logs')) {
        (0, fs_1.mkdirSync)('logs');
    }
    (0, fs_1.appendFileSync)(`logs/log-${dayjs().format('YYYY-MM-DD')}.txt`, `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${(0, util_1.format)(data).replace(/\x1B\[[\d]*?m/g, '')}\n`);
};
exports.log = log;
const ask = (rl, question, isNumber = false) => new Promise((resolve) => {
    rl.question(`${question}`, (chunk) => {
        const answer = chunk.toString().trim();
        if (isNumber && !/^[\d]+$/.test(answer)) {
            if (!/^[\d]+$/.test(answer)) {
                return resolve(ask(rl, (0, chalk_1.red)('格式错误，请重新输入:'), isNumber));
            }
        }
        return resolve(answer);
    });
});
exports.ask = ask;
const loginNode = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, axios_1.default)({
        url: `http://192.168.101.201:801/eportal/portal/login?callback=AutoLogin&login_method=1&user_account=${username}&user_password=${password}&wlan_user_ip=0.0.0.0&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=&jsVersion=4.1&terminal_type=1&lang=zh-cn&v=3689&lang=zh`,
        method: 'get',
        responseType: 'text',
        headers: {
            'Host': '192.168.101.201:801',
            'Referer': 'http://192.168.101.201/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46'
        }
    })
        .then((response) => {
        var _a, _b;
        log(response, true);
        if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.includes('认证成功')) || ((_b = response.data) === null || _b === void 0 ? void 0 : _b.includes('已经在线'))) {
            return true;
        }
        return false;
    })
        .catch((error) => {
        log(error, true);
        return false;
    });
});
const loginShell = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const result = (_a = (0, child_process_1.execSync)(`curl -sS "http://192.168.101.201:801/eportal/portal/login?callback=AutoLogin&login_method=1&user_account=${username}&user_password=${password}&wlan_user_ip=0.0.0.0&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=&jsVersion=4.1&terminal_type=1&lang=zh-cn&v=3689&lang=zh" -H "Host: 192.168.101.201:801" -H "Referer: http://192.168.101.201/" -H "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27")`)) === null || _a === void 0 ? void 0 : _a.toString();
        log(result, true);
        if ((result === null || result === void 0 ? void 0 : result.includes('认证成功')) || (result === null || result === void 0 ? void 0 : result.includes('已经在线'))) {
            return true;
        }
        return false;
    }
    catch (error) {
        log(error, true);
        return false;
    }
});
const login = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield loginNode(username, password)) || (yield loginShell(username, password));
});
exports.login = login;
const checkNetNode = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, axios_1.default)({
        url: 'http://baidu.com',
        method: 'get',
        maxRedirects: 0,
        timeout: 60000
    })
        .then((response) => {
        log(response, true);
        return true;
    })
        .catch((error) => {
        log(error, true);
        return false;
    });
});
const checkNetShell = () => {
    var _a;
    try {
        const result = (_a = (0, child_process_1.execSync)(`curl -sS --connect-timeout 60 http://baidu.com`)) === null || _a === void 0 ? void 0 : _a.toString();
        log(result, true);
        if (result === null || result === void 0 ? void 0 : result.includes('NextURL')) {
            return false;
        }
        return true;
    }
    catch (error) {
        log(error, true);
        return false;
    }
};
const checkNet = () => __awaiter(void 0, void 0, void 0, function* () {
    return (yield checkNetNode()) || checkNetShell();
});
exports.checkNet = checkNet;
