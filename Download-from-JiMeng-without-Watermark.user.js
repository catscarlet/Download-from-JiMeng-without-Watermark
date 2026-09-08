// ==UserScript==
// @name            从即梦AI下载无水印视频和图片 Download Origin Video and Image from JiMeng without Watermark
// @name:zh         从即梦AI下载无水印视频和图片 Download Origin Video and Image from JiMeng without Watermark
// @name:en         Download Origin Video and Image from JiMeng without Watermark 从即梦AI下载无水印视频和图片
// @namespace       https://github.com/catscarlet/Download-from-JiMeng-without-Watermark
// @description     从即梦AI（jimeng.jianying.com）下载无水印视频和图片。 Download Origin Video and Image from jimeng.jianying.com without Watermark
// @description:zh  从即梦AI（jimeng.jianying.com）下载无水印视频和图片。 Download Origin Video and Image from jimeng.jianying.com without Watermark
// @description:en  Download Origin Video and Image from jimeng.jianying.com without Watermark. 从即梦AI（jimeng.jianying.com）下载无水印视频和图片。
// @version         0.2.0
// @author          catscarlet
// @license         GNU Affero General Public License v3.0
// @match           https://jimeng.jianying.com/ai-tool/*
// @run-at          document-end
// @grant           none
// ==/UserScript==

const workspacePrefixOn = 1; //Set 0 to turn off workspacePrefix. The workspacePrefix feature only works when you download in `/ai-tool/generate?workspace`. Does not works in `/ai-tool/asset`

//图片预览图
const imagePreviewSelectors = 'img[class^="preview-"]';
//视频
const videoDivSelectors = '[id^="dreamina-video-player-"]';
//视频时间线
const videoRecordContentClassnamePrefix = 'video-record-content-';
//视频时间线描述
const videoPromptSelectors = 'span[class^="prompt-"]';
//视频在视频时间线
const videoDivSelectorsClassnamePrefix = 'video-element-';
//视频发布按钮
const videoPublishButtonSelectors = '[class^="publish-button-"]';
//详情
const promptValueSelectors = 'span[class^="prompt-value-container-"]';

(function() {
    'use strict';

    let throttleTimer;
    let debounceTimer;

    const observer = new MutationObserver((mutationsList) => {
        const now = Date.now();

        if (!throttleTimer || now - throttleTimer > 300) {
            throttleTimer = now;
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(() => {

                document.querySelectorAll(videoDivSelectors).forEach(videoWrapper => {

                    const grandParent1 = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                    if (grandParent1.className.includes(videoRecordContentClassnamePrefix)) {

                        const checkBtn1 = grandParent1.querySelector('.noWaterMarkDownloadVideoButton');

                        if (!checkBtn1) {
                            const promptNode = grandParent1.parentNode.previousSibling.querySelector(videoPromptSelectors);
                            const fileName = getVideoFileName(promptNode);
                            const downloadVideoButton = generateDownloadVideoButton(fileName);
                            downloadVideoButton.addEventListener('click', async () => {
                                getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName);
                            });

                            grandParent1.append(downloadVideoButton);
                        }
                    } else if (!grandParent1.className.includes('videoDivSelectorsClassnamePrefix')) {
                        const grandParent2 = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                        const publishButton = grandParent2.querySelector(videoPublishButtonSelectors);
                        const checkBtn2 = publishButton.querySelector('.noWaterMarkDownloadVideoButton');

                        if (!checkBtn2) {
                            const promptNode = grandParent2.querySelector(promptValueSelectors);
                            const fileName = getVideoFileName(promptNode);
                            const downloadVideoButton = generateDownloadVideoButton(fileName);

                            downloadVideoButton.addEventListener('click', async () => {
                                getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName);
                            });

                            publishButton.prepend(downloadVideoButton);
                        }

                    } else {
                    }

                });

                document.querySelectorAll(imagePreviewSelectors).forEach((imgElement, imgElementIndex) => {
                    const container = imgElement.parentNode;

                    const hasButton = imgElement.hasAttribute('data-preview-button-added');
                    const hasDraggableAttr = imgElement.hasAttribute('draggable');
                    if (hasButton || !hasDraggableAttr) {
                        return;
                    }

                    const promptNode = document.querySelector(promptValueSelectors);
                    const fileName = getImageFileName(promptNode);
                    const downloadImageButton = generateDownloadImageButton(fileName);
                    downloadImageButton.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        getCrossOriginImage(imgElement, downloadImageButton, fileName);
                    });

                    container.appendChild(downloadImageButton);

                    imgElement.setAttribute('data-preview-button-added', 'true');
                });
            });
        }});

    const config = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
    };

    observer.observe(document.body, config);
})();

