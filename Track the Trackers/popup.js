const trackers = {
    zoom: 'zoom',
    google_analytics: 'google-analytics',
    twitter: 'twitter',
    aliexpress: 'aliexpress',
    linkedIn: 'linkedIn',
}

window.onload = () => {
    chrome.runtime.sendMessage({
        context: "popUpData",
    }, (res) => {
        const { current, history } = res
        getCurrentTrackers(current)
        getHistoryTrackers(history)
    });
}
const getCurrentTrackers = (current) => {
    for (const tracker in trackers) {
        document.getElementById(tracker).innerHTML += ' detected'
        console.log(tracker)
    }
}

const getHistoryTrackers = (history) => {

}

// const currentHandler = (current) => {
//     for (const tracker in trackers) {
//         document.getElementById(tracker).innerHTML += ' detected'
//         console.log(tracker)
//     }
// }