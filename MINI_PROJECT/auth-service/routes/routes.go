package routes

import (
	"github.com/gin-gonic/gin"
	"auth-service/config"
	"auth-service/controllers"
	"auth-service/middleware"
	"go.mongodb.org/mongo-driver/mongo"
)

// SetupRoutes configures all the routes for the application
func SetupRoutes(router *gin.Engine, db *mongo.Database) {
	
	cfg, _ := config.LoadConfig()

	
	authController := controllers.NewAuthController(db, cfg)

	
	router.POST("/register", authController.Register)
	router.POST("/login", authController.Login)


	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		protected.GET("/me", authController.Me)
	}
}
