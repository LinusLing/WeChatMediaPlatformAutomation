#!/usr/bin/env node

const puppeteer = require('puppeteer');
const open = require('open')
const clipboardy = require('clipboardy');
const LocalDate = require('js-localdate-plus');
var fs = require('fs');
const program = require('commander');

program
    .version('1.2.0')
    .usage(' [options]')
    .option('-C, --configPath [xxx]', '配置文件的本地路径（支持所有自定义参数）')
    .option('-t, --title [xxx]', '文章标题')
    .option('-a, --author [xxx]', '文章作者')
    .option('-c, --content [xxx]', '文章内容[可选]，默认从粘贴板复制')
    .option('-u, --username [xxx]', '公众号账号')
    .option('-p, --password [xxx]', '公众号密码')
    .option('-o, --original', '声明原创[可选]')
    .option('--preview', '预览而不发布[可选]')
    .option('--preview_username [xxx~yyy]', '预览名单[可选]，以~间隔多个微信号（自行保证微信号已关注公众号）')
    .option('--skip_typing', '跳过文章标题、作者、文章的填写和封面图片选择（声明原创除外）[可选]')
    .option('--last_edit', '选中最近编辑的文章[可选]，请自行确保当前有“最近编辑”的文章')
    .parse(process.argv);

let title;
let author;
let content;
let username;
let password;
let original;
let preview;
let preview_username;
let skip_typing;
let last_edit;

if (program.configPath !== undefined) {
    try {
        const contents = fs.readFileSync(program.configPath);
        const jsonContent = JSON.parse(contents);
        title = jsonContent.title || undefined;
        author = jsonContent.author || undefined;
        content = jsonContent.content || undefined;
        username = jsonContent.username || undefined;
        password = jsonContent.password || undefined;
        original = jsonContent.original || undefined;
        preview = jsonContent.preview || undefined;
        preview_username = program.preview_username.split("~") || undefined;
        skip_typing = jsonContent.skip_typing || undefined;
        last_edit = jsonContent.last_edit || undefined;
        console.log('读取配置文件成功');
    } catch (error) {
        console.log('读取配置文件失败');
        console.log(error);
    }
}

console.log("----------配置内容 begin----------");

if (title === undefined) {
    if (program.title === undefined) {
        console.log('缺少文章标题， -h 了解如何使用');
        return;
    } else {
        title = String(program.title);
        console.log('文章标题：' + title);
    }
}

if (author === undefined) {
    if (program.author === undefined) {
        console.log('缺少文章作者， -h 了解如何使用');
        return;
    } else {
        author = String(program.author);
        console.log('文章作者：' + author);
    }
}
if (content === undefined) {
    if (program.content === undefined) {} else {
        content = String(program.content);
    }
}
if (username === undefined) {
    if (program.username === undefined) {
        console.log('缺少公众号账号， -h 了解如何使用');
        return;
    } else {
        username = String(program.username);
    }
}
if (password === undefined) {
    if (program.password === undefined) {
        console.log('缺少公众号密码， -h 了解如何使用');
        return;
    } else {
        password = String(program.password);
    }
}
if (original === undefined) {
    if (program.original === undefined) {} else {
        original = program.original;
    }
}
console.log((!original ? "文章不" : "文章将") + "声明原创");

if (preview === undefined) {
    if (program.preview === undefined) {} else {
        preview = program.preview;
        console.log("文章不会发布，只预览");
    }
}

if (preview_username === undefined) {
    if (program.preview_username === undefined) {} else {
        preview_username = program.preview_username.split("~");
        console.log("可预览本文章的微信号：" + preview_username + "（关注公众号后，才能接收图文消息预览）");
    }
}

if (skip_typing === undefined) {
    if (program.skip_typing === undefined) {} else {
        skip_typing = program.skip_typing;
        console.log("将跳过文章标题、作者、文章的填写和封面图片选择（声明原创除外）");
    }
}

if (last_edit === undefined) {
    if (program.last_edit === undefined) {} else {
        last_edit = program.last_edit;
    }
}
console.log(last_edit ? "将选中最近编辑的文章" : "将新建群发的文章");

console.log("----------配置内容 end----------");

const url = "https://mp.weixin.qq.com/"

