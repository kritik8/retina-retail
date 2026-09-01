import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/useAuth';
import { Store, User } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, shop } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Store Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your store configuration, profile details, and telemetry export keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-400" />
              <span>Store Information</span>
            </CardTitle>
            <CardDescription>Registered store profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">Store Name</span>
              <span className="font-semibold text-white">{shop?.shop_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">Business Type</span>
              <span className="capitalize">{shop?.business_type || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">Address</span>
              <span>{shop ? `${shop.address}, ${shop.city}, ${shop.state} - ${shop.pincode}` : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>Account Owner</span>
            </CardTitle>
            <CardDescription>Authenticated user session details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">Owner Name</span>
              <span className="font-semibold text-white">{user?.user_metadata?.full_name || 'Store Owner'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">Email Address</span>
              <span>{user?.email || 'authenticated'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
