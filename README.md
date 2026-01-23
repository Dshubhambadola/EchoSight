# EchoSight

**Turn Social Noise into Strategic Signal.**

EchoSight is a real-time social sentiment analysis and competitive intelligence platform designed for mid-market to enterprise marketing teams.

## Key Features
- **Multi-Source Ingestion**: Real-time data from Reddit, Hacker News (Twitter proxy), and RSS (TikTok proxy).
- **AI Insights**: Automated executive summaries powered by Google Gemini 2.0.
- **Advanced Analytics**: Sentiment trends, topic modeling (Word Cloud), and influencer identification.
- **Enterprise Ready**: Role-based access control (Keycloak) and scalable architecture.

## Tech Stack (Hybrid Microservices)

- **Frontend**: React (Vite) + TypeScript
- **API Gateway**: Node.js (NestJS)
- **Collector**: Go (High-concurrency data fetching)
- **Infrastructure**: Docker, PostgreSQL, Elasticsearch, Redis, Kafka, Keycloak

## Directory Structure

- `/services`
  - `/api-gateway`: Main API entry point (Node.js)
  - `/collector`: Social media data ingestion (Go)
  - `/scraper`: Headless browser automation (Node.js/Playwright)
- `/frontend`: React Web Application
- `/infrastructure`: Configuration and DevOps scripts

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (v18+)
- Go (v1.21+)

### Running the Stack

```bash
docker-compose up -d
```
