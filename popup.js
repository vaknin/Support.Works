const url = window.location.href;
const p_result = document.getElementById('p_result');
const cbox_cs_label = document.getElementById('cbox_cs_label');
const cbox_cs = document.getElementById('cbox_cs');
const input_keyword = document.getElementById('input_keyword');
const btn_search = document.getElementById('btn_search');
const container = document.getElementById('search_container');
const p_progress = document.getElementById('p_progress');
const p_progressNames = document.getElementById('p_progressNames');
const loader = document.getElementById('loader');
let dataIsready = false;
let activeTab;

//#region Event Listeners

//Press 'Enter'
document.addEventListener('keypress', e => {
    if (e.which == 13){
        //If data isn't ready, return
        if (!dataIsready){
            return;
        }
        msg = {
            action: 'search',
            keyword: input_keyword.value,
        };
        sendMessage(msg);
    }
});

//Click Search Button
btn_search.addEventListener('click', () => {
    msg = {
        action: 'search',
        keyword: input_keyword.value,
    };
    sendMessage(msg);
});

cbox_cs.addEventListener('change', () => {
    let msg = {
        action: 'caseSensitivity',
        sensitive: cbox_cs.checked
    };
    sendMessage(msg);
});

//#endregion

//#region Communication

//Send a message to 'content.js'
function sendMessage(msg){

    //Send the message
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, msg);
    });
}

//Popup onClick
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    activeTab = tabs[0];

    //Send popup info to bg.js
    let msg = {
        action: 'popup',
        id: activeTab.id
    };
    chrome.runtime.sendMessage(msg);
 });

//Listen for messages
chrome.runtime.onMessage.addListener(
    function(request, sender) {

        //Data is ready, enable button
        if (request == 'dataIsReady'){
            dataIsready = true;
            input_keyword.style.display = 'inline';
            cbox_cs_label.style.display = 'inline';
            cbox_cs.style.display = 'inline';
            btn_search.style.display = 'inline';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            loader.remove();
            p_progress.remove();
            p_progressNames.remove();
        }

        //Make a search
        else if (request.action == 'search'){
            p_result.style.visibility = 'visible';
            p_result.innerHTML = `${request.results} results`;
        }

        //Display loading progress in percentage
        else if (request.action == 'progress' && sender.tab.id == activeTab.id){
            let current = parseInt(request.progress.current);
            let of = parseInt(request.progress.outof);
            p_progressNames.innerText = request.progress.name;
            p_progress.innerText = `${Math.round((current/of)*100)}%`;
        }

        //Close the popup
        else if (request.action == 'unready'){
            window.close();
        }
});

//#endregion
