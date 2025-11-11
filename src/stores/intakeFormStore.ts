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
  // Step 1
  userType: UserType;
  
  // Novice fields
  productDescription?: string;
  uniqueness?: string;
  competitors?: string[];
  regions?: string[];
  
  // Intermediate fields
  technicalDescription?: string;
  innovations?: string[];
  cpcCodes?: string[];
  priorArtPatents?: string[];
  jurisdictions?: string[];
  
  // Expert fields
  disclosure?: string;
  claims?: string[];
  ipcCpcCodes?: string[];
  assignees?: string[];
  priorArtReferences?: Array<{
    patentNumber: string;
    publicationDate?: string;
    relevanceNotes?: string;
  }>;
  analysisParameters?: {
    dateRange?: { start: string; end: string };
    citationDepth?: number;
    jurisdictionWeights?: Record<string, number>;
  };
  
  // Universal
  uploadedFiles: UploadedFile[];
  pricingTier: PricingTier;
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
  userType: null,
  competitors: [],
  regions: [],
  innovations: [],
  cpcCodes: [],
  priorArtPatents: [],
  jurisdictions: [],
  claims: [],
  ipcCpcCodes: [],
  assignees: [],
  priorArtReferences: [],
  uploadedFiles: [],
  pricingTier: null,
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
        const { userType } = get().formData;
        if (!userType) return 8; // Max possible
        if (userType === 'novice') return 7; // 1 + 5 steps + pricing
        if (userType === 'intermediate') return 8; // 1 + 6 steps + pricing
        return 10; // expert: 1 + 8 steps + pricing
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
