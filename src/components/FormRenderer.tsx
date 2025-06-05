import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormRendererProps } from '../types/schema';
import { createFormValidationSchema } from '../utils/validation';

export const FormRenderer: React.FC<FormRendererProps> = ({ 
  schema, 
  onSubmit,
  initialValues = {},
  customComponents = {},
  loading = false,
  disabled = false,
  className = '',
  style,
  onFormChange,
  onFieldChange,
  renderSubmitButton,
  renderResetButton,
  renderFieldWrapper,
  renderErrorSummary
}) => {
  const validationSchema = createFormValidationSchema(schema);
  
  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const handleSubmit = async (data: Record<string, any>) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={methods.handleSubmit(handleSubmit)}
        className={`conform-form ${className}`}
        style={style}
      >
        {schema.title && (
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {schema.title}
          </h2>
        )}
        {schema.description && (
          <p className="text-sm text-gray-600 mb-6">{schema.description}</p>
        )}
        
        {/* TODO: Implement field rendering */}
        <div className="space-y-4">
          {schema.fields.map((item, index) => (
            <div key={('name' in item ? item.name : `group-${index}`) || index}>
              {'name' in item ? `Field: ${item.name} (Type: ${item.type})` : `Group: ${item.title || 'Untitled'}`}
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={loading || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : (schema.submitButtonText || 'Submit')}
        </button>
      </form>
    </FormProvider>
  );
}; 