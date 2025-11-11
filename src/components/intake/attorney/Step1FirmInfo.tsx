import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StepNavigation } from '../StepNavigation';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Upload } from 'lucide-react';
import { useState } from 'react';

const firmInfoSchema = z.object({
  firmName: z.string().min(2, 'Firm name is required'),
  attorneyName: z.string().min(2, 'Attorney name is required'),
  barNumber: z.string().optional(),
  clientCompanyName: z.string().min(2, 'Client company name is required'),
  reportDeliveryEmail: z.string().email('Valid email is required'),
  firmPrimaryColor: z.string().default('#7C3AED'),
});

interface Step1FirmInfoProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step1FirmInfo({ onNext, onBack }: Step1FirmInfoProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(firmInfoSchema),
    defaultValues: {
      firmName: formData.productDescription || '', // Reusing existing field temporarily
      attorneyName: formData.uniqueness || '',
      barNumber: '',
      clientCompanyName: formData.technicalDescription || '',
      reportDeliveryEmail: '',
      firmPrimaryColor: '#7C3AED',
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: z.infer<typeof firmInfoSchema>) => {
    updateFormData({
      productDescription: data.firmName, // Temporary mapping
      uniqueness: data.attorneyName,
      technicalDescription: data.clientCompanyName,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Firm & Attorney Information</h2>
          <p className="text-muted-foreground">
            This information will be used to white-label your FTO report
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firmName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Law Firm Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Smith & Associates IP Law" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attorneyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attorney Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="barNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bar Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Reg. No. 67,890" {...field} />
              </FormControl>
              <FormDescription>
                Will be displayed on the report if provided
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6">
          <h3 className="font-heading text-section-header mb-4">Firm Branding</h3>
          
          <div className="space-y-4">
            <div>
              <FormLabel>Firm Logo (Optional)</FormLabel>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                  <div className="text-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="max-h-24 mx-auto" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Click to upload logo</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB. Will appear on report cover page.</p>
            </div>

            <FormField
              control={form.control}
              name="firmPrimaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Brand Color</FormLabel>
                  <div className="flex gap-3 items-center">
                    <FormControl>
                      <input type="color" {...field} className="h-10 w-20 rounded-md border cursor-pointer" />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">{field.value}</span>
                  </div>
                  <FormDescription>
                    Used for headings and accents in the report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-heading text-section-header mb-4">Client Information</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="clientCompanyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client/Startup Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Technologies Inc." {...field} />
                  </FormControl>
                  <FormDescription>
                    The company you're preparing this FTO analysis for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportDeliveryEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Delivery Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@lawfirm.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where the completed white-labeled report will be sent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <StepNavigation
          onNext={form.handleSubmit(onSubmit)}
          canGoNext={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
