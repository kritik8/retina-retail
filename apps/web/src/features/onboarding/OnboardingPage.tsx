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
} from 'lucide-react';
import type { BusinessType } from '@/types';

const step1Schema = z.object({
  shop_name: z.string().min(2, 'Shop name must be at least 2 characters'),
  business_type: z.enum(['kirana', 'supermarket', 'pharmacy', 'other'] as const, {
    required_error: 'Please select a business type',
  }),
});
const step2Schema = z.object({
  address: z.string().min(5, 'Full street address is required'),
  city: z.string().min(2, 'City name is required'),
  state: z.string().min(2, 'State name is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});
const step3Schema = z.object({
  number_of_counters: z.coerce.number().min(1).max(50),
  expected_cameras: z.coerce.number().min(1).max(20),
});
const fullOnboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type OnboardingFormData = z.infer<typeof fullOnboardingSchema>;

const businessTypeOptions: { id: BusinessType; label: string; desc: string; icon: React.FC<{ className?: string; style?: React.CSSProperties }> }[] = [
  { id: 'kirana',      label: 'Kirana Store',   desc: 'Local general store & neighborhood retail', icon: Store },
  { id: 'supermarket', label: 'Supermarket',     desc: 'Multi-aisle grocery & hypermarket store',  icon: ShoppingBag },
  { id: 'pharmacy',    label: 'Pharmacy',        desc: 'Chemist, medical, & healthcare outlet',     icon: Pill },
  { id: 'other',       label: 'Other Format',    desc: 'Fashion, electronics, or specialty retail', icon: Building2 },
];

const STEP_LABELS = ['Basic Info', 'Location', 'Hardware'];

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
    let valid = false;
    if (currentStep === 1) valid = await trigger(['shop_name', 'business_type']);
    else if (currentStep === 2) valid = await trigger(['address', 'city', 'state', 'pincode']);
    if (valid && currentStep < 3) setCurrentStep((prev) => (prev + 1) as 2 | 3);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (isConfiguredSupabase) {
        const { error } = await supabase.from('shops').insert([{
          owner_id: user.id,
          shop_name: data.shop_name,
          business_type: data.business_type,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          number_of_counters: data.number_of_counters,
          expected_cameras: data.expected_cameras,
        }]);
        if (error) throw error;
      } else {
        localStorage.setItem('retina_mock_shop', JSON.stringify({
          id: `shop-${Date.now()}`,
          owner_id: user.id,
          ...data,
          created_at: new Date().toISOString(),
        }));
      }
      await refreshShop();
      navigate('/dashboard/overview', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete registration.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-lg space-y-7">
        {/* Header */}
        <div className="text-center space-y-1">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center mx-auto mb-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--fg)' }}>
              <path d="M5.5 16C8.5 10.5 23.5 10.5 26.5 16C23.5 21.5 8.5 21.5 5.5 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="3.5" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--fg)' }}>
            Register your store
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--fg-muted)' }}>
            Set up your store details to unlock live edge-AI analytics.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[10px] p-7 space-y-7"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {/* Stepper Progress */}
          <div className="space-y-3">
            <div className="flex justify-between">
              {STEP_LABELS.map((label, idx) => {
                const step = idx + 1;
                const isActive = currentStep === step;
                const isDone = currentStep > step;
                return (
                  <span
                    key={label}
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{
                      color: isActive
                        ? 'var(--fg)'
                        : isDone
                        ? 'var(--accent)'
                        : 'var(--fg-subtle)',
                    }}
                  >
                    {isDone ? '✓ ' : ''}{label}
                  </span>
                );
              })}
            </div>
            <div
              className="w-full h-px rounded-full overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--accent)' }}
                initial={{ width: '33%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  <Input
                    label="Store / Shop Name"
                    placeholder="e.g. Modern Retail Mart"
                    error={errors.shop_name?.message}
                    {...register('shop_name')}
                  />

                  <div className="space-y-2">
                    <label
                      className="block text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--fg-muted)' }}
                    >
                      Business Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {businessTypeOptions.map(({ id, label, desc, icon: Icon }) => {
                        const isSelected = selectedType === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setValue('business_type', id, { shouldValidate: true })}
                            className="flex items-start gap-3 p-3.5 rounded-lg text-left transition-colors duration-150"
                            style={{
                              background: isSelected ? 'var(--accent-subtle)' : 'var(--bg)',
                              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                            }}
                          >
                            <Icon
                              className="w-4 h-4 mt-0.5 shrink-0"
                              style={{ color: isSelected ? 'var(--accent-fg)' : 'var(--fg-subtle)' }}
                            />
                            <div>
                              <div
                                className="text-[13px] font-medium"
                                style={{ color: isSelected ? 'var(--accent-fg)' : 'var(--fg)' }}
                              >
                                {label}
                              </div>
                              <div className="text-[11px] mt-0.5" style={{ color: 'var(--fg-subtle)' }}>
                                {desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.business_type && (
                      <p className="text-[11px]" style={{ color: 'var(--status-err)' }}>
                        {errors.business_type.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Store physical location</span>
                  </div>
                  <Input label="Street Address / Building" placeholder="e.g. Shop #14, Main Complex" error={errors.address?.message} {...register('address')} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" placeholder="Bengaluru" error={errors.city?.message} {...register('city')} />
                    <Input label="State" placeholder="Karnataka" error={errors.state?.message} {...register('state')} />
                  </div>
                  <Input label="Pincode" placeholder="560001" maxLength={6} error={errors.pincode?.message} {...register('pincode')} />
                </motion.div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  <div
                    className="p-4 rounded-lg space-y-0.5"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <h4 className="text-[13px] font-medium flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                      <Calculator className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
                      Capacity & Edge Setup
                    </h4>
                    <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                      Calibrates queue detection thresholds and camera stream analytics.
                    </p>
                  </div>
                  <Input
                    label="Billing Counters / POS Terminals"
                    type="number"
                    min={1}
                    max={50}
                    error={errors.number_of_counters?.message}
                    helperText="Active checkout counters monitored for queue intelligence."
                    {...register('number_of_counters')}
                  />
                  <Input
                    label="AI Cameras to Install"
                    type="number"
                    min={1}
                    max={20}
                    error={errors.expected_cameras?.message}
                    helperText="Vision sensor nodes planned for entry/exit & aisles."
                    {...register('expected_cameras')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav Controls */}
            <div
              className="flex items-center justify-between mt-7 pt-5"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 text-[13px] transition-colors"
                  style={{ color: 'var(--fg-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : <div />}

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} variant="primary" size="sm">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button type="submit" isLoading={isSubmitting} variant="primary" size="sm">
                  Complete Setup <CheckCircle2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
