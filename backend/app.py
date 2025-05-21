from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from recommender import MovieRecommender
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# Initialize recommender
recommender = MovieRecommender()

@app.route('/')
def serve_index():
    """Serve the frontend index.html file."""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/status', methods=['GET'])
def get_status():
    """Check if models are loaded and ready."""
    try:
        movies_exist = os.path.exists(os.path.join(DATA_DIR, 'movies.csv'))
        ratings_exist = os.path.exists(os.path.join(DATA_DIR, 'ratings.csv'))

        if not movies_exist or not ratings_exist:
            return jsonify({
                'status': 'not_ready',
                'error': 'Movie data files not found in data directory'
            }), 400

        if recommender.movies_df is None:
            recommender.load_data()

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
        return jsonify({'status': 'error', 'error': str(e)}), 500


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

        if recommender.movies_df is None:
            recommender.load_data()

        recommendations = []
        movie_scores = recommender.get_recommendations(
            user_id=int(user_id),
            n=int(n),
            method=method
        )

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
    try:
        recommender.load_data()
        if not recommender.load_models():
            print("Training new models...")
            recommender.train_models()
    except Exception as e:
        print(f"Warning: {str(e)}")
        print("Please ensure MovieLens dataset (movies.csv and ratings.csv) is in the data directory.")
    
    # Only run in debug mode for local dev
    app.run(debug=True, port=5000)
