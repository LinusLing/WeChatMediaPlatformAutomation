# WeChatMediaPlatformAutomation

一款在微信公众号( https://mp.weixin.qq.com )自动预览/发布文章的命令行工具。

## 如何使用

1. 安装：`npm install wechat-mp-automation -g `

2. 打开命令行执行：
   1. 配置文件方式：
      1. `wechat-mp-automation -C YOUR_CONFIG_JSON_FILE_PATH`
   2. 非配置文件方式：
      1. 非原创：`wechat-mp-automation -t [标题] -a [作者] -u [账号] -p [密码]`
      2. 声明原创：`wechat-mp-automation -t [标题] -a [作者] -u [账号] -p [密码] -o`
      3. 其余参数，参看如下帮助文档👇
   
3. 过程中的扫码：

   1. 一次扫码，验证身份后登录
   2. 若设置了只预览不发布（1.2.0 起支持 `--preview`），无需扫码即可预览文章
   3. 1.2.0 前版本或未设置预览的情况，还需一次扫码，确认群发（如群发前，未异常报错的话）

> 本工具不以任何形式保存账号和密码！！！

> puppeteer 安装失败可以参考[这里](https://github.com/cnpm/cnpmjs.org/issues/1246#issuecomment-359148058)

## 帮助文档

```git
$ wechat-mp-automation -h
Usage: wechat-mp-automation [options]

Options:
  -V, --version                 output the version number
  -C, --configPath [xxx]        配置文件的本地路径（支持所有自定义参数）
  -t, --title [xxx]             文章标题
  -a, --author [xxx]            文章作者
  -c, --content [xxx]           文章内容[可选]，默认从粘贴板复制
  -u, --username [xxx]          公众号账号
  -p, --password [xxx]          公众号密码
  -o, --original                声明原创[可选]
  --preview                     预览而不发布[可选]
  --preview_username [xxx~yyy]  预览名单[可选]，以~间隔多个微信号（自行保证微信号已关注公众号）
  --skip_typing                 跳过文章标题、作者、文章的填写和封面图片选择（声明原创除外）[可选]
  --last_edit                   选中最近编辑的文章[可选]，请自行确保当前有“最近编辑”的文章
  -h, --help                    output usage information
```

config.json demo:
```json
{
  "title": "test",
  "author": "小铁匠Linus",
  "username": "YOUR_USERNAME",
  "password": "YOUR_PASSWORD",
  "original": "true"
}
```

## CHANGELOG

<details>
<summary>1.3.1</summary>
</br>
<p>1. 修复点击封面图片选择失效的问题</p>
</details>

<details>
<summary>1.3.0</summary>
</br>
<p>1. 支持新版本的公众号后台</p>
</details>

<details>
<summary>1.2.0</summary>
</br>
<p>1. 支持预览文章，而不发布</p>
<p>2. 选择预览时，支持指定预览的微信号名单（自行保证微信号已关注公众号）</p>
<p>3. 支持跳过填写内容，建议用于二次预览或发布的情况</p>
<p>4. 支持选择最近编辑的文章功能，避免每次都新建群发</p>
<p>5. 未指定文章内容时，采用剪贴板粘贴的方式填入内容，替换原模拟键盘输入的方式</p>
</details>

<details>
<summary>1.1.1</summary>
</br>
<p>1. 登录默认选择账号密码登录</p>
<p>2. 官网页面元素的更正，恢复群发流程</p>
</details>

<details>
<summary>1.1.0</summary>
</br>
<p>1. 支持使用 JSON 格式的本地配置文件作为参数，避免命令行泄漏关键信息</p>
<p>2. 支持在发布过程中展示文章内容</p>
</details>

## Demo

1. 利用**文章内容默认从粘贴板复制**的特性，配合一行命令生成公众号内容的工具 [wechat-format-cli](https://github.com/LinusLing/wechat-format-cli) 使用更香

![cli.png](https://i.loli.net/2020/06/19/GDEwdxrHnTVRyZe.png)

2. 预览最近编辑的文章（用于上一次异常报错或想查看最近一次编辑的文章）

![1.2.0.png](https://i.loli.net/2020/06/19/FzryZdN5VsXoplw.png)

2. 自动发布成功的流程示例

![CorrectResult.png](https://i.loli.net/2019/07/23/5d371a7398b4141770.png)

2. 发布失败流程及失败原因

![error_progress.png](https://i.loli.net/2019/07/23/5d371a73c0f5f58172.png)

![ErrorResult.png](https://i.loli.net/2019/07/23/5d37086e81ff423521.png)

## TODO

1. 通过指定特定文件来上传文章内容
2. 文章发布前的设置可进行自定义（比如~~预览~~、图片选择等）
3. 支持更多种类的创作（~~图文消息~~、文字消息、视频消息、音频消息、图片消息、转载等）

## Issues

[意见与建议](https://github.com/LinusLing/WeChatMediaPlatformAutomation/issues/new)

## 赞赏

<div style="float:left;border:solid 1px 000;margin:2px;"><img src="https://i.loli.net/2019/07/23/5d370dca1cf1911283.jpg" width="300" height="450" ></div>
<div style="float:left;border:solid 1px 000;margin:2px;"><img src="https://i.loli.net/2019/07/23/5d370dcd23ed242202.jpg" width="300" height="450" ></div>
