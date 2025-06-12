/**
 * Tailwind CSS Health Check Utility
 * 
 * This utility helps diagnose and prevent Tailwind CSS disconnection issues
 * by checking if styles are properly loaded and applied.
 */

export interface TailwindHealthStatus {
  isLoaded: boolean;
  isWorking: boolean;
  missingClasses: string[];
  issues: string[];
  recommendations: string[];
}

// Test classes that should always be available
const CRITICAL_CLASSES = [
  'flex',
  'grid',
  'hidden',
  'block',
  'text-center',
  'bg-white',
  'text-gray-900',
  'border',
  'rounded',
  'p-4',
  'm-4',
  'w-full',
  'h-full',
];

// Dynamic classes that are commonly used in the app
const DYNAMIC_CLASSES = [
  'justify-start',
  'justify-end',
  'flex-row',
  'flex-row-reverse',
  'bg-blue-500',
  'text-blue-100',
  'w-12',
  'w-14',
  'h-12',
  'h-14',
];

/**
 * Check if Tailwind CSS is properly loaded and working
 */
export const checkTailwindHealth = (): TailwindHealthStatus => {
  const status: TailwindHealthStatus = {
    isLoaded: false,
    isWorking: false,
    missingClasses: [],
    issues: [],
    recommendations: [],
  };

  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      status.issues.push('Running in server environment - cannot check DOM');
      return status;
    }

    // Check if Tailwind CSS is loaded by looking for its styles
    const stylesheets = Array.from(document.styleSheets);
    const hasTailwindStyles = stylesheets.some(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        return rules.some(rule => 
          rule.cssText && (
            rule.cssText.includes('--tw-') ||
            rule.cssText.includes('tailwind') ||
            rule.cssText.includes('.flex') ||
            rule.cssText.includes('.grid')
          )
        );
      } catch {
        // Cross-origin stylesheets might throw errors
        return false;
      }
    });

    status.isLoaded = hasTailwindStyles;

    if (!status.isLoaded) {
      status.issues.push('Tailwind CSS styles not detected in DOM');
      status.recommendations.push('Check if globals.css is properly imported');
      status.recommendations.push('Verify PostCSS configuration');
      status.recommendations.push('Ensure Tailwind directives are present');
    }

    // Test critical classes by creating temporary elements
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.top = '-9999px';
    document.body.appendChild(testElement);

    const missingClasses: string[] = [];
    
    for (const className of CRITICAL_CLASSES) {
      testElement.className = className;
      const computedStyle = window.getComputedStyle(testElement);
      
      // Check if the class has any effect
      let hasEffect = false;
      
      switch (className) {
        case 'flex':
          hasEffect = computedStyle.display === 'flex';
          break;
        case 'grid':
          hasEffect = computedStyle.display === 'grid';
          break;
        case 'hidden':
          hasEffect = computedStyle.display === 'none';
          break;
        case 'block':
          hasEffect = computedStyle.display === 'block';
          break;
        case 'text-center':
          hasEffect = computedStyle.textAlign === 'center';
          break;
        case 'bg-white':
          hasEffect = computedStyle.backgroundColor === 'rgb(255, 255, 255)' || 
                     computedStyle.backgroundColor === 'white';
          break;
        case 'border':
          hasEffect = computedStyle.borderWidth !== '0px' && 
                     computedStyle.borderWidth !== '';
          break;
        case 'rounded':
          hasEffect = computedStyle.borderRadius !== '0px' && 
                     computedStyle.borderRadius !== '';
          break;
        default:
          // For other classes, just check if any style property changed
          hasEffect = Object.values(computedStyle).some(value => 
            value && value !== 'initial' && value !== 'normal'
          );
      }
      
      if (!hasEffect) {
        missingClasses.push(className);
      }
    }

    document.body.removeChild(testElement);
    
    status.missingClasses = missingClasses;
    status.isWorking = missingClasses.length === 0;

    if (!status.isWorking) {
      status.issues.push(`${missingClasses.length} critical classes not working: ${missingClasses.join(', ')}`);
      status.recommendations.push('Clear Next.js cache (.next folder)');
      status.recommendations.push('Restart development server');
      status.recommendations.push('Check Tailwind config content paths');
    }

    // Additional checks
    if (status.isLoaded && status.isWorking) {
      // Check for common dynamic class issues
      const dynamicIssues = checkDynamicClasses();
      if (dynamicIssues.length > 0) {
        status.issues.push(...dynamicIssues);
        status.recommendations.push('Add dynamic classes to safelist in tailwind.config.js');
        status.recommendations.push('Use the tailwind-optimizer utility for dynamic classes');
      }
    }

  } catch (error) {
    status.issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return status;
};

