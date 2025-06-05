import React, { ReactNode } from 'react';

// Base field validation rules
export interface BaseValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string | Promise<boolean | string>;
}

// Field type specific validation
export interface EmailValidationRules extends BaseValidationRules {
  email?: boolean;
}

export interface NumberValidationRules extends BaseValidationRules {
  step?: number;
}

export interface ArrayValidationRules extends BaseValidationRules {
  minItems?: number;
  maxItems?: number;
}

export type ValidationRules = 
  | BaseValidationRules 
  | EmailValidationRules 
  | NumberValidationRules 
  | ArrayValidationRules;

// Validation messages for internationalization
export interface ValidationMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  min?: string;
  max?: string;
  pattern?: string;
  email?: string;
  custom?: string;
  [key: string]: string | undefined;
}

// Conditional logic operators
export type ConditionalOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterThanOrEqual' 
  | 'lessThanOrEqual' 
  | 'contains' 
  | 'notContains' 
  | 'in' 
  | 'notIn' 
  | 'isEmpty' 
  | 'isNotEmpty';

// Conditional logic definition
export interface ConditionalLogic {
  field: string;
  operator: ConditionalOperator;
  value?: any;
  values?: any[];
}

// Complex conditional logic with AND/OR operations
export interface ComplexConditionalLogic {
  and?: ConditionalLogic[];
  or?: ConditionalLogic[];
  not?: ConditionalLogic;
}

// Select/Radio option
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  description?: string;
}

// Base field interface
export interface BaseField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  className?: string;
  style?: React.CSSProperties;
  validation?: ValidationRules;
  validationMessages?: ValidationMessages;
  conditional?: ConditionalLogic | ComplexConditionalLogic;
  visibleWhen?: Record<string, any>; // Simplified conditional syntax
  disabledWhen?: Record<string, any>;
  customProps?: Record<string, any>;
}

// Specific field types
export interface TextField extends BaseField {
  type: 'text' | 'email' | 'password' | 'url' | 'tel';
  autoComplete?: string;
  maxLength?: number;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface NumberField extends BaseField {
  type: 'number';
  step?: number;
  min?: number;
  max?: number;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  defaultValue?: boolean;
}

export interface RadioField extends BaseField {
  type: 'radio';
  options: SelectOption[];
  inline?: boolean;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
}

export interface DateField extends BaseField {
  type: 'date' | 'datetime-local' | 'time';
  min?: string;
  max?: string;
}

export interface FileField extends BaseField {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
}

export interface HiddenField extends BaseField {
  type: 'hidden';
}

// Array field for repeatable sections
export interface ArrayField extends BaseField {
  type: 'array';
  itemSchema: FormSchema;
  minItems?: number;
  maxItems?: number;
  addButtonText?: string;
  removeButtonText?: string;
  canAdd?: boolean;
  canRemove?: boolean;
  canReorder?: boolean;
}

// Object field for nested forms
export interface ObjectField extends BaseField {
  type: 'object';
  fields: FormField[];
}

// Group/Section for organizing fields
export interface FieldGroup {
  type: 'group';
  title?: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  conditional?: ConditionalLogic | ComplexConditionalLogic;
  visibleWhen?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

// Custom field for user-defined components
export interface CustomField extends BaseField {
  type: 'custom';
  component: string; // Component name to look up in customComponents
  componentProps?: Record<string, any>;
}

// Union of all field types
export type FormField = 
  | TextField 
  | TextareaField 
  | NumberField 
  | CheckboxField 
  | RadioField 
  | SelectField 
  | DateField 
  | FileField 
  | HiddenField 
  | ArrayField 
  | ObjectField 
  | CustomField;

export type FieldType = FormField['type'];

// Layout configuration
export interface LayoutConfig {
  columns?: number;
  spacing?: 'compact' | 'normal' | 'loose';
  labelPosition?: 'top' | 'left' | 'right';
  labelWidth?: string;
}

// Form schema structure
export interface FormSchema {
  title?: string;
  description?: string;
  fields: (FormField | FieldGroup)[];
  layout?: LayoutConfig;
  submitButtonText?: string;
  resetButtonText?: string;
  showResetButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Form renderer props
export interface FormRendererProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onFormChange?: (data: Record<string, any>) => void;
  onFieldChange?: (fieldName: string, value: any, allValues: Record<string, any>) => void;
  customComponents?: Record<string, React.ComponentType<any>>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  renderSubmitButton?: (props: SubmitButtonProps) => ReactNode;
  renderResetButton?: (props: ResetButtonProps) => ReactNode;
  renderFieldWrapper?: (props: FieldWrapperProps) => ReactNode;
  renderErrorSummary?: (errors: FormErrors) => ReactNode;
}

// Additional prop types for custom rendering
export interface SubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
  text: string;
  onClick: () => void;
}

export interface ResetButtonProps {
  disabled?: boolean;
  text: string;
  onClick: () => void;
}

export interface FieldWrapperProps {
  field: FormField;
  children: ReactNode;
  error?: string;
  required?: boolean;
}

export interface FormErrors {
  [fieldName: string]: string | string[];
}

// Hook return types
export interface UseFormRendererReturn {
  formProps: any;
  fieldProps: (name: string) => any;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  reset: () => void;
  setValue: (name: string, value: any) => void;
  getValue: (name: string) => any;
  getAllValues: () => Record<string, any>;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}

// Context types
export interface FormRendererContextValue {
  schema: FormSchema;
  customComponents?: Record<string, React.ComponentType<any>>;
  formMethods: any; // React Hook Form methods
  isSubmitting: boolean;
  errors: FormErrors;
} 