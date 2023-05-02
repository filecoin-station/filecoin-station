'use strict'

const { app, dialog, shell } = require('electron')
const electronLog = require('electron-log')
const path = require('node:path')
const fs = require('node:fs/promises')

console.log('Log file:', electronLog.transports.file.findLogPath())
const log = electronLog.scope('main')

// Override the place where we look for config files when running the end-to-end
// test suite.
// We must call this early on, before any of our modules accesses the config
// store.
// https://www.npmjs.com/package/electron-store
// https://www.electronjs.org/docs/latest/api/app#appgetpathname
if (process.env.STATION_ROOT) {
  app.setPath('userData', path.join(process.env.STATION_ROOT, 'user-data'))

  // Also set 'localUserData' after this PR is landed & released:
  // We are using localUserData for Saturn L2 cache
  // https://github.com/electron/electron/pull/34337
}

require('./setup-sentry')

const { ipcMainEvents, setupIpcMain } = require('./ipc')
const { BUILD_VERSION, STATE_ROOT } = require('./consts')
const { ipcMain } = require('electron/main')
const os = require('os')
const core = require('./core')
const wallet = require('./wallet')
const serve = require('electron-serve')
const { setupAppMenu } = require('./app-menu')
const setupTray = require('./tray')
const setupUI = require('./ui')
const setupUpdater = require('./updater')
const Sentry = require('@sentry/node')
const { setup: setupDialogs } = require('./dialog')
const telemetry = require('./telemetry')

/** @typedef {import('./typings').Activity} Activity */
/** @typedef {import('./typings').ActivityType} ActivityType */

const inTest = (process.env.NODE_ENV === 'test')
const isDev = !app.isPackaged && !inTest

log.info(
  'Filecoin Station build version: %s %s-%s%s%s',
  BUILD_VERSION,
  os.platform(),
  os.arch(),
  isDev ? ' [DEV]' : '',
  inTest ? ' [TEST]' : ''
)
log.info('Machine spec: %s version %s', os.type(), os.release())
// TODO(bajtos) print machine architecture after we upgrade to Electron with
// Node.js 18
// log.info('Machine spec: %s %s version %s', os.type(),
//   os.machine(),
//   os.release())
if (app.runningUnderARM64Translation) {
  log.warn(
    'Warning: we are running under ARM64 translation' +
      ' (macOS Rosetta or Windows WOW).'
  )
}

// Expose additional metadata for Electron preload script
process.env.STATION_BUILD_VERSION = BUILD_VERSION

function handleError (/** @type {any} */ err) {
  Sentry.captureException(err)

  log.error(err)
  dialog.showErrorBox('Error occured', err.stack ?? err.message ?? err)
}

// ensures there are no unhandled errors during initial dev
process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

// Sets User Model Id so notifications work on Windows 10
// To show notifications properly on Windows, we must manually set the
// appUserModelID
// See https://www.electronjs.org/docs/tutorial/notifications#windows
if (process.platform === 'win32') {
  app.setAppUserModelId('io.filecoin.station')
}

// Only one instance can run at a time
if (!inTest && !app.requestSingleInstanceLock()) {
  app.quit()
}

// When the user attempts to start the app and didn't notice the Station icon in
// the tray, help them out by showing the main window
app.on('second-instance', () => {
  ctx.showUI()
})

if (isDev) {
  // Do not preserve old Activity entries in development mode
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fs.unlink(path.join(STATE_ROOT, 'logs', 'activity.json')).catch(() => {})
}

/** @type {import('./typings').Context} */
const ctx = {
  getAllActivities: async () => {
    const activity = await core.getActivity()
    activity.reverse()
    activity.length = Math.min(activity.length, 100)
    return activity
  },

  recordActivity: activity => {
    ipcMain.emit(ipcMainEvents.ACTIVITY_LOGGED, activity)
  },

  getTotalJobsCompleted: async () => {
    const { totalJobsCompleted } = await core.getMetrics()
    return totalJobsCompleted
  },
  setTotalJobsCompleted: (count) => {
    ipcMain.emit(
      ipcMainEvents.JOB_STATS_UPDATED,
      count
    )
  },

  manualCheckForUpdates: () => { throw new Error('never get here') },
  saveModuleLogsAs: () => { throw new Error('never get here') },
  showUI: () => { throw new Error('never get here') },
  loadWebUIFromDist: serve({
    directory: path.resolve(__dirname, '../renderer/dist')
  }),
  confirmChangeWalletAddress: () => { throw new Error('never get here') },
  restartToUpdate: () => { throw new Error('never get here') },
  openReleaseNotes: () => { throw new Error('never get here') },
  getUpdaterStatus: () => { throw new Error('never get here') },
  browseTransactionTracker: (/** @type {string} */ transactionHash) => { shell.openExternal(`https://filfox.info/en/message/${transactionHash}`) },
  transactionUpdate: (transactions) => {
    ipcMain.emit(ipcMainEvents.TRANSACTION_UPDATE, transactions)
  },
  balanceUpdate: (balance) => {
    ipcMain.emit(ipcMainEvents.BALANCE_UPDATE, balance)
  }
}

app.on('before-quit', () => {
  // Flush pending events immediately
  // See https://docs.sentry.io/platforms/node/configuration/draining/
  Sentry.close()
})

process.on('uncaughtException', err => {
  Sentry.captureException(err)
  log.error(err)
  process.exitCode = 1
})

async function run () {
  try {
    await app.whenReady()
  } catch (e) {
    handleError(e)
    app.exit(1)
  }

  try {
    telemetry.setup()
    setupTray(ctx)
    setupDialogs(ctx)
    if (process.platform === 'darwin') {
      await setupAppMenu(ctx)
    }
    await setupUI(ctx)
    await setupUpdater(ctx)
    await setupIpcMain(ctx)

    await wallet.setup(ctx)
    await core.setup(ctx)
  } catch (e) {
    handleError(e)
  }
}

run()
