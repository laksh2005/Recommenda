# Reccomenda - Movie Recommendation System

A movie recommendation system using collaborative filtering techniques (KNN and SVD) built with the MovieLens dataset.

## Features
- Collaborative filtering using KNN and SVD algorithms
- Movie recommendations based on user preferences
- Simple web interface for interacting with the recommendation system
- RESTful API endpoints for getting movie recommendations

## Setup
1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Download the dataset and place it in `backend/data/`
4. Run the Flask backend:
   ```
   cd backend
   python app.py
   ```
5. Open `frontend/index.html` in your browser

## Project Structure
```
cinesuggest/
├── backend/
│   ├── app.py           # Flask application
│   ├── recommender.py   # Recommendation logic
│   ├── model/          # Serialized models
│   └── data/           #  dataset
├── frontend/
│   ├── index.html      # Web interface
│   ├── style.css       # Styling
│   └── script.js       # Frontend logic
└── requirements.txt    # Python dependencies
```

## API Endpoints
- `GET /api/movies`: Get list of available movies
- `POST /api/recommendations`: Get movie recommendations for a user

## Technologies Used
- Backend: Python, Flask, scikit-surprise
- Frontend: HTML, CSS, JavaScript
- Data: MovieLens dataset 