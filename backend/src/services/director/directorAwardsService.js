import { addTalentHistory } from "../simulation/helpers/historyHelper.js";
import { addNotification } from "../simulation/helpers/notificationHelper.js";

const AWARD_GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"];
const WEEKS_PER_YEAR = 52;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toNumber = (value) => Number(value || 0);
const weekToYear = (week = 1) => Math.floor((Number(week || 1) - 1) / WEEKS_PER_YEAR) + 1;

const normalizeMovie = (movie, fallbackIndex = 0) => {
  const criticScore = toNumber(movie.criticScore ?? movie.movieRating ?? movie.quality);
  const audienceScore = toNumber(movie.audienceScore ?? movie.movieRating ?? movie.quality);
  const movieQuality = toNumber(movie.movieQuality ?? movie.quality ?? movie.movieRating ?? ((criticScore + audienceScore) / 2));
  const boxOffice = toNumber(movie.boxOffice);
  const verdict = movie.outcome || movie.verdict || "Unknown";

  return {
    movieId: movie.movieId || movie.id || `${movie.movieName || "movie"}-${movie.releaseWeek || fallbackIndex}`,
    movieTitle: movie.movieTitle || movie.title || movie.movieName || "Untitled Movie",
    year: movie.year || weekToYear(movie.releaseWeek),
    releaseWeek: movie.releaseWeek,
    genre: movie.genre || movie.genres?.[0] || "General",
    movieQuality,
    criticScore,
    audienceScore,
    boxOffice,
    verdict,
  };
};

const getAnnualMovies = (director, awardYear) =>
  (director.careerHistory || [])
    .map(normalizeMovie)
    .filter((movie) => movie.year === awardYear);

const getBoxOfficeScore = (boxOffice) => clamp((toNumber(boxOffice) / 100000000) * 100, 0, 100);

const getGenreSuccessScore = (movie) => {
  if (movie.verdict === "Hit" || movie.verdict === "Blockbuster") {
    return 100;
  }

  if (movie.verdict === "Flop") {
    return 20;
  }

  return clamp((movie.movieQuality + movie.criticScore + movie.audienceScore) / 3, 0, 100);
};

const scoreMovieForAward = (director, movie) => {
  const careerReputation = toNumber(director.reputation);

  return (
    movie.movieQuality * 0.3 +
    movie.criticScore * 0.2 +
    movie.audienceScore * 0.15 +
    getBoxOfficeScore(movie.boxOffice) * 0.15 +
    getGenreSuccessScore(movie) * 0.1 +
    careerReputation * 0.1
  );
};

const getBestMovieCandidate = ({ director, awardYear, genre = null }) => {
  const movies = getAnnualMovies(director, awardYear).filter((movie) => {
    if (!genre) {
      return true;
    }

    return movie.genre === genre;
  });

  if (movies.length === 0) {
    return null;
  }

  return movies
    .map((movie) => ({
      director,
      movie,
      score: scoreMovieForAward(director, movie),
    }))
    .sort((a, b) => b.score - a.score)[0];
};

const getAnnualDirectorScore = (director, awardYear) => {
  const movies = getAnnualMovies(director, awardYear);

  if (movies.length === 0) {
    return null;
  }

  const movieScores = movies.map((movie) => scoreMovieForAward(director, movie));
  const averageMovieScore = movieScores.reduce((sum, score) => sum + score, 0) / movieScores.length;
  const volumeBonus = Math.min(10, movies.length * 2);

  return {
    director,
    movie: movies.sort((a, b) => scoreMovieForAward(director, b) - scoreMovieForAward(director, a))[0],
    score: averageMovieScore + volumeBonus + toNumber(director.reputation) * 0.1,
  };
};

const getLifetimeCandidate = (director, awardYear) => {
  const careerMovies = (director.careerHistory || []).map(normalizeMovie);
  const moviesDirected = toNumber(director.moviesDirected) || careerMovies.length;
  const awards = toNumber(director.awards);
  const reputation = toNumber(director.reputation);
  const age = toNumber(director.age);

  if (moviesDirected < 10 && reputation < 80 && age < 70) {
    return null;
  }

  const averageMovieScore = careerMovies.length
    ? careerMovies.reduce((sum, movie) => sum + scoreMovieForAward(director, movie), 0) / careerMovies.length
    : reputation;

  return {
    director,
    movie: careerMovies.sort((a, b) => scoreMovieForAward(director, b) - scoreMovieForAward(director, a))[0] || {
      movieId: null,
      movieTitle: "Career Achievement",
      year: awardYear,
      genre: "Career",
    },
    score: averageMovieScore + moviesDirected * 1.5 + awards * 5 + reputation * 0.3,
  };
};

const hasAwardForYear = (director, awardName, year) =>
  (director.awardsHistory || []).some(
    (award) => award.awardName === awardName && Number(award.year || weekToYear(award.week)) === year
  );

const buildAward = ({ awardName, category, candidate, awardYear }) => {
  const score = clamp(candidate.score, 0, 100);
  const prestigeValue = Math.round(clamp(5 + (score / 100) * 15, 5, 20));
  const salaryIncreaseRate = clamp(0.1 + (score / 100) * 0.4, 0.1, 0.5);

  return {
    directorId: candidate.director.id,
    awardName,
    category,
    movieId: candidate.movie?.movieId || null,
    movieTitle: candidate.movie?.movieTitle || "Career Achievement",
    year: awardYear,
    prestigeValue,
    salaryIncreaseRate,
    fanIncrease: Math.round(prestigeValue * 1000),
  };
};

