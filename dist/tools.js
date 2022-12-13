"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNetShell = exports.login = void 0;
const axios_1 = require("axios");
const child_process_1 = require("child_process");
const loginNode = async (username, password) => {
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
        console.log(response);
        if (response.data?.includes('认证成功') || response.data?.includes('已经在线')) {
            return true;
        }
        return false;
    })
        .catch((error) => {
        console.log(error);
        return false;
    });
};
const loginShell = async (username, password) => {
    try {
        const result = (0, child_process_1.execSync)(`curl -sS "http://192.168.101.201:801/eportal/portal/login?callback=AutoLogin&login_method=1&user_account=${username}&user_password=${password}&wlan_user_ip=0.0.0.0&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=&jsVersion=4.1&terminal_type=1&lang=zh-cn&v=3689&lang=zh" -H "Host: 192.168.101.201:801" -H "Referer: http://192.168.101.201/" -H "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27")`)?.toString();
        console.log(result);
        if (result?.includes('认证成功') || result?.includes('已经在线')) {
            return true;
        }
        return false;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
const login = async (username, password) => {
    if (await loginNode(username, password)) {
        return true;
    }
    if (await loginShell(username, password)) {
        return true;
    }
    return false;
};
exports.login = login;
const checkNetNode = async () => {
    return (0, axios_1.default)({
        url: 'http://baidu.com',
        method: 'get',
        timeout: 6000
    })
        .then((response) => {
        if (response.data.includes('NextURL')) {
            return false;
        }
        return true;
        console.log(response);
        /*
        '<html>\n' +
      '<meta http-equiv="refresh" content="0;url=http://www.baidu.com/">\n' +
      '</html>\n'
      */
    })
        .catch((error) => {
        console.log(error.response);
        console.log(error.response?.headers);
        // if (error.response?.headers)
    });
};
const checkNetShell = () => {
    try {
        const result = (0, child_process_1.execSync)(`curl -sS --connect-timeout 60 http://baidu.com`)?.toString();
        console.log(result);
        if (result?.includes('NextURL')) {
            return false;
        }
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.checkNetShell = checkNetShell;
