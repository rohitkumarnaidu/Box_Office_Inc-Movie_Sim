import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy } from "lucide-react";
import { fetchAwards } from "../../features/awards/awardsSlice";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Skeleton } from "../../components/ui/Skeleton";

const TrophyRoom = () => {
  const dispatch = useDispatch();
  const { data: awards, loading, error } = useSelector((state) => state.awards);

  useEffect(() => {
    dispatch(fetchAwards());
  }, [dispatch]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl">
            Failed to load awards: {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <header className="flex items-center gap-3">
          <Trophy className="text-yellow-500 w-10 h-10" />
          <h1 className="text-3xl font-bold text-white">Trophy Room</h1>
        </header>

        {awards.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-12 rounded-2xl text-center">
            <Trophy className="text-gray-600 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl text-gray-400">Your trophy case is empty.</h2>
            <p className="text-gray-500 mt-2">Keep producing blockbuster movies to win awards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {awards.map((award, index) => (
              <div 
                key={index} 
                className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-yellow-500/50 transition-colors"
              >
                <Trophy className="text-yellow-500 w-16 h-16 mb-4" />
                <h3 className="text-xl font-bold text-white mb-1">{award.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{award.category}</p>
                <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                  {award.year}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrophyRoom;
