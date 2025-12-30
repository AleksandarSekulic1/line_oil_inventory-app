import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (proizvod) => ipcRenderer.invoke('add-product', proizvod),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  updateProduct: (proizvod) => ipcRenderer.invoke('update-product', proizvod),
  resetApp: () => ipcRenderer.invoke('reset-database'),
  addStockEntry: (data) => ipcRenderer.invoke('add-stock-entry', data),
  removeStockEntry: (data) => ipcRenderer.invoke('remove-stock-entry', data),
  getProductHistory: (id) => ipcRenderer.invoke('get-product-history', id),
  editHistoryEntry: (data) => ipcRenderer.invoke('edit-history-entry', data),
  getAllDeliveries: () => ipcRenderer.invoke('get-all-deliveries'),
  updateDeliveryGroup: (data) => ipcRenderer.invoke('update-delivery-group', data),
  // U preload/index.js
  deleteHistoryEntry: (id) => ipcRenderer.invoke('delete-history-entry', id),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
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