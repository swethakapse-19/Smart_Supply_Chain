import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

def create_mock_data():
    """Generate synthetic historical data mapped to our problem statement"""
    np.random.seed(42)
    n_samples = 1000
    
    # Features: [distance_remaining, speed, weather_severity(0-3), traffic_level(0-3), bottleneck_factor(0-10)]
    weather_severity = np.random.randint(0, 4, n_samples)
    traffic_level = np.random.randint(0, 4, n_samples)
    speed = np.random.normal(60, 15, n_samples) - (weather_severity * 5) - (traffic_level * 10)
    bottleneck_factor = np.random.uniform(0, 10, n_samples)
    
    # Target: 1 if delayed, 0 if on time
    # We create a logic where high severity weather or traffic causes delay
    delay_probability = (weather_severity * 0.25) + (traffic_level * 0.2) + (bottleneck_factor * 0.05)
    delay_probability = np.clip(delay_probability, 0, 1)
    
    is_delayed = np.random.binomial(1, delay_probability)
    
    data = pd.DataFrame({
        'speed': speed,
        'weather_severity': weather_severity,
        'traffic_level': traffic_level,
        'bottleneck_factor': bottleneck_factor,
        'is_delayed': is_delayed
    })
    
    return data

def build_model():
    print("Generating synthetic supply chain transit data...")
    df = create_mock_data()
    
    X = df[['speed', 'weather_severity', 'traffic_level', 'bottleneck_factor']]
    y = df['is_delayed']
    
    print("Training Random Forest Classifier for Preemptive Delay Detection...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    
    accuracy = model.score(X, y)
    print(f"Model trained successfully. Accuracy on synthetic data: {accuracy:.2f}")
    
    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved successfully to current directory.")

if __name__ == "__main__":
    build_model()
