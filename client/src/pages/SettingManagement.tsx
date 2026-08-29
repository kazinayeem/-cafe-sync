import React, { useState, useEffect } from "react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/services/SettingsApi";
import type { SettingsData } from "@/services/SettingsApi";
import {
  Store,
  DollarSign,
  Clock,
  Star,
  Printer,
  Shield,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/PageHeader";
import Swal from "sweetalert2";

export const SettingManagement: React.FC = () => {
  const { data: settingsResponse, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [activeTab, setActiveTab] = useState<
    "business" | "finance" | "hours" | "loyalty" | "pos" | "permissions"
  >("business");

  const [formData, setFormData] = useState<SettingsData>({
    taxRate: 5,
    discountRate: 0,
    currency: "BDT",
    serviceCharge: 0,
    businessName: "Cafe Sync",
    address: "Mirpur, Dhaka - 1206",
    phone: "012-345-6789",
    email: "contact@cafesync.com",
    website: "https://cafe-sync.vercel.app",
    receiptFooter: "Thank you for visiting Cafe Sync! Please come again.",
    enableDiscountInput: true,
    enableTaxOverride: false,
    allowNegativeStock: false,
    enableLoyalty: true,
    loyaltyEarnRate: 1,
    loyaltyRedeemRate: 0.5,
    openingTime: "09:00",
    closingTime: "23:00",
    offDays: [],
    lowStockAlertLevel: 10,
    salesTarget: 15000,
    permissions: {
      admin: [
        "view_dashboard",
        "create_order",
        "edit_order",
        "cancel_order",
        "refund_order",
        "manage_products",
        "manage_inventory",
        "manage_customers",
        "manage_staff",
        "manage_settings",
        "view_reports",
        "manage_tables",
        "manage_shifts",
        "manage_reservations",
      ],
      manager: [
        "view_dashboard",
        "create_order",
        "edit_order",
        "cancel_order",
        "refund_order",
        "manage_products",
        "manage_inventory",
        "manage_customers",
        "view_reports",
        "manage_tables",
        "manage_shifts",
        "manage_reservations",
      ],
      cashier: [
        "create_order",
        "view_orders",
        "manage_tables",
        "manage_customers",
        "manage_shifts",
        "manage_reservations",
      ],
      barista: ["view_orders", "update_order_status", "view_kds"],
      staff: ["create_order", "view_orders", "manage_tables"],
    },
  });

  useEffect(() => {
    if (settingsResponse?.data) {
      setFormData(settingsResponse.data);
    }
  }, [settingsResponse]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      Swal.fire({
        icon: "success",
        title: "Settings Saved Successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      refetch();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to Save",
        text: err?.data?.message || "Something went wrong",
      });
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleToggleOffDay = (day: string) => {
    const current = formData.offDays || [];
    if (current.includes(day)) {
      setFormData({ ...formData, offDays: current.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, offDays: [...current, day] });
    }
  };

  const allPermissions = [
    { key: "view_dashboard", label: "View Dashboard & Sales KPIs" },
    { key: "create_order", label: "Create Orders in POS" },
    { key: "edit_order", label: "Edit / Update Orders" },
    { key: "cancel_order", label: "Cancel & Delete Orders" },
    { key: "refund_order", label: "Process Refunds" },
    { key: "manage_products", label: "Manage Products & Categories" },
    { key: "manage_inventory", label: "Adjust Stock & Inventory" },
    { key: "manage_customers", label: "Manage Customers & Loyalty" },
    { key: "manage_staff", label: "Manage Staff Accounts" },
    { key: "manage_settings", label: "Edit Business Settings" },
    { key: "view_reports", label: "View Financial Reports" },
    { key: "manage_tables", label: "Manage Table Floor Plan" },
    { key: "manage_shifts", label: "Open & Close Cashier Shifts" },
    { key: "manage_reservations", label: "Manage Reservations" },
    { key: "view_kds", label: "Access Kitchen Display (KDS)" },
  ];

  const handleTogglePermission = (roleKey: string, permKey: string) => {
    const permsMap = { ...(formData.permissions || {}) };
    const currentList = permsMap[roleKey] || [];
    if (currentList.includes(permKey)) {
      permsMap[roleKey] = currentList.filter((p) => p !== permKey);
    } else {
      permsMap[roleKey] = [...currentList, permKey];
    }
    setFormData({ ...formData, permissions: permsMap });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="System & Business Settings"
        subtitle="Configure store profile, taxation, loyalty rules, operating hours, and granular role permissions"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </PageHeader>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none border-b border-border/80">
        {[
          { key: "business", label: "Store Profile", icon: Store },
          { key: "finance", label: "Tax & Financials", icon: DollarSign },
          { key: "hours", label: "Operating Hours", icon: Clock },
          { key: "loyalty", label: "Loyalty Program", icon: Star },
          { key: "pos", label: "POS & Printing", icon: Printer },
          { key: "permissions", label: "Role Permissions", icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === key
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Business Profile */}
        {activeTab === "business" && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/80 pb-3">
              Store & Brand Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Business Name *
                </Label>
                <Input
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="rounded-xl mt-1 font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contact Phone Number *
                </Label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="rounded-xl mt-1 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Website / Menu URL
                </Label>
                <Input
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Physical Store Address *
              </Label>
              <Input
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="rounded-xl mt-1 font-medium"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Financials & Tax */}
        {activeTab === "finance" && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/80 pb-3">
              Taxation, Service Charge & Currency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  VAT / Sales Tax Rate (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({ ...formData, taxRate: Number(e.target.value) })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular text-lg"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Service Charge Rate (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.serviceCharge || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceCharge: Number(e.target.value),
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular text-lg"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Default Currency Symbol / Code
                </Label>
                <Input
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  placeholder="BDT"
                  className="rounded-xl mt-1 font-bold font-tabular text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Daily Sales Target (৳)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.salesTarget || 15000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salesTarget: Number(e.target.value),
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Operating Hours */}
        {activeTab === "hours" && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/80 pb-3">
              Operating Schedule & Off Days
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Store Opening Time
                </Label>
                <Input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, openingTime: e.target.value })
                  }
                  className="rounded-xl mt-1 font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Store Closing Time
                </Label>
                <Input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, closingTime: e.target.value })
                  }
                  className="rounded-xl mt-1 font-bold"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Scheduled Off-Days (Closed Days)
              </Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isOff = (formData.offDays || []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleOffDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isOff
                          ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                          : "border-border bg-card hover:bg-accent text-foreground"
                      }`}
                    >
                      {day} {isOff && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Loyalty Program */}
        {activeTab === "loyalty" && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Customer Loyalty & Rewards Engine
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reward repeat cafe customers with points on orders
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.enableLoyalty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableLoyalty: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded text-amber-600"
                />
                <span>Enable Loyalty Program</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Points Earn Rate (Points per ৳100 spent)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.loyaltyEarnRate || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loyaltyEarnRate: Number(e.target.value),
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  e.g., 1 pt earned per ৳100 spent on orders
                </p>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Points Redemption Value (৳ Discount per 1 Point)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  value={formData.loyaltyRedeemRate || 0.5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loyaltyRedeemRate: Number(e.target.value),
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  e.g., 10 points = ৳5.00 discount during checkout
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: POS & Printing */}
        {activeTab === "pos" && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/80 pb-3">
              Thermal Printing & POS Behavior
            </h3>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Receipt Footer Custom Note
              </Label>
              <Input
                value={formData.receiptFooter || ""}
                onChange={(e) =>
                  setFormData({ ...formData, receiptFooter: e.target.value })
                }
                placeholder="Thank you for visiting Cafe Sync!"
                className="rounded-xl mt-1 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-accent/30 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.enableDiscountInput}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableDiscountInput: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded text-amber-600"
                />
                <span>Allow Cashier Manual Discount Input</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-accent/30 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.allowNegativeStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowNegativeStock: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded text-amber-600"
                />
                <span>Allow Orders When Out of Stock</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: Role Permissions Matrix */}
        {activeTab === "permissions" && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Role & Permission Matrix
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enforce granular backend and UI access privileges per employee role
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
                  <tr>
                    <th className="py-3 px-3">System Permission</th>
                    <th className="py-3 px-3 text-center">Manager</th>
                    <th className="py-3 px-3 text-center">Cashier</th>
                    <th className="py-3 px-3 text-center">Barista</th>
                    <th className="py-3 px-3 text-center">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {allPermissions.map((perm) => (
                    <tr key={perm.key} className="hover:bg-accent/40">
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        {perm.label}
                      </td>

                      {["manager", "cashier", "barista", "staff"].map((roleKey) => {
                        const isGranted = (
                          formData.permissions?.[roleKey] || []
                        ).includes(perm.key);

                        return (
                          <td key={roleKey} className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() =>
                                handleTogglePermission(roleKey, perm.key)
                              }
                              className="h-4 w-4 rounded text-amber-600 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-3 rounded-xl shadow-lg"
          >
            {isSaving ? "Saving Settings..." : "Save System Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingManagement;
