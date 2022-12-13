"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
(async () => {
    console.log(await (0, tools_1.checkNetShell)());
    /*
    if (await checkNet()) {
      return true;
    }
    await login('', '');
    */
})();
