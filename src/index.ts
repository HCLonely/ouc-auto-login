import { login, checkNet } from './tools';

(async () => {
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

  if (await checkNet()) {
    console.log('网络已连接');
    return true;
  }
  console.log('网络未连接');
  if (!ARGV.username) {
    return console.log('未传入用户名(学号)');
  }
  if (!ARGV.password) {
    return console.log('未传入密码');
  }
  console.log('尝试登录中...');
  if (await login(ARGV.username, ARGV.password)) {
    return console.log('登陆成功!');
  }
  console.log('登陆失败!');
})();
