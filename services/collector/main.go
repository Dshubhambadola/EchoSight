package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
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
	// New Fields for Phase 11
	AuthorFollowers int     `json:"author_followers"`
	ImpactScore     float64 `json:"impact_score"`
	// New Fields for Phase 13
	MediaMeta map[string]string `json:"media_meta"`
}

// Reddit API Structures
type RedditResponse struct {
	Data struct {
		Children []struct {
			Data struct {
				ID         string  `json:"id"`
				Title      string  `json:"title"`
				Author     string  `json:"author"`
				CreatedUTC float64 `json:"created_utc"`
			} `json:"data"`
		} `json:"children"`
	} `json:"data"`
}

// HN API Item
type HNItem struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	By    string `json:"by"`
	Time  int64  `json:"time"`
	Type  string `json:"type"`
}

// RSS Structures
type RSS struct {
	Channel Channel `xml:"channel"`
}

type Channel struct {
	Items []Item `xml:"item"`
}

type Item struct {
	Title   string `xml:"title"`
	Link    string `xml:"link"`
	Creator string `xml:"dc:creator"` // Often used for author
	PubDate string `xml:"pubDate"`
}

var kafkaTopic = "social-mentions"

// --- Fetchers ---

// Helper to simulate impact
func calculateImpact(platform string, author string) (int, float64) {
	// Deterministic random based on author name length to keep it consistent-ish for same author
	// In reality, we'd query an API.
	seed := 0
	for _, c := range author {
		seed += int(c)
	}
	followers := (seed * 123) % 100000 // 0 to 100k
	if followers < 100 {
		followers = 100
	}

	// Simple Impact Logic: log10(followers) * 10 + random noise
	// Max ~ log10(100k) * 10 = 5 * 10 = 50. Scaled up to 100.
	importScore := float64(followers)/100000.0*80.0 + 20.0
	if importScore > 100 {
		importScore = 100
	}

	return followers, importScore
}

func fetchRedditPosts() ([]SocialMention, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://www.reddit.com/r/technology/new.json?limit=5", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "EchoSight/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("reddit api returned status: %d", resp.StatusCode)
	}

	var rResponse RedditResponse
	if err := json.NewDecoder(resp.Body).Decode(&rResponse); err != nil {
		return nil, err
	}

	var mentions []SocialMention
	seenIDs := make(map[string]bool)

	for _, child := range rResponse.Data.Children {
		data := child.Data
		if seenIDs[data.ID] {
			continue
		}
		seenIDs[data.ID] = true

		f, i := calculateImpact("Reddit", data.Author)

		mentions = append(mentions, SocialMention{
			ID:              "reddit_" + data.ID,
			Platform:        "Reddit",
			Content:         data.Title,
			Author:          data.Author,
			Timestamp:       time.Unix(int64(data.CreatedUTC), 0),
			Sentiment:       "Neutral",
			AuthorFollowers: f,
			ImpactScore:     i,
		})
	}
	return mentions, nil
}

func fetchHackerNews() ([]SocialMention, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	// 1. Get Top Stories IDs
	resp, err := client.Get("https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty&limitToFirst=5&orderBy=\"$key\"")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var ids []int
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, err
	}

	// Limit to 3 to be nice
	if len(ids) > 3 {
		ids = ids[:3]
	}

	var mentions []SocialMention

	// 2. Fetch details for each
	for _, id := range ids {
		itemResp, err := client.Get(fmt.Sprintf("https://hacker-news.firebaseio.com/v0/item/%d.json", id))
		if err != nil {
			continue
		}
		var item HNItem
		if err := json.NewDecoder(itemResp.Body).Decode(&item); err == nil && item.Title != "" {
			authorName := "@" + item.By
			f, i := calculateImpact("Twitter", authorName)

			mentions = append(mentions, SocialMention{
				ID:              fmt.Sprintf("twitter_%d", item.ID), // Proxy ID
				Platform:        "Twitter",                          // Simulating Twitter
				Content:         item.Title,
				Author:          authorName,
				Timestamp:       time.Unix(item.Time, 0),
				Sentiment:       "Neutral",
				AuthorFollowers: f,
				ImpactScore:     i,
			})
		}
		itemResp.Body.Close()
	}
	return mentions, nil
}

