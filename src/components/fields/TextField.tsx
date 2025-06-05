import React from 'react';

export interface TextFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
  error?: string;
  description?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  'data-testid'?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  readonly = false,
  required = false,
  autoComplete,
  maxLength,
  className = '',
  style,
  error,
  description,
  onChange,
  onBlur,
  onFocus,
  'data-testid': testId,
  ...rest
}) => {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  
  const baseClassName = `
    w-full px-3 py-2 border rounded-md text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    readonly:bg-gray-50 readonly:cursor-default
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="form-field" style={style}>
      <label 
        htmlFor={fieldId}
        className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}
      
      <input
        id={fieldId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readonly}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={baseClassName}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[
          error ? errorId : null,
          description ? descriptionId : null,
        ].filter(Boolean).join(' ') || undefined}
        data-testid={testId}
        {...rest}
      />
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}; 