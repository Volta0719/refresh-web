/*
 * @Author: fanjf
 * @Date: 2023-07-20 14:20:05
 * @LastEditTime: 2023-07-21 09:19:31
 * @LastEditors: fanjf
 * @FilePath: \refresh-web\popup\popup.js
 * @Description: 🎉🎉🎉
 */

const startTaskDom = document.getElementById("startTask");
if (startTaskDom) {
    startTaskDom.onclick = () => {
        console.log('我点击了启动按钮！')
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    type: 'start',
                    tabId: tabs[0].id,
                    time:60
                },
                function (response) {
                    console.log(response?.farewell);
                }
            );
        });
    }

} else {
    console.log('startTaskDom未找到！！')
}

