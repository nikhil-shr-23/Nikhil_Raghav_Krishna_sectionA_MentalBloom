package config

import (
	"context"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// representing here -> the configuratio of application
type Config struct {
	ServerPort     string
	MongoURI       string
	MongoDB        string
	JWTSecret      string
	TokenExpiresIn time.Duration
}



func LoadConfig() (*Config, error) {
	
	mongoURIDefault := "mongodb+srv://chatbos:chatbos123@cluster0.xpibyq2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
	mongoURI := getEnv("MONGO_URI", mongoURIDefault)

	config := &Config{
		ServerPort:     getEnv("PORT", "8080"),
		MongoURI:       mongoURI,
		MongoDB:        getEnv("MONGO_DB", "mentalbloom"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key"),
		TokenExpiresIn: time.Hour * 24, // 24 hours
	}

	return config, nil
}

// connect to that database we've used -> mdb
func ConnectDB(cfg *Config) (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set client options
	clientOptions := options.Client().ApplyURI(cfg.MongoURI)

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	return client.Database(cfg.MongoDB), nil
}

// get an enviroment variable or default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
