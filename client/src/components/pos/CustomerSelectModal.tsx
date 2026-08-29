import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
} from "@/services/customerApi";
import type { Customer } from "@/services/customerApi";
import { Search, UserPlus, Star, User, Phone, Check, ArrowLeft } from "lucide-react";

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  selectedCustomer,
  onSelectCustomer,
}) => {
  const [search, setSearch] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const { data: customerData, isLoading } = useGetCustomersQuery(
    { search, limit: 10 },
    { skip: !isOpen }
  );

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();

  const handleSelect = (c: Customer) => {
    onSelectCustomer(c);
    onClose();
  };

  const handleWalkIn = () => {
    onSelectCustomer(null);
    onClose();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    try {
      const res = await createCustomer({
        name: newName,
        phone: newPhone,
        email: newEmail,
        notes: newNotes,
      }).unwrap();

      if (res.success && res.data) {
        onSelectCustomer(res.data);
        setIsCreatingNew(false);
        setNewName("");
        setNewPhone("");
        setNewEmail("");
        setNewNotes("");
        onClose();
      }
    } catch (err) {
      console.error("Failed to register customer:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              {isCreatingNew ? "Add New Customer" : "Select Customer"}
            </DialogTitle>
            {isCreatingNew ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs font-semibold text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Search
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingNew(true)}
                className="text-xs font-semibold rounded-xl text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                + New Customer
              </Button>
            )}
          </div>
        </DialogHeader>

        {isCreatingNew ? (
          <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Name *
              </Label>
              <Input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. John Doe"
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Phone Number *
              </Label>
              <Input
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="e.g. 01712345678"
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address (Optional)
              </Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="customer@example.com"
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Preferences / Allergies Note
              </Label>
              <Input
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Prefers almond milk, no sugar"
                className="rounded-xl mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl shadow-md mt-4"
            >
              {isCreating ? "Creating..." : "Save & Attach to Order"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by phone, name or email..."
                className="pl-9 rounded-xl"
              />
            </div>

            {/* Walk-in Customer Option */}
            <button
              type="button"
              onClick={handleWalkIn}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                !selectedCustomer
                  ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 font-bold"
                  : "border-border hover:bg-accent text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Walk-in Guest</p>
                  <p className="text-[11px] text-muted-foreground">
                    Standard guest (no loyalty tracking)
                  </p>
                </div>
              </div>
              {!selectedCustomer && <Check className="h-4 w-4 text-amber-600" />}
            </button>

            {/* Customer List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Searching customers...
                </div>
              ) : customerData?.data?.length ? (
                customerData.data.map((c) => {
                  const isSelected = selectedCustomer?._id === c._id;

                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 font-bold"
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {c.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {c.loyaltyPoints || 0} pts
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No registered customers found.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
