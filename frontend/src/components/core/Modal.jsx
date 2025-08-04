/**
 * MODAL COMPONENT
 * 
 * Modular modal component using factory pattern and dependency injection.
 * Easy to create different modal types during presentations.
 */

import React from 'react';
import { modalFactory } from '../../factories/ModalFactory.js';
import { useFeatureFlag } from '../../systems/FeatureFlags.js';
import { useComponentStyles, useAnimation } from '../../hooks/useTheme.js';

// MODIFICATION POINT: Base modal component with dependency injection
export const Modal = ({
  isOpen = false,
  onClose,
  children,
  title,
  size = 'medium',
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  // Dependency injection props
  themeHook = useComponentStyles,
  featureFlagHook = useFeatureFlag,
  animationHook = useAnimation,
  ...props
}) => {
  // Use injected hooks
  const { getThemeColor } = themeHook('modal');
  const isAnimationsEnabled = featureFlagHook('ENABLE_MODAL_ANIMATIONS', true);
  const { fadeIn } = animationHook();

  const modalConfig = {
    type: 'basic',
    isOpen,
    onClose,
    size,
    className,
    overlayClassName,
    closeOnOverlayClick,
    closeOnEscape,
    title,
    children,
    showCloseButton,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

// MODIFICATION POINT: Specialized modal components
export const ConfirmModal = ({
  isOpen = false,
  onClose,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  ...props
}) => {
  const modalConfig = {
    type: 'confirm',
    isOpen,
    onClose,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel: onCancel || onClose,
    confirmVariant,
    cancelVariant,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

export const FormModal = ({
  isOpen = false,
  onClose,
  title,
  form,
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  ...props
}) => {
  const modalConfig = {
    type: 'form',
    isOpen,
    onClose,
    title,
    form,
    onSubmit,
    onCancel: onCancel || onClose,
    submitText,
    cancelText,
    isSubmitting,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

export const InfoModal = ({
  isOpen = false,
  onClose,
  title = 'Information',
  message,
  ...props
}) => {
  const modalConfig = {
    type: 'info',
    isOpen,
    onClose,
    title,
    message,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

export const WarningModal = ({
  isOpen = false,
  onClose,
  title = 'Warning',
  message,
  ...props
}) => {
  const modalConfig = {
    type: 'warning',
    isOpen,
    onClose,
    title,
    message,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

export const ErrorModal = ({
  isOpen = false,
  onClose,
  title = 'Error',
  message,
  ...props
}) => {
  const modalConfig = {
    type: 'error',
    isOpen,
    onClose,
    title,
    message,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

export const LoadingModal = ({
  isOpen = false,
  title = 'Loading...',
  message = 'Please wait',
  ...props
}) => {
  const modalConfig = {
    type: 'loading',
    isOpen,
    title,
    message,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

// MODIFICATION POINT: Wizard modal component
export const WizardModal = ({
  isOpen = false,
  onClose,
  title,
  steps = [],
  currentStep = 0,
  onNext,
  onPrevious,
  onFinish,
  onCancel,
  ...props
}) => {
  const modalConfig = {
    type: 'wizard',
    isOpen,
    onClose,
    title,
    steps,
    currentStep,
    onNext,
    onPrevious,
    onFinish,
    onCancel: onCancel || onClose,
    ...props
  };

  const ModalComponent = modalFactory.createModal(modalConfig);
  return React.createElement(ModalComponent);
};

// MODIFICATION POINT: Modal hook for state management
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  const [data, setData] = React.useState(null);

  const openModal = React.useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal
  };
};

// MODIFICATION POINT: Modal service for programmatic modals
export class ModalService {
  constructor() {
    this.modals = new Map();
    this.listeners = new Set();
  }

  // Show different types of modals programmatically
  showConfirm(options) {
    return new Promise((resolve) => {
      const modalId = this.generateId();
      const modal = {
        id: modalId,
        type: 'confirm',
        isOpen: true,
        ...options,
        onConfirm: () => {
          this.close(modalId);
          resolve(true);
        },
        onCancel: () => {
          this.close(modalId);
          resolve(false);
        }
      };

      this.modals.set(modalId, modal);
      this.notifyListeners();
    });
  }

  showInfo(options) {
    const modalId = this.generateId();
    const modal = {
      id: modalId,
      type: 'info',
      isOpen: true,
      ...options,
      onClose: () => this.close(modalId)
    };

    this.modals.set(modalId, modal);
    this.notifyListeners();
    return modalId;
  }

  showError(options) {
    const modalId = this.generateId();
    const modal = {
      id: modalId,
      type: 'error',
      isOpen: true,
      ...options,
      onClose: () => this.close(modalId)
    };

    this.modals.set(modalId, modal);
    this.notifyListeners();
    return modalId;
  }

  showLoading(options) {
    const modalId = this.generateId();
    const modal = {
      id: modalId,
      type: 'loading',
      isOpen: true,
      ...options
    };

    this.modals.set(modalId, modal);
    this.notifyListeners();
    return modalId;
  }

  close(modalId) {
    if (this.modals.has(modalId)) {
      this.modals.delete(modalId);
      this.notifyListeners();
    }
  }

  closeAll() {
    this.modals.clear();
    this.notifyListeners();
  }

  getModals() {
    return Array.from(this.modals.values());
  }

  generateId() {
    return `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getModals()));
  }
}

// Singleton instance
export const modalService = new ModalService();

// MODIFICATION POINT: Hook for modal service
export const useModalService = () => {
  const [modals, setModals] = React.useState([]);

  React.useEffect(() => {
    return modalService.addListener(setModals);
  }, []);

  return {
    modals,
    showConfirm: modalService.showConfirm.bind(modalService),
    showInfo: modalService.showInfo.bind(modalService),
    showError: modalService.showError.bind(modalService),
    showLoading: modalService.showLoading.bind(modalService),
    close: modalService.close.bind(modalService),
    closeAll: modalService.closeAll.bind(modalService)
  };
};

// MODIFICATION POINT: Modal container component
export const ModalContainer = () => {
  const { modals } = useModalService();

  return React.createElement('div', {
    className: 'modal-container'
  }, modals.map(modal => {
    const ModalComponent = modalFactory.createModal(modal);
    return React.createElement(ModalComponent, {
      key: modal.id
    });
  }));
};

// EXAMPLE USAGE:
/*
// Basic modal usage
const { isOpen, openModal, closeModal } = useModal();

<Modal isOpen={isOpen} onClose={closeModal} title="My Modal">
  <p>Modal content here</p>
</Modal>

// Specialized modals
<ConfirmModal
  isOpen={showConfirm}
  title="Delete User"
  message="Are you sure you want to delete this user?"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>

<FormModal
  isOpen={showForm}
  title="Edit User"
  form={<UserForm />}
  onSubmit={handleSubmit}
  onCancel={() => setShowForm(false)}
/>

// Wizard modal
<WizardModal
  isOpen={showWizard}
  title="Setup Wizard"
  steps={[
    { content: <Step1 /> },
    { content: <Step2 /> },
    { content: <Step3 /> }
  ]}
  currentStep={currentStep}
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  onFinish={handleFinish}
/>

// Programmatic usage
const handleDelete = async () => {
  const confirmed = await modalService.showConfirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?'
  });
  
  if (confirmed) {
    // Delete the item
  }
};

modalService.showError({
  title: 'Error',
  message: 'Something went wrong!'
});

const loadingId = modalService.showLoading({
  title: 'Processing...',
  message: 'Please wait while we process your request'
});

// Close loading modal when done
modalService.close(loadingId);
*/