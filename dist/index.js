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
const tools_1 = require("./tools");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const ARGV = {};
    process.argv.forEach((e) => {
        const [name, value] = e.split('=');
        if (name && value) {
            ARGV[name] = value;
            return e;
        }
        return e;
    });
    if (yield (0, tools_1.checkNet)()) {
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
    if (yield (0, tools_1.login)(ARGV.username, ARGV.password)) {
        return console.log('登陆成功!');
    }
    console.log('登陆失败!');
}))();
