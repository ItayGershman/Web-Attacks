const trackers = {
    zoom: 'zoom',
    google_analytics: 'google_analytics',
    facebook: 'facebook',
    aliexpress: 'aliexpress',
    linkedIn: 'linkedIn',
}

const getWebsiteTrackers = (current) => {
    for (const tracker in trackers) {
        document.getElementById(tracker).innerHTML += ` ${
      current.trackers[tracker] ? 'Tracks you! 😈' : 'Innocent for now 😇'
    }`
    }
}

const getHistoryTrackers = (history) => {
    for (const tracks in history) {
        const trackerID = document.getElementById(`${tracks}_history`)
        if (history[tracks].length) {
            history[tracks].forEach(value => {
                trackerID.innerHTML += `<li>${value}</li>`
            })
        }
        else {
            trackerID.innerHTML += `<li><p>No History for this tracker</p></li>`
        }
    }
}

window.onload = () => {
    chrome.runtime.sendMessage({
            context: 'getTrackers',
        },
        (res) => {
            const { current, history } = res
            getWebsiteTrackers(current)
            getHistoryTrackers(history)
        }
    )
    //Add onClick to buttons
    const acc = document.getElementsByClassName('accordion')
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener('click', function() {
            this.classList.toggle('active')
            const panel = this.nextElementSibling
            if (panel.style.display === 'block') {
                panel.style.display = 'none'
            } else {
                panel.style.display = 'block'
            }
        })
    }
}