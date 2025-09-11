"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackgroundLines } from "@/components/ui/background-lines";
import { cn } from "@/lib/utils";
import type React from "react";

export default function Login() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login form submitted");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <BackgroundLines
        className="absolute inset-0 z-0"
        children
      ></BackgroundLines>

      <div className="relative z-10 flex items-center justify-center w-full">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ☕ Cafe POS System
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Login to manage your cafe orders, track sales, and monitor
            performance
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@cafe.com" />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </LabelInputContainer>

            <Button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
