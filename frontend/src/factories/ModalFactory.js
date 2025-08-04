/**
 * MODAL FACTORY
 * 
 * Factory pattern for creating dynamic modals with different types and configurations.
 * Easy to add new modal types and behaviors during presentations.
 */

import React from 'react';
import { UI_CONFIG } from '../config/app.config.js';

export class ModalFactory {
  constructor(config = UI_CONFIG) {
    this.config = config;
    this.modalTypes = new Map();
    this.initializeDefaultTypes();
  }

  // MODIFICATION POINT: Register new modal types
  initializeDefaultTypes() {
    this.registerModalType('basic', this.createBasicModal);
    this.registerModalType('confirm', this.createConfirmModal);
    this.registerModalType('form', this.createFormModal);
    this.registerModalType('info', this.createInfoModal);
    this.registerModalType('warning', this.createWarningModal);
    this.registerModalType('error', this.createErrorModal);
    this.registerModalType('loading', this.createLoadingModal);
    
    // Example: Custom modal types
    // this.registerModalType('wizard', this.createWizardModal);
    // this.registerModalType('gallery', this.createGalleryModal);
  }

  registerModalType(type, creator) {
    this.modalTypes.set(type, creator);
  }

  // MODIFICATION POINT: Easy modal creation from configuration
  createModal(modalConfig) {
    const {
      type = 'basic',
      isOpen = false,
      onClose,
      className = '',
      overlayClassName = '',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      size = 'medium',
      ...props
    } = modalConfig;

    const modalCreator = this.modalTypes.get(type);
    if (!modalCreator) {
      console.warn(`Unknown modal type: ${type}`);
      return null;
    }

    return (additionalProps) => {
      const combinedProps = { ...props, ...additionalProps };

      // Handle escape key
      React.useEffect(() => {
        if (!closeOnEscape || !isOpen) return;
        
        const handleEscape = (e) => {
          if (e.key === 'Escape') onClose?.();
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }, [isOpen, closeOnEscape, onClose]);

      // Handle body scroll lock
      React.useEffect(() => {
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset';
        }
        
        return () => {
          document.body.style.overflow = 'unset';
        };
      }, [isOpen]);

      if (!isOpen) return null;

      return React.createElement('div', {
        className: `modal-overlay fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        onClick: closeOnOverlayClick ? onClose : undefined
      }, [
        React.createElement('div', {
          key: 'modal-content',
          className: `modal-content bg-white rounded-lg shadow-xl ${this.config.MODAL_SIZES[size.toUpperCase()]} ${className} max-h-[90vh] overflow-y-auto`,
          onClick: (e) => e.stopPropagation()
        }, modalCreator.call(this, combinedProps))
      ]);
    };
  }

  // Modal type creators
  createBasicModal = (props) => {
    const { title, children, onClose, showCloseButton = true } = props;

    return [
      // Header
      title && React.createElement('div', {
        key: 'header',
        className: 'modal-header flex items-center justify-between p-6 border-b'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, title),
        
        showCloseButton && React.createElement('button', {
          key: 'close',
          onClick: onClose,
          className: 'text-gray-400 hover:text-gray-600 transition-colors'
        }, '×')
      ]),

      // Body
      React.createElement('div', {
        key: 'body',
        className: 'modal-body p-6'
      }, children)
    ];
  };

  createConfirmModal = (props) => {
    const {
      title = 'Confirm Action',
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel,
      confirmVariant = 'primary',
      cancelVariant = 'secondary'
    } = props;

    return [
      // Header
      React.createElement('div', {
        key: 'header',
        className: 'modal-header p-6 border-b'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, title)
      ]),

      // Body
      React.createElement('div', {
        key: 'body',
        className: 'modal-body p-6'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-700'
        }, message)
      ]),

      // Footer
      React.createElement('div', {
        key: 'footer',
        className: 'modal-footer flex gap-3 justify-end p-6 border-t bg-gray-50'
      }, [
        React.createElement('button', {
          key: 'cancel',
          onClick: onCancel,
          className: `btn btn-${cancelVariant}`
        }, cancelText),
        
        React.createElement('button', {
          key: 'confirm',
          onClick: onConfirm,
          className: `btn btn-${confirmVariant}`
        }, confirmText)
      ])
    ];
  };

  createFormModal = (props) => {
    const {
      title,
      form,
      onSubmit,
      onCancel,
      submitText = 'Submit',
      cancelText = 'Cancel',
      isSubmitting = false
    } = props;

    return [
      // Header
      React.createElement('div', {
        key: 'header',
        className: 'modal-header p-6 border-b'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, title)
      ]),

      // Body with form
      React.createElement('form', {
        key: 'form',
        onSubmit: (e) => {
          e.preventDefault();
          onSubmit?.();
        },
        className: 'modal-form'
      }, [
        React.createElement('div', {
          key: 'body',
          className: 'modal-body p-6'
        }, form),

        // Footer
        React.createElement('div', {
          key: 'footer',
          className: 'modal-footer flex gap-3 justify-end p-6 border-t bg-gray-50'
        }, [
          React.createElement('button', {
            key: 'cancel',
            type: 'button',
            onClick: onCancel,
            disabled: isSubmitting,
            className: 'btn btn-secondary'
          }, cancelText),
          
          React.createElement('button', {
            key: 'submit',
            type: 'submit',
            disabled: isSubmitting,
            className: 'btn btn-primary'
          }, isSubmitting ? 'Submitting...' : submitText)
        ])
      ])
    ];
  };

  createInfoModal = (props) => {
    const { title = 'Information', message, onClose } = props;

    return [
      // Header with info icon
      React.createElement('div', {
        key: 'header',
        className: 'modal-header flex items-center gap-3 p-6 border-b'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'
        }, [
          React.createElement('span', {
            key: 'icon-text',
            className: 'text-blue-600 font-bold'
          }, 'i')
        ]),
        
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, title)
      ]),

      // Body
      React.createElement('div', {
        key: 'body',
        className: 'modal-body p-6'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-700'
        }, message)
      ]),

      // Footer
      React.createElement('div', {
        key: 'footer',
        className: 'modal-footer flex justify-end p-6 border-t bg-gray-50'
      }, [
        React.createElement('button', {
          key: 'ok',
          onClick: onClose,
          className: 'btn btn-primary'
        }, 'OK')
      ])
    ];
  };

  createWarningModal = (props) => {
    const { title = 'Warning', message, onClose } = props;

    return [
      // Header with warning icon
      React.createElement('div', {
        key: 'header',
        className: 'modal-header flex items-center gap-3 p-6 border-b'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center'
        }, [
          React.createElement('span', {
            key: 'icon-text',
            className: 'text-yellow-600 font-bold'
          }, '!')
        ]),
        
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, title)
      ]),

      // Body
      React.createElement('div', {
        key: 'body',
        className: 'modal-body p-6'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-700'
        }, message)
      ]),

      // Footer
      React.createElement('div', {
        key: 'footer',
        className: 'modal-footer flex justify-end p-6 border-t bg-gray-50'
      }, [
        React.createElement('button', {
          key: 'ok',
          onClick: onClose,
          className: 'btn btn-warning'
        }, 'OK')
      ])
    ];
  };

  createErrorModal = (props) => {
    const { title = 'Error', message, onClose } = props;

    return [
      // Header with error icon
      React.createElement('div', {
        key: 'header',
        className: 'modal-header flex items-center gap-3 p-6 border-b'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'
        }, [
          React.createElement('span', {
            key: 'icon-text',
            className: 'text-red-600 font-bold'
          }, '×')
        ]),
        
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-red-900'
        }, title)
      ]),

      // Body
      React.createElement('div', {
        key: 'body',
        className: 'modal-body p-6'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-700'
        }, message)
      ]),

      // Footer
      React.createElement('div', {
        key: 'footer',
        className: 'modal-footer flex justify-end p-6 border-t bg-gray-50'
      }, [
        React.createElement('button', {
          key: 'ok',
          onClick: onClose,
          className: 'btn btn-error'
        }, 'OK')
      ])
    ];
  };

  createLoadingModal = (props) => {
    const { title = 'Loading...', message = 'Please wait' } = props;

    return [
      // Body with loading indicator
      React.createElement('div', {
        key: 'body',
        className: 'modal-body flex flex-col items-center justify-center p-8'
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'
        }),
        
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900 mb-2'
        }, title),
        
        React.createElement('p', {
          key: 'message',
          className: 'text-gray-600 text-center'
        }, message)
      ])
    ];
  };

  // MODIFICATION POINT: Add new modal types
  createWizardModal = (props) => {
    const { 
      title,
      steps,
      currentStep = 0,
      onNext,
      onPrevious,
      onFinish,
      onCancel
    } = props;

    return [
      // Header with step indicator
      React.createElement('div', {
        key: 'header',
        className: 'modal-header p-6 border-b'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900 mb-4'
        }, title),
        
        React.createElement('div', {
          key: 'steps',
          className: 'flex items-center'
        }, steps.map((step, index) =>
          React.createElement('div', {
            key: index,
            className: `flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`
          }, [
            React.createElement('div', {
              key: 'circle',
              className: `w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`
            }, index + 1),
            
            index < steps.length - 1 && React.createElement('div', {
              key: 'line',
              className: `flex-1 h-0.5 mx-2 ${
                index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`
            })
          ])
        ))
      ]),

      // Body with current step content
      React.createElement('div', {
        key: 'body',
        className: 'modal-body p-6'
      }, steps[currentStep]?.content),

      // Footer with navigation
      React.createElement('div', {
        key: 'footer',
        className: 'modal-footer flex justify-between p-6 border-t bg-gray-50'
      }, [
        React.createElement('button', {
          key: 'cancel',
          onClick: onCancel,
          className: 'btn btn-secondary'
        }, 'Cancel'),
        
        React.createElement('div', {
          key: 'nav-buttons',
          className: 'flex gap-2'
        }, [
          currentStep > 0 && React.createElement('button', {
            key: 'previous',
            onClick: onPrevious,
            className: 'btn btn-secondary'
          }, 'Previous'),
          
          currentStep < steps.length - 1 ? 
            React.createElement('button', {
              key: 'next',
              onClick: onNext,
              className: 'btn btn-primary'
            }, 'Next') :
            React.createElement('button', {
              key: 'finish',
              onClick: onFinish,
              className: 'btn btn-primary'
            }, 'Finish')
        ])
      ])
    ];
  };
}

export const modalFactory = new ModalFactory();

// EXAMPLE USAGE:
/*
const confirmModalConfig = {
  type: 'confirm',
  isOpen: showConfirmModal,
  title: 'Delete User',
  message: 'Are you sure you want to delete this user? This action cannot be undone.',
  onConfirm: () => handleDeleteUser(),
  onCancel: () => setShowConfirmModal(false),
  onClose: () => setShowConfirmModal(false)
};

const ConfirmModal = modalFactory.createModal(confirmModalConfig);
*/