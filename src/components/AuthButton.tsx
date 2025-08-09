"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { memo, useCallback } from "react";
import type { AuthButtonProps } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AuthButton = memo(function AuthButton({ className }: AuthButtonProps = {}) {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const handleSignIn = useCallback(() => {
    signInWithGoogle().catch(error => {
      console.error('Sign in failed:', error);
    });
  }, [signInWithGoogle]);

  const handleSignOut = useCallback(() => {
    signOut().catch(error => {
      console.error('Sign out failed:', error);
    });
  }, [signOut]);

  if (loading) {
    return (
      <Button variant="outline" disabled className={className}>
        Loading...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="default" className={className}>
        <LogIn className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className || ''}`}>
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.displayName || user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-sm text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});