const selectTopCandidate = (candidates, awardName, awardYear, minimumScore = 60) =>
  candidates
    .filter(Boolean)
    .filter((candidate) => candidate.score >= minimumScore)
    .filter((candidate) => !hasAwardForYear(candidate.director, awardName, awardYear))
    .sort((a, b) => b.score - a.score)[0] || null;

const collectDirectorEntries = (gameState) => [
  ...(gameState.marketDirectors || []).map((director) => ({ director, pool: "market" })),
  ...(gameState.ownedDirectors || []).map((director) => ({ director, pool: "owned" })),
  ...(gameState.retiredDirectors || []).map((director) => ({ director, pool: "retired" })),
];

const determineDirectorAwards = (gameState, awardYear) => {
  const entries = collectDirectorEntries(gameState).filter(
    ({ director }) => director.status !== "RETIRED" || (director.careerHistory || []).length > 0
  );
  const awards = [];

  const bestDirectorCandidate = selectTopCandidate(
    entries.map(({ director }) => getBestMovieCandidate({ director, awardYear })),
    "Best Director",
    awardYear
  );

  if (bestDirectorCandidate) {
    awards.push(buildAward({ awardName: "Best Director", category: "Overall", candidate: bestDirectorCandidate, awardYear }));
  }

  AWARD_GENRES.forEach((genre) => {
    const awardName = `Best ${genre} Director`;
    const candidate = selectTopCandidate(
      entries.map(({ director }) => getBestMovieCandidate({ director, awardYear, genre })),
      awardName,
      awardYear
    );

    if (candidate) {
      awards.push(buildAward({ awardName, category: genre, candidate, awardYear }));
    }
  });

  const debutCandidate = selectTopCandidate(
    entries
      .map(({ director }) => {
        const careerMovies = director.careerHistory || [];
        const annualCandidate = getBestMovieCandidate({ director, awardYear });

        if (!annualCandidate || careerMovies.length !== 1) {
          return null;
        }

        return {
          ...annualCandidate,
          score: annualCandidate.score + 10,
        };
      }),
    "Best Debut Director",
    awardYear
  );

  if (debutCandidate) {
    awards.push(buildAward({ awardName: "Best Debut Director", category: "Debut", candidate: debutCandidate, awardYear }));
  }

  const directorOfYearCandidate = selectTopCandidate(
    entries.map(({ director }) => getAnnualDirectorScore(director, awardYear)),
    "Director Of The Year",
    awardYear,
    65
  );

  if (directorOfYearCandidate) {
    awards.push(buildAward({ awardName: "Director Of The Year", category: "Annual", candidate: directorOfYearCandidate, awardYear }));
  }

  const lifetimeCandidate = selectTopCandidate(
    entries.map(({ director }) => getLifetimeCandidate(director, awardYear)),
    "Lifetime Achievement Award",
    awardYear,
    75
  );

  if (lifetimeCandidate) {
    awards.push(buildAward({ awardName: "Lifetime Achievement Award", category: "Career", candidate: lifetimeCandidate, awardYear }));
  }

  return awards;
};

const applyDirectorAward = ({ award, studio, gameState }) => {
  const director = collectDirectorEntries(gameState).find(
    ({ director: candidate }) => candidate.id === award.directorId
  )?.director;

  if (!director) {
    return;
  }

  const previousSalary = toNumber(director.salary);
  const nextSalary = Math.round(previousSalary * (1 + award.salaryIncreaseRate));

  director.awards = toNumber(director.awards) + 1;
  addTalentHistory(gameState, director.id, "AWARD", {
    awardName: award.awardName,
    category: award.category,
    movieId: award.movieId,
    movieTitle: award.movieTitle,
    movieName: award.movieTitle,
    year: award.year,
    prestigeValue: award.prestigeValue,
  });

  director.reputation = clamp(toNumber(director.reputation) + award.prestigeValue, 0, 100);
  director.salary = nextSalary;
  director.marketValue = Math.round(toNumber(director.marketValue) + nextSalary * award.salaryIncreaseRate + award.prestigeValue * 100000);
  addTalentHistory(gameState, director.id, "SALARY", {
    week: gameState.currentWeek,
    salary: nextSalary,
    reason: `${award.awardName} Award Increase`,
  });

  if (studio) {
    studio.fans = toNumber(studio.fans) + award.fanIncrease;
  }

  addNotification(gameState, `${director.name} won ${award.awardName}.`);
};

export const processDirectorAwards = (gameState, studio) => {
  const awardYear = weekToYear(gameState.currentWeek);

  if (gameState.currentWeek % WEEKS_PER_YEAR !== 0) {
    return [];
  }

  gameState.directorAwardYearsProcessed = gameState.directorAwardYearsProcessed || [];

  if (gameState.directorAwardYearsProcessed.includes(awardYear)) {
    return [];
  }

  const awards = determineDirectorAwards(gameState, awardYear);

  awards.forEach((award) => applyDirectorAward({ award, studio, gameState }));

  gameState.directorAwardYearsProcessed.push(awardYear);

  return awards;
};
