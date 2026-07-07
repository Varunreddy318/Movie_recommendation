# CineMatch - Machine Learning Movie Recommender & AI Advisor

Welcome to **CineMatch**, a production-ready, full-stack Movie Recommendation Website powered by a content-based machine learning engine and an interactive Gemini AI movie chatbot. 

This repository contains both a high-performance **live React + Node.js (Express)** full-stack application and a fully configured **Python + Flask** machine learning codebase, making it ready for instant local execution or free cloud deployments on Render.

---

## 🚀 Key Features

*   **Premium Netflix-Inspired UI**: Animated movie cards, responsive sliding carousels, backdrop spotlights, glassmorphism overlays, and a responsive layout with smooth transitions.
*   **Live Autocomplete Search**: Search while typing with instant poster and rating dropdowns.
*   **Machine Learning Recommendation Engine**: Suggests top 10 similar movies using a customized Content-Based Filtering algorithm (TF-IDF vectorizer + Cosine Similarity).
*   **Interactive AI Chatbot**: Chat with an intelligent cinephile assistant powered by Google Gemini 3.5 Flash to get smart movie advice, compare plots, or ask questions about movie lists.
*   **Favorites & Watchlist**: Save your preferred movies using persistent `localStorage`.
*   **Recently Viewed Tracker**: Keeps a local view history to track your exploration journey.
*   **Dynamic Filtering**: Instantly filter movies by genre, release year, language, or minimum critic rating.
*   **Graceful TMDB Integration**: Integrates directly with the official TMDB API if a `TMDB_API_KEY` is provided; otherwise, falls back gracefully to a high-fidelity pre-compiled dataset.

---

## 🛠️ Project Directory Structure

```text
Movie-Recommendation/
│
├── dataset/                  # Machine learning training datasets
│   ├── tmdb_5000_movies.csv  # Raw movie attributes (Genres, Budget, Release Date, etc.)
│   └── tmdb_5000_credits.csv # Credits data (Cast, Crew, Director)
│
├── models/                   # Pickled trained ML models (Python)
│   ├── similarity.pkl        # Cosine Similarity Matrix
│   └── movies.pkl            # Preprocessed movies DataFrame
│
├── static/                   # Flask frontend assets (CSS, JS, Images)
├── templates/                # Flask HTML templates
│   ├── index.html            # Main dashboard & Search page
│   ├── movie.html            # Deep detail view
│   └── recommendations.html  # Recommendations page
│
├── src/                      # React Frontend Source (Live Web App)
│   ├── components/           # Modular visual components
│   ├── data/                 # Rich movies seed dataset
│   ├── lib/                  # TypeScript TF-IDF and Similarity Engine
│   └── App.tsx               # Main React dashboard layout
│
├── recommendation.py         # Preprocessing, Feature Engineering & ML training script (Python)
├── app.py                    # Flask Web Server & API route endpoints (Python)
├── server.ts                 # Express Web Server & API routes (TypeScript)
├── requirements.txt          # Python dependencies list
├── Procfile                  # Production start command for cloud providers (Python)
├── runtime.txt               # Specifying Python environment version
├── package.json              # Node dependencies & full-stack build scripts
└── README.md                 # Project architecture & user manual
```

---

## 🧠 Machine Learning Explanation

### 1. Why Content-Based Filtering?
Unlike Collaborative Filtering (which requires rich user ratings histories and suffers from the "cold start" problem for new users and new items), **Content-Based Filtering** analyzes the attributes (or *content*) of a movie to recommend other items. By extracting metadata such as overviews, taglines, genres, keywords, cast, and directors, we can recommend highly accurate matches instantly without relying on active user traffic.

