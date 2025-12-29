import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (proizvod) => ipcRenderer.invoke('add-product', proizvod),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  updateProduct: (proizvod) => ipcRenderer.invoke('update-product', proizvod)
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