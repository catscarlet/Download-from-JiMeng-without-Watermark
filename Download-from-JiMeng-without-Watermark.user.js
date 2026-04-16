// ==UserScript==
// @name            从即梦AI下载无水印视频和图片 Download Origin Video and Image from JiMeng without Watermark
// @name:en         Download Origin Video and Image from JiMeng without Watermark 从即梦AI下载无水印视频和图片
// @namespace       https://github.com/catscarlet/Download-from-JiMeng-without-Watermark
// @description     从即梦AI（jimeng.jianying.com）下载无水印视频和图片. Download Origin Video and Image from jimeng.jianying.com without Watermark
// @description:en  Download Origin Video and Image from jimeng.jianying.com without Watermark. 从即梦AI（jimeng.jianying.com）下载无水印视频和图片
// @version         0.1.0
// @author          catscarlet
// @license         GNU Affero General Public License v3.0
// @match           https://jimeng.jianying.com/ai-tool/*
// @run-at          document-end
// @grant           none
// ==/UserScript==

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

                document.querySelectorAll('.video-wrapper-n_RhyO').forEach(videoWrapper => {

                    const grandParent1 = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                    if (grandParent1.className == 'video-record-content-JwGmeX') {

                        const checkBtn1 = grandParent1.querySelector('.noWaterMarkDownloadVideoButton');

                        if (!checkBtn1) {
                            const promptNode = grandParent1.parentNode.previousSibling.querySelector('.prompt-P_8aF8');
                            const fileName = getVideoFileName(promptNode);
                            const downloadVideoButton = generateDownloadVideoButton(fileName);
                            downloadVideoButton.addEventListener('click', async () => {
                                getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName);
                            });

                            grandParent1.append(downloadVideoButton);
                        }
                    } else if (!grandParent1.className.includes('video-element-TQKQjt')) {
                        const grandParent2 = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                        const checkBtn2 = grandParent2.querySelector('.publish-button-C80dLI').querySelector('.noWaterMarkDownloadVideoButton');

                        if (!checkBtn2) {
                            const promptNode = grandParent2.querySelector('.prompt-value-p42svP');
                            const fileName = getVideoFileName(promptNode);
                            const downloadVideoButton = generateDownloadVideoButton(fileName);

                            downloadVideoButton.addEventListener('click', async () => {
                                getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName);
                            });

                            grandParent2.querySelector('.publish-button-C80dLI').prepend(downloadVideoButton);
                        }

                    } else {
                    }

                });

                document.querySelectorAll('.preview-k4e1UX').forEach((imgElement, imgElementIndex) => {
                    const container = imgElement.parentNode;

                    const hasButton = imgElement.hasAttribute('data-preview-button-added');
                    if (hasButton) {
                        return;
                    }

                    const fileName = getImageFileName();
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

    downloadVideoButton.style.cursor = 'not-allowed';
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

    downloadImageButton.style.cursor = 'not-allowed';
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

function getVideoFileName(promptNode) {
    let fileName;

    if (promptNode && promptNode.textContent != '无提示词') {
        fileName = promptNode.textContent;
    } else {
        fileName = '无提示词-' + getYmdHMS();
    }

    fileName = fileName.replace(/[\n\r]/g, '');

    return fileName;
}

function getImageFileName() {
    const promptNode = document.querySelector('.prompt-value-p42svP');

    let fileName;

    if (promptNode && promptNode.textContent != '无提示词') {
        fileName = '即梦无水印-' + promptNode.textContent + '-' + getYmdHMS();;
    } else {
        fileName = '无提示词-' + getYmdHMS();
    }

    fileName = fileName.replace(/[\n\r]/g, '');

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
