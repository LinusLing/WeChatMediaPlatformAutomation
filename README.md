# WeChatMediaPlatformAutomation

一款在微信公众号( https://mp.weixin.qq.com )自动发布文章的命令行工具。

## 如何使用

1. 安装：`npm install wechat-mp-automation -g `
2. 打开命令行执行：
   1. 配置文件方式：
      1. `wechat-mp-automation -C YOUR_CONFIG_JSON_FILE_PATH`
   2. 非配置文件方式：
      1. 非原创：`wechat-mp-automation -t [标题] -a [作者] -u [账号] -p [密码]`
      2. 声明原创：`wechat-mp-automation -t [标题] -a [作者] -u [账号] -p [密码] -o`
3. 过程中的两次扫码：一次扫码验证身份登录，一次扫码确认群发（如未异常报错）

> 本工具不以任何形式保存账号和密码！！！

> puppeteer 安装失败可以参考[这里](https://github.com/cnpm/cnpmjs.org/issues/1246#issuecomment-359148058)

## 帮助文档

```git
$ wechat-mp-automation -h
Usage: wechat-mp-automation [options]

Options:
  -V, --version         output the version number
  -C, --configPath [xxx]  配置文件的本地路径（支持所有自定义参数，优先配置文件内的参数）
  -t, --title [xxx]     文章标题
  -a, --author [xxx]    文章作者
  -c, --content [xxx]   文章内容[可选]，默认从粘贴板复制
  -u, --username [xxx]  公众号账号
  -p, --password [xxx]  公众号密码
  -o, --original        声明原创[可选]
  -h, --help            output usage information
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

1.自动发布成功的流程示例

![CorrectResult.png](https://i.loli.net/2019/07/23/5d371a7398b4141770.png)

2.发布失败流程及失败原因

![error_progress.png](https://i.loli.net/2019/07/23/5d371a73c0f5f58172.png)

![ErrorResult.png](https://i.loli.net/2019/07/23/5d37086e81ff423521.png)

## TODO

1. 通过指定特定文件来上传文章内容
2. 文章发布前的设置可进行自定义

## Issues

[意见与建议](https://github.com/LinusLing/WeChatMediaPlatformAutomation/issues/new)

## 赞赏

<div style="float:left;border:solid 1px 000;margin:2px;"><img src="https://i.loli.net/2019/07/23/5d370dca1cf1911283.jpg"  width="300" height="450" ></div>
<div style="float:left;border:solid 1px 000;margin:2px;"><img src="https://i.loli.net/2019/07/23/5d370dcd23ed242202.jpg" width="300" height="450" ></div>
