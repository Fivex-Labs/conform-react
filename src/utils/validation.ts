import * as yup from 'yup';
import { ValidationRules, ValidationMessages, FormField, FormSchema } from '../types/schema';

/**
 * Creates a Yup validation schema for a single field
 */
export function createFieldValidationSchema(
  field: FormField,
  customMessages?: ValidationMessages
): yup.AnySchema {
  let schema: yup.AnySchema;
  
  // Start with the appropriate base schema
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'url':
    case 'tel':
    case 'textarea':
      schema = yup.string();
      break;
    
    case 'number':
      schema = yup.number();
      break;
    
    case 'checkbox':
      schema = yup.boolean();
      break;
    
    case 'date':
    case 'datetime-local':
    case 'time':
      schema = yup.date();
      break;
    
    case 'select':
    case 'radio':
      schema = yup.mixed();
      break;
    
    case 'file':
      schema = yup.mixed();
      break;
    
    case 'array':
      schema = yup.array();
      break;
    
    case 'object':
      schema = yup.object();
      break;
    
    default:
      schema = yup.mixed();
  }
  
  // Apply validation rules
  if (field.validation) {
    schema = applyValidationRules(schema, field.validation, field.validationMessages || customMessages);
  }
  
  // Handle required validation
  if (field.required || field.validation?.required) {
    const message = getValidationMessage('required', field.validationMessages, customMessages);
    schema = schema.required(message);
  }
  
  return schema;
}

/**
 * Applies validation rules to a Yup schema
 */
function applyValidationRules(
  schema: yup.AnySchema,
  rules: ValidationRules,
  messages?: ValidationMessages
): yup.AnySchema {
  let updatedSchema = schema;
  
  // String-specific validations
  if (updatedSchema instanceof yup.StringSchema) {
    if (rules.minLength !== undefined) {
      const message = getValidationMessage('minLength', messages);
      updatedSchema = updatedSchema.min(rules.minLength, message);
    }
    
    if (rules.maxLength !== undefined) {
      const message = getValidationMessage('maxLength', messages);
      updatedSchema = updatedSchema.max(rules.maxLength, message);
    }
    
    if (rules.pattern) {
      const message = getValidationMessage('pattern', messages);
      updatedSchema = updatedSchema.matches(new RegExp(rules.pattern), message);
    }
    
    if ('email' in rules && rules.email) {
      const message = getValidationMessage('email', messages);
      updatedSchema = updatedSchema.email(message);
    }
  }
  
  // Number-specific validations
  if (updatedSchema instanceof yup.NumberSchema) {
    if (rules.min !== undefined) {
      const message = getValidationMessage('min', messages);
      updatedSchema = updatedSchema.min(rules.min, message);
    }
    
    if (rules.max !== undefined) {
      const message = getValidationMessage('max', messages);
      updatedSchema = updatedSchema.max(rules.max, message);
    }
  }
  
  // Array-specific validations
  if (updatedSchema instanceof yup.ArraySchema) {
    if ('minItems' in rules && rules.minItems !== undefined) {
      const message = getValidationMessage('minItems', messages);
      updatedSchema = updatedSchema.min(rules.minItems, message);
    }
    
    if ('maxItems' in rules && rules.maxItems !== undefined) {
      const message = getValidationMessage('maxItems', messages);
      updatedSchema = updatedSchema.max(rules.maxItems, message);
    }
  }
  
  // Custom validation
  if (rules.custom) {
    const message = getValidationMessage('custom', messages);
    updatedSchema = updatedSchema.test('custom', message, async function(value) {
      const result = await rules.custom!(value);
      return typeof result === 'boolean' ? result : false;
    });
  }
  
  return updatedSchema;
}

/**
 * Creates a complete Yup validation schema for a form
 */
export function createFormValidationSchema(
  schema: FormSchema,
  customMessages?: ValidationMessages
): yup.ObjectSchema<any> {
  const shape: Record<string, yup.AnySchema> = {};
  
  function processFields(fields: (FormField | any)[]) {
    fields.forEach(field => {
      if ('type' in field) {
        if (field.type === 'group') {
          // Process group fields
          processFields(field.fields);
        } else if (field.type === 'array') {
          // Handle array fields
          const itemSchema = createFormValidationSchema(field.itemSchema, customMessages);
          shape[field.name] = yup.array().of(itemSchema);
        } else if (field.type === 'object') {
          // Handle object fields
          const objectShape: Record<string, yup.AnySchema> = {};
          field.fields.forEach((subField: FormField) => {
            objectShape[subField.name] = createFieldValidationSchema(subField, customMessages);
          });
          shape[field.name] = yup.object().shape(objectShape);
        } else {
          // Regular field
          shape[field.name] = createFieldValidationSchema(field, customMessages);
        }
      }
    });
  }
  
  processFields(schema.fields);
  
  return yup.object().shape(shape);
}

/**
 * Gets validation message with fallback to default messages
 */
function getValidationMessage(
  key: string,
  fieldMessages?: ValidationMessages,
  globalMessages?: ValidationMessages
): string {
  const message = fieldMessages?.[key] || globalMessages?.[key] || DEFAULT_VALIDATION_MESSAGES[key];
  return message || `Validation failed for ${key}`;
}

/**
 * Default validation messages
 */
export const DEFAULT_VALIDATION_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  minLength: 'Must be at least ${min} characters',
  maxLength: 'Must be no more than ${max} characters',
  min: 'Must be at least ${min}',
  max: 'Must be no more than ${max}',
  pattern: 'Invalid format',
  email: 'Must be a valid email address',
  custom: 'Invalid value',
  minItems: 'Must have at least ${min} items',
  maxItems: 'Must have no more than ${max} items',
};

/**
 * Validates a single field value
 */
export async function validateFieldValue(
  fieldName: string,
  value: any,
  field: FormField,
  customMessages?: ValidationMessages
): Promise<string | null> {
  try {
    const fieldSchema = createFieldValidationSchema(field, customMessages);
    await fieldSchema.validate(value);
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Validation error';
  }
}

/**
 * Validates entire form data
 */
export async function validateFormData(
  data: Record<string, any>,
  schema: FormSchema,
  customMessages?: ValidationMessages
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};
  
  try {
    const validationSchema = createFormValidationSchema(schema, customMessages);
    await validationSchema.validate(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      error.inner.forEach(err => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    }
  }
  
  return errors;
}

/**
 * Transforms Yup validation errors to a more usable format
 */
export function transformValidationErrors(error: yup.ValidationError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  error.inner.forEach(err => {
    if (err.path) {
      if (!errors[err.path]) {
        errors[err.path] = [];
      }
      errors[err.path].push(err.message);
    }
  });
  
  return errors;
}

/**
 * Checks if a value is empty based on its type
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
} 