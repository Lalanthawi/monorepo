/**
 * REFACTORED COMPONENTS EXAMPLE
 * 
 * Example demonstrating the refactored components and systems.
 * Shows how easy it is to modify and extend functionality.
 */

import React from 'react';
import { Button, PrimaryButton, SecondaryButton } from '../components/core/Button.jsx';
import { Modal, ConfirmModal, FormModal, useModal } from '../components/core/Modal.jsx';
import { formFactory } from '../factories/FormFactory.js';
import { tableFactory } from '../factories/TableFactory.js';
import { FeatureGate } from '../systems/FeatureFlags.js';

// MODIFICATION POINT: Example form configuration
const userFormConfig = {
  fields: [
    {
      type: 'text',
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      validation: ['required']
    },
    {
      type: 'email',
      name: 'email', 
      label: 'Email Address',
      placeholder: 'Enter your email',
      validation: ['required', 'email']
    },
    {
      type: 'select',
      name: 'role',
      label: 'Role',
      options: [
        { value: 'Admin', label: 'Administrator' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Electrician', label: 'Electrician' }
      ],
      validation: ['required']
    },
    {
      type: 'textarea',
      name: 'bio',
      label: 'Biography',
      placeholder: 'Tell us about yourself',
      rows: 4
    }
  ],
  onSubmit: (data) => {
    console.log('Form submitted:', data);
    alert('User created successfully!');
  },
  submitText: 'Create User',
  cancelText: 'Cancel'
};

// MODIFICATION POINT: Example table configuration
const usersTableConfig = {
  columns: [
    { key: 'name', title: 'Name', type: 'text', sortable: true, filterable: true },
    { key: 'email', title: 'Email', type: 'text', sortable: true, filterable: true },
    { 
      key: 'role', 
      title: 'Role', 
      type: 'status', 
      filterable: true, 
      filterType: 'select',
      filterOptions: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Electrician', label: 'Electrician' }
      ],
      statusColors: {
        Admin: 'text-red-600 bg-red-100',
        Manager: 'text-blue-600 bg-blue-100', 
        Electrician: 'text-green-600 bg-green-100'
      }
    },
    { 
      key: 'actions', 
      title: 'Actions', 
      type: 'actions',
      actions: [
        { 
          label: 'Edit', 
          onClick: (row) => alert(`Edit user: ${row.name}`),
          className: 'btn-sm btn-primary'
        },
        { 
          label: 'Delete', 
          onClick: (row) => alert(`Delete user: ${row.name}`),
          className: 'btn-sm btn-danger'
        }
      ]
    }
  ],
  data: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Electrician' },
    { id: 4, name: 'Alice Wilson', email: 'alice@example.com', role: 'Manager' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Electrician' }
  ],
  pagination: true,
  sorting: true,
  filtering: true,
  onRowClick: (row) => console.log('Row clicked:', row)
};

// Create components using factories
const UserForm = formFactory.createForm(userFormConfig);
const UsersTable = tableFactory.createTable(usersTableConfig);

