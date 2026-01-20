package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/IBM/sarama"
	"github.com/gorilla/mux"
)

// SocialMention represents the data structure for a social post
type SocialMention struct {
	ID        string    `json:"id"`
	Platform  string    `json:"platform"`
	Content   string    `json:"content"`
	Author    string    `json:"author"`
	Timestamp time.Time `json:"timestamp"`
	Sentiment string    `json:"sentiment"`
}

var (
	platforms  = []string{"Twitter", "Reddit", "TikTok"}
	sentiments = []string{"Positive", "Negative", "Neutral"}
	contents   = []string{
		"Just tried the new EchoSight feature! #awesome",
		"Why does this always crash? #frustrated",
		"Interesting analysis on market trends.",
		"Anyone else seeing this issue?",
		"Big news coming soon!",
	}
	kafkaTopic = "social-mentions"
)

func generateMockMention() SocialMention {
	return SocialMention{
		ID:        "evt_" + time.Now().Format("20060102150405"),
		Platform:  platforms[rand.Intn(len(platforms))],
		Content:   contents[rand.Intn(len(contents))],
		Author:    "user_" + time.Now().Format("05"),
		Timestamp: time.Now(),
		Sentiment: sentiments[rand.Intn(len(sentiments))],
	}
}

func main() {
	// Initialize Router
	r := mux.NewRouter()

	// Health Check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Collector Service is operational"))
	})

	// Kafka Producer Setup
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092"
	}
	brokerList := []string{broker}

	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	// Connect to Kafka & Start Generating Data
	go func() {
		// Wait for Kafka to be ready
		time.Sleep(10 * time.Second)

		var producer sarama.SyncProducer
		var err error

		// Simple retry loop for connection
		for i := 0; i < 5; i++ {
			producer, err = sarama.NewSyncProducer(brokerList, config)
			if err == nil {
				break
			}
			log.Printf("Failed to start Kafka producer (attempt %d): %v", i+1, err)
			time.Sleep(5 * time.Second)
		}

		if err != nil {
			log.Fatalf("Could not connect to Kafka after retries: %v", err)
			return
		}
		defer producer.Close()
		log.Println("Connected to Kafka at", brokerList)

		// Ticker to generate data
		ticker := time.NewTicker(2 * time.Second)
		for range ticker.C {
			mention := generateMockMention()
			bytes, _ := json.Marshal(mention)

			msg := &sarama.ProducerMessage{
				Topic: kafkaTopic,
				Value: sarama.StringEncoder(string(bytes)),
			}

			partition, offset, err := producer.SendMessage(msg)
			if err != nil {
				log.Printf("Failed to send message: %v", err)
			} else {
				log.Printf("Message sent to partition %d at offset %d: %s", partition, offset, mention.Content)
			}
		}
	}()

	// Start Server
	srv := &http.Server{
		Handler:      r,
		Addr:         "0.0.0.0:8001",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Println("Collector Service listening on :8001")
	log.Fatal(srv.ListenAndServe())
}
