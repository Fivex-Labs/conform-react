// Main component
export { FormRenderer } from './components/FormRenderer';

// Types and interfaces
export type {
  FormSchema,
  FormField,
  FieldGroup,
  FormRendererProps,
  ValidationRules,
  ValidationMessages,
  ConditionalLogic,
  ComplexConditionalLogic,
  SelectOption,
  BaseField,
  TextField as TextFieldType,
  TextareaField,
  NumberField,
  CheckboxField,
  RadioField,
  SelectField,
  DateField,
  FileField,
  HiddenField,
  ArrayField,
  ObjectField,
  CustomField,
  LayoutConfig,
  SubmitButtonProps,
  ResetButtonProps,
  FieldWrapperProps,
  FormErrors,
  UseFormRendererReturn,
  FormRendererContextValue,
} from './types/schema';

// Default field components
export { TextField } from './components/fields/TextField';

// Utility functions
export {
  evaluateCondition,
  evaluateComplexCondition,
  evaluateConditionalLogic,
  evaluateSimpleCondition,
  shouldFieldBeVisible,
  shouldFieldBeDisabled,
  getNestedValue,
} from './utils/conditionalLogic';

export {
  createFieldValidationSchema,
  createFormValidationSchema,
  validateFieldValue,
  validateFormData,
  transformValidationErrors,
  isEmpty,
  DEFAULT_VALIDATION_MESSAGES,
} from './utils/validation';

// Re-export some useful types from react-hook-form for convenience
export type { FieldError, FieldErrors } from 'react-hook-form'; 