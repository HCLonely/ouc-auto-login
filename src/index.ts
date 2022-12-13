import { login, checkNetShell } from './tools';

(async () => {
  console.log(checkNetShell());
  /*
  if (await checkNet()) {
    return true;
  }
  await login('', '');
  */
})();
