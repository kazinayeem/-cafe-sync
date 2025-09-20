import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function DiscountDialog({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (discount: number) => void;
}) {
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState("");

  const handleApply = () => {
    const value = Number(discount);
    if (isNaN(value) || value < 0 || value > 100) {
      setError("Please enter a valid discount between 0 and 100.");
      return;
    }
    onApply(value);
    onClose();
    setDiscount("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Enter discount percentage (0–100)"
            value={discount}
            onChange={(e) => {
              setDiscount(e.target.value);
              setError("");
            }}
            className="text-sm"
          />
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
