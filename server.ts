import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { popularMovies } from "./src/data/movies";
import { MovieRecommender } from "./src/lib/ml";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Machine Learning Recommender Engine with our movie dataset
const recommender = new MovieRecommender(popularMovies);

// Initialize Gemini Client
const geminiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Chatbot will run in fallback smart-simulated response mode.");
}

// Helper to check if a TMDB key is available and query it
const tmdbKey = process.env.TMDB_API_KEY;

/**
 * Endpoint: /api/movies
 * Returns list of movies with optional filtering by genre, year, language, rating, and pagination
 */
app.get("/api/movies", (req, res) => {
  try {
    let results = [...popularMovies];
    const { genre, year, language, minRating, q } = req.query;

    // Filter by text search query
    if (q) {
      const searchStr = String(q).toLowerCase();
      results = results.filter(m => 
        m.title.toLowerCase().includes(searchStr) || 
        m.overview.toLowerCase().includes(searchStr) ||
        m.genres.some(g => g.toLowerCase().includes(searchStr))
      );
    }

    // Filter by genre
    if (genre) {
      const targetGenre = String(genre).toLowerCase();
      results = results.filter(m => m.genres.some(g => g.toLowerCase() === targetGenre));
    }

    // Filter by year
    if (year) {
      const targetYear = String(year);
      results = results.filter(m => m.releaseDate.startsWith(targetYear));
    }

    // Filter by language
    if (language) {
      const targetLang = String(language).toLowerCase();
      results = results.filter(m => m.language.toLowerCase() === targetLang);
    }

    // Filter by minimum rating
    if (minRating) {
      const ratingLimit = parseFloat(String(minRating));
      if (!isNaN(ratingLimit)) {
        results = results.filter(m => m.voteAverage >= ratingLimit);
      }
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch movies", details: error.message });
  }
});

/**
 * Endpoint: /api/search (Autocomplete search suggestion API)
 * Returns brief items (id, title, genres, posterPath, releaseDate) for dropdown
 */
app.get("/api/search", (req, res) => {
  try {
    const query = String(req.query.q || "").toLowerCase().trim();
    if (!query) {
      return res.json([]);
    }

    const suggestions = popularMovies
      .filter(m => m.title.toLowerCase().includes(query))
      .slice(0, 8)
      .map(m => ({
        id: m.id,
        title: m.title,
        genres: m.genres,
        posterPath: m.posterPath,
        releaseDate: m.releaseDate,
        voteAverage: m.voteAverage
      }));

    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: "Autocomplete search failed", details: error.message });
  }
});

/**
 * Endpoint: /api/movie/:id
 * Returns a detailed single movie. Integrates TMDB API key if present.
 */
app.get("/api/movie/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const movie = popularMovies.find(m => m.id === id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found in internal TMDB seed dataset." });
    }

    // If TMDB_API_KEY is available, we could fetch live reviews or cast updates
    let reviews = [
      { author: "CinematicWhiz", content: `Absolutely phenomenal! ${movie.title} is an absolute masterpiece of direction, editing, and storytelling. It stays with you long after the credits roll.`, rating: 9, createdAt: "2026-02-14" },
      { author: "Reviewer_42", content: `Solid film. Great acting, but the pacing felt slightly slow in the second act. Overall worth watching!`, rating: 8, createdAt: "2026-03-01" }
    ];

    if (tmdbKey && tmdbKey.trim() !== "") {
      try {
        const tmdbUrl = `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${tmdbKey}&language=en-US`;
        const tmdbRes = await fetch(tmdbUrl);
        if (tmdbRes.ok) {
          const data = await tmdbRes.json();
          if (data.results && data.results.length > 0) {
            reviews = data.results.slice(0, 5).map((r: any) => ({
              author: r.author,
              content: r.content,
              rating: r.author_details?.rating || undefined,
              createdAt: r.created_at?.split("T")[0] || ""
            }));
          }
        }
      } catch (err) {
        console.warn("Could not fetch live TMDB reviews, using high-fidelity pre-compiled fallbacks.", err);
      }
    }

    res.json({
      ...movie,
      reviews
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch movie details", details: error.message });
  }
});

/**
 * Endpoint: /api/recommend (ML Recommendation API)
 * Query params: id=... or title=...
 */
