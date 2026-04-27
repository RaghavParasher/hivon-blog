"use client";

import { useAuth, UserRole } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // User is logged in but doesn't have the required role
        router.push("/");
      }
    }
  }, [user, profile, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-muted">Verifying your access...</p>
      </div>
    );
  }

  // If we are still checking roles after loading is done, don't show children yet
  if (!user || (allowedRoles && profile && !allowedRoles.includes(profile.role))) {
    return null;
  }

  return <>{children}</>;
}
