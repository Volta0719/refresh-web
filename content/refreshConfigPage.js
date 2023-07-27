/*
 * @Author: fanjf
 * @Date: 2023-07-20 13:57:47
 * @LastEditTime: 2023-07-27 15:25:45
 * @LastEditors: fanjf
 * @FilePath: \refresh-web\content\refreshConfigPage.js
 * @Description: 🎉🎉🎉
 */
console.log('chrome', chrome)
// chrome.alarms.create({delayInMinutes: 3.0})
const id = chrome?.runtime?.id || ''
const vloltaSessionTimeKey = `voltaTime_${id}`
const voltaMeta = document.querySelector(`meta[name="${vloltaSessionTimeKey}"]`)
const voltaSessionTime = sessionStorage.getItem(vloltaSessionTimeKey)

//在页面中创建一个指示定时刷新的状态指示器
const createVoltaRefreshHtml = (time, nexttime) => {
    if (!!document.getElementById('voltaIcon')) {
        document.getElementById('voltaIcon').title = `${chrome.i18n.getMessage("nextHappen")}:${nexttime}`;
    } else {
        const style = document.createElement('style')
        style.appendChild(document.createTextNode(`
        @keyframes vlotarefreshrotate{
            0% {transform: rotate(1turn);}
            100% {transform: rotate(0turn);}
        }
        `));
        document.getElementsByTagName('head')[0].appendChild(style)
        const defaultImgUrl = chrome.runtime.getURL("icons/icon.png");
        let divDom = document.createElement('div');
        divDom.title = `${chrome.i18n.getMessage("nextHappen")}:${nexttime}`;
        divDom.id = 'voltaIcon';
        divDom.setAttribute('style', `position:fixed;
        top:50%;
        transform:translateY(-50%);
        margin:auto;
        right:20px;
        width:32px;
        height:32px;
        background:url('${defaultImgUrl}');
        background-size:cover;
        background-repeat:np-repeat;
        border-radius:50%;
        z-index:999;
        animation-name:vlotarefreshrotate;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function:linear;
        animation-fill-mode:forwards;
        `)

        document.body.appendChild(divDom);
        document.getElementById('voltaIcon').onclick = (e) => {
            let f = confirm(chrome.i18n.getMessage("contentConfirmText"));
            if (f) {
                chrome.runtime.sendMessage(
                    { from: 'content', type: 'stop' },
                    (response) => {
                        sessionStorage.removeItem(vloltaSessionTimeKey);
                        location.reload();
                    }
                );
            }
        }
        document.getElementById('voltaIcon').oncontextmenu = (e) => {
            e.preventDefault();
            e.target.style.display = "none";
            // console.log('hello right')
        }
    }
}
const createVoltaRefresh = (time = '60', name = vloltaSessionTimeKey) => {
    if (!!document.querySelector(`meta[name="${vloltaSessionTimeKey}"]`)) {
        console.log(`${chrome.i18n.getMessage("contentAlreadylog")}${time}s`)
        document.querySelector(`meta[name="${vloltaSessionTimeKey}"]`).content = time;
    } else {
        const voltaCreateMeta = document.createElement('meta');
        voltaCreateMeta.name = name;
        voltaCreateMeta.httpEquiv = 'refresh';
        voltaCreateMeta.content = time;
        document.getElementsByTagName('head')[0].appendChild(voltaCreateMeta);
    }
}
if (!!voltaSessionTime && !voltaMeta) {
    // const voltaStartTime = new Date();//获取时间
    createVoltaRefresh(voltaSessionTime);
    const nextVoltaRerfeshTime = recordNextHappenTime(voltaSessionTime);
    createVoltaRefreshHtml(voltaSessionTime, nextVoltaRerfeshTime)
    //这个应该要做修改 要与service_work通信
    chrome.runtime.sendMessage(
        { from: 'content', nextTime: nextVoltaRerfeshTime, type: 'update' },
        function (response) {
            console.log("收到来自后台的回复：" + response?.message);
        }
    );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type === 'start') {
        //启动
        sessionStorage.setItem(vloltaSessionTimeKey, request?.time || '60');//将时间修改
        createVoltaRefresh(request?.time);
        const nextVoltaRerfeshTime = recordNextHappenTime(request?.time);
        createVoltaRefreshHtml(request?.time, nextVoltaRerfeshTime)
        sendResponse({
            from: 'content',
            type:'add',
            nextTime: nextVoltaRerfeshTime
        })
    } else if (request?.type === 'stop') {
        //停止
        sessionStorage.removeItem(vloltaSessionTimeKey);
        // document.querySelector(`meta[name="${vloltaSessionTimeKey}"]`).remove();
        sendResponse({ message: "ok" });
        location.reload();

    }
});

// chrome.runtime.sendMessage(
//     { greeting: "hello，我是content-script，主动发消息给后台！" },
//     function (response) {
//       console.log("收到来自后台的回复：" + response);
//     }
//   );
