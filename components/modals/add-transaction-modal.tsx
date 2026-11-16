"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: "expense" | "income"
  onSubmit: (data: any) => Promise<void>
}

export function AddTransactionModal({
  isOpen,
  onClose,
  type,
  onSubmit,
}: AddTransactionModalProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(type === "expense" ? "Food" : "Salary")
  const [merchantOrSource, setMerchantOrSource] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("UPI")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return

    setIsSubmitting(true)
    try {
      if (type === "expense") {
        await onSubmit({
          amount: Number(amount),
          category,
          merchant: merchantOrSource || undefined,
          payment_method: paymentMethod,
          transaction_date: date,
          description: description || undefined,
        })
      } else {
        await onSubmit({
          source: merchantOrSource || "Income Source",
          amount: Number(amount),
          category,
          transaction_date: date,
          description: description || undefined,
          recurring: false,
        })
      }
      onClose()
      setAmount("")
      setMerchantOrSource("")
      setDescription("")
    } catch {
      // toast is handled in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type === "expense" ? "Record New Expense" : "Log Income Receipt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g. 2500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {type === "expense" ? (
                  <>
                    <SelectItem value="Food">Food & Dining</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Rent">Rent & Housing</SelectItem>
                    <SelectItem value="Transportation">Transportation & Fuel</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Investments">Investments</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Investments">Investments</SelectItem>
                    <SelectItem value="Rental">Rental Income</SelectItem>
                    <SelectItem value="Dividends">Dividends</SelectItem>
                    <SelectItem value="Interest">Interest</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="merchant">
              {type === "expense" ? "Merchant / Payee" : "Income Source"}
            </Label>
            <Input
              id="merchant"
              placeholder={type === "expense" ? "e.g. Swiggy, Amazon, Shell" : "e.g. Company Name, Client"}
              value={merchantOrSource}
              onChange={(e) => setMerchantOrSource(e.target.value)}
            />
          </div>

          {type === "expense" && (
            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Notes / Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Weekend dinner with team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !amount}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
