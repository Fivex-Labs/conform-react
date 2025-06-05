import { ConditionalLogic, ComplexConditionalLogic, ConditionalOperator } from '../types/schema';

/**
 * Evaluates a single conditional logic rule against form values
 */
export function evaluateCondition(
  condition: ConditionalLogic,
  formValues: Record<string, any>
): boolean {
  const fieldValue = getNestedValue(formValues, condition.field);
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    
    case 'notEquals':
      return fieldValue !== condition.value;
    
    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value);
    
    case 'lessThan':
      return Number(fieldValue) < Number(condition.value);
    
    case 'greaterThanOrEqual':
      return Number(fieldValue) >= Number(condition.value);
    
    case 'lessThanOrEqual':
      return Number(fieldValue) <= Number(condition.value);
    
    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(String(condition.value));
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      return false;
    
    case 'notContains':
      if (typeof fieldValue === 'string') {
        return !fieldValue.includes(String(condition.value));
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(condition.value);
      }
      return true;
    
    case 'in':
      return condition.values ? condition.values.includes(fieldValue) : false;
    
    case 'notIn':
      return condition.values ? !condition.values.includes(fieldValue) : true;
    
    case 'isEmpty':
      return fieldValue === null || 
             fieldValue === undefined || 
             fieldValue === '' || 
             (Array.isArray(fieldValue) && fieldValue.length === 0);
    
    case 'isNotEmpty':
      return fieldValue !== null && 
             fieldValue !== undefined && 
             fieldValue !== '' && 
             (!Array.isArray(fieldValue) || fieldValue.length > 0);
    
    default:
      return false;
  }
}

/**
 * Evaluates complex conditional logic with AND/OR/NOT operations
 */
export function evaluateComplexCondition(
  condition: ComplexConditionalLogic,
  formValues: Record<string, any>
): boolean {
  if (condition.and) {
    return condition.and.every(subCondition => 
      evaluateCondition(subCondition, formValues)
    );
  }
  
  if (condition.or) {
    return condition.or.some(subCondition => 
      evaluateCondition(subCondition, formValues)
    );
  }
  
  if (condition.not) {
    return !evaluateCondition(condition.not, formValues);
  }
  
  return false;
}

/**
 * Evaluates any conditional logic (simple or complex)
 */
export function evaluateConditionalLogic(
  condition: ConditionalLogic | ComplexConditionalLogic,
  formValues: Record<string, any>
): boolean {
  if ('field' in condition) {
    return evaluateCondition(condition, formValues);
  } else {
    return evaluateComplexCondition(condition, formValues);
  }
}

/**
 * Evaluates simplified conditional syntax (visibleWhen/disabledWhen)
 */
export function evaluateSimpleCondition(
  condition: Record<string, any>,
  formValues: Record<string, any>
): boolean {
  return Object.entries(condition).every(([field, expectedValue]) => {
    const fieldValue = getNestedValue(formValues, field);
    
    if (typeof expectedValue === 'object' && expectedValue !== null) {
      // Handle complex conditions in simple syntax
      if ('$in' in expectedValue) {
        return expectedValue.$in.includes(fieldValue);
      }
      if ('$notIn' in expectedValue) {
        return !expectedValue.$notIn.includes(fieldValue);
      }
      if ('$gt' in expectedValue) {
        return Number(fieldValue) > Number(expectedValue.$gt);
      }
      if ('$lt' in expectedValue) {
        return Number(fieldValue) < Number(expectedValue.$lt);
      }
      if ('$gte' in expectedValue) {
        return Number(fieldValue) >= Number(expectedValue.$gte);
      }
      if ('$lte' in expectedValue) {
        return Number(fieldValue) <= Number(expectedValue.$lte);
      }
      if ('$contains' in expectedValue) {
        return String(fieldValue).includes(String(expectedValue.$contains));
      }
      if ('$isEmpty' in expectedValue) {
        const isEmpty = fieldValue === null || 
                       fieldValue === undefined || 
                       fieldValue === '' || 
                       (Array.isArray(fieldValue) && fieldValue.length === 0);
        return expectedValue.$isEmpty ? isEmpty : !isEmpty;
      }
    }
    
    // Simple equality check
    return fieldValue === expectedValue;
  });
}

/**
 * Gets nested value from object using dot notation
 */
export function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Determines if a field should be visible based on its conditional logic
 */
export function shouldFieldBeVisible(
  field: { conditional?: ConditionalLogic | ComplexConditionalLogic; visibleWhen?: Record<string, any> },
  formValues: Record<string, any>
): boolean {
  // Check complex conditional logic first
  if (field.conditional) {
    return evaluateConditionalLogic(field.conditional, formValues);
  }
  
  // Check simple conditional syntax
  if (field.visibleWhen) {
    return evaluateSimpleCondition(field.visibleWhen, formValues);
  }
  
  // Default to visible
  return true;
}

/**
 * Determines if a field should be disabled based on its conditional logic
 */
export function shouldFieldBeDisabled(
  field: { disabledWhen?: Record<string, any>; disabled?: boolean },
  formValues: Record<string, any>
): boolean {
  // Check if field is explicitly disabled
  if (field.disabled) {
    return true;
  }
  
  // Check conditional disabling
  if (field.disabledWhen) {
    return evaluateSimpleCondition(field.disabledWhen, formValues);
  }
  
  return false;
} 