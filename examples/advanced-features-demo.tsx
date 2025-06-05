import React, { useState } from 'react';
import { FormRenderer } from '../src/components/FormRenderer';
import { FieldSchema } from '../src/types/schema';

// Advanced Features Demo
export const AdvancedFeaturesDemo: React.FC = () => {
  const [formData, setFormData] = useState({});
  const [submissionData, setSubmissionData] = useState(null);

  // Advanced form schema with new field types
  const advancedSchema: FieldSchema[] = [
    {
      name: 'documents',
      type: 'fileUpload' as any, // Our new advanced file upload
      label: 'Project Documents',
      description: 'Upload project files (PDF, DOC, images)',
      validation: {
        required: true
      },
      props: {
        multiple: true,
        accept: ['.pdf', '.docx', '.jpg', '.png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        preview: true,
        upload: {
          endpoint: '/api/upload',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer token123'
          }
        }
      }
    },
    {
      name: 'assignee',
      type: 'autocomplete' as any, // Our new autocomplete field
      label: 'Project Assignee',
      description: 'Search and select a team member',
      validation: {
        required: true
      },
      props: {
        searchEndpoint: '/api/users/search',
        displayKey: 'name',
        valueKey: 'id',
        debounce: 300,
        minChars: 2,
        template: '{{name}} - {{department}} ({{email}})',
        placeholder: 'Type to search team members...'
      }
    },
    {
      name: 'projectDeadline',
      type: 'dateTime' as any, // Our new date/time field
      label: 'Project Deadline',
      description: 'When should this project be completed?',
      validation: {
        required: true
      },
      props: {
        includeTime: true,
        format: 'yyyy-MM-dd HH:mm',
        restrictions: {
          minDate: 'today',
          businessDaysOnly: true,
          disabledDays: ['saturday', 'sunday']
        }
      }
    },
    {
      name: 'teamMembers',
      type: 'autocomplete' as any,
      label: 'Team Members',
      description: 'Select multiple team members for this project',
      props: {
        multiple: true,
        options: [
          { label: 'John Doe - Engineering', value: 'john', department: 'Engineering', email: 'john@company.com' },
          { label: 'Jane Smith - Design', value: 'jane', department: 'Design', email: 'jane@company.com' },
          { label: 'Bob Johnson - Marketing', value: 'bob', department: 'Marketing', email: 'bob@company.com' }
        ],
        template: '{{label}}'
      }
    },
    {
      name: 'meetingDateTime',
      type: 'dateTime' as any,
      label: 'Kickoff Meeting',
      description: 'Schedule the project kickoff meeting',
      props: {
        includeTime: true,
        format: 'yyyy-MM-dd HH:mm',
        restrictions: {
          minDate: 'today',
          maxDate: '+30days',
          disabledDays: [0, 6], // Sunday = 0, Saturday = 6
        }
      }
    },
    // Cross-field validation example
    {
      name: 'projectEndDate',
      type: 'dateTime' as any,
      label: 'Project End Date',
      description: 'Must be after the deadline',
      validation: {
        custom: async (value: any, formData: any) => {
          if (!value || !formData.projectDeadline) return true;
          
          const endDate = new Date(value);
          const deadline = new Date(formData.projectDeadline);
          
          if (endDate <= deadline) {
            return 'Project end date must be after the deadline';
          }
          
          return true;
        },
        dependencies: ['projectDeadline']
      },
      props: {
        format: 'yyyy-MM-dd',
        restrictions: {
          minDate: 'today'
        }
      }
    },
    // Computed field example
    {
      name: 'projectDuration',
      type: 'text',
      label: 'Project Duration (Days)',
      description: 'Automatically calculated based on dates',
      props: {
        disabled: true // Read-only computed field
      },
      computed: {
        formula: (formData: any) => {
          if (!formData.projectDeadline || !formData.projectEndDate) {
            return '';
          }
          
          const start = new Date(formData.projectDeadline);
          const end = new Date(formData.projectEndDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return `${diffDays} days`;
        },
        dependencies: ['projectDeadline', 'projectEndDate']
      }
    },
    // Conditional field example
    {
      name: 'budget',
      type: 'number',
      label: 'Project Budget ($)',
      description: 'Required for projects longer than 30 days',
      validation: {
        required: (formData: any) => {
          const duration = parseInt(formData.projectDuration?.replace(' days', '') || '0');
          return duration > 30;
        }
      },
      conditional: {
        field: 'projectDuration',
        operator: 'isNotEmpty'
      },
      props: {
        min: 1000,
        step: 100
      }
    },
    // Advanced text area with rich features
    {
      name: 'description',
      type: 'textarea',
      label: 'Project Description',
      description: 'Provide a detailed description of the project',
      validation: {
        required: true,
        minLength: 50,
        maxLength: 500
      },
      props: {
        rows: 6,
        placeholder: 'Describe the project goals, scope, and key deliverables...'
      }
    },
    // Priority with conditional styling
    {
      name: 'priority',
      type: 'select',
      label: 'Project Priority',
      validation: {
        required: true
      },
      options: [
        { label: '🔴 High Priority', value: 'high' },
        { label: '🟡 Medium Priority', value: 'medium' },
        { label: '🟢 Low Priority', value: 'low' }
      ]
    },
    // Tags/categories with multiple selection
    {
      name: 'tags',
      type: 'select',
      label: 'Project Tags',
      description: 'Select relevant tags for this project',
      props: {
        multiple: true
      },
      options: [
        { label: 'Frontend', value: 'frontend' },
        { label: 'Backend', value: 'backend' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'API', value: 'api' },
        { label: 'Database', value: 'database' },
        { label: 'DevOps', value: 'devops' },
        { label: 'Testing', value: 'testing' },
        { label: 'Documentation', value: 'docs' }
      ]
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setSubmissionData(data);
  };

  const handleValidation = (fieldName: string, value: any, formData: any) => {
    console.log('Field validation:', { fieldName, value, formData });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Advanced Form Features Demo
        </h1>
        <p className="text-gray-600">
          Showcasing the advanced capabilities of @fivexlabs/conform-react
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Creation Form</h2>
            
            <FormRenderer
              schema={advancedSchema}
              onSubmit={handleSubmit}
              onChange={setFormData}
              onValidation={handleValidation}
              submitText="Create Project"
              className="space-y-6"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          {/* Current Form Data */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📊 Live Form Data
            </h3>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Features Showcase */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ✨ Advanced Features
            </h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• 📁 <strong>File Upload:</strong> Drag & drop, progress tracking</li>
              <li>• 🔍 <strong>Autocomplete:</strong> Async search, templates</li>
              <li>• 📅 <strong>Smart Date/Time:</strong> Business rules, restrictions</li>
              <li>• 🔗 <strong>Cross-field Validation:</strong> Dependent validations</li>
              <li>• 🧮 <strong>Computed Fields:</strong> Auto-calculated values</li>
              <li>• 🎯 <strong>Conditional Logic:</strong> Dynamic field visibility</li>
              <li>• ⚡ <strong>Real-time Updates:</strong> Live form state</li>
            </ul>
          </div>

          {/* Performance Metrics */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              ⚡ Performance
            </h3>
            <div className="text-sm text-purple-800 space-y-1">
              <div>Fields: {advancedSchema.length}</div>
              <div>Renders: Optimized</div>
              <div>Validation: Debounced</div>
              <div>Bundle Size: Minimal</div>
            </div>
          </div>

          {/* Submission Result */}
          {submissionData && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                🎉 Submission Result
              </h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-32">
                {JSON.stringify(submissionData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">
          📈 Before vs After Enhancement
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-3">
              😐 Basic Form Library
            </h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>✗ Basic input fields only</li>
              <li>✗ Simple validation</li>
              <li>✗ No file upload handling</li>
              <li>✗ Basic select dropdowns</li>
              <li>✗ Manual date input</li>
              <li>✗ No conditional logic</li>
              <li>✗ Limited customization</li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🚀 Enhanced @fivexlabs/conform-react
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Advanced file upload with progress</li>
              <li>✓ Smart autocomplete with async search</li>
              <li>✓ Business-aware date/time picker</li>
              <li>✓ Cross-field validation</li>
              <li>✓ Computed fields</li>
              <li>✓ Conditional logic engine</li>
              <li>✓ Real-time form analytics</li>
              <li>✓ Enterprise-ready features</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🎯 Ready for Production
        </h2>
        <p className="text-blue-800 mb-4">
          These advanced features make @fivexlabs/conform-react suitable for:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded p-3">
            <strong>Enterprise Apps</strong><br/>
            Complex business forms with validation
          </div>
          <div className="bg-white rounded p-3">
            <strong>SaaS Platforms</strong><br/>
            User onboarding and configuration
          </div>
          <div className="bg-white rounded p-3">
            <strong>Admin Dashboards</strong><br/>
            Data entry and management forms
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo; 