### 2. Preprocessing & Feature Engineering
We combine individual textual features into a consolidated block of **"Tags"** for each movie.
*   **Text Cleaning**: We convert all overviews and taglines to lowercase and remove punctuation.
*   **Token Merging**: To avoid conflicts where parts of names look similar (e.g., "Chris Evans" vs. "Chris Pratt"), we remove whitespace from actor and director names (e.g., `chrisevans`, `chrispratt`, `christophernolan`).
*   **Consolidated Tags**: Formulated as:
    $$\text{Tags} = \text{Overview} + \text{Tagline} + \text{Genres} + \text{Keywords} + \text{Cast} + \text{Director}$$

### 3. TF-IDF Vectorization
**TF-IDF** (Term Frequency-Inverse Document Frequency) transforms the unstructured text tags into a structured, numerical matrix:
*   **Term Frequency ($TF$)**: Measures how frequently a term appears in a movie's tags.
    $$TF(t, d) = \frac{\text{Count of term } t \text{ in movie } d}{\text{Total terms in movie } d}$$
*   **Inverse Document Frequency ($IDF$)**: Measures how rare/informative a term is across all movies. It penalizes generic words that appear everywhere (e.g., "the", "movie", "story").
    $$IDF(t) = \log\left(1 + \frac{N}{DF(t)}\right)$$
*   **TF-IDF Weight**: 
    $$W(t, d) = TF(t, d) \times IDF(t)$$

We limit our vocabulary to the top 5,000 most predictive features using `scikit-learn`'s `TfidfVectorizer`.

### 4. Cosine Similarity
To find similar movies, we calculate the cosine of the angle between their respective TF-IDF vectors.
$$\text{Similarity}(A, B) = \cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$
*   A value of **1.0** indicates that the two movies are highly identical in content, themes, or casting.
*   A value of **0.0** indicates completely unrelated content profiles.

### 5. Complexity, Advantages & Limitations
*   **Time Complexity**: Computing similarity is $O(M^2 \times N)$ where $M$ is the number of movies and $N$ is the vocabulary size. Lookups are extremely fast: $O(M \log M)$ to sort recommendations.
*   **Advantages**: No Cold-Start problem, highly explainable, recommends niche movies.
*   **Limitations**: High specialization (rarely suggests completely unexpected genres/discovers outside of the user's active theme), relies on high-quality metadata.

---

## 💻 Local Installation & Setup

### Option A: Running the React + Node.js (Live App)
This runs the high-fidelity live website with Express, React, and Vite.
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure environment variables**:
    Create a `.env` file from the example:
    ```bash
    cp .env.example .env
    ```
    Add your `GEMINI_API_KEY` (highly recommended for AI Chatbot) and optional `TMDB_API_KEY`.
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Build and Compile for Production**:
    ```bash
    npm run build
    npm run start
    ```

### Option B: Running the Python Flask Application
This runs the standalone Python Flask server with scikit-learn models.
1.  **Install Python requirements**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Train the Machine Learning Models**:
    Run the preprocessing pipeline to generate the pickled files:
    ```bash
    python recommendation.py
    ```
3.  **Launch the Flask Application**:
    ```bash
    python app.py
    ```
    Open `http://localhost:5000` in your web browser.

---

## ☁️ Deployment Guide

### Deploying the Python Flask App on Render (Free)
1.  **Push to GitHub**:
    Initialize a git repository and push your project to a public or private GitHub repository.
2.  **Log in to Render**:
    Navigate to [Render](https://render.com) and click **New > Web Service**.
3.  **Connect GitHub Repo**:
    Select your repository from the list.
4.  **Configure Settings**:
    *   **Runtime**: `Python`
    *   **Build Command**: `pip install -r requirements.txt && python recommendation.py`
    *   **Start Command**: `gunicorn app:app`
    *   **Plan**: `Free`
5.  **Environment Variables**:
    Add the following variables in the **Environment** tab:
    *   `FLASK_SECRET_KEY` = `your_custom_secret_key`
    *   `GEMINI_API_KEY` = `your_gemini_api_key`
    *   `TMDB_API_KEY` = `your_tmdb_api_key_optional`
6.  **Deploy**: Click **Deploy Web Service** and your recommender is online!
