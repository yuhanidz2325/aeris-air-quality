CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE air_quality_raw (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    pm25 FLOAT,
    pm10 FLOAT,
    co FLOAT,
    no2 FLOAT,
    o3 FLOAT,
    temperature FLOAT,
    humidity FLOAT,
    timestamp TIMESTAMP,
    is_processed BOOLEAN DEFAULT FALSE
);

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    parameter VARCHAR(50),
    time_segment VARCHAR(50),
    predicted_value FLOAT,
    prediction_time TIMESTAMP
);

CREATE TABLE anomaly_results (
    id SERIAL PRIMARY KEY,
    parameter VARCHAR(50),
    is_anomaly BOOLEAN,
    anomaly_score FLOAT,
    detection_time TIMESTAMP
);

INSERT INTO cities (name) VALUES ('Surabaya');