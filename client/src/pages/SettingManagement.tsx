import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/services/SettingsApi";

const weekdays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const currencies = [
  "BDT",
  "USD",
  "EUR",
  "GBP",
  "INR",
  "AUD",
  "CAD",
  "JPY",
  "SGD",
  "CHF",
  "CNY",
  "HKD",
];

export const SettingManagement = () => {
  const { data: settings, isLoading } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    taxRate: 0,
    discountRate: 0,
    currency: "BDT",
    serviceCharge: 0,
    businessName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    receiptFooter: "",
    enableDiscountInput: true,
    enableTaxOverride: false,
    allowNegativeStock: false,
    openingTime: "09:00",
    closingTime: "23:00",
    offDays: [] as string[],
    lowStockAlertLevel: 5,
    salesTarget: 10000,
  });

  // Populate form when settings load
  console.log(settings);

  useEffect(() => {
    if (settings?.data) {
      setForm({
        taxRate: settings.data.taxRate,
        discountRate: settings.data.discountRate,
        currency: settings.data.currency,
        serviceCharge: settings.data.serviceCharge || 0,
        businessName: settings.data.businessName,
        address: settings.data.address,
        phone: settings.data.phone,
        email: settings.data.email || "",
        website: settings.data.website || "",
        receiptFooter: settings.data.receiptFooter || "",
        enableDiscountInput: settings.data.enableDiscountInput,
        enableTaxOverride: settings.data.enableTaxOverride,
        allowNegativeStock: settings.data.allowNegativeStock,
        openingTime: settings.data.openingTime,
        closingTime: settings.data.closingTime,
        offDays: settings.data.offDays || weekdays, // select all by default
        lowStockAlertLevel: settings.data.lowStockAlertLevel || 5,
        salesTarget: settings.data.salesTarget || 10000,
      });
    }
  }, [settings]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOffDay = (day: string) => {
    handleChange(
      "offDays",
      form.offDays.includes(day)
        ? form.offDays.filter((d) => d !== day)
        : [...form.offDays, day]
    );
  };

  const handleSave = async () => {
    try {
      await updateSettings({ ...form }).unwrap();
      toast.success("Settings updated successfully!");
      setIsEditMode(false);
    } catch (err) {
      toast.error("Failed to update settings!");
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Card className="space-y-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Business Settings</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "Cancel Edit" : "Edit"}
          </Button>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Settings */}
          <Section title="Financial Settings">
            <InputField
              label="Tax Rate (%)"
              value={form.taxRate}
              onChange={(val) => handleChange("taxRate", Number(val))}
              type="number"
              disabled={!isEditMode}
            />
            <InputField
              label="Discount Rate (%)"
              value={form.discountRate}
              onChange={(val) => handleChange("discountRate", Number(val))}
              type="number"
              disabled={!isEditMode}
            />
            <SelectField
              label="Currency"
              value={form.currency}
              options={currencies}
              onChange={(val) => handleChange("currency", val)}
              disabled={!isEditMode}
            />
            <InputField
              label="Service Charge (%)"
              value={form.serviceCharge}
              onChange={(val) => handleChange("serviceCharge", Number(val))}
              type="number"
              disabled={!isEditMode}
            />
          </Section>

          {/* Business Info */}
          <Section title="Business Info">
            <InputField
              label="Business Name"
              value={form.businessName}
              onChange={(val) => handleChange("businessName", val)}
              disabled={!isEditMode}
            />
            <InputField
              label="Address"
              value={form.address}
              onChange={(val) => handleChange("address", val)}
              disabled={!isEditMode}
            />
            <InputField
              label="Phone"
              value={form.phone}
              onChange={(val) => handleChange("phone", val)}
              disabled={!isEditMode}
            />
            <InputField
              label="Email"
              value={form.email}
              onChange={(val) => handleChange("email", val)}
              disabled={!isEditMode}
            />
            <InputField
              label="Website"
              value={form.website}
              onChange={(val) => handleChange("website", val)}
              disabled={!isEditMode}
            />
            <InputField
              label="Receipt Footer"
              value={form.receiptFooter}
              onChange={(val) => handleChange("receiptFooter", val)}
              disabled={!isEditMode}
            />
          </Section>

          {/* POS Behavior */}
          <Section title="POS Behavior">
            EnableDiscountInput
            <CheckboxField
              label="Enable Discount Input"
              checked={form.enableDiscountInput}
              onChange={(val) => handleChange("enableDiscountInput", val)}
              disabled={!isEditMode}
            />
            enableTaxOverride
            <CheckboxField
              label="Enable Tax Override"
              checked={form.enableTaxOverride}
              onChange={(val) => handleChange("enableTaxOverride", val)}
              disabled={!isEditMode}
            />
            allowNegativeStock
            <CheckboxField
              label="Allow Negative Stock"
              checked={form.allowNegativeStock}
              onChange={(val) => handleChange("allowNegativeStock", val)}
              disabled={!isEditMode}
            />
          </Section>

          {/* Timing & Off Days */}
          <Section title="Business Hours & Off Days">
            <InputField
              label="Opening Time"
              value={form.openingTime}
              onChange={(val) => handleChange("openingTime", val)}
              type="time"
              disabled={!isEditMode}
            />
            <InputField
              label="Closing Time"
              value={form.closingTime}
              onChange={(val) => handleChange("closingTime", val)}
              type="time"
              disabled={!isEditMode}
            />
            <div className="md:col-span-2">
              <Label>Off Days</Label>
              <div className="flex flex-wrap gap-3 mt-1">
                {weekdays.map((day) => (
                  <div className="flex flex-row items-center gap-1 flex-wrap">
                    <Checkbox
                      key={day}
                      checked={form.offDays.includes(day)}
                      disabled={!isEditMode}
                      onCheckedChange={() => toggleOffDay(day)}
                    ></Checkbox>
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Reports */}
          <Section title="Reports">
            <InputField
              label="Low Stock Alert Level"
              value={form.lowStockAlertLevel}
              onChange={(val) =>
                handleChange("lowStockAlertLevel", Number(val))
              }
              type="number"
              disabled={!isEditMode}
            />
            <InputField
              label="Sales Target"
              value={form.salesTarget}
              onChange={(val) => handleChange("salesTarget", Number(val))}
              type="number"
              disabled={!isEditMode}
            />
          </Section>
        </CardContent>

        {isEditMode && (
          <>
            <Separator />
            <div className="p-4 flex justify-end">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

// --- Reusable Components ---
interface InputFieldProps {
  label: string;
  value: any;
  onChange: (val: any) => void;
  type?: string;
  disabled?: boolean;
}
const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}
const CheckboxField = ({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) => (
  <Checkbox
    checked={checked}
    disabled={disabled}
    onCheckedChange={(val) => onChange(Boolean(val))}
  >
    {label}
  </Checkbox>
);

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
}
const SelectField = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: SelectFieldProps) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a value" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section = ({ title, children }: SectionProps) => (
  <div className="md:col-span-2 space-y-3">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);
