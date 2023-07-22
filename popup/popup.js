/*
 * @Author: fanjf
 * @Date: 2023-07-20 14:20:05
 * @LastEditTime: 2023-07-21 16:35:16
 * @LastEditors: fanjf
 * @FilePath: \refresh-web\popup\popup.js
 * @Description: 🎉🎉🎉 
 */
console.log('chrome popup', chrome)
const startTaskDom = document.getElementById("startTask");
const timeBoxDom = document.getElementById("timeBox");
const icoBoxDom = document.getElementById("icoBox");
const choosedTimeList = ['30', '60', '300', '600', '900', '1200', '1800', '3600'];
const taskList = {};
console.log('taskList', taskList)
let currentTime = choosedTimeList[0];//刷新的时间间隔
let finalTimeItem = choosedTimeList.reduce((acc, cur, index, arr) => `${acc}
<p class='time-item ${index === 0 ? 'volta-active' : ''}' data-index='${index}' data-time='${cur}'>${cur}s</p>
`, '')

timeBoxDom.innerHTML = `${finalTimeItem}
<p class='time-item-input' contenteditable='true' id="timeInput"></p>
`;
finalTimeItem = null;
const addNewIcoDom = (icoData) => {
    icoBoxDom.innerHTML = `${icoBoxDom.innerHTML}
    <img class='ico-item' 
    src='${icoData.icon}' 
    id='${icoData.id}' 
    data-url='${icoData.url}' 
    data-winid='${icoData.winId}' 
    data-count='${icoData.count}' 
    data-time='${icoData.time}' 
    data-nexttime='${icoData.nextHappenTime}'
    />
    `
}

const updateIcoDomInfo = (id, { count, time, nextHappenTime }) => {
    const voltaIcoDom = document.getElementById(id);
    voltaIcoDom.setAttribute('data-count', count);
    voltaIcoDom.setAttribute('data-time', time);
    voltaIcoDom.setAttribute('data-nexttime', nextHappenTime);
}
if (startTaskDom) {
    startTaskDom.onclick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log('tabs', tabs[0])
            taskList[tabs[0].id] = {
                id: tabs[0].id,
                icon: tabs[0].favIconUrl,
                url: tabs[0].url,
                winId: tabs[0].windowId,
                time: currentTime,
                count: 1,
                nextHappenTime: ''
            }
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    type: 'start',
                    tabId: tabs[0].id,
                    time: currentTime
                },
                function (response) {
                    console.log('response popup', response)
                    taskList[tabs[0].id].nextHappenTime = response?.nextTime;
                    addNewIcoDom(taskList[tabs[0].id])
                }
            );
        });
    }
} else {
    console.log('startTaskDom未找到！！')
}
// //界首content的内容
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const { tab } = sender;
        if (taskList.hasOwnProperty(tab.id)) {
            taskList[tab.id].nextHappenTime = request?.nextTime;
            taskList[tab.id].count = (+taskList[tab.id].count) + 1;
            updateIcoDomInfo(tab.id, taskList[tab.id]);
            sendResponse({
                message: 'ok'
            })
        } else {
            sendResponse({
                message: `TaskList Has Not Own Property ${tab.id}`
            })
        }

    });

const removeItemActive = () => {
    const activeItem = document.getElementsByClassName('volta-active');
    if (activeItem.length > 0) {
        Array.from(activeItem).forEach(d => d.classList.remove('volta-active'))
    }
}
timeBoxDom.onclick = (e) => {
    console.log('e.target.classList1', e.target)
    if (e.target.classList.contains('time-item')) {
        removeItemActive();
        currentTime = e.target.getAttribute("data-time");
        e.target.classList.add('volta-active');
    }
}
//输入框
document.getElementById('timeInput').oninput = (e) => {
    removeItemActive();
    currentTime = +e.target.innerHTML;
    e.target.innerHTML = e.target.innerHTML.replace(/[\D]/g, '');
    if (window.getSelection) {
        e.target.focus();
        let range = window.getSelection();
        range.selectAllChildren(e.target);
        range.collapseToEnd();
    }
    else if (document.selection) {
        let range = document.selection.createRange();
        range.moveToElementText(e.target);
        range.collapse(false);
        range.select();
    }
}