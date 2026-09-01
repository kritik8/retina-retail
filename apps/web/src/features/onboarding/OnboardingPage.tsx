import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/useAuth';
import { supabase, isConfiguredSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Store,
  ShoppingBag,
  Pill,
  Building2,
  MapPin,
  Calculator,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { BusinessType } from '@/types';

// Step 1 Validation Schema
const step1Schema = z.object({
  shop_name: z.string().min(2, 'Shop name must be at least 2 characters'),
  business_type: z.enum(['kirana', 'supermarket', 'pharmacy', 'other'] as const, {
    required_error: 'Please select a business type',
  }),
});

// Step 2 Validation Schema
const step2Schema = z.object({
  address: z.string().min(5, 'Full street address is required'),
  city: z.string().min(2, 'City name is required'),
  state: z.string().min(2, 'State name is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

// Step 3 Validation Schema
const step3Schema = z.object({
  number_of_counters: z.coerce.number().min(1, 'At least 1 counter is required').max(50, 'Max 50 counters'),
  expected_cameras: z.coerce.number().min(1, 'At least 1 camera is required').max(20, 'Max 20 cameras'),
});

// Combined Full Schema
const fullOnboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type OnboardingFormData = z.infer<typeof fullOnboardingSchema>;

const businessTypeOptions: { id: BusinessType; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'kirana', label: 'Kirana Store', desc: 'Local general store & neighborhood retail', icon: Store },
  { id: 'supermarket', label: 'Supermarket', desc: 'Multi-aisle grocery & hypermarket store', icon: ShoppingBag },
  { id: 'pharmacy', label: 'Pharmacy', desc: 'Chemist, medical, & healthcare outlet', icon: Pill },
  { id: 'other', label: 'Other Format', desc: 'Fashion, electronics, or specialty retail', icon: Building2 },
];

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refreshShop } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(fullOnboardingSchema),
    defaultValues: {
      shop_name: '',
      business_type: 'kirana',
      address: '',
      city: '',
      state: '',
      pincode: '',
      number_of_counters: 2,
      expected_cameras: 3,
    },
  });

  const selectedType = watch('business_type');

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['shop_name', 'business_type']);
    } else if (currentStep === 2) {
      isValid = await trigger(['address', 'city', 'state', 'pincode']);
    }

    if (isValid && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 2 | 3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      if (isConfiguredSupabase) {
        const { error } = await supabase.from('shops').insert([
          {
            owner_id: user.id,
            shop_name: data.shop_name,
            business_type: data.business_type,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            number_of_counters: data.number_of_counters,
            expected_cameras: data.expected_cameras,
          },
        ]);

        if (error) {
          throw error;
        }
      } else {
        // Fallback local mock shop insertion
        const mockShop = {
          id: `shop-${Date.now()}`,
          owner_id: user.id,
          ...data,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('retina_mock_shop', JSON.stringify(mockShop));
      }

      await refreshShop();
      navigate('/dashboard/overview', { replace: true });
    } catch (err: unknown) {
      console.error('Onboarding submission failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to complete registration. Please try again.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-xl">
        {/* Top Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Onboarding</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Register Your Store</h1>
          <p className="text-sm text-slate-400">
            Set up your store details to connect edge AI cameras and stream live shopper analytics.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-8">
          
          {/* Stepper Progress Indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className={currentStep >= 1 ? 'text-indigo-400' : ''}>1. Basic Info</span>
              <span className={currentStep >= 2 ? 'text-indigo-400' : ''}>2. Location</span>
              <span className={currentStep >= 3 ? 'text-indigo-400' : ''}>3. Hardware & Counters</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: '33%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* STEP 1: Basic Info & Icon-based Cards */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Input
                    label="Store / Shop Name"
                    placeholder="e.g. Modern Retail Mart"
                    error={errors.shop_name?.message}
                    {...register('shop_name')}
                  />

                  {/* Business Type Selectable Icon Cards */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Business Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {businessTypeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedType === option.id;
                        return (
                          <div
                            key={option.id}
                            onClick={() => setValue('business_type', option.id, { shouldValidate: true })}
                            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                            }`}
                          >
                            <div
                              className={`p-2.5 rounded-lg shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white">{option.label}</h4>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
                              </div>
                              <p className="text-xs text-slate-400 leading-snug">{option.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.business_type && (
                      <p className="text-xs text-rose-400 mt-1 font-medium">{errors.business_type.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Address Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Store Physical Location</span>
                  </div>

                  <Input
                    label="Street Address / Building"
                    placeholder="e.g. Shop #14, Main Commercial Complex"
                    error={errors.address?.message}
                    {...register('address')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="e.g. Bengaluru"
                      error={errors.city?.message}
                      {...register('city')}
                    />

                    <Input
                      label="State"
                      placeholder="e.g. Karnataka"
                      error={errors.state?.message}
                      {...register('state')}
                    />
                  </div>

                  <Input
                    label="Pincode (6 digits)"
                    placeholder="e.g. 560001"
                    maxLength={6}
                    error={errors.pincode?.message}
                    {...register('pincode')}
                  />
                </motion.div>
              )}

              {/* STEP 3: Hardware & Counters */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-indigo-400" />
                      <span>Capacity & Edge Setup</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      This information helps calibrate queue detection thresholds and camera stream analytics.
                    </p>
                  </div>

                  <Input
                    label="Number of Billing Counters / POS Terminals"
                    type="number"
                    min={1}
                    max={50}
                    error={errors.number_of_counters?.message}
                    helperText="Active checkout counters monitored for queue intelligence."
                    {...register('number_of_counters')}
                  />

                  <div className="space-y-1">
                    <Input
                      label="Expected AI Cameras to Install"
                      type="number"
                      min={1}
                      max={20}
                      error={errors.expected_cameras?.message}
                      helperText="Number of vision sensor nodes planned for entry/exit & aisles."
                      {...register('expected_cameras')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-8">
              {currentStep > 1 ? (
                <Button type="button" onClick={prevStep} variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} variant="primary" className="gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" isLoading={isSubmitting} variant="primary" className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                  <span>Complete Setup</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
