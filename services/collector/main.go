package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/IBM/sarama"
	"github.com/gorilla/mux"
)

func main() {
	// Initialize Router
	r := mux.NewRouter()

	// Health Check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Collector Service is operational"))
	})

	// Kafka Producer Setup
	brokerList := []string{os.Getenv("KAFKA_BROKER")}
	if os.Getenv("KAFKA_BROKER") == "" {
		brokerList = []string{"localhost:9092"}
	}

	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	// Connect to Kafka (Async to allow service to start even if Kafka is warming up)
	go func() {
		producer, err := sarama.NewSyncProducer(brokerList, config)
		if err != nil {
			log.Printf("Failed to start Kafka producer: %v", err)
			return
		}
		defer producer.Close()
		log.Println("Connected to Kafka at", brokerList)
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
