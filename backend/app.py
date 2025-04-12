from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import MovieRecommender
import os

app = Flask(__name__)
CORS(app)

# Initialize recommender
recommender = MovieRecommender()

@app.route('/api/status', methods=['GET'])
def get_status():
    """Check if models are loaded and ready."""
    try:
        # Check if data files exist
        movies_exist = os.path.exists('data/movies.csv')
        ratings_exist = os.path.exists('data/ratings.csv')
        
        if not movies_exist or not ratings_exist:
            return jsonify({
                'status': 'not_ready',
                'error': 'Movie data files not found in data directory'
            }), 400

        # Try to load data if not already loaded
        if recommender.movies_df is None:
            recommender.load_data()
        
        # Try to load models, train if not available
        models_loaded = recommender.load_models()
        if not models_loaded:
            recommender.train_models()
            models_loaded = recommender.load_models()
        
        return jsonify({
            'status': 'ready',
            'models_loaded': models_loaded,
            'data_loaded': True
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/movies', methods=['GET'])
def get_movies():
    """Get all available movies."""
    try:
        if recommender.movies_df is None:
            recommender.load_data()
        movies = recommender.get_all_movies()
        return jsonify({'movies': movies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get movie recommendations for a user."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        user_id = data.get('userId')
        n = data.get('n', 10)
        method = data.get('method', 'hybrid')

        if not user_id:
            return jsonify({'error': 'userId is required'}), 400

        # Ensure data is loaded
        if recommender.movies_df is None:
            recommender.load_data()

        # Get recommendations
        recommendations = []
        movie_scores = recommender.get_recommendations(
            user_id=int(user_id),
            n=int(n),
            method=method
        )
        
        # Format recommendations
        for movie_id, score in movie_scores.items():
            movie_info = recommender.movies_df[recommender.movies_df['movieId'] == movie_id].iloc[0]
            recommendations.append({
                'movieId': int(movie_id),
                'title': movie_info['title'],
                'predicted_rating': round(float(score), 2)
            })

        return jsonify({'recommendations': recommendations})
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Set the working directory to the backend folder
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Try to load existing models and data
    try:
        recommender.load_data()
        if not recommender.load_models():
            print("Training new models...")
            recommender.train_models()
    except Exception as e:
        print(f"Warning: {str(e)}")
        print("Please ensure MovieLens dataset (movies.csv and ratings.csv) is in the data directory.")
    
    app.run(debug=True, port=5000) 