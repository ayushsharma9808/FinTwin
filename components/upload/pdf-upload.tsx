"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, Check, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/format"
import { toast } from "sonner"

interface ImportedTxn {
  id: string
  transaction_date: string
  description: string
  debit: number
  credit: number
  balance: number
  category: string
  selected?: boolean
}

interface PdfUploadProps {
  onDataParsed?: (data: any) => void
  className?: string
}

export function PdfUpload({ onDataParsed, className }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "review" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedTransactions, setParsedTransactions] = useState<ImportedTxn[]>([])
  const [summary, setSummary] = useState<{ totalTransactions: number; totalCredit: number; totalDebit: number } | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadFile = useCallback(
    async (file: File) => {
      setFileName(file.name)
      setUploadState("uploading")
      setProgress(25)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        setProgress(60)
        const res = await fetch("/api/statements/upload", {
          method: "POST",
          body: formData,
        })

        setProgress(100)
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Failed to process bank statement")
        }

        const data = await res.json()
        const txnsWithSelection = data.transactions.map((t: any) => ({
          ...t,
          selected: true,
        }))

        setParsedTransactions(txnsWithSelection)
        setSummary(data.summary)
        setUploadState("review")
        onDataParsed?.(data)
        toast.success(`Extracted ${data.transactions.length} transactions from statement`)
      } catch (err: any) {
        setError(err.message || "Error processing file")
        setUploadState("error")
        toast.error(err.message || "Upload failed")
      }
    },
    [onDataParsed]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUploadFile(file)
    },
    [handleUploadFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUploadFile(file)
    },
    [handleUploadFile]
  )

  const toggleSelectTxn = (id: string) => {
    setParsedTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    )
  }

  const handleApprove = async () => {
    const selected = parsedTransactions.filter((t) => t.selected)
    if (selected.length === 0) {
      toast.error("Please select at least one transaction to approve")
      return
    }

    setIsApproving(true)
    try {
      const res = await fetch("/api/statements/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: selected }),
      })

      if (!res.ok) throw new Error("Approval failed")
      const result = await res.json()

      setUploadState("success")
      toast.success(result.message)
    } catch (err: any) {
      toast.error(err.message || "Failed to approve transactions")
    } finally {
      setIsApproving(false)
    }
  }

  const reset = () => {
    setUploadState("idle")
    setProgress(0)
    setFileName(null)
    setParsedTransactions([])
    setSummary(null)
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className || ""}`}>
      {uploadState === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
          }`}
        >
          <div className="mb-4 rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="text-base font-semibold">Upload Bank Statement</h4>
          <p className="mt-1 text-center text-xs text-muted-foreground max-w-sm">
            Upload PDF or CSV statements from HDFC, ICICI, SBI, Axis or any Indian bank. Financial records will be automatically parsed for approval.
          </p>
          <label className="mt-4 cursor-pointer">
            <Button size="sm" asChild>
              <span>
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </span>
            </Button>
          </label>
        </div>
      )}

      {uploadState === "uploading" && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <h4 className="font-semibold text-sm">Extracting Statement Transactions</h4>
          <p className="text-xs text-muted-foreground mt-1">Analyzing {fileName} with secure OCR/parser...</p>
          <div className="mt-4 w-64 rounded-full bg-muted h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadState === "review" && (
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-base">Review & Approve Records</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Statement: <span className="font-medium text-foreground">{fileName}</span> ({parsedTransactions.length} records extracted)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={reset}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleApprove} disabled={isApproving}>
                {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
                Approve & Add to Ledger
              </Button>
            </div>
          </div>

          {summary && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-muted/40 p-3">
                <span className="text-xs text-muted-foreground">Total Inflows</span>
                <p className="text-base font-bold text-green-500">+{formatINR(summary.totalCredit)}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <span className="text-xs text-muted-foreground">Total Outflows</span>
                <p className="text-base font-bold text-red-500">-{formatINR(summary.totalDebit)}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <span className="text-xs text-muted-foreground">Selected for Ledger</span>
                <p className="text-base font-bold text-foreground">
                  {parsedTransactions.filter((t) => t.selected).length} / {parsedTransactions.length}
                </p>
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr>
                  <th className="p-2.5 text-left w-10">Select</th>
                  <th className="p-2.5 text-left">Date</th>
                  <th className="p-2.5 text-left">Description</th>
                  <th className="p-2.5 text-left">Category</th>
                  <th className="p-2.5 text-right">Debit</th>
                  <th className="p-2.5 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parsedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="p-2.5">
                      <input
                        type="checkbox"
                        checked={t.selected}
                        onChange={() => toggleSelectTxn(t.id)}
                        className="rounded border-border text-primary cursor-pointer"
                      />
                    </td>
                    <td className="p-2.5 text-muted-foreground whitespace-nowrap">{t.transaction_date}</td>
                    <td className="p-2.5 font-medium">{t.description}</td>
                    <td className="p-2.5">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-2.5 text-right text-red-500 font-mono">
                      {t.debit > 0 ? `-${formatINR(t.debit)}` : "—"}
                    </td>
                    <td className="p-2.5 text-right text-green-500 font-mono">
                      {t.credit > 0 ? `+${formatINR(t.credit)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {uploadState === "success" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 rounded-full bg-green-500/10 p-3 text-green-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="font-semibold text-base">Transactions Added to Ledger!</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Your statement has been securely processed and reconciled with your financial digital twin.
          </p>
          <Button size="sm" variant="outline" onClick={reset} className="mt-4">
            Upload Another Statement
          </Button>
        </div>
      )}

      {uploadState === "error" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 rounded-full bg-red-500/10 p-3 text-red-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="font-semibold text-base">Upload Failed</h4>
          <p className="mt-1 text-xs text-red-500 max-w-sm">{error}</p>
          <Button size="sm" variant="outline" onClick={reset} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
