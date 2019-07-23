#!/usr/bin/env node

const puppeteer = require('puppeteer');
const open = require('open')
const clipboardy = require('clipboardy');
const LocalDate = require('js-localdate-plus');
var fs = require('fs');
const program = require('commander');

program
    .version('1.0.0')
    .usage(' [options]')
    .option('-t, --title [xxx]', '文章标题')
    .option('-a, --author [xxx]', '文章作者')
    .option('-c, --content [xxx]', '文章内容[可选]，默认从粘贴板复制')
    .option('-u, --username [xxx]', '公众号账号')
    .option('-p, --password [xxx]', '公众号密码')
    .option('-o, --original', '声明原创[可选]')
    .parse(process.argv);

let title;
if (program.title === undefined) {
    console.log('缺少文章标题， -h 了解如何使用');
    return;
} else {
    title = String(program.title);
    console.log('文章标题：' + title);
}
let author;
if (program.author === undefined) {
    console.log('缺少文章作者， -h 了解如何使用');
    return;
} else {
    author = String(program.author);
    console.log('文章作者：' + author);
}
let content;
if (program.content === undefined) {} else {
    content = String(program.content);
}
let username;
if (program.username === undefined) {
    console.log('缺少公众号账号， -h 了解如何使用');
    return;
} else {
    username = String(program.username);
}
let password;
if (program.password === undefined) {
    console.log('缺少公众号密码， -h 了解如何使用');
    return;
} else {
    password = String(program.password);
}
let original;
if (program.original === undefined) {} else {
    original = program.original;
}
console.log((!original ? "文章不" : "文章将") + "声明原创");

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
            await page.waitForSelector('#header > div.banner > div > div > form > div.login_btn_panel > a');
            //type the name
            await page.focus('#header > div.banner > div > div > form > div.login_input_panel > div:nth-child(1) > div > span > input')
            await page.keyboard.type(username);
            //type the pwd
            await page.focus('#header > div.banner > div > div > form > div.login_input_panel > div:nth-child(2) > div > span > input')
            await page.keyboard.type(password);
            await page.waitFor(50);
            //Click on the submit button
            await page.click('#header > div.banner > div > div > form > div.login_btn_panel > a')

            // 扫码登录
            console.log("扫码登录中...");
            const IMAGE_SELECTOR = '#app > div.weui-desktop-layout__main__bd > div > div.js_scan.weui-desktop-qrcheck > div.weui-desktop-qrcheck__qrcode-area > div > img'
            await page.waitForSelector(IMAGE_SELECTOR);
            await page.waitFor(200);
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
            let pasted_content = content ? content : (await clipboardy.read());
            await page.keyboard.type(String(pasted_content));
            await page.waitFor(100);

            // 封面图片选择
            console.log("正在自动选择封面图片...");
            await page.hover('#js_cover_area > div.select-cover__btn.js_cover_btn_area');
            await page.click('#js_imagedialog');
            await page.waitFor(500);

            let day = (new LocalDate()).getDay();
            let len = (await page.$$('li.img_item')).length;
            let offset = day % len + 1;
            const left = 'body > div.dialog_wrp.img_dialog_wrp.ui-draggable > div > div.dialog_bd > div > div.img_crop_panel > div.js_select_frame.img_pick_panel.inner_container_box.side_l.cell_layout > div.inner_main > div > div.img_pick_area_inner > div.img_pick > ul > li:nth-child(';
            const right = ')';
            await page.click(left + String(offset) + right);

            await page.click('body > div.dialog_wrp.img_dialog_wrp.ui-draggable > div > div.dialog_ft > span.js_crop_next_btn.btn.btn_input.js_btn_p.btn_primary > button');
            await page.waitFor(1200);
            // 选择图片完成
            const IMG_DONE = "body > div.dialog_wrp.img_dialog_wrp.ui-draggable > div > div.dialog_ft > span.js_crop_done_btn.btn.btn_primary.btn_input.js_btn_p > button";
            await page.waitForSelector(IMG_DONE);
            await page.click(IMG_DONE);
            await page.waitFor(1000);

            if (original === true) {
                // 声明原创
                console.log("正在声明原创...");
                await page.click('#js_original > div.unorigin.js_original_type > div.setting-group__content > a');
                await page.waitForSelector("#js_copyright_agree");
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
            const CONFIRM_SEND_BTN = "#wxDialog_1 > div.dialog_ft > a.btn.btn_primary.js_btn";
            await page.waitForSelector(CONFIRM_SEND_BTN);
            await page.waitFor(500);
            await page.click(CONFIRM_SEND_BTN);

            // 等待确认二维码
            await page.waitForSelector('body > div.dialog_wrp.ui-draggable > div > div.dialog_bd > div > div > div.qrcode_wrp > img')

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
autoLogin().then(console.log).catch(console.error);