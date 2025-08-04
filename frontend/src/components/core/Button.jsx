/**
 * button component
 * 
 * tried to make a reusable button but its getting pretty complex
 * supports different colors, sizes, loading states etc
 * TODO: maybe split this up? its doing too much
 */

import React from 'react';
import { useComponentStyles } from '../../hooks/useTheme.js';
import { useFeatureFlag } from '../../systems/FeatureFlags.js';

// main button component - takes a bunch of props to customize it
export const Button = ({
  children, // button text or content
  variant = 'primary', // color variant
  size = 'md', // size variant
  disabled = false, // disabled state
  loading = false, // loading state (shows spinner)
  icon = null, // optional icon
  iconPosition = 'left', // where to put the icon
  onClick, // click handler
  type = 'button', // button type for forms
  className = '', // extra css classes
  style = {}, // custom styles
  // dependency injection for testing (probably overkill but whatever)
  themeHook = useComponentStyles,
  featureFlagHook = useFeatureFlag,
  ...props
}) => {
  // get theme styles and check if animations are enabled
  const { className: baseClassName, getThemeColor } = themeHook('button', variant, size);
  const isAnimationsEnabled = featureFlagHook('ENABLE_BUTTON_ANIMATIONS', true);

  // different button styles based on variant prop
  const variantStyles = {
    primary: `bg-primary text-white hover:bg-opacity-90 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, // blue
    secondary: `bg-secondary text-white hover:bg-opacity-90 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, // green
    outline: `border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, // outlined
    ghost: `text-primary bg-transparent hover:bg-primary hover:bg-opacity-10 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, // minimal
    danger: `bg-error text-white hover:bg-opacity-90 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, // red for delete etc
    success: `bg-success text-white hover:bg-opacity-90 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}` // green for success
  };

  // different sizes (padding and text size)
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs', // tiny
    sm: 'px-3 py-1.5 text-sm', // small
    md: 'px-4 py-2 text-base', // normal
    lg: 'px-6 py-3 text-lg', // large
    xl: 'px-8 py-4 text-xl' // extra large
  };

  const animationClasses = isAnimationsEnabled ? 'transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95' : '';
  
  const finalClassName = [
    baseClassName,
    variantStyles[variant],
    sizeStyles[size],
    animationClasses,
    loading ? 'pointer-events-none' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // MODIFICATION POINT: Icon rendering
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      // Simple icon name - could be extended to use icon library
      return React.createElement('span', {
        className: `icon-${icon} ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`
      });
    }
    
    // React component or element
    return React.cloneElement(icon, {
      className: `${icon.props?.className || ''} ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`
    });
  };

  // MODIFICATION POINT: Loading spinner
  const renderLoadingSpinner = () => {
    return React.createElement('div', {
      className: 'inline-flex items-center'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'
      }),
      React.createElement('span', { key: 'text' }, 'Loading...')
    ]);
  };

  return React.createElement('button', {
    type,
    className: finalClassName,
    style: {
      ...style,
      backgroundColor: variant === 'primary' ? getThemeColor('primary') : undefined
    },
    disabled: disabled || loading,
    onClick: handleClick,
    ...props
  }, [
    loading ? renderLoadingSpinner() : React.createElement('div', {
      key: 'content',
      className: 'inline-flex items-center justify-center'
    }, [
      iconPosition === 'left' && renderIcon(),
      children && React.createElement('span', { key: 'children' }, children),
      iconPosition === 'right' && renderIcon()
    ])
  ]);
};

// MODIFICATION POINT: Button variants as separate components
export const PrimaryButton = (props) => React.createElement(Button, { variant: 'primary', ...props });
export const SecondaryButton = (props) => React.createElement(Button, { variant: 'secondary', ...props });
export const OutlineButton = (props) => React.createElement(Button, { variant: 'outline', ...props });
export const GhostButton = (props) => React.createElement(Button, { variant: 'ghost', ...props });
export const DangerButton = (props) => React.createElement(Button, { variant: 'danger', ...props });
export const SuccessButton = (props) => React.createElement(Button, { variant: 'success', ...props });

// MODIFICATION POINT: Button group component
export const ButtonGroup = ({ children, orientation = 'horizontal', className = '', ...props }) => {
  const orientationStyles = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  };

  return React.createElement('div', {
    className: `button-group ${orientationStyles[orientation]} ${className}`,
    ...props
  }, React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    // Add group styling to buttons
    const isFirst = index === 0;
    const isLast = index === React.Children.count(children) - 1;
    
    let groupClassName = '';
    if (orientation === 'horizontal') {
      if (!isFirst && !isLast) groupClassName = '-ml-px rounded-none';
      else if (isFirst) groupClassName = 'rounded-r-none';
      else if (isLast) groupClassName = '-ml-px rounded-l-none';
    } else {
      if (!isFirst && !isLast) groupClassName = '-mt-px rounded-none';
      else if (isFirst) groupClassName = 'rounded-b-none';
      else if (isLast) groupClassName = '-mt-px rounded-t-none';
    }

    return React.cloneElement(child, {
      className: `${child.props.className || ''} ${groupClassName}`.trim()
    });
  }));
};

// MODIFICATION POINT: Icon button component
export const IconButton = ({ icon, tooltip, ...props }) => {
  const buttonElement = React.createElement(Button, {
    ...props,
    icon,
    className: `icon-button ${props.className || ''}`
  });

  if (tooltip) {
    return React.createElement('div', {
      className: 'relative group'
    }, [
      buttonElement,
      React.createElement('div', {
        key: 'tooltip',
        className: 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap'
      }, tooltip)
    ]);
  }

  return buttonElement;
};

// MODIFICATION POINT: Floating action button
export const FloatingActionButton = ({ position = 'bottom-right', ...props }) => {
  const positionStyles = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  return React.createElement(Button, {
    ...props,
    className: `fab rounded-full shadow-lg hover:shadow-xl z-50 ${positionStyles[position]} ${props.className || ''}`,
    size: props.size || 'lg'
  });
};

// EXAMPLE USAGE:
/*
// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<PrimaryButton>Primary</PrimaryButton>
<SecondaryButton>Secondary</SecondaryButton>
<OutlineButton>Outline</OutlineButton>

// With icons
<Button icon="plus" iconPosition="left">Add Item</Button>
<IconButton icon="settings" tooltip="Settings" />

// With loading state
<Button loading onClick={handleSubmit}>Submit</Button>

// Button group
<ButtonGroup>
  <Button>First</Button>
  <Button>Second</Button>
  <Button>Third</Button>
</ButtonGroup>

// Floating action button
<FloatingActionButton icon="plus" position="bottom-right" />

// With dependency injection for testing
<Button 
  themeHook={mockThemeHook}
  featureFlagHook={mockFeatureFlagHook}
>
  Test Button
</Button>
*/