app.get("/api/recommend", (req, res) => {
  try {
    const id = req.query.id as string;
    const title = req.query.title as string;

    let targetMovie = popularMovies.find(m => m.id === id);
    if (!targetMovie && title) {
      targetMovie = popularMovies.find(m => m.title.toLowerCase() === title.toLowerCase());
    }

    if (!targetMovie) {
      return res.status(404).json({ error: "Target movie not found to generate recommendations." });
    }

    const recommendations = recommender.getRecommendations(targetMovie.id, 10);
    res.json({
      movie: targetMovie,
      recommendations: recommendations.map(r => ({
        ...r.movie,
        similarityScore: r.score
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: "Recommendation compilation failed", details: error.message });
  }
});

/**
 * Endpoint: /api/chatbot
 * Intelligent movie recommendation and cinephile chatbot powered by Gemini 3.5 Flash!
 */
app.post("/api/chatbot", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Empty message text provided." });
    }

    // Check if we can use Gemini Client, otherwise fallback gracefully
    if (ai) {
      try {
        const systemInstruction = `You are a Senior Movie Advisor and ML Cinephile Expert chatbot.
You are helping users discover great movies using both your general knowledge and the application's pre-compiled dataset of top 50 popular movies.
The app's dataset currently includes:
${popularMovies.map(m => `- ${m.title} (${m.genres.join(", ")}) - Dir: ${m.director}`).join("\n")}

Respond to user questions, recommend movies, compare plots, explain machine learning algorithms (like Content-Based Filtering, Cosine Similarity, TF-IDF), or tell movie jokes.
If recommending a movie from our list, highlight it so the user can easily find it. Keep your tone engaging, cinematic, informative, and expert. Keep responses under 300 words.`;

        // Map ChatHistory to the required Gemini Content structure
        const contents: any[] = [];
        if (chatHistory && Array.isArray(chatHistory)) {
          chatHistory.forEach((msg: any) => {
            contents.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          });
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        const reply = response.text || "I was unable to formulate a response at this time.";
        return res.json({ reply });
      } catch (geminiErr: any) {
        console.error("Gemini invocation failed, falling back to smart rules.", geminiErr);
      }
    }

    // Fallback static smart response system if Gemini API is not configured or fails
    const cleanedMsg = message.toLowerCase();
    let reply = "Hello! I am your AI Movie Advisor. Let's talk about movies! You can ask me for recommendations, explain how Cosine Similarity works, or talk about popular directors.";

    if (cleanedMsg.includes("recommend") || cleanedMsg.includes("suggest") || cleanedMsg.includes("watch")) {
      const randomMovies = [...popularMovies].sort(() => 0.5 - Math.random()).slice(0, 3);
      reply = `I highly recommend looking at these exceptional films from our collection:
1. **${randomMovies[0].title}** (${randomMovies[0].genres.join(", ")}) - "${randomMovies[0].tagline}"
2. **${randomMovies[1].title}** (${randomMovies[1].genres.join(", ")}) - Directed by ${randomMovies[1].director}
3. **${randomMovies[2].title}** (${randomMovies[2].genres.join(", ")}) - Over ${randomMovies[2].voteCount} votes!

Which genre or mood are you in right now so I can narrow this down?`;
    } else if (cleanedMsg.includes("cosine") || cleanedMsg.includes("similarity") || cleanedMsg.includes("tf-idf") || cleanedMsg.includes("ml") || cleanedMsg.includes("algorithm") || cleanedMsg.includes("machine learning")) {
      reply = `Our movie engine uses a state-of-the-art **Content-Based Filtering** algorithm:
1. **Feature Engineering**: We combine the title, description, genres, keywords, director, and actors into a rich text block (tags) for each movie.
2. **TF-IDF Vectorization**: Term Frequency-Inverse Document Frequency turns the text into numerical vectors, assigning higher weights to unique, descriptive words.
3. **Cosine Similarity**: We calculate the angle between movie vectors. A value of 1 means perfectly identical content, while 0 means completely different.

This allows us to suggest movies with similar themes and directors instantly without needing any user ratings!`;
    } else if (cleanedMsg.includes("nolan") || cleanedMsg.includes("inception") || cleanedMsg.includes("interstellar")) {
      reply = "Christopher Nolan is a master of non-linear story structure and high-concept ideas. In our system, we have *Inception*, *The Dark Knight*, and *Interstellar*. These will heavily recommend each other due to matching themes of time-dilation, subconscious reality, and director similarities!";
    } else if (cleanedMsg.includes("scifi") || cleanedMsg.includes("science fiction") || cleanedMsg.includes("space")) {
      reply = "If you love Sci-Fi, check out *Interstellar*, *Inception*, *The Matrix*, *Blade Runner 2049*, *Avatar*, or *Dune*. They have stunning visual designs and deep philosophical themes.";
    }

    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: "Chatbot engine error", details: error.message });
  }
});

// Setup Vite Dev Server / Static Files Serving based on Environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite Dev Server Middleware.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Movie Recommendation Server is active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
