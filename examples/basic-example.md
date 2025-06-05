# Basic Usage Examples

## Simple Contact Form

```tsx
import React from 'react';
import { FormRenderer, FormSchema } from '@fivexlabs/conform-react';

const contactFormSchema: FormSchema = {
  title: "Contact Us",
  description: "We'd love to hear from you!",
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      validation: { 
        required: true, 
        minLength: 2 
      },
      placeholder: "Enter your full name"
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      validation: { 
        required: true, 
        email: true 
      },
      placeholder: "your.email@example.com"
    },
    {
      name: "subject",
      label: "Subject",
      type: "select",
      options: [
        { label: "General Inquiry", value: "general" },
        { label: "Technical Support", value: "support" },
        { label: "Partnership", value: "partnership" },
        { label: "Other", value: "other" }
      ],
      validation: { required: true }
    },
    {
      name: "customSubject",
      label: "Please specify",
      type: "text",
      visibleWhen: { subject: "other" },
      validation: { required: true },
      placeholder: "Please describe your inquiry"
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      validation: { 
        required: true, 
        minLength: 10,
        maxLength: 1000 
      },
      placeholder: "Tell us more about your inquiry...",
      rows: 5
    },
    {
      name: "newsletter",
      label: "Subscribe to our newsletter",
      type: "checkbox",
      defaultValue: false
    }
  ],
  submitButtonText: "Send Message",
  showResetButton: true
};

export const ContactForm = () => {
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <FormRenderer
        schema={contactFormSchema}
        onSubmit={handleSubmit}
        onFormChange={(data) => {
          console.log('Form data changed:', data);
        }}
      />
    </div>
  );
};
```

## User Registration with Conditional Logic

```tsx
import React from 'react';
import { FormRenderer, FormSchema } from '@fivexlabs/conform-react';

const registrationSchema: FormSchema = {
  title: "Create Your Account",
  fields: [
    {
      type: "group",
      title: "Personal Information",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          validation: { required: true, minLength: 2 }
        },
        {
          name: "lastName",
          label: "Last Name",
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
          name: "phone",
          label: "Phone Number",
          type: "tel",
          validation: { 
            pattern: "^\\+?[1-9]\\d{1,14}$" 
          },
          validationMessages: {
            pattern: "Please enter a valid phone number"
          }
        }
      ]
    },
    {
      type: "group",
      title: "Account Details",
      fields: [
        {
          name: "username",
          label: "Username",
          type: "text",
          validation: { 
            required: true, 
            minLength: 3,
            pattern: "^[a-zA-Z0-9_]+$"
          },
          validationMessages: {
            pattern: "Username can only contain letters, numbers, and underscores"
          }
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          validation: { 
            required: true, 
            minLength: 8,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
          },
          validationMessages: {
            pattern: "Password must contain at least one lowercase letter, one uppercase letter, and one number"
          }
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          validation: { 
            required: true,
            custom: (value, formData) => {
              return value === formData.password || "Passwords do not match";
            }
          }
        }
      ]
    },
    {
      type: "group",
      title: "Preferences",
      fields: [
        {
          name: "accountType",
          label: "Account Type",
          type: "radio",
          options: [
            { label: "Personal", value: "personal" },
            { label: "Business", value: "business" },
            { label: "Developer", value: "developer" }
          ],
          validation: { required: true },
          defaultValue: "personal"
        },
        {
          name: "companyName",
          label: "Company Name",
          type: "text",
          visibleWhen: { accountType: "business" },
          validation: { required: true }
        },
        {
          name: "githubUsername",
          label: "GitHub Username",
          type: "text",
          visibleWhen: { accountType: "developer" },
          placeholder: "your-github-username"
        },
        {
          name: "interests",
          label: "Areas of Interest",
          type: "select",
          multiple: true,
          options: [
            { label: "Web Development", value: "web" },
            { label: "Mobile Development", value: "mobile" },
            { label: "Data Science", value: "data" },
            { label: "Machine Learning", value: "ml" },
            { label: "DevOps", value: "devops" },
            { label: "Design", value: "design" }
          ]
        }
      ]
    },
    {
      name: "agreeToTerms",
      label: "I agree to the Terms of Service and Privacy Policy",
      type: "checkbox",
      validation: { required: true },
      validationMessages: {
        required: "You must agree to the terms to create an account"
      }
    },
    {
      name: "marketingEmails",
      label: "Send me marketing emails and product updates",
      type: "checkbox",
      defaultValue: true
    }
  ],
  submitButtonText: "Create Account"
};

export const RegistrationForm = () => {
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Registration data:', data);
    
    // Remove confirmPassword from submission data
    const { confirmPassword, ...submitData } = data;
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        // Redirect to welcome page or login
      } else {
        const error = await response.json();
        console.error('Registration failed:', error);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormRenderer
        schema={registrationSchema}
        onSubmit={handleSubmit}
        className="space-y-8"
      />
    </div>
  );
};
```

