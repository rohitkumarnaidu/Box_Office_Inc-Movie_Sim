/**
 * Exporter utility to download studio financial reports in CSV format.
 *
 * @param {Array} history - Financial history array
 * @param {string} studioName - Name of the studio
 */
export const exportFinancialCSV = (history = [], studioName = "Studio") => {
  if (!history || history.length === 0) {
    alert("No financial records to export.");
    return;
  }

  const headers = ["Year", "Week", "Revenue (₹)", "Expenses (₹)", "Payroll (₹)", "Movie Production (₹)", "Marketing (₹)", "Net Profit (₹)", "Cash Balance (₹)"];
  
  const rows = history.map(item => [
    item.year || 1,
    item.week || 1,
    item.revenue || 0,
    item.expenses || 0,
    item.payroll || 0,
    item.movieCosts || 0,
    item.marketingCosts || 0,
    item.profit || 0,
    item.balance || 0
  ]);

  const csvContent = [
    `# Financial Report for ${studioName}`,
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${studioName.replace(/\s+/g, "_")}_Financial_Report.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
