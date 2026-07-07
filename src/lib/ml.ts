import { Movie } from "../types";

/**
 * Tokenize a text string into an array of clean words.
 * This includes lowercasing, removing punctuation, and filtering out common English stop words.
 */
export function tokenize(text: string): string[] {
  const stopWords = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
    "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
    "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
    "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves"
  ]);

  // Lowercase, remove non-alphanumeric chars (except spaces), split by space
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
}

/**
 * Creates combined tags for a movie.
 * Features combined: Overview, Genres, Keywords, Cast Names, and Director.
 */
export function createMovieTags(movie: Movie): string {
  const genresStr = movie.genres.join(" ");
  const keywordsStr = movie.keywords.join(" ");
  const castStr = movie.cast.map(c => c.name.replace(/\s+/g, "")).join(" "); // combine first/last name to keep as single token
  const directorStr = movie.director.replace(/\s+/g, "");

  return `${movie.overview} ${genresStr} ${keywordsStr} ${castStr} ${directorStr} ${movie.tagline || ""}`;
}

/**
 * High-performance client-side Content-Based Recommender Engine using TF-IDF and Cosine Similarity.
 */
export class MovieRecommender {
  private movies: Movie[];
  private vocabulary: string[] = [];
  private idf: { [word: string]: number } = {};
  private tfidfVectors: number[][] = [];

  constructor(movies: Movie[]) {
    this.movies = movies;
    this.train();
  }

  /**
   * Train the TF-IDF vectorizer and calculate the movie similarity profiles.
   */
  private train() {
    const totalDocs = this.movies.length;
    const documentTokens: string[][] = [];
    const wordDocCounts: { [word: string]: number } = {};

    // 1. Process all documents and tokenize them
    for (const movie of this.movies) {
      const tags = createMovieTags(movie);
      const tokens = tokenize(tags);
      documentTokens.push(tokens);

      const uniqueTokensInDoc = new Set(tokens);
      for (const token of uniqueTokensInDoc) {
        wordDocCounts[token] = (wordDocCounts[token] || 0) + 1;
      }
    }

    // 2. Build vocabulary of unique terms that appear in at least one document
    this.vocabulary = Object.keys(wordDocCounts);

    // 3. Compute IDF for each term: log(1 + totalDocs / docCount)
    for (const word of this.vocabulary) {
      this.idf[word] = Math.log(1 + totalDocs / wordDocCounts[word]);
    }

    // 4. Compute TF-IDF vectors for each movie
    this.tfidfVectors = documentTokens.map(tokens => {
      // Count term occurrences in this document
      const termCounts: { [word: string]: number } = {};
      for (const token of tokens) {
        termCounts[token] = (termCounts[token] || 0) + 1;
      }

      // Build vector aligned with our vocabulary
      const vector = new Array(this.vocabulary.length).fill(0);
      const totalTerms = tokens.length;

      if (totalTerms > 0) {
        for (let i = 0; i < this.vocabulary.length; i++) {
          const word = this.vocabulary[i];
          if (termCounts[word]) {
            const tf = termCounts[word] / totalTerms;
            const idf = this.idf[word];
            vector[i] = tf * idf;
          }
        }
      }

      return vector;
    });
  }

  /**
   * Compute Cosine Similarity between two numerical vectors.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get top N recommended movies based on similarity to a given movie ID.
   */
  public getRecommendations(movieId: string, limit = 10): { movie: Movie; score: number }[] {
    const targetIdx = this.movies.findIndex(m => m.id === movieId);
    if (targetIdx === -1) {
      return [];
    }

    const targetVector = this.tfidfVectors[targetIdx];
    const similarities: { movie: Movie; score: number }[] = [];

    for (let i = 0; i < this.movies.length; i++) {
      // Don't recommend the movie itself
      if (i === targetIdx) continue;

      const simScore = this.cosineSimilarity(targetVector, this.tfidfVectors[i]);
      similarities.push({
        movie: this.movies[i],
        score: simScore
      });
    }

    // Sort by score descending and return top limit
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
