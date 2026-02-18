import { usePage } from "@inertiajs/react";

// Currency formatting function
export const formatCurrency = (amount: string | number) => {
  if (typeof window !== 'undefined' && window.appSettings?.formatCurrency) {
    const numericAmount =
      typeof amount === 'number' ? amount : parseFloat(amount);
    return window.appSettings.formatCurrency(numericAmount, { showSymbol: true });
  }
  return amount;
};

// Date formatting function
export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

// String capitalize function
export const capitalize = (str: string) => {
  if (!str) return '';
  
  return str
    .toLowerCase() // Convert everything to lowercase first
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ') // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' '); // Join back with spaces
};


// Get status icon based on status value
export const getStatusIcon = (status: string | boolean | number) => {
  // Handle boolean values
  if (typeof status === 'boolean') {
    return status ? 'Unlock' : 'Lock';
  }
  
  // Handle string values
  if (typeof status === 'string') {
    const lowerStatus = status.toLowerCase();
    if (['active', 'enabled', 'open', 'published', 'approved', 'completed', 'paid'].includes(lowerStatus)) {
      return 'Unlock';
    }
    if (['inactive', 'disabled', 'closed', 'draft', 'pending', 'cancelled', 'unpaid'].includes(lowerStatus)) {
      return 'Lock';
    }
  }
  
  // Handle numeric values (1 = active, 0 = inactive)
  if (typeof status === 'number') {
    return status === 1 ? 'Unlock' : 'Lock';
  }
  
  // Default to Lock for unknown status
  return 'Lock';
};

// Get status label based on current status
export const getStatusLabel = (status: string | boolean | number, t: (key: string) => string) => {
  const icon = getStatusIcon(status);
  return icon === 'Unlock' ? t('Deactivate') : t('Activate');
};

// Get dynamic action config for status toggle
export const getStatusAction = (item: any, t: (key: string) => string, permission: string) => {
  const status = item.status;
  return {
    label: getStatusLabel(status, t),
    icon: getStatusIcon(status),
    action: 'toggle-status',
    className: 'text-green-500',
    requiredPermission: permission
  };
};

export const getIsDemo = () => {
  try {
    const { is_demo } = usePage().props as any;
    console.log('is_demo value:', is_demo);
    return is_demo === true || is_demo === 'true';
  } catch {
    return false;
  }
};