func fetchRSSProxy() ([]SocialMention, error) {
	log.Println("Fetching RSS Proxy...")
	// Using The Verge RSS as a proxy for "Tech Video/News" (TikTok/News Source)
	url := "https://www.theverge.com/rss/index.xml"

	var mentions []SocialMention

	// Simulation Data
	sounds := []string{"Oh No - Kreepa", "Spongebob Fail", "Funny Laugh", "Original Sound - User123", "Trending Beat 2024"}
	effects := []string{"Green Screen", "Time Warp Scan", "Disco Lights", "Beauty Mode", "Zoom In"}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)

	var items []Item
	if err == nil && resp.StatusCode == http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		var rss RSS
		if xml.Unmarshal(data, &rss) == nil {
			items = rss.Channel.Items
		}
	} else {
		log.Printf("RSS Fetch failed or empty: %v. Using Mock Data.", err)
	}

	// Fallback to Mock Data if RSS is dry or failed
	if len(items) == 0 {
		log.Println("RSS empty, generating mock TikTok data")
		items = []Item{
			{Title: "Viral Dance Challenge 2026", Link: "http://tiktok.com/video1", Creator: "@dancer_01", PubDate: time.Now().String()},
			{Title: "POV: You forgot your homework", Link: "http://tiktok.com/video2", Creator: "@comedy_king", PubDate: time.Now().String()},
			{Title: "Best Life Hacks for Students", Link: "http://tiktok.com/video3", Creator: "@lifehacks", PubDate: time.Now().String()},
		}
	}

	// Take top 3
	count := 0
	for _, item := range items {
		if count >= 3 {
			break
		}
		f, i := calculateImpact("TikTok", item.Creator)

		// Simulate TikTok Meta
		sound := sounds[int(time.Now().UnixNano())%len(sounds)]
		effect := effects[int(time.Now().UnixNano()/2)%len(effects)]

		meta := map[string]string{
			"sound":  sound,
			"effect": effect,
		}

		mentions = append(mentions, SocialMention{
			ID:              "tiktok_" + fmt.Sprintf("%d_%d", time.Now().UnixNano(), count), // Generate pseudo ID
			Platform:        "TikTok",                                                       // Simulating TikTok
			Content:         item.Title + " " + item.Link,
			Author:          item.Creator,
			Timestamp:       time.Now(),
			Sentiment:       "Neutral",
			AuthorFollowers: f,
			ImpactScore:     i,
			MediaMeta:       meta,
		})
		count++
	}

	return mentions, nil
}

// --- Producer ---
func produceMentions(producer sarama.SyncProducer, mentions []SocialMention) {
	for _, mention := range mentions {
		bytes, _ := json.Marshal(mention)
		msg := &sarama.ProducerMessage{
			Topic: kafkaTopic,
			Value: sarama.StringEncoder(string(bytes)),
		}
		partition, offset, err := producer.SendMessage(msg)
		if err != nil {
			log.Printf("Failed to send [%s]: %v", mention.Platform, err)
		} else {
			log.Printf("[%s] Sent to p%d:o%d: %s", mention.Platform, partition, offset, mention.Content)
		}
		time.Sleep(100 * time.Millisecond)
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

	// Kafka Connection Loop
	var producer sarama.SyncProducer
	var err error
	for i := 0; i < 10; i++ {
		producer, err = sarama.NewSyncProducer(brokerList, config)
		if err == nil {
			break
		}
		log.Printf("Kafka connection attempt %d failed: %v", i+1, err)
		time.Sleep(5 * time.Second)
	}
	if err != nil {
		log.Fatalf("Fatal: Could not connect to Kafka: %v", err)
	}
	defer producer.Close()
	log.Println("Connected to Kafka at", brokerList)

	// Start Polling Routines
	go func() {
		redditTicker := time.NewTicker(30 * time.Second)
		hnTicker := time.NewTicker(45 * time.Second)
		rssTicker := time.NewTicker(60 * time.Second)

		log.Println("Starting Multi-Source Poller (VERSION 2.0 LOADED)...")

		for {
			select {
			case <-redditTicker.C:
				posts, err := fetchRedditPosts()
				if err == nil {
					produceMentions(producer, posts)
				} else {
					log.Printf("Reddit Error: %v", err)
				}
			case <-hnTicker.C:
				posts, err := fetchHackerNews()
				if err == nil {
					produceMentions(producer, posts)
				} else {
					log.Printf("Twitter/HN Error: %v", err)
				}
			case <-rssTicker.C:
				posts, err := fetchRSSProxy()
				if err == nil {
					produceMentions(producer, posts)
				} else {
					log.Printf("TikTok/RSS Error: %v", err)
				}
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