function autoLogin() {
    return new Promise(async (resolve, reject) => {
        const browserConfig = process.env.SHOW_BROWSER ? {
            headless: false,
            slowMo: 100
        } : {}
        browserConfig['defaultViewport'] = null; // 页面最大化
        const browser = await puppeteer.launch(browserConfig);
        let page = await browser.newPage();
        await page.setViewport({
            width: 1200,
            height: 890,
        });

        try {
            let clickAndWaitForTarget = async (clickSelector, page, browser) => {
                const pageTarget = page.target(); //save this to know that this was the opener
                await page.click(clickSelector); //click on a link
                const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget); //check that you opened this page, rather than just checking the url
                const newPage = await newTarget.page(); //get the page object
                // await newPage.once("load",()=>{}); //this doesn't work; wait till page is loaded
                await newPage.waitForSelector("body"); //wait for page to be loaded

                return newPage;
            };

            // 打开首页
            console.log("正在打开登录首页...");
            await page.goto(url);

            // 登录
            console.log("正在登录...");
            const element = await page.$('[class="login__type__container login__type__container__scan"]');
            if (element) {
                await page.click('#header > div.banner > div > div > div.login__type__container.login__type__container__scan > a')
            }

            await page.waitForSelector('#header > div.banner > div > div > div.login__type__container.login__type__container__account > form > div.login_btn_panel > a');
            //type the name
            await page.focus('#header > div.banner > div > div > div.login__type__container.login__type__container__account > form > div.login_input_panel > div:nth-child(1) > div > span > input')
            await page.keyboard.type(username);
            //type the pwd
            await page.focus('#header > div.banner > div > div > div.login__type__container.login__type__container__account > form > div.login_input_panel > div:nth-child(2) > div > span > input')
            await page.keyboard.type(password);
            await page.waitFor(50);
            //Click on the submit button
            await page.click('#header > div.banner > div > div > div.login__type__container.login__type__container__account > form > div.login_btn_panel > a')

            // 扫码登录
            console.log("扫码登录中...");
            const IMAGE_SELECTOR = '#app > div.weui-desktop-layout__main__bd > div > div.js_scan.weui-desktop-qrcheck > div.weui-desktop-qrcheck__qrcode-area > div > img'
            await page.waitForSelector(IMAGE_SELECTOR);
            await page.waitFor(500);
            await page.screenshot({
                path: 'screenshot.png',
                clip: {
                    x: 390,
                    y: 270,
                    width: 420,
                    height: 330
                }
            });
            open('screenshot.png');

            if (last_edit) {
                // 最近编辑
                console.log("打开最近编辑的文章中...");
                const LAST_EDIT_BUTTON_SELECTOR = '#app > div.main_bd > div:nth-child(3) > div.weui-desktop-panel__bd > div > span > a:nth-child(1)';
                await Promise.race([
                    page.waitForSelector(LAST_EDIT_BUTTON_SELECTOR)
                ]);
                await page.waitFor(500);
                page = await clickAndWaitForTarget(LAST_EDIT_BUTTON_SELECTOR, page, browser);

                // 删除扫码登录截图
                fs.unlinkSync('screenshot.png');

                await page.waitFor(5000);
            } else {
                // 新建群发
                console.log("新建群发文章中...");
                const NEW_POST_WITH_DRAFT = '#app > div.main_bd > div:nth-child(3) > div.weui-desktop-panel__hd.weui-desktop-global-mod > div.weui-desktop-global__extra > a'
                const NEW_POST = '#app > div.main_bd > div:nth-child(3) > div > div > a'
                const NEW_POST_CLASS_NAME = 'weui-desktop-btn weui-desktop-btn_primary'
                const element2 = await Promise.race([
                    page.waitForSelector(NEW_POST),
                    page.waitForSelector(NEW_POST_WITH_DRAFT)
                ]);
                var props = await page.evaluate(
                    element => Array.from(element.attributes, ({
                        name,
                        value
                    }) => name === 'class' ? `${value}` : null),
                    element2
                );
                const realClassName = props.find(value => value !== null);
                let REAL_SELECTOR;
                if (realClassName === NEW_POST_CLASS_NAME) {
                    REAL_SELECTOR = NEW_POST;
                } else {
                    REAL_SELECTOR = NEW_POST_WITH_DRAFT;
                }
                await page.waitFor(500);
                page = await clickAndWaitForTarget(REAL_SELECTOR, page, browser);
                await page.setViewport({
                    width: 1200,
                    height: 890,
                });
                await page.waitForSelector("body");
                await page.waitFor(5000);

                // 删除扫码登录截图
                fs.unlinkSync('screenshot.png');

                await page.evaluate(() => {
                    window.click = function click(x, y) {
                        var ev = document.createEvent("MouseEvent");
                        var el = document.elementFromPoint(x, y);
                        ev.initMouseEvent(
                            "click",
                            true /* bubble */ , true /* cancelable */ ,
                            window, null,
                            x, y, 0, 0, /* coordinates */
                            false, false, false, false, /* modifier keys */
                            0 /*left*/ , null
                        );
                        el.dispatchEvent(ev);
                    }
                });
                await page.evaluate(() => {
                    const click = window.click;
                    click(600, 470);
                });

                const pageTarget = page.target(); //save this to know that this was the opener
                // await page.click(clickSelector); //click on a link
                const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget); //check that you opened this page, rather than just checking the url
                page = await newTarget.page(); //get the page object
                await page.setViewport({
                    width: 1200,
                    height: 890,
                });
                await page.waitForSelector("body");
                await page.waitFor(5000);
            }

            if (!skip_typing) {
                // 文章标题
                console.log("正在填写文章标题...");
                await page.click('#title');
                await page.waitFor(100);
                await page.keyboard.type(String(title));
                await page.waitFor(100);

                // 文章作者
                console.log("正在填写文章作者...");
                await page.keyboard.press('Tab', {
                    delay: 100
                });
                await page.keyboard.type(String(author));
                await page.waitFor(100);

                // 文章内容
                console.log("正在填写文章内容...");
                await page.keyboard.press('Tab', {
                    delay: 100
                });

                var pasted_content;
                if (content) {
                    // 指定文章内容时，模拟键盘输入内容
                    pasted_content = content;
                    await page.keyboard.type(String(pasted_content));
                } else {
                    // 未指定文章内容时，采用剪贴板粘贴的方式填入内容
                    pasted_content = await clipboardy.read();
                    // https://stackoverflow.com/questions/11750447/performing-a-copy-and-paste-with-selenium-2#answer-41046276
                    // https://github.com/puppeteer/puppeteer/blob/56742ebe8cbb353d7739faee358f60832ef113e5/src/USKeyboardLayout.ts
                    await page.keyboard.down('ShiftLeft')
                    await page.keyboard.press('Insert')
                    await page.keyboard.up('ShiftLeft')
                }
                await page.waitFor(100);

                console.log("----------文章内容 begin----------");
                console.log(pasted_content)
                console.log("----------文章内容 end----------");

                // 封面图片选择
                console.log("正在自动选择封面图片...");
                await page.hover('#js_cover_area > div.select-cover__btn.js_cover_btn_area');
                await page.waitFor(500);
                await page.click('#js_imagedialog');
                await page.waitForSelector('div > div.weui-desktop-media-list-wrp.weui-desktop-img-picker__list__wrp.js_img-picker_wrapper > ul > li:nth-child(1)');

                let day = (new LocalDate()).getDay();
                const len = await page.$$eval('.weui-desktop-img-picker__list > li.weui-desktop-img-picker__item > i', links => {
                    return links.length
                });
                let offset = day % len + 1;
                const left = 'div > div.weui-desktop-media-list-wrp.weui-desktop-img-picker__list__wrp.js_img-picker_wrapper > ul > li:nth-child(';
                const right = ')';
                await page.click(left + String(offset) + right);

                await page.click('div.weui-desktop-dialog__wrp.weui-desktop-dialog_img-picker.weui-desktop-dialog_img-picker-with-crop > div > div.weui-desktop-dialog__ft > button');
                await page.waitFor(1200);

                // 选择图片完成
                const IMG_DONE = "div.weui-desktop-dialog__wrp.weui-desktop-dialog_img-picker.weui-desktop-dialog_img-picker-with-crop > div > div.weui-desktop-dialog__ft > button:nth-child(3)";
                await page.waitForSelector(IMG_DONE);
                await page.waitFor(200);
                await page.click(IMG_DONE);
                await page.waitFor(2000);
            }

            if (original) {
                // 声明原创
                console.log("正在声明原创...");

                await page.evaluate(() => {
                    document.querySelector('#js_original > div.unorigin.js_original_type > div.setting-group__content > a').click();
                });
                await page.waitForSelector("label[for='js_copyright_agree'");
                await page.click('body > div.dialog_wrp.simple.align_edge.original_dialog.ui-draggable > div > div.dialog_bd > div.step_panel.step_agreement.js_step_panel > div > div > div > div.tool_area.new-tool_area > label > i');
                await page.click('body > div.dialog_wrp.simple.align_edge.original_dialog.ui-draggable > div > div.dialog_ft > span:nth-child(1) > button');
                await page.waitFor(50);
                await page.click('#js_original_article_type > div > a');
                await page.waitFor(50);
                await page.click('#js_original_article_type > div > div > div > div.weui-desktop-dropdown__list__cascade__container.js_scroll_area.js_data > dl > dd > dl:nth-child(2) > dt');
                await page.waitFor(50);
                await page.click('body > div.dialog_wrp.simple.align_edge.original_dialog.ui-draggable > div > div.dialog_ft > span:nth-child(3) > button');
                await page.waitFor(500);
            } else {
                await page.waitFor(500);
            }

            if (preview) {
                // 预览
                console.log("正在预览文章...");
                const PREVIEW_BTN = "#js_preview > button";
                await page.waitForSelector(PREVIEW_BTN);
                await page.click(PREVIEW_BTN);
                await page.waitFor(500);

                const element = await page.$('[class="weui-desktop-form-tag__name"]');
                if (!element) {
                    console.log("正在填写预览名单...");
                    // 没有默认预览的名单，则添加 preview_username 中的名单
                    await page.waitForSelector('#js_preview_wxname');
                    await page.focus('#js_preview_wxname');
                    for (const key in preview_username) {
                        const username = preview_username[key];
                        await page.keyboard.type(username);
                        await page.keyboard.press('Enter', {
                            delay: 100
                        });
                        await page.waitFor(1500);
                    }
                }

                // 预览确认
                console.log("预览确认中...");
                const PREVIEW_CONFIRM_BTN = "body > div.dialog_wrp.label_block.wechat_send_dialog.ui-draggable > div > div.dialog_ft > span.btn.btn_primary.btn_input.js_btn_p > button"
                await page.waitForSelector(PREVIEW_CONFIRM_BTN);
                await page.click(PREVIEW_CONFIRM_BTN);

                await page.waitFor(500);
                console.log("预览发布成功。");
            } else {
                // 保存并转发
                console.log("正在保存文章并转发...");
                const SEND_BTN = "#js_send > button";
                await page.waitForSelector(SEND_BTN);
                await page.click(SEND_BTN);
                await page.waitFor(500);

                // 群发+确认群发
                console.log("扫码确认群发中...");
                const SCAN_SEND_BTN = "#send_btn_main > div > a";
                await page.waitForSelector(SCAN_SEND_BTN);
                await page.click(SCAN_SEND_BTN);
                const CONFIRM_SEND_BTN = "#vue_app > div:nth-child(3) > div.weui-desktop-dialog__wrp > div > div.weui-desktop-dialog__ft > button.weui-desktop-btn.weui-desktop-btn_primary";
                await page.waitForSelector(CONFIRM_SEND_BTN);
                await page.waitFor(500);
                await page.click(CONFIRM_SEND_BTN);

                // 等待确认二维码
                await page.waitForSelector('body > div.dialog_wrp.ui-draggable > div > div.dialog_bd > div > div > div.qrcode_wrp > img')
                await page.waitFor(500);
                await page.screenshot({
                    path: 'confirmSend.png',
                    clip: {
                        x: 460,
                        y: 480,
                        width: 280,
                        height: 330
                    }
                });
                open('confirmSend.png');

                // 等待发布成功页面展示
                const MAIN_BD = "#app > div.main_bd";
                await page.waitForSelector(MAIN_BD);
                await page.waitFor(500);
                console.log("群发发布成功。");

                // 删除扫码确认发布截图
                fs.unlinkSync('confirmSend.png');
            }

            // 结束
            browser.close();
            return resolve();
        } catch (e) {
            // 异常时截图保存
            await page.screenshot({
                path: 'ErrorResult.png',
            });
            console.log("发生异常，详情请见 ErrorResult.png");
            // 结束
            browser.close();
            return reject(e);
        }
    })
}
autoLogin().catch(console.error);