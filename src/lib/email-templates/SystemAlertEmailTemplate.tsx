/**
 * System Alert Email Template
 * 
 * Professional system alert email template for critical notifications
 * Uses React components for rich HTML email content with alert styling
 */

import * as React from 'react'

interface SystemAlertEmailTemplateProps {
  recipientName: string
  alertType: 'info' | 'warning' | 'error' | 'success'
  subject: string
  message: string
  details?: string
  timestamp: Date
}

const getAlertStyles = (alertType: string) => {
  switch (alertType) {
    case 'error':
      return {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        iconColor: '#dc2626',
        textColor: '#991b1b',
        icon: '🚨'
      }
    case 'warning':
      return {
        backgroundColor: '#fefbeb',
        borderColor: '#f59e0b',
        iconColor: '#d97706',
        textColor: '#92400e',
        icon: '⚠️'
      }
    case 'success':
      return {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
        iconColor: '#16a34a',
        textColor: '#166534',
        icon: '✅'
      }
    default: // info
      return {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        iconColor: '#2563eb',
        textColor: '#1e40af',
        icon: 'ℹ️'
      }
  }
}

export const SystemAlertEmailTemplate: React.FC<Readonly<SystemAlertEmailTemplateProps>> = ({
  recipientName,
  alertType,
  subject,
  message,
  details,
  timestamp,
}) => {
  const alertStyles = getAlertStyles(alertType)
  
  return (
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
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h1 style={{
          color: '#1f2937',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0',
          marginBottom: '8px'
        }}>
          System Alert - LGU Project
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0'
        }}>
          Alert Type: {alertType.toUpperCase()}
        </p>
      </div>

      {/* Alert Box */}
      <div style={{
        backgroundColor: alertStyles.backgroundColor,
        border: `2px solid ${alertStyles.borderColor}`,
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <span style={{
            fontSize: '24px',
            marginRight: '12px',
            lineHeight: '1'
          }}>
            {alertStyles.icon}
          </span>
          <div style={{ flex: '1' }}>
            <h2 style={{
              color: alertStyles.textColor,
              fontSize: '18px',
              fontWeight: '600',
              margin: '0',
              marginBottom: '8px'
            }}>
              {subject}
            </h2>
            <p style={{
              color: alertStyles.textColor,
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              Alert Level: {alertType.charAt(0).toUpperCase() + alertType.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Hello {recipientName},
        </h3>
        
        <p style={{
          color: '#374151',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '20px'
        }}>
          A system alert has been triggered and requires your attention:
        </p>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#1f2937',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0',
            marginBottom: '12px'
          }}>
            Alert Details:
          </h4>
          <p style={{
            color: '#374151',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0',
            whiteSpace: 'pre-wrap'
          }}>
            {message}
          </p>
        </div>

        {/* Additional Details (if provided) */}
        {details && (
          <div style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              color: '#1f2937',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0',
              marginBottom: '8px'
            }}>
              Additional Information:
            </h4>
            <p style={{
              color: '#374151',
              fontSize: '13px',
              lineHeight: '1.5',
              margin: '0',
              whiteSpace: 'pre-wrap'
            }}>
              {details}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '12px',
            margin: '0'
          }}>
            <strong>Alert Timestamp:</strong> {timestamp.toLocaleString()}
          </p>
        </div>

        {/* Action Required */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{
            color: '#92400e',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0',
            marginBottom: '8px'
          }}>
            📋 Action Required
          </h4>
          <p style={{
            color: '#92400e',
            fontSize: '13px',
            lineHeight: '1.5',
            margin: '0'
          }}>
            Please review this alert and take appropriate action if necessary. 
            Log into your admin dashboard to view more details and manage system settings.
          </p>
        </div>

        {/* Dashboard Link */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a
            href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Access Admin Dashboard
          </a>
        </div>
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
          This system alert was automatically generated by LGU Project
        </p>
        <p style={{ margin: '0', marginBottom: '8px' }}>
          Alert ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
        <p style={{ margin: '0' }}>
          © 2024 LGU Project. All rights reserved.
        </p>
      </div>
    </div>
  )
}
