import os
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
import pickle

class MovieRecommender:
    def __init__(self):
        self.movies_df = None
        self.ratings_df = None
        self.user_movie_matrix = None
        self.knn_model = None
        self.svd_model = None
        self.scaler = StandardScaler()

    def load_data(self, movies_path='data/movies.csv', ratings_path='data/ratings.csv'):
        """Load MovieLens dataset."""
        self.movies_df = pd.read_csv(movies_path)
        self.ratings_df = pd.read_csv(ratings_path)
        
        # Create user-movie matrix
        self.user_movie_matrix = self.ratings_df.pivot(
            index='userId', 
            columns='movieId', 
            values='rating'
        ).fillna(0)

    def train_models(self):
        """Train KNN and SVD models."""
        # Scale the data
        scaled_data = self.scaler.fit_transform(self.user_movie_matrix)
        
        # Train KNN model
        self.knn_model = NearestNeighbors(
            n_neighbors=10,
            metric='cosine',
            algorithm='brute'
        )
        self.knn_model.fit(scaled_data)

        # Train SVD model
        self.svd_model = TruncatedSVD(n_components=100, random_state=42)
        self.svd_model.fit(scaled_data)
        
        # Save models
        self._save_models()

    def _save_models(self):
        """Save trained models."""
        os.makedirs('model', exist_ok=True)
        with open('model/knn_model.pkl', 'wb') as f:
            pickle.dump(self.knn_model, f)
        with open('model/svd_model.pkl', 'wb') as f:
            pickle.dump(self.svd_model, f)
        with open('model/scaler.pkl', 'wb') as f:
            pickle.dump(self.scaler, f)

    def load_models(self):
        """Load trained models."""
        try:
            with open('model/knn_model.pkl', 'rb') as f:
                self.knn_model = pickle.load(f)
            with open('model/svd_model.pkl', 'rb') as f:
                self.svd_model = pickle.load(f)
            with open('model/scaler.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
            return True
        except:
            return False

    def get_recommendations(self, user_id, n=10, method='hybrid'):
        """Get movie recommendations for a user."""
        if method not in ['knn', 'svd', 'hybrid']:
            raise ValueError("Method must be one of: 'knn', 'svd', 'hybrid'")

        if user_id not in self.user_movie_matrix.index:
            raise ValueError("User ID not found in the dataset")

        user_ratings = self.user_movie_matrix.loc[user_id].values.reshape(1, -1)
        user_ratings_scaled = self.scaler.transform(user_ratings)
        
        # Get recommendations based on method
        if method == 'knn':
            recommendations = self._get_knn_recommendations(user_ratings_scaled, n)
        elif method == 'svd':
            recommendations = self._get_svd_recommendations(user_ratings_scaled, n)
        else:  # hybrid
            knn_recs = self._get_knn_recommendations(user_ratings_scaled, n)
            svd_recs = self._get_svd_recommendations(user_ratings_scaled, n)
            recommendations = self._combine_recommendations(knn_recs, svd_recs, n)

        return recommendations

    def _get_knn_recommendations(self, user_ratings_scaled, n):
        """Get recommendations using KNN."""
        distances, indices = self.knn_model.kneighbors(user_ratings_scaled)
        similar_users = indices[0]
        
        # Get movies that similar users rated highly
        similar_user_ratings = self.user_movie_matrix.iloc[similar_users]
        movie_scores = similar_user_ratings.mean()
        
        # Filter out movies the user has already rated
        user_movies = self.user_movie_matrix.columns[user_ratings_scaled[0] > 0]
        movie_scores = movie_scores.drop(user_movies)
        
        return self._get_top_movies(movie_scores, n)

    def _get_svd_recommendations(self, user_ratings_scaled, n):
        """Get recommendations using SVD."""
        user_embedding = self.svd_model.transform(user_ratings_scaled)
        predicted_ratings = self.svd_model.inverse_transform(user_embedding)
        predicted_ratings = pd.Series(
            predicted_ratings[0], 
            index=self.user_movie_matrix.columns
        )
        
        # Filter out movies the user has already rated
        user_movies = self.user_movie_matrix.columns[user_ratings_scaled[0] > 0]
        predicted_ratings = predicted_ratings.drop(user_movies)
        
        return self._get_top_movies(predicted_ratings, n)

    def _combine_recommendations(self, knn_recs, svd_recs, n):
        """Combine KNN and SVD recommendations."""
        # Combine and average scores for movies that appear in both
        combined_scores = {}
        
        for movie in set(knn_recs.keys()) | set(svd_recs.keys()):
            knn_score = knn_recs.get(movie, 0)
            svd_score = svd_recs.get(movie, 0)
            combined_scores[movie] = (knn_score + svd_score) / 2
        
        return dict(sorted(
            combined_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:n])

    def _get_top_movies(self, scores, n):
        """Get top N movies with their scores."""
        top_movies = scores.nlargest(n)
        return dict(top_movies)

    def get_all_movies(self):
        """Return all movies in the dataset."""
        return self.movies_df[['movieId', 'title']].to_dict('records') 