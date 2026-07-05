import { X, FileSpreadsheet, TrendingUp, DollarSign } from "lucide-react";
import { exportFinancialCSV } from "../../utils/reportExporter";

const ReportModal = ({ isOpen, onClose, history = [], studioName = "Studio" }) => {
  if (!isOpen) return null;

  // Calculate quarterly stats (last 13 weeks represent a quarter)
  const quarterData = history.slice(-13);
  const totalRevenue = quarterData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = quarterData.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-400" /> Export Financial Audit
        </h3>

        <div className="space-y-4 text-slate-300">
          <p className="text-sm text-slate-400">
            Generate and export a full chronological ledger of cash flow transactions, production investments, and marketing expenditures.
          </p>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs uppercase text-slate-500 font-bold tracking-wider">Quarterly Summary (Last 13 Weeks)</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total Income:</span>
              <span className="text-emerald-400 font-bold">₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total Expenses:</span>
              <span className="text-rose-400 font-bold">₹{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-850 pt-2 font-semibold">
              <span className="text-slate-350">Net Margin:</span>
              <span className={totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                ₹{totalProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => exportFinancialCSV(history, studioName)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
          >
            <FileSpreadsheet size={18} /> Export ledger (.CSV)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
