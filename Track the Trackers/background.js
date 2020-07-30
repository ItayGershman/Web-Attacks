const defaultTrackers = {
  zoom: false,
  google_analytics: false,
  facebook: false,
  aliexpress: false,
  linkedIn: false
}

const current = {
  trackers: defaultTrackers,
  website: ''
}

const history = {
  zoom: [],
  google_analytics: [],
  facebook: [],
  aliexpress: [],
  linkedIn: []
}

const appendHistoryTrackers = (website, trackers) => {
  for (const tracks in history) {
    if (trackers[tracks]) {
      history[tracks].push(website)
      history[tracks] = [...new Set(history[tracks])]
    }
  }
}

const addTrackers = (website, trackers) => {
  current.trackers = trackers
  current.website = website
  appendHistoryTrackers(website, trackers)
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  const { context, website, trackers } = req
  if (context === 'getTrackers') {
    sendResponse({ history, current })
  } else if (context === 'addTrackers') {
    addTrackers(website, trackers)
  }
})
