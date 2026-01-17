"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/format"

interface ParsedData {
  accountType: string
  transactions: number
  totalIncome: number
  totalExpenses: number
  period: string
}

interface PdfUploadProps {
  onDataParsed?: (data: ParsedData) => void
  className?: string
}

export function PdfUpload({ onDataParsed, className }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const simulateUpload = useCallback(
    async (file: File) => {
      setFileName(file.name)
      setUploadState("uploading")
      setProgress(0)
      setError(null)

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100))
        setProgress(i)
      }

      setUploadState("parsing")

      // Simulate parsing delay
      await new Promise((r) => setTimeout(r, 1500))

      // Mock parsed data
      const mockData: ParsedData = {
        accountType: "HDFC Bank Statement",
        transactions: 147,
        totalIncome: 285000,
        totalExpenses: 142500,
        period: "Dec 2025 - Jan 2026",
      }

      setParsedData(mockData)
      setUploadState("success")
      onDataParsed?.(mockData)
    },
    [onDataParsed],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type === "application/pdf") {
        simulateUpload(file)
      } else {
        setError("Please upload a PDF file only")
        setUploadState("error")
      }
    },
    [simulateUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === "application/pdf") {
        simulateUpload(file)
      } else {
        setError("Please upload a PDF file only")
        setUploadState("error")
      }
    },
    [simulateUpload],
  )

  const reset = () => {
    setUploadState("idle")
    setProgress(0)
    setFileName(null)
    setParsedData(null)
    setError(null)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence mode="wait">
        {uploadState === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50",
            )}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">Drop your bank statement PDF here</p>
            <p className="mt-1 text-xs text-muted-foreground">or click to browse (PDF only)</p>
          </motion.div>
        )}

        {(uploadState === "uploading" || uploadState === "parsing") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {uploadState === "uploading" ? "Uploading..." : "Parsing data..."}
                </p>
              </div>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: uploadState === "parsing" ? "100%" : `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {uploadState === "success" && parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-2/20 p-2">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-chart-2">Successfully parsed</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Account Type</p>
                <p className="mt-1 text-sm font-medium">{parsedData.accountType}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="mt-1 text-sm font-medium">{parsedData.period}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="mt-1 text-sm font-medium text-chart-2">+{formatINR(parsedData.totalIncome)}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="mt-1 text-sm font-medium text-chart-5">-{formatINR(parsedData.totalExpenses)}</p>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {parsedData.transactions} transactions detected
            </p>
          </motion.div>
        )}

        {uploadState === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-destructive/50 bg-destructive/10 p-6"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Upload failed</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                Try again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
