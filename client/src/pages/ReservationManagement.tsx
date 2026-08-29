import React, { useState, useEffect } from "react";
import {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useDeleteReservationMutation,
} from "@/services/reservationApi";
import type { Reservation } from "@/services/reservationApi";
import { useGetTablesQuery } from "@/services/tableService";
import { socket } from "@/utils/socket";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Users,
  Phone,
  Plus,
  CheckCircle2,
  Grid3X3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import Swal from "sweetalert2";

export const ReservationManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: reservationsResponse, isLoading, refetch } =
    useGetReservationsQuery({
      date: selectedDate,
      status: statusFilter,
    });

  const { data: tablesResponse } = useGetTablesQuery();
  const [createReservation, { isLoading: isCreating }] =
    useCreateReservationMutation();
  const [updateStatus] = useUpdateReservationStatusMutation();
  const [deleteReservation] = useDeleteReservationMutation();

  useEffect(() => {
    socket.on("reservationUpdated", () => refetch());
    return () => {
      socket.off("reservationUpdated");
    };
  }, [refetch]);

  const reservations: Reservation[] = reservationsResponse?.data || [];
  const tables = tablesResponse?.tables || [];

  const upcomingCount = reservations.filter((r) => r.status === "upcoming" || r.status === "confirmed").length;
  const seatedCount = reservations.filter((r) => r.status === "seated").length;
  const totalGuests = reservations.reduce((sum, r) => sum + (r.guests || 0), 0);

  const handleOpenAdd = () => {
    setCustomerName("");
    setPhone("");
    setEmail("");
    setDate(selectedDate || new Date().toISOString().split("T")[0]);
    setTime("19:00");
    setGuests(2);
    setTableId("");
    setSpecialRequests("");
    setIsAddModalOpen(true);
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !date || !time) return;

    try {
      await createReservation({
        customerName,
        phone,
        email,
        date,
        time,
        guests,
        tableId: tableId || undefined,
        specialRequests,
      }).unwrap();

      setIsAddModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Reservation Booked!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to create reservation",
      });
    }
  };

  const handleStatusChange = async (res: Reservation, newStatus: string) => {
    try {
      await updateStatus({ id: res._id, status: newStatus }).unwrap();
      Swal.fire({
        icon: "success",
        title: `Status: ${newStatus}`,
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to update reservation",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Cancel & Delete Reservation?",
      text: "This reservation booking will be cancelled.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Cancel",
    });

    if (res.isConfirmed) {
      try {
        await deleteReservation(id).unwrap();
        Swal.fire({ icon: "success", title: "Reservation Cancelled", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Table Reservations"
        subtitle="Manage guest reservations, seating schedules, guest party sizes, and table allocations"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Book Reservation
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Upcoming Bookings" value={upcomingCount} icon={CalendarCheck} accentColor="amber" />
        <StatCard title="Seated Right Now" value={seatedCount} icon={Users} accentColor="emerald" />
        <StatCard title="Total Expected Guests" value={totalGuests} icon={Grid3X3} accentColor="slate" />
      </div>

      {/* Date & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded-xl text-xs font-semibold bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: "all", label: "All Statuses" },
            { key: "upcoming", label: "Upcoming" },
            { key: "seated", label: "Seated" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === key
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-card border border-border/60 animate-pulse"
              />
            ))
        ) : reservations.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={CalendarCheck}
              title="No Reservations for this Date"
              description="There are currently no table bookings scheduled for this date filter."
              actionLabel="+ Book Reservation"
              onAction={handleOpenAdd}
            />
          </div>
        ) : (
          reservations.map((res) => {
            const isSeated = res.status === "seated";
            const isUpcoming = res.status === "upcoming" || res.status === "confirmed";

            return (
              <div
                key={res._id}
                className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm flex flex-col justify-between gap-4 hover:border-amber-500/50 transition-all"
              >
                {/* Header: Name, Guests & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">
                      {res.customerName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {res.phone}
                    </p>
                  </div>

                  <StatusBadge status={res.status} type="reservation" />
                </div>

                {/* Booking Info Box */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-accent/40 border border-border/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Time Slot
                    </span>
                    <p className="font-black text-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-amber-600" />
                      {res.time}
                    </p>
                  </div>

                  <div className="border-x border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Party Size
                    </span>
                    <p className="font-black text-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-blue-600" />
                      {res.guests} Guests
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Table
                    </span>
                    <p className="font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                      {res.table ? (res.table as any).name : "Unassigned"}
                    </p>
                  </div>
                </div>

                {res.specialRequests && (
                  <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg italic">
                    Note: "{res.specialRequests}"
                  </p>
                )}

                {/* Quick Status Advancement */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    {isUpcoming ? (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(res, "seated")}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Seat Guests
                      </Button>
                    ) : isSeated ? (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(res, "completed")}
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                      >
                        Complete Dining
                      </Button>
                    ) : null}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(res._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Cancel Booking"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Reservation Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Book Table Reservation
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveReservation} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Name *
              </Label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Phone Number *
                </Label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="rounded-xl mt-1 font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Number of Guests
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reservation Date *
                </Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Time Slot *
                </Label>
                <Input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assign Table (Optional)
              </Label>
              <Select value={tableId} onValueChange={(val) => setTableId(val)}>
                <SelectTrigger className="rounded-xl mt-1 text-xs font-medium">
                  <SelectValue placeholder="Select Table" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {tables.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} ({t.seats} seats • {t.section})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Special Requests / Notes
              </Label>
              <Input
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Window seat, anniversary setup"
                className="rounded-xl mt-1"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {isCreating ? "Saving..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationManagement;
