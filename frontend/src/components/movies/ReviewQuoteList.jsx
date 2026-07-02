import { MessageSquare, Star } from "lucide-react";

const ReviewQuoteList = ({ quotes = [] }) => {
  if (quotes.length === 0) return <div className="text-slate-500 text-sm">No critic reviews available for this film.</div>;

  return (
    <div className="space-y-4">
      {quotes.map((q, idx) => (
        <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-850 hover:border-slate-800 transition space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-bold text-sm">{q.outlet}</p>
              <p className="text-xs text-slate-500">By {q.author}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg text-xs font-bold">
              <Star size={12} fill="currentColor" /> {q.score}/100
            </div>
          </div>
          <p className="text-sm text-slate-300 italic leading-relaxed">{q.quote}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewQuoteList;