// MODIFICATION POINT: Main example component
export const RefactoredExample = () => {
  const { isOpen: showBasicModal, openModal: openBasicModal, closeModal: closeBasicModal } = useModal();
  const { isOpen: showConfirmModal, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();
  const { isOpen: showFormModal, openModal: openFormModal, closeModal: closeFormModal } = useModal();

  const handleConfirmAction = () => {
    alert('Action confirmed!');
    closeConfirmModal();
  };

  const handleFormSubmit = (formData) => {
    console.log('Form submitted in modal:', formData);
    alert('Form submitted successfully!');
    closeFormModal();
  };

  return React.createElement('div', {
    className: 'refactored-example p-8 max-w-6xl mx-auto'
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'mb-8'
    }, [
      React.createElement('h1', {
        key: 'title',
        className: 'text-3xl font-bold text-gray-900 mb-4'
      }, 'Refactored Components Example'),
      
      React.createElement('p', {
        key: 'description',
        className: 'text-lg text-gray-600'
      }, 'This example demonstrates the modular, configurable components created through refactoring. Each component can be easily modified during presentations.')
    ]),

    // Button Examples
    React.createElement('section', {
      key: 'buttons',
      className: 'mb-8'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-2xl font-semibold mb-4'
      }, 'Button Components'),
      
      React.createElement('div', {
        key: 'button-grid',
        className: 'grid grid-cols-2 md:grid-cols-4 gap-4'
      }, [
        React.createElement(PrimaryButton, {
          key: 'primary',
          onClick: openBasicModal
        }, 'Open Modal'),
        
        React.createElement(SecondaryButton, {
          key: 'secondary',
          onClick: openConfirmModal
        }, 'Confirm Action'),
        
        React.createElement(Button, {
          key: 'outline',
          variant: 'outline',
          onClick: openFormModal
        }, 'Open Form'),
        
        React.createElement(Button, {
          key: 'loading',
          loading: true
        }, 'Loading...')
      ])
    ]),

    // Feature Flag Examples
    React.createElement('section', {
      key: 'feature-flags',
      className: 'mb-8'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-2xl font-semibold mb-4'
      }, 'Feature Flag Examples'),
      
      React.createElement(FeatureGate, {
        key: 'dark-mode-gate',
        flag: 'ENABLE_DARK_MODE'
      }, React.createElement('div', {
        className: 'p-4 bg-gray-800 text-white rounded-lg mb-4'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold mb-2'
        }, 'Dark Mode Feature'),
        React.createElement('p', {
          key: 'text'
        }, 'This section only appears when dark mode feature flag is enabled.')
      ])),
      
      React.createElement(FeatureGate, {
        key: 'notifications-gate',
        flag: 'ENABLE_NOTIFICATIONS',
        fallback: React.createElement('div', {
          className: 'p-4 bg-gray-100 rounded-lg'
        }, 'Notifications feature is disabled')
      }, React.createElement('div', {
        className: 'p-4 bg-blue-100 rounded-lg'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold mb-2'
        }, 'Notifications Enabled'),
        React.createElement('p', {
          key: 'text'
        }, 'You would see notification controls here.')
      ]))
    ]),

    // Form Example
    React.createElement('section', {
      key: 'form',
      className: 'mb-8'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-2xl font-semibold mb-4'
      }, 'Dynamic Form Example'),
      
      React.createElement('div', {
        key: 'form-container',
        className: 'bg-white p-6 rounded-lg shadow border'
      }, [
        React.createElement(UserForm, { key: 'form' })
      ])
    ]),

    // Table Example
    React.createElement('section', {
      key: 'table',
      className: 'mb-8'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-2xl font-semibold mb-4'
      }, 'Dynamic Table Example'),
      
      React.createElement('div', {
        key: 'table-container',
        className: 'bg-white rounded-lg shadow border'
      }, [
        React.createElement(UsersTable, { key: 'table' })
      ])
    ]),

    // Modals
    React.createElement(Modal, {
      key: 'basic-modal',
      isOpen: showBasicModal,
      onClose: closeBasicModal,
      title: 'Basic Modal Example'
    }, [
      React.createElement('p', {
        key: 'content',
        className: 'mb-4'
      }, 'This is a basic modal created using the modal factory. It can be easily customized with different sizes, styles, and behaviors.'),
      
      React.createElement('ul', {
        key: 'features',
        className: 'list-disc list-inside space-y-2 text-gray-600'
      }, [
        React.createElement('li', { key: '1' }, 'Configurable size and styling'),
        React.createElement('li', { key: '2' }, 'Close on overlay click or ESC key'),
        React.createElement('li', { key: '3' }, 'Accessible and keyboard navigable'),
        React.createElement('li', { key: '4' }, 'Easy to extend with new modal types')
      ])
    ]),

    React.createElement(ConfirmModal, {
      key: 'confirm-modal',
      isOpen: showConfirmModal,
      onClose: closeConfirmModal,
      title: 'Confirm Action',
      message: 'Are you sure you want to perform this action? This is a specialized confirm modal created using the modal factory.',
      onConfirm: handleConfirmAction,
      confirmText: 'Yes, Continue',
      cancelText: 'Cancel'
    }),

    React.createElement(FormModal, {
      key: 'form-modal',
      isOpen: showFormModal,
      onClose: closeFormModal,
      title: 'Create New User',
      form: React.createElement(UserForm),
      onSubmit: handleFormSubmit,
      submitText: 'Create User',
      cancelText: 'Cancel'
    })
  ]);
};

export default RefactoredExample;