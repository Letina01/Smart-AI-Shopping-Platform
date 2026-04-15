# Smart AI Shopping Platform - Comprehensive Setup Guide

## 🚀 Overview
A production-ready microservices-based shopping platform featuring AI recommendations, real-time search, order tracking, and a modern React frontend.

## 🏗️ Architecture
- **Microservices**: Eureka Server, API Gateway, Auth, User, Product, AI, Order, History, Notification.
- **Databases**: Central MySQL 8.0 instance with dedicated service databases.
- **Messaging**: Apache Kafka for event-driven search and order logs.
- **Caching**: Redis for optimized product searches.
- **Frontend**: React 18 with Tailwind CSS, Framer Motion, and Lucide Icons.

## 🛠️ Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+ & npm**
- **Docker Desktop** (recommended for infrastructure)
- **MySQL 8.0** (if running locally)

---

## 🏁 How to Run (Recommended: Docker Compose)

The easiest way to run the entire ecosystem is using Docker Compose. This starts all 9 microservices plus MySQL, Kafka, Zookeeper, and Redis.

### 1. Build Backend Services
Navigate to the root directory and build the JAR files:
```powershell
mvn clean package -DskipTests
```

### 2. Start the Ecosystem
Launch all containers in detached mode:
```powershell
docker-compose up -d --build
```

### 3. Start Frontend
In a new terminal, navigate to the `frontend` directory:
```powershell
cd frontend
npm install
npm start
```
The app will be available at `http://localhost:3000`.

---

## 🔧 How to Run (Local Development)

If you want to run services individually for debugging:

### 1. Start Infrastructure
Ensure MySQL, Kafka, and Redis are running on your machine.
- **MySQL**: Create user `shopping_user` with password `shopping_pass`. Run `mysql-init/init.sql` to create databases.
- **Redis**: Port 6379.
- **Kafka**: Port 9092.

### 2. Run Services in Order
Run these from their respective directories using `mvn spring-boot:run` or your IDE:
1. `eureka-server` (Port 8761)
2. `api-gateway` (Port 8080)
3. `auth-service` (Port 9898)
4. All other services (`user`, `product`, `ai`, `order`, `history`, `notification`)

---

## 🧪 Testing the Flow
1. **Login/Register**: Open `http://localhost:3000`, create an account, and log in.
2. **Search**: Enter 'iPhone' or 'Laptop' in the dashboard search bar.
3. **AI Insight**: Click 'Best Price' or 'Best Rating' to see AI recommendations.
4. **Order**: Click 'Buy Now' on a product card. This redirects to the platform and saves the order.
5. **Activity**: Visit the 'History' page to see your search logs and order history.
6. **Profile**: Update your name or add a shipping address in the 'Profile' section.

---

## 📡 API Endpoints (via API Gateway: 8080)
- `POST /auth/register` - New user registration
- `POST /auth/token` - Get JWT token
- `GET /products/search?q={query}&email={email}` - Search products
- `POST /ai/recommend` - Get AI insights
- `POST /orders` - Create mock order
- `GET /history/search?email={email}` - Fetch search logs
- `GET /user/profile?email={email}` - Fetch user details

---

## 📄 Notes
- The default JWT secret is hardcoded for demo purposes; in production, use Environment Variables.
- AI Service uses mock integration for Spring AI; connect a real provider (OpenAI/Ollama) in `ai-service/application.yml` for real LLM responses.

---

## ☁️ AWS EC2 Free Tier Deployment

### Overview
This section provides instructions for deploying a minimal, stable version of the application on AWS EC2 Free Tier (t2.micro).

### Optimized Services for EC2
The following 4 services are enabled for free tier deployment:
- **api-gateway** (Port 8080) - Main entry point
- **auth-service** (Port 9898) - Authentication with H2 database
- **user-service** (Port 9001) - User management
- **product-service** (Port 9002) - Product search

### Excluded Services (for Free Tier)
The following heavy services are disabled to save memory and storage:
- MySQL, Kafka, Zookeeper, Redis, Eureka, AI Service, Notification Service, History Service, Order Service

### Prerequisites
1. AWS EC2 instance (t2.micro or t3.micro)
2. Ubuntu 22.04 LTS or Amazon Linux 2023
3. Docker and Docker Compose installed

### Deployment Steps

#### 1. Connect to EC2 Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. Install Docker
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
```

#### 3. Transfer Project Files
```bash
# From your local machine
scp -i your-key.pem -r ./Smart\ AI\ Shopping\ Platform ubuntu@your-ec2-ip:/home/ubuntu/
```

#### 4. Configure Environment
```bash
cd /home/ubuntu/Smart\ AI\ Shopping\ Platform
cp .env.ec2 .env
# Edit .env and update FRONTEND_URL with your EC2 public IP
nano .env
```

#### 5. Build and Start Services
```bash
# Build all services
docker-compose -f docker-compose.ec2.yml build

# Start services in detached mode
docker-compose -f docker-compose.ec2.yml up -d
```

#### 6. Verify Services
```bash
# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.ec2.yml logs -f

# Test API Gateway
curl http://localhost:8080/actuator/health
```

### Service URLs (Docker Network)
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:9898
- User Service: http://localhost:9001
- Product Service: http://localhost:9002

### H2 Console Access
Auth-service H2 console: http://your-ec2-ip:9898/h2-console

### Stop Services
```bash
docker-compose -f docker-compose.ec2.yml down
```

### Troubleshooting
- **Out of memory**: Ensure JVM memory limits are set: `-Xms128m -Xmx256m`
- **Port conflicts**: Ensure ports 8080, 9898, 9001, 9002 are not in use
- **Container not starting**: Check logs with `docker-compose logs [service-name]`

### Full Deployment
To deploy all services (requires more resources), use the full docker-compose.yml:
```bash
docker-compose up -d --build
```
