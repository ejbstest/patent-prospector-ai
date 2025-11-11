import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserType = 'novice' | 'intermediate' | 'expert' | null;
export type PricingTier = 'free' | 'standard' | 'premium' | null;

export interface UploadedFile {
  file: File;
  label?: string;
  preview?: string;
}

export interface FormData {
  // Step 1: Firm & Attorney Information
  firmName?: string;
  attorneyName?: string;
  firmLogo?: File;
  firmPrimaryColor?: string;
  firmSecondaryColor?: string;
  clientCompanyName?: string;
  reportDeliveryEmail?: string;
  
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
  technicalSpecifications?: Record<string, any>;
  diagrams?: File[];
  
  // Step 4: Prior Art Awareness
  knownCompetitors?: string[];
  knownPatents?: string[];
  researchPapers?: string[];
  tradePublications?: string[];
  
  // Step 5: Patent Classification
  suggestedCpcCodes?: string[];
  selectedCpcCodes?: string[];
  primaryTechnologyDomains?: string[];
  
  // Step 6: Geographic Scope
  targetMarkets?: string[];
  priorityJurisdiction?: string;
  manufacturingLocations?: string[];
  
  // Step 7: Competitive Landscape
  directCompetitors?: Array<{ name: string; description: string }>;
  indirectCompetitors?: string[];
  marketLeaders?: string[];
  recentAcquisitions?: string[];
  dominantPatentHolders?: string[];
  
  // Step 8: Business Context
  developmentStage?: string;
  fundingStage?: string;
  fundingTimeline?: string;
  commercializationTimeline?: string;
  
  // Step 9: Analysis Preferences
  analysisDepth?: 'standard' | 'comprehensive';
  whiteSpaceAnalysis?: string[];
  reportFormats?: string[];
  turnaroundTime?: 'standard' | 'priority' | 'rush';
  
  // Step 10: Document Uploads
  uploadedFiles: UploadedFile[];
  
  // Step 11: Payment
  pricingTier: PricingTier;
  totalCost?: number;
  selectedAddons?: string[];
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
  getTotalSteps: () => number;
}

const initialFormData: FormData = {
  firmPrimaryColor: '#7C3AED',
  firmSecondaryColor: '#6D28D9',
  keyInnovations: [],
  knownCompetitors: [],
  knownPatents: [],
  researchPapers: [],
  tradePublications: [],
  suggestedCpcCodes: [],
  selectedCpcCodes: [],
  primaryTechnologyDomains: [],
  targetMarkets: [],
  directCompetitors: [],
  indirectCompetitors: [],
  marketLeaders: [],
  recentAcquisitions: [],
  dominantPatentHolders: [],
  whiteSpaceAnalysis: [],
  reportFormats: ['pdf'],
  uploadedFiles: [],
  pricingTier: null,
  selectedAddons: [],
  analysisDepth: 'standard',
  turnaroundTime: 'standard',
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

      getTotalSteps: () => {
        return 11; // All attorneys follow the same 11-step flow
      },
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
