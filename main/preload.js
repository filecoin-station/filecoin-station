const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  saturnNode: {
    start: () => ipcRenderer.invoke('saturn:start'),
    stop: () => ipcRenderer.invoke('saturn:stop'),
    isRunning: () => ipcRenderer.invoke('saturn:isRunning'),
    isReady: () => ipcRenderer.invoke('saturn:isReady'),
    getLog: () => ipcRenderer.invoke('saturn:getLog'),
    getWebUrl: () => ipcRenderer.invoke('saturn:getWebUrl'),
    getFilAddress: () => ipcRenderer.invoke('saturn:getFilAddress'),
    setFilAddress: (/** @type {string | undefined} */ address) => ipcRenderer.invoke('saturn:setFilAddress', address)
  },
  stationConfig: {
    getFilAddress: () => ipcRenderer.invoke('station:getFilAddress'),
    setFilAddress: (/** @type {string | undefined} */ address) => ipcRenderer.invoke('station:setFilAddress', address),
    getSawOnboarding: () => ipcRenderer.invoke('station:getSawOnboarding'),
    setSawOnboarding: () => ipcRenderer.invoke('station:setSawOnboarding'),
    getUserConsent: () => ipcRenderer.invoke('station:getUserConsent'),
    setUserConsent: (/** @type {boolean} */ consent) => ipcRenderer.invoke('station:setUserConsent', consent)
  },
  stationEvents: {
    onActivityLog: (/** @type {() => Function} */ callback) => {
      ipcRenderer.on('activity-log', callback)
      return () => ipcRenderer.removeListener('activity-log', callback)
    },
    onJobsCounter: (/** @type {() => Function} */ callback) => {
      ipcRenderer.on('jobs-counter', callback)
      return () => ipcRenderer.removeListener('jobs-counter', callback)
    },
    onEarningsCounter: (/** @type {() => Function} */ callback) => {
      ipcRenderer.on('earnings-counter', callback)
      return () => ipcRenderer.removeListener('earnings-counter', callback)
    }
  }
})
