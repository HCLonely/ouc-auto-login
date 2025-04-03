import axios from 'axios';
import { execSync } from 'child_process';
import { gray, red } from 'chalk';
import * as dayjs from 'dayjs';
import { appendFileSync } from 'fs';
import { format } from 'util';
import type { Interface } from 'readline';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
// dayjs.tz.setDefault('Asia/Shanghai');

const log = (data: any, debug: boolean = false) => {
  if (!debug) {
    console.log(`${gray(`[${dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')}]`)} ${format(data)}`);
  }
  appendFileSync(`logs/log-${dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD')}.txt`, `[${dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')}] ${format(data).replace(/\x1B\[[\d]*?m/g, '')}\n`);
}
const ask = (rl: Interface, question: string, isNumber: boolean = false): Promise<string> => new Promise((resolve) => {
  rl.question(`${question}`, (chunk) => {
    const answer = chunk.toString().trim();
    if (isNumber && !/^[\d]+$/.test(answer)) {
      return resolve(ask(rl, red('格式错误，请重新输入:'), isNumber));
    }
    return resolve(answer);
  });
});

const loginNode = async (username: string, password: string, loginUrl: string, userIp: string): Promise<boolean> => {
  return axios({
    url: `${loginUrl}/eportal/portal/login?callback=AutoLogin&login_method=1&user_account=${username}&user_password=${password}&wlan_user_ip=${userIp}&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=&jsVersion=4.1&terminal_type=1&lang=zh-cn&v=3689&lang=zh`,
    method: 'get',
    responseType: 'text',
    headers: {
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
const loginShell = async (username: string, password: string, loginUrl: string, userIp: string): Promise<boolean> => {
  try {
    const result = execSync(`curl -sS "${loginUrl}/eportal/portal/login?callback=AutoLogin&login_method=1&user_account=${username}&user_password=${password}&wlan_user_ip=${userIp}&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=&jsVersion=4.1&terminal_type=1&lang=zh-cn&v=3689&lang=zh" -H "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27"`)?.toString();
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
const getIpNode = async (): Promise<string | null | undefined> => {
  return axios({
    url: 'https://wxrz.ouc.edu.cn/',
    method: 'get',
    responseType: 'text',
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46'
    }
  })
    .then((response) => {
      log(response, true);
      const ip = response.data?.match(/v64ip='(\d+\.\d+\.\d+\.\d+)'/)?.[1];
      return ip;
    })
    .catch((error) => {
      log(error, true);
      return null;
    });
};
const getIpShell = async (): Promise<string> => {
  try {
    const result = execSync(`curl -sS -k "https://wxrz.ouc.edu.cn/" --resolve wxrz.ouc.edu.cn:443:10.100.29.2 -H "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27" | grep -Po "v46?ip='\\d+.\\d+.\\d+.\\d+'" | grep -Po -m 1 "\\d+.\\d+.\\d+.\\d+"`)?.toString();
    log(result, true);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(result)) {
      return result;
    }
    return '0.0.0.0';
  } catch (error) {
    log(error, true);
    return '0.0.0.0';
  }
};
const login = async (username: string, password: string, area: 'laoshan' | 'xihaian' = 'xihaian'): Promise<boolean> => {
  const loginUrls = {
    laoshan: 'https://10.100.29.2:802',
    xihaian: 'http://192.168.101.201:801'
  };
  const loginUrl = loginUrls[area] || loginUrls['xihaian'];
  const ip = await getIpNode() || await getIpShell() || '0.0.0.0';
  return await loginNode(username, password, loginUrl, ip) || await loginShell(username, password, loginUrl, ip);
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
      if (response.data?.includes('wxrz.ouc.edu.cn')) {
        return false;
      }
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
    if (result?.includes('NextURL') || result?.includes('wxrz.ouc.edu.cn')) {
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
