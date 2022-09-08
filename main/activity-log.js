'use strict'

/** @typedef {import('./typings').ActivityEvent}  ActivityEvent */
/** @typedef {import('./typings').ActivityEntry}  ActivityEntry */

const Store = require('electron-store')
const activityLogStore = new Store({
  name: 'activity-log'
})

class ActivityLog {
  #entries
  #lastId

  constructor () {
    this.#entries = loadStoredEntries()
    this.#lastId = Number(this.#entries.at(-1)?.id ?? 0)
  }

  /**
   * @param {ActivityEvent} args
   * @returns {ActivityEntry}
   */
  recordEvent ({ source, type, message }) {
    const nextId = ++this.#lastId
    /** @type {ActivityEntry} */
    const entry = {
      id: String(nextId),
      timestamp: Date.now(),
      source,
      type,
      message
    }
    // Freeze the data to prevent ActivityLog users from accidentally changing our store
    Object.freeze(entry)

    this.#entries.push(entry)
    this.#save()
    return entry
  }

  getAllEntries () {
    // Clone the array to prevent the caller from accidentally changing our store
    return [...this.#entries]
  }

  static reset () {
    const self = new ActivityLog()
    self.#entries = []
    self.#save()
  }

  #save () {
    activityLogStore.set('events', this.#entries)
  }
}

/**
 * @returns {ActivityEntry[]}
 */
function loadStoredEntries () {
  // A workaround to fix false TypeScript errors
  return /** @type {any} */(activityLogStore.get('events', []))
}

module.exports = {
  ActivityLog
}
