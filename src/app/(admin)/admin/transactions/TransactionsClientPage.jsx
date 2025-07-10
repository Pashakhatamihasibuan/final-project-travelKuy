"use client";

import { useOptimistic, useTransition, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { updateTransactionStatus } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, RefreshCw, Calendar, User, DollarSign, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal } from "lucide-react";

// ✅ PERBAIKAN: Sesuaikan dengan status yang diterima API
const VALID_API_STATUSES = ["pending", "success", "failed"];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400",
    icon: "⏳",
    variant: "secondary",
  },
  success: {
    label: "Success",
    color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
    icon: "✅",
    variant: "default",
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    icon: "❌",
    variant: "destructive",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    icon: "🚫",
    variant: "outline",
  },
};

// Enhanced Search and Filter Component
function SearchAndFilter({ searchTerm, onSearchChange, dateRange, onDateRangeChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status");

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleExport = () => {
    toast.success("Export functionality will be implemented soon!");
  };

  const handleReset = () => {
    onSearchChange("");
    onDateRangeChange({ from: "", to: "" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Card className="mb-6 border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filters & Search
            </CardTitle>
            <CardDescription className="mt-1">Filter and search through transactions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by user name..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
          </div>
          <Select value={currentStatus || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span>🔄</span>
                  All Statuses
                </div>
              </SelectItem>
              {VALID_API_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <span>{STATUS_CONFIG[status].icon}</span>
                    {STATUS_CONFIG[status].label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={dateRange.from} onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })} className="flex-1" />
            <span className="text-muted-foreground">to</span>
            <Input type="date" value={dateRange.to} onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })} className="flex-1" />
          </div>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ✅ PERBAIKAN: Status Action Dropdown yang lebih baik
function StatusActionDropdown({ transaction, action }) {
  const [isPending, startTransition] = useTransition();

  if (!transaction.status || !VALID_API_STATUSES.includes(transaction.status)) {
    return <div className="text-xs text-red-500 italic min-w-[120px]">Invalid status: {transaction.status}</div>;
  }

  const handleStatusChange = (newStatus) => {
    if (!VALID_API_STATUSES.includes(newStatus)) {
      toast.error(`Status "${newStatus}" tidak didukung oleh sistem`);
      return;
    }

    const formData = new FormData();
    formData.append("newStatus", newStatus);
    startTransition(() => action(formData));
  };

  // Jika status adalah cancelled, tampilkan status saja tanpa dropdown
  if (transaction.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>{STATUS_CONFIG[transaction.status]?.icon}</span>
        <span className="italic">Cannot update</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="h-8 w-full justify-between border border-input hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <span>{STATUS_CONFIG[transaction.status]?.icon}</span>
              <span className="text-sm">{STATUS_CONFIG[transaction.status]?.label}</span>
            </div>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {VALID_API_STATUSES.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              className="flex items-center gap-2 cursor-pointer"
              disabled={status === transaction.status}
            >
              <span>{STATUS_CONFIG[status].icon}</span>
              <span>{STATUS_CONFIG[status].label}</span>
              {status === transaction.status && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

// Enhanced Transaction Stats Component
function TransactionStats({ transactions }) {
  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "pending").length,
    success: transactions.filter((t) => t.status === "success").length,
    failed: transactions.filter((t) => t.status === "failed").length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0),
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
              <span className="text-lg">⏳</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success</p>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400">{stats.success}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
              <span className="text-lg">❌</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">{stats.failed}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ PERBAIKAN: TransactionsTable dengan dropdown action yang lebih baik
function TransactionsTable({ transactions, filteredTransactions }) {
  const router = useRouter();
  const [optimisticTransactions, setOptimisticStatus] = useOptimistic(filteredTransactions, (state, { transactionId, newStatus }) => {
    return state.map((t) => (t.id === transactionId ? { ...t, status: newStatus } : t));
  });

  const handleStatusChangeAction = async (transactionId, formData) => {
    const newStatus = formData.get("newStatus");
    const originalTransaction = filteredTransactions.find((t) => t.id === transactionId);

    if (!VALID_API_STATUSES.includes(newStatus)) {
      toast.error(`Status "${newStatus}" tidak didukung oleh sistem`);
      return;
    }

    setOptimisticStatus({ transactionId, newStatus });

    try {
      const result = await updateTransactionStatus(transactionId, newStatus);

      if (result.success) {
        toast.success(result.message || "Status berhasil diperbarui");
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast.error(result.message || "Gagal memperbarui status");
        setOptimisticStatus({
          transactionId,
          newStatus: originalTransaction?.status || "pending",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Terjadi kesalahan saat memperbarui status");
      setOptimisticStatus({
        transactionId,
        newStatus: originalTransaction?.status || "pending",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold">Transaction Records</CardTitle>
            <CardDescription className="mt-1">
              Showing {filteredTransactions.length} of {transactions.length} total transactions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[250px] px-6 py-3">User</TableHead>
                <TableHead className="w-[150px] text-right px-6 py-3">Amount</TableHead>
                <TableHead className="w-[150px] px-6 py-3">Status</TableHead>
                <TableHead className="w-[200px] px-6 py-3">Date</TableHead>
                <TableHead className="w-[180px] text-center px-6 py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(optimisticTransactions || []).map((trx) => (
                <TableRow key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{trx.userName || "User Not Found"}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[180px]">ID: {trx.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium px-6 py-4">{formatCurrency(trx.totalAmount)}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={STATUS_CONFIG[trx.status]?.variant || "outline"} className={`${STATUS_CONFIG[trx.status]?.color} border`}>
                      <span className="mr-1">{STATUS_CONFIG[trx.status]?.icon}</span>
                      {STATUS_CONFIG[trx.status]?.label || trx.status?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground px-6 py-4">{formatDate(trx.createdAt)}</TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex justify-center">
                      <StatusActionDropdown transaction={trx} action={handleStatusChangeAction.bind(null, trx.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {(!optimisticTransactions || optimisticTransactions.length === 0) && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No transactions found</h3>
            <p className="text-muted-foreground">No transactions match your current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced Pagination Component
function PaginationControls({ currentPage, totalPages, totalItems }) {
  const page = Number(currentPage);
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `/admin/transactions?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * 15 + 1;
  const endItem = Math.min(page * 15, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> transactions
      </div>
      <div className="flex items-center gap-2">
        <Link href={createPageUrl(page - 1)}>
          <Button variant="outline" size="sm" disabled={page <= 1} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
        </Link>
        <div className="flex items-center gap-1">
          {(() => {
            const getPageNumbers = () => {
              const delta = 2;
              const range = [];
              const rangeWithDots = [];

              for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
                range.push(i);
              }

              if (page - delta > 2) {
                rangeWithDots.push(1, "...");
              } else {
                rangeWithDots.push(1);
              }

              rangeWithDots.push(...range);

              if (page + delta < totalPages - 1) {
                rangeWithDots.push("...", totalPages);
              } else if (totalPages > 1) {
                rangeWithDots.push(totalPages);
              }

              return [...new Set(rangeWithDots)];
            };

            return getPageNumbers().map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <span key={`dots-${index}`} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                );
              }

              return (
                <Link key={`page-${pageNum}`} href={createPageUrl(pageNum)}>
                  <Button variant={pageNum === page ? "default" : "outline"} size="sm" className="w-8 h-8">
                    {pageNum}
                  </Button>
                </Link>
              );
            });
          })()}
        </div>
        <Link href={createPageUrl(page + 1)}>
          <Button variant="outline" size="sm" disabled={page >= totalPages} className="gap-1">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function TransactionsClientPage({ initialTransactions, pagination }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const transactions = Array.isArray(initialTransactions) ? initialTransactions : [];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = searchTerm === "" || (transaction.userName && transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDateRange =
      (!dateRange.from || new Date(transaction.createdAt) >= new Date(dateRange.from)) &&
      (!dateRange.to || new Date(transaction.createdAt) <= new Date(dateRange.to));

    return matchesSearch && matchesDateRange;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all transactions</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <TransactionStats transactions={transactions} />
      <SearchAndFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} dateRange={dateRange} onDateRangeChange={setDateRange} />
      <TransactionsTable transactions={transactions} filteredTransactions={filteredTransactions} />
      <PaginationControls currentPage={pagination?.currentPage || 1} totalPages={pagination?.totalPages || 1} totalItems={filteredTransactions.length} />
    </div>
  );
}
