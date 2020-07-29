const init = {
    zoom: false,
    google_analytics: false,
    twitter: false,
    aliexpress: false,
    linkedIn: false,
}
const current = {
    host: '',
    trackers: init
}

const messageListener = (request, sender, sendResponse) => {
    const { context, website, trackers } = request
    switch (context) {
        // case 'trackersDetection':
        //     updateTrackers(website, trackers)
        //     break;
        case 'popUpData':
            sendResponse({ history, current })
            break;
    }
}
chrome.runtime.onMessage.addListener(messageListener)