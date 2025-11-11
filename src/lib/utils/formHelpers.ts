import { validatePatentNumber } from '../schemas/intakeFormSchemas';

// Debounce function for auto-save
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format patent number for display
export function formatPatentNumber(number: string): string {
  const cleaned = number.trim().toUpperCase();
  
  // US patents: US1234567A1
  if (cleaned.startsWith('US')) {
    return cleaned.replace(/^(US)(\d+)([A-Z]\d?)$/, '$1 $2 $3');
  }
  
  // EP patents: EP1234567A1
  if (cleaned.startsWith('EP')) {
    return cleaned.replace(/^(EP)(\d+)([A-Z]\d)$/, '$1 $2 $3');
  }
  
  // WO patents: WO2021/123456
  if (cleaned.startsWith('WO')) {
    return cleaned;
  }
  
  return cleaned;
}

// Validate and clean patent number input
export function cleanPatentNumber(input: string): string | null {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
  
  if (validatePatentNumber(cleaned)) {
    return cleaned;
  }
  
  return null;
}

// Mock CPC/IPC code search (replace with real API later)
export const mockCPCCodes = [
  { code: 'H04L29/06', description: 'Transmission of digital information' },
  { code: 'G06F21/60', description: 'Protecting data' },
  { code: 'G06Q20/38', description: 'Payment architectures' },
  { code: 'H04W12/00', description: 'Security arrangements' },
  { code: 'G06N3/08', description: 'Neural networks' },
  { code: 'H01L21/02', description: 'Semiconductor devices' },
  { code: 'A61B5/00', description: 'Medical diagnosis' },
  { code: 'B60W30/00', description: 'Autonomous vehicles' },
  { code: 'G06F16/00', description: 'Information retrieval' },
  { code: 'H04N21/00', description: 'Streaming content' },
];

export function searchCPCCodes(query: string): typeof mockCPCCodes {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockCPCCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

// Character count helper
export function getCharacterCountColor(count: number, max: number): string {
  const percentage = (count / max) * 100;
  if (percentage >= 100) return 'text-destructive';
  if (percentage >= 90) return 'text-warning';
  return 'text-muted-foreground';
}
