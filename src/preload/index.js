import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // Funkcija koju zovemo iz React-a
  getProducts: () => ipcRenderer.invoke('get-products')
}

// Expose APIs
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {}) // Ostavljamo default
    contextBridge.exposeInMainWorld('api', api)     // Dodajemo nas API
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = {}
  window.api = api
}