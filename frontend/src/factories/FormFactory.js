/**
 * form factory thing
 * 
 * this was supposed to make forms easier to create but honestly its kinda complicated
 * basically you give it a config object and it builds a form for you
 * TODO: simplify this mess, its getting out of hand
 */

import React from 'react';
import { FORM_CONFIG } from '../config/app.config.js';

export class FormFactory {
  constructor(config = FORM_CONFIG) {
    this.config = config;
    this.fieldComponents = new Map(); // stores field type -> component mapping
    this.validators = new Map(); // stores validation functions
    this.initializeDefaultFields(); // set up basic field types
    this.initializeDefaultValidators(); // set up validation rules
  }

  // register all the default field types we support
  initializeDefaultFields() {
    this.registerField(this.config.FIELD_TYPES.TEXT, this.createTextInput);
    this.registerField(this.config.FIELD_TYPES.EMAIL, this.createEmailInput);
    this.registerField(this.config.FIELD_TYPES.PASSWORD, this.createPasswordInput);
    this.registerField(this.config.FIELD_TYPES.SELECT, this.createSelect);
    this.registerField(this.config.FIELD_TYPES.TEXTAREA, this.createTextarea);
    this.registerField(this.config.FIELD_TYPES.CHECKBOX, this.createCheckbox);
    this.registerField(this.config.FIELD_TYPES.DATE, this.createDateInput);
    this.registerField(this.config.FIELD_TYPES.FILE, this.createFileInput);
    
    // TODO: add rich text editor when we figure out which library to use
  }

  initializeDefaultValidators() {
    this.registerValidator('required', (value) => !!value || 'This field is required');
    this.registerValidator('email', (value) => 
      this.config.VALIDATION.EMAIL_REGEX.test(value) || 'Invalid email format'
    );
    this.registerValidator('minLength', (value, min) => 
      value.length >= min || `Minimum ${min} characters required`
    );
    this.registerValidator('maxLength', (value, max) => 
      value.length <= max || `Maximum ${max} characters allowed`
    );
    
    // MODIFICATION POINT: Add custom validators
    // this.registerValidator('phone', (value) => /* phone validation */);
  }

  registerField(type, component) {
    this.fieldComponents.set(type, component);
  }

  registerValidator(name, validatorFn) {
    this.validators.set(name, validatorFn);
  }