async function getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName) {
    const btnOriginStyle = {};

    btnOriginStyle.cursor = downloadVideoButton.style.cursor;
    btnOriginStyle.backgroundColor = downloadVideoButton.style.backgroundColor;

    downloadVideoButton.style.cursor = 'wait';
    downloadVideoButton.style.backgroundColor = 'grey';

    const fileUrl = videoWrapper.childNodes[0].src;

    try {
        const response = await fetch(fileUrl, {mode: 'cors'});
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        setTimeout(() => {
            a.click();
        }, 10);
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            downloadVideoButton.style.cursor = btnOriginStyle.cursor;
            downloadVideoButton.style.backgroundColor = btnOriginStyle.backgroundColor;
        }, 1000);
    } catch (error) {
        alert('加载失败，请确保服务器开启了 CORS 支持。');
        downloadVideoButton.style.cursor = btnOriginStyle.cursor;
        downloadVideoButton.style.backgroundColor = btnOriginStyle.backgroundColor;
    }
}

async function getCrossOriginImage(imgElement, downloadImageButton, fileName) {
    const btnOriginStyle = {};

    btnOriginStyle.cursor = downloadImageButton.style.cursor;
    btnOriginStyle.backgroundColor = downloadImageButton.style.backgroundColor;

    downloadImageButton.style.cursor = 'wait';
    downloadImageButton.style.backgroundColor = 'grey';

    const fileUrl = imgElement.src;

    try {
        const response = await fetch(fileUrl, {mode: 'cors'});
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        setTimeout(() => {
            a.click();
        }, 10);
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            downloadImageButton.style.cursor = btnOriginStyle.cursor;
            downloadImageButton.style.backgroundColor = btnOriginStyle.backgroundColor;
        }, 1000);
    } catch (error) {
        alert('加载失败，请确保服务器开启了 CORS 支持。');

        downloadImageButton.style.cursor = btnOriginStyle.cursor;
        downloadImageButton.style.backgroundColor = btnOriginStyle.backgroundColor;
    }
}

function generateDownloadVideoButton(fileName) {
    const downloadVideoButton = document.createElement('div');
    downloadVideoButton.className = 'noWaterMarkDownloadVideoButton';
    downloadVideoButton.title = '下载文件名为「' + fileName + '」的 预览视频文件';
    downloadVideoButton.textContent = '预览视频下载';
    downloadVideoButton.style.backgroundColor = 'blue';
    downloadVideoButton.style.color = 'white';
    downloadVideoButton.style.padding = '8px 12px';
    downloadVideoButton.style.marginRight = '8px';
    downloadVideoButton.style.borderRadius = '4px';
    downloadVideoButton.style.cursor = 'pointer';
    downloadVideoButton.style.display = 'inline-block';

    return downloadVideoButton;
}

function generateDownloadImageButton(fileName) {
    const downloadImageButton = document.createElement('div');
    downloadImageButton.className = 'noWaterMarkDownloadImageButton';
    downloadImageButton.title = '下载文件名为「' + fileName + '」的图片文件';
    downloadImageButton.textContent = '下载预览图片';
    downloadImageButton.style.backgroundColor = 'blue';
    downloadImageButton.style.color = 'white';
    downloadImageButton.style.position = 'absolute';
    downloadImageButton.style.top = '0.5em';
    downloadImageButton.style.left = '0.5em';
    downloadImageButton.style.padding = '8px 12px';
    downloadImageButton.style.borderRadius = '4px';
    downloadImageButton.style.cursor = 'pointer';

    return downloadImageButton;
}

function getWorkplacePrefix() {

    if (workspacePrefixOn == 0) {
        return '';
    }

    let url = new URL(location.href);
    let workspace = url.searchParams.get('workspace');
    let workspaceStr = '';

    if (workspace && workspace != 0) {
        workspaceStr = workspace + '-';
    }

    return workspaceStr;
}
function getVideoFileName(promptNode) {
    let fileName;
    let workspace = getWorkplacePrefix();

    if (promptNode && promptNode.textContent != '无提示词') {
        let promptText = safePromptText(promptNode.textContent, 59);
        fileName = '即梦无水印-' + workspace + promptText;
    } else {
        fileName = '即梦无水印-' + workspace + '无提示词-' + getYmdHMS();
    }

    return fileName;
}

function getImageFileName(promptNode) {
    let fileName;
    let workspace = getWorkplacePrefix();

    if (promptNode && promptNode.textContent != '无提示词') {
        let promptText = safePromptText(promptNode.textContent, 45);
        fileName = '即梦无水印-' + workspace + promptText + '-' + getYmdHMS();;
    } else {
        fileName = '即梦无水印-' + workspace + '无提示词-' + getYmdHMS();
    }

    return fileName;
}

function getYmdHMS() {
    const date = new Date();
    const Y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const H = String(date.getHours()).padStart(2, '0');
    const M = String(date.getMinutes()).padStart(2, '0');
    const S = String(date.getSeconds()).padStart(2, '0');

    const result = `${Y}${m}${d}${H}${M}${S}`;

    return result;
}

function safePromptText(promptText, maxlength = 59) {
    promptText = promptText.replace(/[\n\r]/g, '');
    let promptTextSize = new Blob([promptText], {type: 'text/plain;charset=utf-8'}).size;

    if (promptTextSize < 206) {

        return promptText;
    }

    let promptTextShort = promptText.slice(0, maxlength) + '…';

    return promptTextShort;
}
