// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

const userIdInput = document.getElementById('userId');
const methodSelect = document.getElementById('method');
const genreSelect = document.getElementById('genre');
const countInput = document.getElementById('count');
const getRecommendationsBtn = document.getElementById('getRecommendations');
const recommendationsGrid = document.getElementById('recommendations');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const mainContent = document.getElementById('mainContent');
const footer = document.querySelector('footer');

const genreGradients = {
    action: 'linear-gradient(45deg, #D94550, #C84A30)',
    comedy: 'linear-gradient(135deg, rgb(49, 124, 44) 0%, rgb(32, 40, 33) 100%',
    drama: 'linear-gradient(45deg, #5D54A4, #30A5A5)',
    romance: 'linear-gradient(45deg, #D9728A, #C64A6C)',
    thriller: 'linear-gradient(45deg, #112540, #2B5C8E)',
    scifi: 'linear-gradient(45deg, #4D9DB3, #6A5C99)',
    horror: 'linear-gradient(45deg, #262626, #663333)',
    '': 'linear-gradient(135deg, #D9A74A 0%, #262626 100%)'  // Default gold and black
};

const genreBackgrounds = {
    action: 'linear-gradient(135deg, #261A1C 0%, #4D3030 100%)',
    comedy: 'linear-gradient(135deg,  rgb(92, 100, 93) 0%,rgb(22, 96, 17) 100%',
    drama: 'linear-gradient(135deg, #25203D 0%, #5C508C 100%)',
    romance: 'linear-gradient(135deg, #332026 0%, #994D66 100%)',
    thriller: 'linear-gradient(135deg, #0F151F 0%, #2E4159 100%)',
    scifi: 'linear-gradient(135deg, #1F2940 0%, #3E6C8C 100%)',
    horror: 'linear-gradient(135deg, #1A1A1A 0%,rgb(203, 47, 47) 100%)',
    '': 'linear-gradient(135deg, #1A1A1A 0%, #BF933D 100%)'  // Default black and gold
};

// Softer footer backgrounds with good contrast
const genreFooterBackgrounds = {
    action: 'rgba(38, 26, 28, 0.95)',
    comedy: 'rgba(61, 52, 32, 0.95)',
    drama: 'rgba(37, 32, 61, 0.95)',
    romance: 'rgba(51, 32, 38, 0.95)',
    thriller: 'rgba(15, 21, 31, 0.95)',
    scifi: 'rgba(31, 41, 64, 0.95)',
    horror: 'rgba(26, 26, 26, 0.95)',
    '': 'rgba(26, 26, 26, 0.95)'  // Default black
};

// Text colors optimized for readability on each theme
const genreTextColors = {
    action: '#ffffff',
    comedy: '#1a1a1a',    // Dark text for light comedy background
    drama: '#ffffff',
    romance: '#ffffff',
    thriller: '#ffffff',
    scifi: '#ffffff',
    horror: '#ffffff',
    '': '#ffffff'
};

// Card background colors with proper contrast
const genreCardBackgrounds = {
    action: 'rgba(255, 255, 255, 0.15)',
    comedy: 'rgba(0, 0, 0, 0.2)',       // Darker cards for light comedy background
    drama: 'rgba(255, 255, 255, 0.15)',
    romance: 'rgba(255, 255, 255, 0.15)',
    thriller: 'rgba(255, 255, 255, 0.1)',
    scifi: 'rgba(255, 255, 255, 0.15)',
    horror: 'rgba(255, 255, 255, 0.1)',
    '': 'rgba(255, 255, 255, 0.1)'
};

// Accent colors for highlights and details
const genreAccentColors = {
    action: '#FF5F41',
    comedy: '#FFCC00',
    drama: '#8A63FF',
    romance: '#FF77AD',
    thriller: '#0087FF',
    scifi: '#00EAFF',
    horror: '#FF0000',
    '': '#3498db'
};

