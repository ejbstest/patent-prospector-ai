import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UploadedFile {
  file: File;
  label?: string;
  preview?: string;
}

// Attorney intake form data structure (11-step flow)
export interface FormData {
  // Step 1: Firm & Attorney Information
  firmName?: string;
  attorneyName?: string;
  barNumber?: string;
  clientCompanyName?: string;
  reportDeliveryEmail?: string;
  firmPrimaryColor?: string;
  firmLogoUrl?: string;
  
  // Step 2: Invention Overview
  inventionTitle?: string;
  inventionCategory?: string;
  valueProp?: string;
  problemBeingSolved?: string;
  solutionApproach?: string;
  targetCustomers?: string;
  
  // Step 3: Technical Details
  technicalDescription?: string;
  keyInnovations?: string[];
  technicalSpecifications?: Record<string, string>;
  
  // Step 4: Prior Art Awareness
  knownCompetitors?: string[];
  knownPatents?: string[];
  researchPapers?: string[];
  tradePublications?: string[];
  
  // Step 5: Patent Classification
  selectedClassifications?: string[];
  manualClassifications?: string[];
  primaryDomain?: string;
  
  // Step 6: Geographic Scope
  targetMarkets?: string[];
  priorityJurisdiction?: string;
  manufacturingLocations?: string;
  
  // Step 7: Competitive Landscape
  directCompetitors?: string[];
  indirectCompetitors?: string[];
  marketLeaders?: string[];
  recentAcquisitions?: string[];
  dominantPatentHolders?: string[];
  
  // Step 8: Business Context
  developmentStage?: string;
  fundingStage?: string;
  fundingTimeline?: Date;
  launchDate?: Date;
  
  // Step 9: Analysis Preferences
  analysisDepth?: 'standard' | 'comprehensive';
  whiteSpaceFocus?: boolean;
  reportFormats?: string[];
  turnaroundTime?: 'standard' | 'priority' | 'rush';
  
  // Step 10: Document Uploads
  uploadedFiles: UploadedFile[];
  acceptTerms?: boolean;
  
  // Step 11: Payment & Delivery (handled separately in payment flow)
  secondaryEmails?: string[];
  
  // Legacy fields (for backward compatibility with createAnalysis)
  // These will be removed once createAnalysis is fully updated
  disclosure?: string;
  innovations?: string[];
  cpcCodes?: string[];
  regions?: string[];
  competitors?: string[];
}

interface IntakeFormState {
  currentStep: number;
  formData: FormData;
  isDirty: boolean;
  lastSaved: number | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  addFile: (file: UploadedFile) => void;
  removeFile: (index: number) => void;
  markSaved: () => void;
  reset: () => void;
}

const initialFormData: FormData = {
  // Initialize with empty arrays for required fields
  keyInnovations: [],
  knownCompetitors: [],
  knownPatents: [],
  researchPapers: [],
  tradePublications: [],
  selectedClassifications: [],
  manualClassifications: [],
  targetMarkets: [],
  directCompetitors: [],
  indirectCompetitors: [],
  marketLeaders: [],
  recentAcquisitions: [],
  dominantPatentHolders: [],
  reportFormats: ['pdf'],
  uploadedFiles: [],
  secondaryEmails: [],
  
  // Legacy fields for backward compatibility
  innovations: [],
  cpcCodes: [],
  regions: [],
  competitors: [],
  
  // Default values
  analysisDepth: 'standard',
  whiteSpaceFocus: true,
  turnaroundTime: 'standard',
  firmPrimaryColor: '#7C3AED',
};

export const useIntakeFormStore = create<IntakeFormState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: initialFormData,
      isDirty: false,
      lastSaved: null,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      prevStep: () => set((state) => ({ 
        currentStep: Math.max(1, state.currentStep - 1) 
      })),

      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        isDirty: true,
      })),

      addFile: (file) => set((state) => ({
        formData: {
          ...state.formData,
          uploadedFiles: [...state.formData.uploadedFiles, file],
        },
        isDirty: true,
      })),

      removeFile: (index) => set((state) => ({
        formData: {
          ...state.formData,
          uploadedFiles: state.formData.uploadedFiles.filter((_, i) => i !== index),
        },
        isDirty: true,
      })),

      markSaved: () => set({ isDirty: false, lastSaved: Date.now() }),

      reset: () => set({
        currentStep: 1,
        formData: initialFormData,
        isDirty: false,
        lastSaved: null,
      }),
    }),
    {
      name: 'intake-form-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: {
          ...state.formData,
          uploadedFiles: [], // Don't persist File objects
        },
        lastSaved: state.lastSaved,
      }),
    }
  )
);
