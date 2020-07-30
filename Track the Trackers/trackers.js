window.onload = () => {
    const trackersScripts = document.getElementsByTagName("script") // Get all possible trackers by script
    const trackers = {} // send trackers object to addTrackers context
    for (let i = 0; i < trackersScripts.length; ++i) {
        if (trackersScripts[i].src.includes('d29k50lkkhkjby.cloudfront.net')) 
            trackers.zoom = true
        if (trackersScripts[i].src.includes('google-analytics.com')) 
            trackers.google_analytics = true
        if (trackersScripts[i].src.includes('connect.facebook.net'))
            trackers.facebook = true
        if (trackersScripts[i].src.includes('assets.alicdn.com'))
            trackers.aliexpress = true
        if (trackersScripts[i].src.includes('platform.linkedin.com'))
            trackers.linkedIn = true
    }
    chrome.runtime.sendMessage({
        context: 'addTrackers',
        website: window.location.host,
        trackers
    })
}