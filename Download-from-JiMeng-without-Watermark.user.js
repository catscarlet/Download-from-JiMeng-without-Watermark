// ==UserScript==
// @name            从即梦AI下载无水印视频 Download Origin Video from JiMeng without Watermark
// @name:en         Download Origin Video from JiMeng without Watermark 从即梦AI下载无水印视频
// @namespace       https://github.com/catscarlet/Download-from-JiMeng-without-Watermark
// @description     从即梦AI（jimeng.jianying.com）下载无水印视频. Download Origin Video from jimeng.jianying.com without Watermark
// @description:en  Download Origin Video from jimeng.jianying.com without Watermark. 从即梦AI（jimeng.jianying.com）下载无水印视频
// @version         0.0.1
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

                document.querySelectorAll('.video-wrapper-syJsMl').forEach(videoWrapper => {

                    const parentClassName = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.className;

                    if (parentClassName == 'video-record-content-dejFeW') {

                        const checkBtn1 = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.noWaterMarkDownloadVideoButton');

                        if (!checkBtn1) {

                            const fileName = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.querySelector('.prompt-DO1VXC').textContent;

                            const downloadVideoButton = generateDownloadVideoButton(fileName);
                            downloadVideoButton.addEventListener('click', async () => {
                                getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName);
                            });

                            videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(downloadVideoButton);
                        }
                    } else if (parentClassName.includes('lv-modal')) {

                        const checkBtn2 = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.publish-button-LkMPnt').querySelector('.noWaterMarkDownloadVideoButton');

                        if (!checkBtn2) {

                            const fileName = videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.prompt-value-text-Lf5Gx7').textContent;

                            const downloadVideoButton = generateDownloadVideoButton(fileName);

                            downloadVideoButton.addEventListener('click', async () => {
                                getCrossOriginVideo(videoWrapper, downloadVideoButton, fileName);
                            });

                            videoWrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.publish-button-LkMPnt').appendChild(downloadVideoButton);
                        }

                    } else {
                    }

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
        alert('图片加载失败，请确保图片服务器开启了 CORS 支持。');
        downloadVideoButton.style.cursor = btnOriginStyle.cursor;
        downloadVideoButton.style.backgroundColor = btnOriginStyle.backgroundColor;
    }
}

function generateDownloadVideoButton(fileName) {
    const downloadVideoButton = document.createElement('div');
    downloadVideoButton.className = 'noWaterMarkDownloadVideoButton';
    downloadVideoButton.title = '下载文件名为「' + fileName + '」的 无水印视频文件';
    downloadVideoButton.textContent = '无水印视频下载';
    downloadVideoButton.style.backgroundColor = 'blue';
    downloadVideoButton.style.color = 'white';
    downloadVideoButton.style.padding = '8px 12px';
    downloadVideoButton.style.marginRight = '8px';
    downloadVideoButton.style.borderRadius = '4px';
    downloadVideoButton.style.cursor = 'pointer';
    downloadVideoButton.style.display = 'inline-block';

    return downloadVideoButton;
}