## Survey Form with Array Fields

```tsx
import React from 'react';
import { FormRenderer, FormSchema } from '@fivexlabs/conform-react';

const surveySchema: FormSchema = {
  title: "Customer Feedback Survey",
  description: "Help us improve our services",
  fields: [
    {
      name: "rating",
      label: "Overall Satisfaction",
      type: "radio",
      options: [
        { label: "😢 Very Dissatisfied", value: 1 },
        { label: "😕 Dissatisfied", value: 2 },
        { label: "😐 Neutral", value: 3 },
        { label: "😊 Satisfied", value: 4 },
        { label: "😍 Very Satisfied", value: 5 }
      ],
      validation: { required: true }
    },
    {
      name: "improvements",
      label: "What could we improve?",
      type: "textarea",
      visibleWhen: { 
        rating: { $lte: 3 } 
      },
      validation: { required: true },
      placeholder: "Please tell us what we can do better..."
    },
    {
      name: "features",
      label: "Which features do you use most?",
      type: "select",
      multiple: true,
      options: [
        { label: "Dashboard", value: "dashboard" },
        { label: "Reports", value: "reports" },
        { label: "Analytics", value: "analytics" },
        { label: "API", value: "api" },
        { label: "Mobile App", value: "mobile" }
      ]
    },
    {
      name: "recommendations",
      label: "Product Recommendations",
      type: "array",
      description: "Tell us about products or services you'd like to see",
      minItems: 0,
      maxItems: 5,
      addButtonText: "Add Recommendation",
      itemSchema: {
        fields: [
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "Software", value: "software" },
              { label: "Hardware", value: "hardware" },
              { label: "Service", value: "service" },
              { label: "Training", value: "training" }
            ],
            validation: { required: true }
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            validation: { required: true, maxLength: 200 },
            placeholder: "Describe the product or service..."
          },
          {
            name: "priority",
            label: "Priority",
            type: "radio",
            options: [
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" }
            ],
            defaultValue: "medium"
          }
        ]
      }
    },
    {
      name: "referral",
      label: "Would you recommend us to others?",
      type: "radio",
      options: [
        { label: "Definitely not", value: "no" },
        { label: "Probably not", value: "probably-no" },
        { label: "Maybe", value: "maybe" },
        { label: "Probably yes", value: "probably-yes" },
        { label: "Definitely yes", value: "yes" }
      ],
      validation: { required: true }
    },
    {
      name: "followUp",
      label: "Can we follow up with you about this feedback?",
      type: "checkbox",
      defaultValue: false
    },
    {
      name: "contactInfo",
      label: "Contact Information",
      type: "object",
      visibleWhen: { followUp: true },
      fields: [
        {
          name: "email",
          label: "Email",
          type: "email",
          validation: { required: true, email: true }
        },
        {
          name: "phone",
          label: "Phone (optional)",
          type: "tel"
        },
        {
          name: "preferredContact",
          label: "Preferred Contact Method",
          type: "radio",
          options: [
            { label: "Email", value: "email" },
            { label: "Phone", value: "phone" }
          ],
          defaultValue: "email"
        }
      ]
    }
  ],
  submitButtonText: "Submit Feedback"
};

export const SurveyForm = () => {
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Survey data:', data);
    
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert('Thank you for your feedback!');
      }
    } catch (error) {
      console.error('Survey submission error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <FormRenderer
        schema={surveySchema}
        onSubmit={handleSubmit}
      />
    </div>
  );
}; 