  // MODIFICATION POINT: Easy form creation from configuration
  createForm(formConfig) {
    const {
      fields,
      layout = 'vertical',
      className = '',
      onSubmit,
      submitText = 'Submit',
      cancelText = 'Cancel',
      onCancel
    } = formConfig;

    return (props) => {
      const [formData, setFormData] = React.useState({});
      const [errors, setErrors] = React.useState({});

      const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      };

      const validate = () => {
        const newErrors = {};
        
        fields.forEach(field => {
          const value = formData[field.name] || '';
          
          if (field.validation) {
            field.validation.forEach(rule => {
              if (typeof rule === 'string') {
                const validator = this.validators.get(rule);
                if (validator) {
                  const result = validator(value);
                  if (result !== true) newErrors[field.name] = result;
                }
              } else if (typeof rule === 'object') {
                const { type, param } = rule;
                const validator = this.validators.get(type);
                if (validator) {
                  const result = validator(value, param);
                  if (result !== true) newErrors[field.name] = result;
                }
              }
            });
          }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (validate() && onSubmit) {
          onSubmit(formData);
        }
      };

      return React.createElement('form', {
        className: `form-factory ${layout} ${className}`,
        onSubmit: handleSubmit
      }, [
        ...fields.map(field => this.createField(field, formData[field.name], 
          (value) => handleChange(field.name, value), errors[field.name])),
        React.createElement('div', { 
          key: 'buttons',
          className: 'form-buttons flex gap-2 mt-4' 
        }, [
          React.createElement('button', {
            key: 'submit',
            type: 'submit',
            className: 'btn btn-primary'
          }, submitText),
          onCancel && React.createElement('button', {
            key: 'cancel', 
            type: 'button',
            onClick: onCancel,
            className: 'btn btn-secondary'
          }, cancelText)
        ])
      ]);
    };
  }

  createField(fieldConfig, value, onChange, error) {
    const { type, name, label, ...props } = fieldConfig;
    const FieldComponent = this.fieldComponents.get(type);
    
    if (!FieldComponent) {
      console.warn(`Unknown field type: ${type}`);
      return null;
    }

    return React.createElement('div', {
      key: name,
      className: 'form-field mb-4'
    }, [
      label && React.createElement('label', {
        key: 'label',
        className: 'form-label block text-sm font-medium mb-1'
      }, label),
      FieldComponent({
        key: 'input',
        name,
        value: value || '',
        onChange,
        error: !!error,
        ...props
      }),
      error && React.createElement('span', {
        key: 'error',
        className: 'form-error text-red-500 text-sm mt-1'
      }, error)
    ]);
  }

  // Field component creators
  createTextInput = (props) => {
    return React.createElement('input', {
      type: 'text',
      className: `form-input ${props.error ? 'error' : ''}`,
      value: props.value,
      onChange: (e) => props.onChange(e.target.value),
      ...props
    });
  };

  createEmailInput = (props) => {
    return React.createElement('input', {
      type: 'email',
      className: `form-input ${props.error ? 'error' : ''}`,
      value: props.value,
      onChange: (e) => props.onChange(e.target.value),
      ...props
    });
  };

  createPasswordInput = (props) => {
    return React.createElement('input', {
      type: 'password',
      className: `form-input ${props.error ? 'error' : ''}`,
      value: props.value,
      onChange: (e) => props.onChange(e.target.value),
      ...props
    });
  };

  createSelect = (props) => {
    const { options = [], ...otherProps } = props;
    return React.createElement('select', {
      className: `form-select ${props.error ? 'error' : ''}`,
      value: props.value,
      onChange: (e) => props.onChange(e.target.value),
      ...otherProps
    }, [
      React.createElement('option', { key: 'empty', value: '' }, 'Select...'),
      ...options.map(option => 
        React.createElement('option', {
          key: option.value,
          value: option.value
        }, option.label)
      )
    ]);
  };

  createTextarea = (props) => {
    return React.createElement('textarea', {
      className: `form-textarea ${props.error ? 'error' : ''}`,
      value: props.value,
      onChange: (e) => props.onChange(e.target.value),
      rows: props.rows || 3,
      ...props
    });
  };

  createCheckbox = (props) => {
    return React.createElement('input', {
      type: 'checkbox',
      className: `form-checkbox ${props.error ? 'error' : ''}`,
      checked: props.value,
      onChange: (e) => props.onChange(e.target.checked),
      ...props
    });
  };

  createDateInput = (props) => {
    return React.createElement('input', {
      type: 'date',
      className: `form-input ${props.error ? 'error' : ''}`,
      value: props.value,
      onChange: (e) => props.onChange(e.target.value),
      ...props
    });
  };

  createFileInput = (props) => {
    return React.createElement('input', {
      type: 'file',
      className: `form-file ${props.error ? 'error' : ''}`,
      onChange: (e) => props.onChange(e.target.files[0]),
      ...props
    });
  };

  // MODIFICATION POINT: Add new field types like rich text editor
  createRichTextEditor = (props) => {
    // Implementation for rich text editor
    return React.createElement('div', {
      className: 'rich-text-editor',
      contentEditable: true,
      onInput: (e) => props.onChange(e.target.innerHTML),
      dangerouslySetInnerHTML: { __html: props.value }
    });
  };
}

export const formFactory = new FormFactory();

// EXAMPLE USAGE:
/*
const loginFormConfig = {
  fields: [
    {
      type: 'email',
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      validation: ['required', 'email']
    },
    {
      type: 'password', 
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      validation: ['required', { type: 'minLength', param: 6 }]
    }
  ],
  onSubmit: (data) => console.log('Form submitted:', data),
  submitText: 'Login'
};

const LoginForm = formFactory.createForm(loginFormConfig);
*/