function scrollToMain() {
    document.getElementById('mainContent').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function updateUIGradient(genre) {
    // Remove all theme classes
    mainContent.classList.remove('theme-action', 'theme-comedy', 'theme-drama', 
        'theme-romance', 'theme-thriller', 'theme-scifi', 'theme-horror');
    footer.classList.remove('theme-action', 'theme-comedy', 'theme-drama', 
        'theme-romance', 'theme-thriller', 'theme-scifi', 'theme-horror');
    
    // Add the appropriate theme class
    if (genre) {
        mainContent.classList.add(`theme-${genre}`);
        footer.classList.add(`theme-${genre}`);
    }
    
    const gradient = genreGradients[genre] || genreGradients[''];
    const background = genreBackgrounds[genre] || genreBackgrounds[''];
    const footerBg = genreFooterBackgrounds[genre] || genreFooterBackgrounds[''];
    const textColor = genreTextColors[genre] || genreTextColors[''];
    const cardBg = genreCardBackgrounds[genre] || genreCardBackgrounds[''];
    const accentColor = genreAccentColors[genre] || genreAccentColors[''];
    
    document.documentElement.style.setProperty('--current-gradient', gradient);
    document.documentElement.style.setProperty('--main-bg-color', background);
    document.documentElement.style.setProperty('--footer-bg-color', footerBg);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--card-background', cardBg);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    document.querySelectorAll('.gradient-btn').forEach(el => {
        el.style.background = gradient;
    });
    
    document.querySelectorAll('.movie-card').forEach(card => {
        card.style.background = cardBg;
        
        const ratingValue = card.querySelector('.rating-value');
        if (ratingValue) {
            ratingValue.style.color = accentColor;
        }
        
        const stars = card.querySelectorAll('.fa-star, .fa-star-half-alt');
        stars.forEach(star => {
            star.style.color = accentColor;
        });
    });

    const dropdowns = document.querySelectorAll('select');
    dropdowns.forEach(dropdown => {
        dropdown.style.color = textColor;
        dropdown.style.borderColor = `${accentColor}50`; 
    });
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.color = textColor;
        input.style.borderColor = `${accentColor}50`;
    });
    
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.background = gradient;
            this.style.color = textColor;
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            this.style.color = textColor;
        });
    });
    
    document.querySelectorAll('.glass-card, .movie-card').forEach(card => {
        card.style.borderColor = `${accentColor}30`; 
        card.style.boxShadow = `0 5px 15px rgba(0, 0, 0, 0.3), 0 0 5px ${accentColor}30`;
    });
}

// Initialize status check
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setInterval(checkStatus, 30000); // Check every 30 seconds
});

async function checkStatus() {
    try {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Checking system status...';
        
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();

        if (response.ok && data.status === 'ready') {
            statusDot.className = 'status-dot ready';
            statusText.textContent = 'Reccomendation System is ready';
            getRecommendationsBtn.disabled = false;
        } else {
            statusDot.className = 'status-dot';
            statusText.textContent = data.error || 'System is initializing...';
            getRecommendationsBtn.disabled = true;
        }
    } catch (error) {
        console.error('Status check error:', error);
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Error connecting to server. Is the backend running?';
        getRecommendationsBtn.disabled = true;
    }
}

getRecommendationsBtn.addEventListener('click', async () => {
    const userId = parseInt(userIdInput.value);
    const method = methodSelect.value;
    const genre = genreSelect.value;
    const count = parseInt(countInput.value);

    if (!userId) {
        alert('Please enter a valid User ID');
        return;
    }

    try {
        getRecommendationsBtn.disabled = true;
        getRecommendationsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
        recommendationsGrid.innerHTML = '<div class="loading">Finding the perfect movies for you...</div>';
        
        const response = await fetch(`${API_BASE_URL}/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                method: method,
                genre: genre,
                n: count
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.recommendations && data.recommendations.length > 0) {
                displayRecommendations(data.recommendations);
            } else {
                recommendationsGrid.innerHTML = '<div class="no-results">No recommendations found for this user.</div>';
            }
        } else {
            throw new Error(data.error || 'Failed to get recommendations');
        }
    } catch (error) {
        console.error('Recommendation error:', error);
        recommendationsGrid.innerHTML = `<div class="error-message">${error.message}</div>`;
    } finally {
        getRecommendationsBtn.disabled = false;
        getRecommendationsBtn.innerHTML = '<i class="fas fa-search"></i><span>Get Recommendations</span>';
    }
});

function displayRecommendations(recommendations) {
    recommendationsGrid.innerHTML = '';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

    recommendations.forEach((movie, index) => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.style.animationDelay = `${index * 0.1}s`;
        
        movieCard.innerHTML = `
            <div class="movie-title">${movie.title}</div>
            <div class="movie-info">
                <div class="predicted-rating">
                    <span class="rating-value" style="color: ${accentColor}">${movie.predicted_rating}</span>
                    <div class="rating-stars">
                        ${getStarRating(movie.predicted_rating)}
                    </div>
                </div>
                ${movie.genres ? `<div class="movie-genres">${movie.genres}</div>` : ''}
            </div>
        `;

        recommendationsGrid.appendChild(movieCard);
    });
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    
    return `
        ${`<i class="fas fa-star" style="color: ${accentColor}"></i>`.repeat(fullStars)}
        ${hasHalfStar ? `<i class="fas fa-star-half-alt" style="color: ${accentColor}"></i>` : ''}
        ${`<i class="far fa-star" style="color: ${accentColor}50"></i>`.repeat(emptyStars)}
    `;
}

userIdInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

countInput.addEventListener('input', (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 20) value = 20;
    e.target.value = value;
});

genreSelect.addEventListener('change', (e) => {
    updateUIGradient(e.target.value);
});

updateUIGradient(genreSelect.value);