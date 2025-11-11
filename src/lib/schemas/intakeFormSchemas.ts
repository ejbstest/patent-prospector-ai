import { z } from 'zod';

// Step 1: User Type Selection
export const userTypeSchema = z.object({
  userType: z.enum(['novice', 'intermediate', 'expert'], {
    required_error: 'Please select an option',
  }),
});

// Novice Flow Schemas
export const noviceStep2Schema = z.object({
  productDescription: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(500, 'Maximum 500 characters'),
});

export const noviceStep3Schema = z.object({
  uniqueness: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(300, 'Maximum 300 characters'),
});

export const noviceStep4Schema = z.object({
  competitors: z.array(z.string()).optional(),
});

export const noviceStep5Schema = z.object({
  regions: z.array(z.string()).min(1, 'Please select at least one region'),
});

export const noviceStep6Schema = z.object({
  uploadedFiles: z.array(z.any()).optional(),
});

// Intermediate Flow Schemas
export const intermediateStep2Schema = z.object({
  technicalDescription: z
    .string()
    .min(20, 'Please provide at least 20 characters')
    .max(1000, 'Maximum 1000 characters'),
});

export const intermediateStep3Schema = z.object({
  innovations: z
    .array(z.string().min(1))
    .min(3, 'Please provide at least 3 innovations'),
});

export const intermediateStep4Schema = z.object({
  cpcCodes: z.array(z.string()).optional(),
});

export const intermediateStep5Schema = z.object({
  priorArtPatents: z.array(z.string()).optional(),
});

export const intermediateStep6Schema = z.object({
  jurisdictions: z.array(z.string()).min(1, 'Please select at least one jurisdiction'),
});

export const intermediateStep7Schema = z.object({
  uploadedFiles: z.array(z.any()).optional(),
});

// Expert Flow Schemas
export const expertStep2Schema = z.object({
  disclosure: z
    .string()
    .min(50, 'Please provide at least 50 characters')
    .max(2000, 'Maximum 2000 characters'),
});

export const expertStep3Schema = z.object({
  claims: z
    .array(z.string().min(1))
    .min(1, 'Please provide at least one claim'),
});

export const expertStep4Schema = z.object({
  ipcCpcCodes: z
    .array(z.string())
    .min(1, 'Please provide at least one classification'),
});

export const expertStep5Schema = z.object({
  assignees: z.array(z.string()).optional(),
});

export const expertStep6Schema = z.object({
  priorArtReferences: z.array(
    z.object({
      patentNumber: z.string().min(1, 'Patent number required'),
      publicationDate: z.string().optional(),
      relevanceNotes: z.string().optional(),
    })
  ).optional(),
});

export const expertStep7Schema = z.object({
  analysisParameters: z.object({
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
    citationDepth: z.number().min(1).max(10).optional(),
    jurisdictionWeights: z.record(z.string(), z.number()).optional(),
  }).optional(),
});

export const expertStep8Schema = z.object({
  uploadedFiles: z.array(z.any()).optional(),
});

// Pricing Schema
export const pricingSchema = z.object({
  pricingTier: z.enum(['free', 'standard', 'premium'], {
    required_error: 'Please select a pricing tier',
  }),
});

// Patent number validation
export const patentNumberRegex = {
  US: /^US\d{7,8}[A-Z]\d?$/,
  EP: /^EP\d{7}[A-Z]\d$/,
  WO: /^WO\d{4}\/\d{6}$/,
  general: /^[A-Z]{2}\d{5,}/,
};

export function validatePatentNumber(number: string): boolean {
  const cleaned = number.trim().toUpperCase();
  return Object.values(patentNumberRegex).some(regex => regex.test(cleaned));
}

// File validation
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export function validateFileType(file: File): boolean {
  return ACCEPTED_FILE_TYPES.includes(file.type) || 
         file.name.endsWith('.pdf') || 
         file.name.endsWith('.docx') || 
         file.name.endsWith('.txt');
}

export function validateTotalFileSize(files: File[]): boolean {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  return totalSize <= MAX_FILE_SIZE;
}
