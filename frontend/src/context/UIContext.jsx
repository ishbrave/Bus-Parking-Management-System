import { createContext, useState } from 'react';

export const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', data: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });

  const openModal = (type, data = null) => setModal({ open: true, type, data });
  const closeModal = () => setModal({ open: false, type: '', data: null });

  const openConfirm = (message, onConfirm) => setConfirmModal({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ open: false, message: '', onConfirm: null });

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, modal, openModal, closeModal, confirmModal, openConfirm, closeConfirm }}>
      {children}
    </UIContext.Provider>
  );
}
