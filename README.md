# @fivexlabs/conform-react

<div align="center">
  <img src="https://fivexlabs.com/assets/icon/logos/icon-logo-square.jpeg" alt="Fivex Labs" width="80" height="80" />
  
  <h3>React JSON Form Renderer</h3>
  <p>Build dynamic, conditional forms using JSON schemas with React Hook Form integration</p>
  
  <p>Made with ❤️ by <a href="https://fivexlabs.com">Fivex Labs</a></p>

  [![npm version](https://badge.fury.io/js/@fivexlabs%2Fconform-react.svg)](https://www.npmjs.com/package/@fivexlabs/conform-react)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

## ✨ Features

### 🎯 **Core Features**
- **📋 Declarative Schema Definition**: Define entire forms using JSON schemas
- **🔄 Dynamic Conditional Logic**: Show/hide fields based on other field values
- **✅ Comprehensive Validation**: Built-in and custom validation with internationalization support
- **🎨 Customizable Components**: Provide your own React components for any field type
- **♿ Accessibility First**: WCAG compliant forms with proper ARIA attributes
- **🚀 Performance Optimized**: Built on React Hook Form for optimal performance
- **📦 TypeScript Ready**: Full TypeScript support with comprehensive type definitions

### 🔥 **Advanced Features** (New!)
- **📁 Smart File Upload**: Drag & drop interface with progress tracking, image preview, and validation
- **🔍 Async Autocomplete**: Search-as-you-type with debouncing, templates, and API integration
- **📅 Business Date/Time Picker**: Business rules, timezone support, and restriction handling
- **🔗 Cross-field Validation**: Dependencies between fields with real-time validation
- **🧮 Computed Fields**: Auto-calculated values based on other field data
- **⚡ Real-time Updates**: Live form state management and analytics

## 📦 Installation

```bash
npm install @fivexlabs/conform-react react-hook-form yup date-fns
# or
yarn add @fivexlabs/conform-react react-hook-form yup date-fns
```

> **Note**: `date-fns` is required for the advanced date/time picker functionality.

## 🚀 Quick Start

```tsx
import React from 'react';
import { FormRenderer, FormSchema } from '@fivexlabs/conform-react';

const schema: FormSchema = {
  title: "User Registration",
  fields: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      validation: { required: true, minLength: 2 }
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      validation: { required: true, email: true }
    },
    {
      name: "subscribe",
      label: "Subscribe to newsletter?",
      type: "checkbox",
      defaultValue: false
    },
    {
      name: "reason",
      label: "Why do you want to subscribe?",
      type: "textarea",
      visibleWhen: { subscribe: true },
      validation: { required: true, maxLength: 200 }
    }
  ]
};

function App() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
  };

  return (
    <FormRenderer
      schema={schema}
      onSubmit={handleSubmit}
      onFormChange={(data) => console.log('Form changed:', data)}
    />
  );
}
```

## 🔥 Advanced Features Showcase

### 📁 Smart File Upload

Create powerful file upload experiences with drag & drop, progress tracking, and validation:

```typescript
{
  name: "documents",
  type: "fileUpload",
  label: "Project Documents",
  props: {
    multiple: true,
    accept: ['.pdf', '.docx', '.jpg', '.png'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    preview: true,
    upload: {
      endpoint: '/api/upload',
      method: 'POST',
      headers: { 'Authorization': 'Bearer token123' }
    }
  },
  onUploadProgress: (progress, file) => console.log(`${file.name}: ${progress}%`),
  onUploadComplete: (response, file) => console.log('Upload completed:', response)
}
```

### 🔍 Async Autocomplete

Build smart search interfaces with real-time suggestions:

```typescript
{
  name: "assignee",
  type: "autocomplete",
  label: "Project Assignee",
  props: {
    searchEndpoint: '/api/users/search',
    displayKey: 'name',
    valueKey: 'id',
    debounce: 300,
    minChars: 2,
    template: '{{name}} - {{department}} ({{email}})',
    multiple: false
  }
}
```

### 📅 Business Date/Time Picker

Handle complex business rules with smart date/time selection:

```typescript
{
  name: "deadline",
  type: "dateTime",
  label: "Project Deadline",
  props: {
    includeTime: true,
    format: 'yyyy-MM-dd HH:mm',
    restrictions: {
      minDate: 'today',
      businessDaysOnly: true,
      disabledDays: ['saturday', 'sunday'],
      disabledDates: ['2024-12-25', '2024-01-01']
    }
  }
}
```

### 🔗 Cross-field Validation

Create intelligent forms with field dependencies:

```typescript
{
  name: "endDate",
  type: "dateTime",
  label: "Project End Date",
  validation: {
    custom: async (value, formData) => {
      if (value <= formData.startDate) {
        return 'End date must be after start date';
      }
      return true;
    },
    dependencies: ['startDate'] // Re-validate when startDate changes
  }
}
```

### 🧮 Computed Fields

Auto-calculate values based on other field data:

```typescript
{
  name: "totalCost",
  type: "text",
  label: "Total Cost",
  props: { disabled: true }, // Read-only
  computed: {
    formula: (formData) => {
      const hours = formData.estimatedHours || 0;
      const rate = formData.hourlyRate || 0;
      return `$${(hours * rate).toFixed(2)}`;
    },
    dependencies: ['estimatedHours', 'hourlyRate']
  }
}
```

## 📚 Documentation

### Basic Form Schema

A form schema defines the structure, validation, and behavior of your form:

```typescript
interface FormSchema {
  title?: string;
  description?: string;
  fields: (FormField | FieldGroup)[];
  layout?: LayoutConfig;
  submitButtonText?: string;
  resetButtonText?: string;
  showResetButton?: boolean;
}
```

### Field Types

#### Text Input Fields
```typescript
{
  name: "username",
  label: "Username",
  type: "text", // "text" | "email" | "password" | "url" | "tel"
  placeholder: "Enter your username",
  validation: {
    required: true,
    minLength: 3,
    pattern: "^[a-zA-Z0-9_]+$"
  },
  validationMessages: {
    pattern: "Username can only contain letters, numbers, and underscores"
  }
}
```

#### Select Fields
```typescript
{
  name: "country",
  label: "Country",
  type: "select",
  options: [
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "United Kingdom", value: "uk" }
  ],
  validation: { required: true }
}
```

#### Array Fields (Repeatable Sections)
```typescript
{
  name: "addresses",
  label: "Addresses",
  type: "array",
  minItems: 1,
  maxItems: 3,
  itemSchema: {
    fields: [
      {
        name: "street",
        label: "Street Address",
        type: "text",
        validation: { required: true }
      },
      {
        name: "city",
        label: "City",
        type: "text",
        validation: { required: true }
      }
    ]
  }
}
```

### Conditional Logic

#### Simple Conditional Syntax
```typescript
{
  name: "otherReason",
  label: "Please specify",
  type: "text",
  visibleWhen: { reason: "other" }, // Show when reason equals "other"
  disabledWhen: { status: "readonly" } // Disable when status equals "readonly"
}
```

#### Advanced Conditional Logic
```typescript
{
  name: "discount",
  label: "Discount Code",
  type: "text",
  conditional: {
    and: [
      { field: "membershipType", operator: "equals", value: "premium" },
      { field: "orderAmount", operator: "greaterThan", value: 100 }
    ]
  }
}
```

#### Complex Conditions with MongoDB-style Operators
```typescript
{
  name: "specialOffer",
  label: "Special Offer",
  type: "checkbox",
  visibleWhen: {
    age: { $gte: 18 },
    country: { $in: ["us", "ca", "uk"] },
    email: { $contains: "@company.com" }
  }
}
```

### Validation

#### Built-in Validation Rules
```typescript
{
  validation: {
    required: true,
    minLength: 5,
    maxLength: 50,
    min: 0,
    max: 100,
    pattern: "^[A-Z][a-z]+$",
    email: true // For email fields
  }
}
```

#### Custom Validation
```typescript
{
  validation: {
    custom: async (value) => {
      // Async validation example
      const isUnique = await checkUsernameUniqueness(value);
      return isUnique || "Username is already taken";
    }
  }
}
```

### Field Groups
```typescript
{
  type: "group",
  title: "Personal Information",
  description: "Please provide your personal details",
  collapsible: true,
  fields: [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      validation: { required: true }
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      validation: { required: true }
    }
  ]
}
```

### Custom Components

You can provide your own React components for any field type:

```tsx
import { TextField } from '@mui/material';

const customComponents = {
  text: ({ field, value, onChange, error, ...props }) => (
    <TextField
      label={field.label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
      fullWidth
      {...props}
    />
  ),
  select: CustomSelectComponent,
  // ... other custom components
};

<FormRenderer
  schema={schema}
  customComponents={customComponents}
  onSubmit={handleSubmit}
/>
```

### Advanced Usage

#### Custom Rendering
```tsx
<FormRenderer
  schema={schema}
  onSubmit={handleSubmit}
  renderSubmitButton={(props) => (
    <CustomButton loading={props.loading} onClick={props.onClick}>
      {props.text}
    </CustomButton>
  )}
  renderErrorSummary={(errors) => (
    <CustomErrorDisplay errors={errors} />
  )}
  renderFieldWrapper={({ field, children, error }) => (
    <div className="custom-field-wrapper">
      {children}
      {error && <span className="error-icon">⚠️</span>}
    </div>
  )}
/>
```

#### Form State Management
```tsx
const FormWithState = () => {
  const [formData, setFormData] = useState({});
  
  return (
    <FormRenderer
      schema={schema}
      initialValues={{ username: 'defaultUser' }}
      onSubmit={handleSubmit}
      onFormChange={setFormData}
      onFieldChange={(fieldName, value, allValues) => {
        console.log(`Field ${fieldName} changed to:`, value);
      }}
    />
  );
};
```

## 🎨 Styling

The library provides unstyled components by default with semantic CSS classes for easy styling:

```css
.conform-form {
  /* Main form container */
}

.form-field {
  /* Individual field wrapper */
}

.form-group {
  /* Field group container */
}

.form-error {
  /* Error message styling */
}
```

For Tailwind CSS users, the default components include Tailwind classes that you can customize.

## 🧪 Testing

```bash
npm test
```

## 📖 API Reference

### FormRenderer Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `schema` | `FormSchema` | ✅ | The JSON schema defining the form structure |
| `onSubmit` | `(data: Record<string, any>) => void \| Promise<void>` | ✅ | Called when form is submitted |
| `initialValues` | `Record<string, any>` | ❌ | Initial form values |
| `onFormChange` | `(data: Record<string, any>) => void` | ❌ | Called when any field changes |
| `onFieldChange` | `(fieldName: string, value: any, allValues: Record<string, any>) => void` | ❌ | Called when a specific field changes |
| `customComponents` | `Record<string, React.ComponentType<any>>` | ❌ | Custom components for field types |
| `loading` | `boolean` | ❌ | Shows loading state |
| `disabled` | `boolean` | ❌ | Disables entire form |

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of all changes and new features.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Fivex Labs

[Fivex Labs](https://fivexlabs.com) is a technology company focused on building innovative tools and libraries for modern web development. We believe in creating solutions that are both powerful and developer-friendly.

Visit us at [fivexlabs.com](https://fivexlabs.com) to learn more about our work and other open-source projects.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://fivexlabs.com">Fivex Labs</a></p>
  <p>© 2025 Fivex Labs. All rights reserved.</p>
</div> 