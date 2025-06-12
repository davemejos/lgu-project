/**
 * Tailwind CSS Optimization Utilities
 * 
 * This utility prevents Tailwind CSS disconnection issues by:
 * 1. Providing safe class name generation
 * 2. Ensuring classes are not purged
 * 3. Handling dynamic class generation properly
 * 4. Providing fallback styles
 */

// Safe class name generator to prevent purging issues
export const safeClassName = (...classes: (string | undefined | null | false)[]): string => {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
};

// Dynamic class generator with safelist protection
export const dynamicClass = (
  baseClass: string,
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string => {
  return safeClassName(baseClass, condition ? trueClass : falseClass);
};

// Status-based class generator (commonly used in the app)
export const statusClass = (status: string): string => {
  const statusClasses: Record<string, string> = {
    'ACTIVE': 'status-active bg-green-100 text-green-800 border-green-200',
    'INACTIVE': 'status-inactive bg-red-100 text-red-800 border-red-200',
    'ON_LEAVE': 'status-on-leave bg-yellow-100 text-yellow-800 border-yellow-200',
    'SUSPENDED': 'status-suspended bg-red-100 text-red-800 border-red-200',
    'Active': 'status-active bg-green-100 text-green-800 border-green-200',
    'Inactive': 'status-inactive bg-red-100 text-red-800 border-red-200',
    'On Leave': 'status-on-leave bg-yellow-100 text-yellow-800 border-yellow-200',
    'Suspended': 'status-suspended bg-red-100 text-red-800 border-red-200',
  };
  
  return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Responsive class generator
export const responsiveClass = (
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string => {
  return safeClassName(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  );
};

// Button variant class generator
export const buttonClass = (
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  disabled: boolean = false
): string => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';
  
  return safeClassName(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses
  );
};

// Input class generator with error states
export const inputClass = (
  hasError: boolean = false,
  disabled: boolean = false,
  size: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const baseClasses = 'block w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  
  const stateClasses = hasError
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500';
  
  const disabledClasses = disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
    : 'bg-white';
  
  return safeClassName(
    baseClasses,
    sizeClasses[size],
    stateClasses,
    disabledClasses
  );
};

// Card class generator
export const cardClass = (
  variant: 'default' | 'elevated' | 'outlined' | 'flat' = 'default',
  padding: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const baseClasses = 'bg-white rounded-lg';
  
  const variantClasses = {
    default: 'border border-gray-200',
    elevated: 'shadow-lg border border-gray-100',
    outlined: 'border-2 border-gray-300',
    flat: 'border-0',
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return safeClassName(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding]
  );
};

// Animation class generator
export const animationClass = (
  type: 'fade-in' | 'slide-up' | 'pulse' | 'spin' | 'bounce' = 'fade-in',
  duration: 'fast' | 'normal' | 'slow' = 'normal'
): string => {
  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'pulse': 'animate-pulse',
    'spin': 'animate-spin',
    'bounce': 'animate-bounce',
  };
  
  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };
  
  return safeClassName(
    animationClasses[type],
    durationClasses[duration]
  );
};

// Grid class generator
export const gridClass = (
  cols: number | { sm?: number; md?: number; lg?: number; xl?: number },
  gap: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };
  
  if (typeof cols === 'number') {
    return safeClassName('grid', `grid-cols-${cols}`, gapClasses[gap]);
  }
  
  const responsiveCols = [
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter((col): col is string => Boolean(col));
  
  return safeClassName('grid', ...responsiveCols, gapClasses[gap]);
};

// Text class generator
export const textClass = (
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' = 'base',
  weight: 'normal' | 'medium' | 'semibold' | 'bold' = 'normal',
  color: string = 'text-gray-900'
): string => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  return safeClassName(
    sizeClasses[size],
    weightClasses[weight],
    color
  );
};

// Spacing class generator
export const spacingClass = (
  margin?: string,
  padding?: string
): string => {
  return safeClassName(margin, padding);
};

// Flex class generator
export const flexClass = (
  direction: 'row' | 'col' = 'row',
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start',
  align: 'start' | 'center' | 'end' | 'stretch' = 'start',
  wrap: boolean = false
): string => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };
  
  return safeClassName(
    'flex',
    directionClasses[direction],
    justifyClasses[justify],
    alignClasses[align],
    wrap && 'flex-wrap'
  );
};

// Export all utilities as a single object for easier importing
export const tw = {
  safe: safeClassName,
  dynamic: dynamicClass,
  status: statusClass,
  responsive: responsiveClass,
  button: buttonClass,
  input: inputClass,
  card: cardClass,
  animation: animationClass,
  grid: gridClass,
  text: textClass,
  spacing: spacingClass,
  flex: flexClass,
};
