import { createLocalStorage } from 'localstorage-ponyfill'
import { ITokenStore } from '../interfaces'
import log from './logger'

const localStorage = createLocalStorage()

export default {
  get: async (key: string): Promise<ITokenStore> => {
    if (!key) {
      throw new Error(`${key} not provided`)
    }
    const item = await localStorage.getItem(key)
    return JSON.parse(item || '{}')
  },
  set: async (key: string, item: ITokenStore): Promise<void> => {
    if (!key) {
      log('utils/storage', 'set', `${key} not provided`)
      return
    }
    if (!item) {
      log('utils/storage', 'set', `item not provided`)
      return
    }
    await localStorage.setItem(key, JSON.stringify(item))
  }
}
