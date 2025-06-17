/**
 * Welcome Email Template
 * 
 * Professional welcome email template for new users
 * Uses React components for rich HTML email content
 */

import * as React from 'react'

interface WelcomeEmailTemplateProps {
  recipientName: string
  loginUrl: string
}

export const WelcomeEmailTemplate: React.FC<Readonly<WelcomeEmailTemplateProps>> = ({
  recipientName,
  loginUrl,
}) => (
  <div style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff'
  }}>
    {/* Header */}
    <div style={{
      textAlign: 'center',
      marginBottom: '40px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e5e7eb'
    }}>
      <h1 style={{
        color: '#1f2937',
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0',
        marginBottom: '8px'
      }}>
        Welcome to LGU Project
      </h1>
      <p style={{
        color: '#6b7280',
        fontSize: '16px',
        margin: '0'
      }}>
        Your account has been successfully created
      </p>
    </div>

    {/* Main Content */}
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{
        color: '#1f2937',
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '16px'
      }}>
        Hello {recipientName}!
      </h2>
      
      <p style={{
        color: '#374151',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        We&apos;re excited to have you join our Local Government Unit management system.
        Your account has been successfully created and you can now access all the features 
        of our professional admin dashboard.
      </p>

      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          marginTop: '0'
        }}>
          What you can do:
        </h3>
        <ul style={{
          color: '#374151',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0',
          paddingLeft: '20px'
        }}>
          <li style={{ marginBottom: '8px' }}>Manage personnel records and information</li>
          <li style={{ marginBottom: '8px' }}>Access comprehensive dashboard analytics</li>
          <li style={{ marginBottom: '8px' }}>Configure system settings and preferences</li>
          <li style={{ marginBottom: '8px' }}>Generate reports and export data</li>
          <li style={{ marginBottom: '8px' }}>Use our AI-powered chatbot assistant</li>
        </ul>
      </div>

      {/* Call to Action Button */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <a
          href={loginUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '12px 32px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Access Your Dashboard
        </a>
      </div>

      <p style={{
        color: '#6b7280',
        fontSize: '14px',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        If you have any questions or need assistance, please don&apos;t hesitate to contact our support team.
        We&apos;re here to help you make the most of your LGU Project experience.
      </p>
    </div>

    {/* Security Notice */}
    <div style={{
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '6px',
      padding: '16px',
      marginBottom: '32px'
    }}>
      <h4 style={{
        color: '#92400e',
        fontSize: '14px',
        fontWeight: '600',
        margin: '0',
        marginBottom: '8px'
      }}>
        🔒 Security Notice
      </h4>
      <p style={{
        color: '#92400e',
        fontSize: '13px',
        lineHeight: '1.5',
        margin: '0'
      }}>
        For your security, please keep your login credentials confidential and log out when using shared computers.
      </p>
    </div>

    {/* Footer */}
    <div style={{
      textAlign: 'center',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb',
      color: '#6b7280',
      fontSize: '12px'
    }}>
      <p style={{ margin: '0', marginBottom: '8px' }}>
        This email was sent by LGU Project Admin System
      </p>
      <p style={{ margin: '0' }}>
        © 2024 LGU Project. All rights reserved.
      </p>
    </div>
  </div>
)
