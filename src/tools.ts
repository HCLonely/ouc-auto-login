import axios from 'axios';
import { execSync } from 'child_process';
import { gray, red } from 'chalk';
import * as dayjs from 'dayjs';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { format } from 'util';
import type { Interface } from 'readline';

const log = (data: any, debug: boolean = false) => {
  if (!debug) {
    console.log(`${gray(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)} ${format(data)}`);
  }
  if (!existsSync('logs')) {
    mkdirSync('logs');
  }
  appendFileSync(`logs/log-${dayjs().format('YYYY-MM-DD')}.txt`, `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${format(data.replace(/\x1B\[[\d]*?m/g, ''))}\n`);
}
const ask = (rl: Interface, question: string, isNumber: boolean = false): Promise<string> => new Promise((resolve) => {
  rl.question(`${question}`, (chunk) => {
    const answer = chunk.toString().trim();
    if (isNumber && !/^[\d]+$/.test(answer)) {
      if (!/^[\d]+$/.test(answer)) {
        return resolve(ask(rl, red('格式错误，请重新输入:'), isNumber));
      }
    }
    return resolve(answer);
  });
});
const loginNode = async (username: string, password: string): Promise<boolean> => {
  return axios({
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
      log(response, true);
      if (response.data?.includes('认证成功') || response.data?.includes('已经在线')) {
        return true;
      }
      return false;
    })
    .catch((error) => {
      log(error, true);
      return false;
    })
}
const loginShell = async (username: string, password: string): Promise<boolean> => {
  try {
    const result = execSync(`curl -sS "http://192.168.101.201:801/eportal/portal/login?callback=AutoLogin&login_method=1&user_account=${username}&user_password=${password}&wlan_user_ip=0.0.0.0&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=&jsVersion=4.1&terminal_type=1&lang=zh-cn&v=3689&lang=zh" -H "Host: 192.168.101.201:801" -H "Referer: http://192.168.101.201/" -H "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27")`)?.toString();
    log(result, true);
    if (result?.includes('认证成功') || result?.includes('已经在线')) {
      return true;
    }
    return false;
  } catch (error) {
    log(error, true);
    return false;
  }
}

const login = async (username: string, password: string): Promise<boolean> => {
  return await loginNode(username, password) || await loginShell(username, password);
}

const checkNetNode = async (): Promise<boolean> => {
  return axios({
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
}
const checkNetShell = (): boolean => {
  try {
    const result = execSync(`curl -sS --connect-timeout 60 http://baidu.com`)?.toString();
    log(result, true);
    if (result?.includes('NextURL')) {
      return false;
    }
    return true;
  } catch (error) {
    log(error, true);
    return false;
  }
}

const checkNet = async () => {
  return await checkNetNode() || checkNetShell();
}

export { login, checkNet, log, ask }
