# ouc-auto-login

自动登录中国海洋大学OUC-AUTO网络帐号。

## 使用方法

1. [点此下载](https://github.com/HCLonely/ouc-auto-login/releases)`OUC-AUTO-Login.exe`程序；
2. 双击运行，按照提示输入帐号密码等；
![Step 2](pics/sp20221214_220704_461.png?raw=true)
3. 程序会自动创建计划任务（创建时请按提示输入当前计算机账户的密码），如果创建失败或你不想让程序自动创建也可以[自行创建计划任务](#自行创建计划任务)。
![Step 3](pics/sp20221214_220357_805.png?raw=true)

## 自行创建计划任务

1. 在按照[使用方法](#使用方法)进行到第二步时，关掉弹出的输入密码窗口，此时程序所在文件夹会生成一个`OUC-AUTO-Login.xml`文件；
2. 按`Win` + `r`键，在弹出的运行窗口中输入`taskschd.msc`并回车；
![Step 2](pics/sp20221214_220853_537.png?raw=true)
3. 在弹出的`任务计划程序`窗口点击右侧的`导入任务`，选择第一步生成的`OUC-AUTO-Login.xml`文件，确定；
![Step 3](pics/Snipaste_2022-12-14_22-11-08.png?raw=true)
4. 输入当前计算机账户的密码（如果有）。
![Result](pics/Snipaste_2022-12-14_22-14-10.png?raw=true)

## 其他说明

- 计划任务创建完成后不要将`OUC-AUTO-Login.exe`文件移动到其他位置，不要重命名`OUC-AUTO-Login.exe`文件！
