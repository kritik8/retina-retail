import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/useAuth';
import { Store, User } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, shop } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
          Settings
        </h1>
        <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          Manage your store profile, hardware configurations, and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Store className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Store Information</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>Registered store profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-0.5" style={{ color: 'var(--fg-subtle)' }}>
                Store Name
              </span>
              <span className="font-medium text-sm" style={{ color: 'var(--fg)' }}>{shop?.shop_name || 'N/A'}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-0.5" style={{ color: 'var(--fg-subtle)' }}>
                Business Type
              </span>
              <span className="capitalize" style={{ color: 'var(--fg-muted)' }}>{shop?.business_type || 'N/A'}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-0.5" style={{ color: 'var(--fg-subtle)' }}>
                Address
              </span>
              <span style={{ color: 'var(--fg-muted)' }}>{shop ? `${shop.address}, ${shop.city}, ${shop.state} - ${shop.pincode}` : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <User className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Account Owner</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>Authenticated user session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-0.5" style={{ color: 'var(--fg-subtle)' }}>
                Owner Name
              </span>
              <span className="font-medium text-sm" style={{ color: 'var(--fg)' }}>{user?.user_metadata?.full_name || 'Store Owner'}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-0.5" style={{ color: 'var(--fg-subtle)' }}>
                Email Address
              </span>
              <span className="font-mono" style={{ color: 'var(--fg-muted)' }}>{user?.email || 'authenticated'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