/**
 * Check for common dynamic class issues
 */
const checkDynamicClasses = (): string[] => {
  const issues: string[] = [];
  
  // Check if commonly used dynamic classes are available
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);

  const problematicClasses: string[] = [];
  
  for (const className of DYNAMIC_CLASSES) {
    testElement.className = className;
    const computedStyle = window.getComputedStyle(testElement);
    
    // Simple check - if no styles are applied, the class might be purged
    const hasAnyStyle = Array.from(computedStyle).some(prop => {
      const value = computedStyle.getPropertyValue(prop);
      return value && value !== 'initial' && value !== 'normal' && value !== '';
    });
    
    if (!hasAnyStyle) {
      problematicClasses.push(className);
    }
  }

  document.body.removeChild(testElement);
  
  if (problematicClasses.length > 0) {
    issues.push(`Dynamic classes may be purged: ${problematicClasses.join(', ')}`);
  }
  
  return issues;
};

/**
 * Auto-fix common Tailwind issues
 */
export const autoFixTailwindIssues = (): string[] => {
  const fixes: string[] = [];
  
  try {
    // Add tailwind-loaded class to body to prevent FOUC
    if (document.body && !document.body.classList.contains('tailwind-loaded')) {
      document.body.classList.add('tailwind-loaded');
      document.body.classList.remove('tailwind-loading');
      fixes.push('Added tailwind-loaded class to prevent FOUC');
    }
    
    // Force refresh of CSS if needed
    const stylesheets = Array.from(document.styleSheets);
    const tailwindSheet = stylesheets.find(sheet => {
      try {
        return sheet.href && sheet.href.includes('globals.css');
      } catch {
        return false;
      }
    });
    
    if (tailwindSheet && tailwindSheet.disabled) {
      tailwindSheet.disabled = false;
      fixes.push('Re-enabled Tailwind CSS stylesheet');
    }
    
  } catch {
    // Silently fail - this is a best-effort fix
  }
  
  return fixes;
};

/**
 * Monitor Tailwind health continuously
 */
export const monitorTailwindHealth = (
  onIssueDetected?: (status: TailwindHealthStatus) => void,
  intervalMs: number = 30000 // Check every 30 seconds
): () => void => {
  const check = () => {
    const status = checkTailwindHealth();
    if (!status.isWorking && onIssueDetected) {
      onIssueDetected(status);
    }
  };

  // Initial check
  setTimeout(check, 1000);

  // Periodic checks
  const intervalId = setInterval(check, intervalMs);
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

/**
 * Get diagnostic information for debugging
 */
export const getTailwindDiagnostics = () => {
  const diagnostics = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    stylesheetCount: typeof document !== 'undefined' ? document.styleSheets.length : 0,
    bodyClasses: typeof document !== 'undefined' ? Array.from(document.body.classList) : [],
    htmlClasses: typeof document !== 'undefined' ? Array.from(document.documentElement.classList) : [],
    viewport: typeof window !== 'undefined' ? {
      width: window.innerWidth,
      height: window.innerHeight,
    } : null,
    timestamp: new Date().toISOString(),
  };
  
  return diagnostics;
};

// Export a simple health check function for quick debugging
export const quickHealthCheck = (): boolean => {
  const status = checkTailwindHealth();
  
  if (!status.isWorking) {
    console.warn('🚨 Tailwind CSS Health Check Failed:', status);
    console.log('🔧 Recommendations:', status.recommendations);
    
    // Try auto-fix
    const fixes = autoFixTailwindIssues();
    if (fixes.length > 0) {
      console.log('🛠️ Auto-fixes applied:', fixes);
    }
  }
  
  return status.isWorking;
};
