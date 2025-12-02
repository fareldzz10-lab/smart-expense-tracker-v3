import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Calendar,
  Tag,
  FileText,
  Sparkles,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Transaction, TransactionType, SavingsGoal } from "../types";
import { CATEGORIES } from "../constants";
import { parseNaturalLanguageTransaction } from "../services/geminiService";
import { getCurrencySymbol, compressImage } from "../utils";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id">) => Promise<void>;
  onUpdate: (transaction: Transaction) => Promise<void>;
  initialData: Transaction | null;
  prefillData?: Partial<Transaction> | null;
  currency: string;
  locale: string;
  defaultType: TransactionType;
  savingsGoals?: SavingsGoal[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialData,
  prefillData,
  currency,
  locale,
  defaultType,
  savingsGoals = [],
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [linkedGoalId, setLinkedGoalId] = useState("");
  const [attachment, setAttachment] = useState<string>("");

  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setDate(initialData.date.split("T")[0]);
        setDescription(initialData.description || "");
        setLinkedGoalId(initialData.linkedGoalId || "");
        setAttachment(initialData.attachment || "");
      } else if (prefillData) {
        // Duplicate/Prefill Mode
        setType(prefillData.type || defaultType);
        setAmount(prefillData.amount?.toString() || "");
        setCategory(prefillData.category || "");
        setDate(
          prefillData.date
            ? prefillData.date.split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setDescription(prefillData.description || "");
        setLinkedGoalId(prefillData.linkedGoalId || "");
        setAttachment(prefillData.attachment || "");
        setAiInput("");
      } else {
        // Create Mode
        setType(defaultType);
        setAmount("");
        setCategory("");
        setDate(new Date().toISOString().split("T")[0]);
        setDescription("");
        setLinkedGoalId("");
        setAttachment("");
        setAiInput("");
      }
      setErrors({});
    }
  }, [isOpen, initialData, prefillData, defaultType]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
      isValid = false;
    }

    if (!category.trim()) {
      newErrors.category = "Please select or enter a category";
      isValid = false;
    }

    if (!date) {
      newErrors.date = "Date is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const txData = {
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString(),
      description,
      type,
      linkedGoalId: linkedGoalId || undefined,
      attachment: attachment || undefined,
    };

    if (initialData) {
      await onUpdate({ ...initialData, ...txData });
    } else {
      await onSave(txData);
    }
    onClose();
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await parseNaturalLanguageTransaction(aiInput);
      if (result) {
        if (result.amount) {
          setAmount(result.amount.toString());
          setErrors((prev) => ({ ...prev, amount: "" }));
        }
        if (result.category) {
          setCategory(result.category);
          setErrors((prev) => ({ ...prev, category: "" }));
        }
        if (result.description) setDescription(result.description);
        if (result.type) setType(result.type as TransactionType);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setAttachment(compressed);
      } catch (error) {
        console.error("Image processing failed", error);
        setErrors((prev) => ({
          ...prev,
          attachment: "Failed to process image",
        }));
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeAttachment = () => {
    setAttachment("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currencySymbol = getCurrencySymbol(locale, currency);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {initialData
                    ? "Edit Transaction"
                    : prefillData
                    ? "Duplicate Transaction"
                    : "New Transaction"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                {/* AI Input */}
                {!initialData && !prefillData && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-sm" />
                    <div className="relative bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask AI: 'Spent 50k on lunch'..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAiParse()}
                        className="flex-1 bg-transparent px-3 text-sm outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        onClick={handleAiParse}
                        disabled={isAiLoading || !aiInput}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isAiLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Type Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      type === TransactionType.EXPENSE
                        ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <ArrowDownCircle size={18} /> Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      type === TransactionType.INCOME
                        ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <ArrowUpCircle size={18} /> Income
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Amount
                  </label>
                  <div className="relative group">
                    <div
                      className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg transition-colors ${
                        errors.amount
                          ? "text-red-400 top-1/2"
                          : "text-slate-400 group-focus-within:text-indigo-500"
                      }`}
                    >
                      {currencySymbol}
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (errors.amount)
                          setErrors((prev) => ({ ...prev, amount: "" }));
                      }}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-2xl font-bold text-slate-800 dark:text-white outline-none transition-all ${
                        errors.amount
                          ? "border-red-300 dark:border-red-800 focus:ring-2 focus:ring-red-500/50"
                          : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                      }`}
                      placeholder="0"
                      autoFocus={!initialData && !prefillData}
                    />
                  </div>
                  {errors.amount && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium animate-pulse">
                      <AlertCircle size={12} />
                      {errors.amount}
                    </div>
                  )}
                </div>

                {/* Category & Date Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Tag
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                          errors.category ? "text-red-400" : "text-slate-400"
                        }`}
                        size={16}
                      />
                      <input
                        type="text"
                        list="categories"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          if (errors.category)
                            setErrors((prev) => ({ ...prev, category: "" }));
                        }}
                        className={`w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-medium outline-none ${
                          errors.category
                            ? "border-red-300 dark:border-red-800 focus:ring-2 focus:ring-red-500/50"
                            : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                        }`}
                        placeholder="Select..."
                      />
                      <datalist id="categories">
                        {CATEGORIES[type].map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    {errors.category && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-medium">
                        <AlertCircle size={12} />
                        Required
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                          errors.date ? "text-red-400" : "text-slate-400"
                        }`}
                        size={16}
                      />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          if (errors.date)
                            setErrors((prev) => ({ ...prev, date: "" }));
                        }}
                        className={`w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-medium outline-none ${
                          errors.date
                            ? "border-red-300 dark:border-red-800 focus:ring-2 focus:ring-red-500/50"
                            : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                        }`}
                      />
                    </div>
                    {errors.date && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-medium">
                        <AlertCircle size={12} />
                        Required
                      </div>
                    )}
                  </div>
                </div>

                {/* Savings Goal Link (Optional) */}
                {savingsGoals.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Link to Savings Goal (Optional)
                    </label>
                    <div className="relative">
                      <Target
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <select
                        value={linkedGoalId}
                        onChange={(e) => setLinkedGoalId(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                      >
                        <option value="">None</option>
                        {savingsGoals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.name} (Current:{" "}
                            {getCurrencySymbol(locale, currency)}
                            {goal.currentAmount})
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 ml-1">
                      {type === TransactionType.EXPENSE
                        ? "Amount will be ADDED to the selected savings goal."
                        : "Amount will also be ADDED to the savings goal."}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 text-slate-400"
                      size={16}
                    />
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Add notes..."
                    />
                  </div>
                </div>

                {/* Receipt Attachment */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Receipt / Attachment
                  </label>

                  {!attachment ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      {isCompressing ? (
                        <Loader2 className="animate-spin mb-2" size={24} />
                      ) : (
                        <Paperclip className="mb-2" size={24} />
                      )}
                      <span className="text-sm font-medium">
                        {isCompressing
                          ? "Processing Image..."
                          : "Click to attach receipt"}
                      </span>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img
                        src={attachment}
                        alt="Receipt"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={removeAttachment}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white font-medium flex items-center gap-1">
                        <ImageIcon size={12} /> Receipt Attached
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSubmit}
                  disabled={isCompressing}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    type === TransactionType.INCOME
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isCompressing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Check size={20} />
                  )}
                  {initialData ? "Update Transaction" : "Save Transaction"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
