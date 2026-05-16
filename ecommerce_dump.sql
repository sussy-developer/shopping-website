-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: ecommerce
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CARTS`
--

DROP TABLE IF EXISTS `CARTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CARTS` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `session_id` (`session_id`),
  CONSTRAINT `CARTS_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CARTS`
--

LOCK TABLES `CARTS` WRITE;
/*!40000 ALTER TABLE `CARTS` DISABLE KEYS */;
INSERT INTO `CARTS` VALUES (1,NULL,'0510cd02-8ccd-4016-bad1-67bca95ad533');
/*!40000 ALTER TABLE `CARTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CART_ITEMS`
--

DROP TABLE IF EXISTS `CART_ITEMS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CART_ITEMS` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`cart_item_id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `CART_ITEMS_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `CARTS` (`cart_id`),
  CONSTRAINT `CART_ITEMS_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CART_ITEMS`
--

LOCK TABLES `CART_ITEMS` WRITE;
/*!40000 ALTER TABLE `CART_ITEMS` DISABLE KEYS */;
INSERT INTO `CART_ITEMS` VALUES (1,1,1,1);
/*!40000 ALTER TABLE `CART_ITEMS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CATEGORIES`
--

DROP TABLE IF EXISTS `CATEGORIES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CATEGORIES` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CATEGORIES`
--

LOCK TABLES `CATEGORIES` WRITE;
/*!40000 ALTER TABLE `CATEGORIES` DISABLE KEYS */;
INSERT INTO `CATEGORIES` VALUES (5,'Beauty'),(4,'Books'),(1,'Electronics'),(2,'Fashion'),(3,'Home & Living'),(6,'Sports');
/*!40000 ALTER TABLE `CATEGORIES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `INVENTORY`
--

DROP TABLE IF EXISTS `INVENTORY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `INVENTORY` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `stock_quantity` int NOT NULL,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `product_id` (`product_id`),
  CONSTRAINT `INVENTORY_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `INVENTORY`
--

LOCK TABLES `INVENTORY` WRITE;
/*!40000 ALTER TABLE `INVENTORY` DISABLE KEYS */;
INSERT INTO `INVENTORY` VALUES (1,1,24),(2,2,8),(3,3,15),(4,4,0),(5,5,42),(6,6,30),(7,7,12),(8,8,56),(9,9,9),(10,10,4),(11,11,78),(12,12,22),(13,13,33),(14,14,17),(15,15,19),(16,16,11);
/*!40000 ALTER TABLE `INVENTORY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ORDERS`
--

DROP TABLE IF EXISTS `ORDERS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ORDERS` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `order_date` datetime DEFAULT NULL,
  `order_status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ORDERS_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ORDERS`
--

LOCK TABLES `ORDERS` WRITE;
/*!40000 ALTER TABLE `ORDERS` DISABLE KEYS */;
/*!40000 ALTER TABLE `ORDERS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ORDER_ITEMS`
--

DROP TABLE IF EXISTS `ORDER_ITEMS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ORDER_ITEMS` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `ORDER_ITEMS_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`order_id`),
  CONSTRAINT `ORDER_ITEMS_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ORDER_ITEMS`
--

LOCK TABLES `ORDER_ITEMS` WRITE;
/*!40000 ALTER TABLE `ORDER_ITEMS` DISABLE KEYS */;
/*!40000 ALTER TABLE `ORDER_ITEMS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PAYMENTS`
--

DROP TABLE IF EXISTS `PAYMENTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PAYMENTS` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `PAYMENTS_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PAYMENTS`
--

LOCK TABLES `PAYMENTS` WRITE;
/*!40000 ALTER TABLE `PAYMENTS` DISABLE KEYS */;
/*!40000 ALTER TABLE `PAYMENTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCTS`
--

DROP TABLE IF EXISTS `PRODUCTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PRODUCTS` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `product_name` varchar(200) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `PRODUCTS_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `CATEGORIES` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCTS`
--

LOCK TABLES `PRODUCTS` WRITE;
/*!40000 ALTER TABLE `PRODUCTS` DISABLE KEYS */;
INSERT INTO `PRODUCTS` VALUES (1,1,'Aurora Wireless Headphones','Studio-grade active noise cancellation with 40-hour battery life. Plush memory-foam cups, lossless Bluetooth 5.3, and an adaptive EQ that tunes itself to your hearing profile.',189.00,'Sonata Audio'),(2,1,'Lumen 14 Pro Laptop','14-inch micro-OLED display, 18-core ARM silicon, 22-hour battery. Engineered for creative professionals who refuse to plug in.',1499.00,'Northwave'),(3,1,'Helix 5G Smartphone','Triple-lens computational camera, titanium chassis, and a 6.7-inch LTPO display that drops to 1Hz to sip battery on the lock screen.',899.00,'Northwave'),(4,1,'Orbit Smartwatch GS','Sapphire crystal face, dual-frequency GPS, blood-oxygen and ECG sensors. Seven days on a single charge.',349.00,'Sonata Audio'),(5,2,'Linen Heritage Shirt','Garment-dyed Belgian linen with mother-of-pearl buttons and reinforced split-tail hem. Pre-washed for that perfect Sunday-afternoon drape.',89.00,'Marlow & Co'),(6,2,'Stride Runner Sneakers','Nitrogen-infused foam midsole and a recycled-knit upper. Tested across 12,000 km of city pavement so your knees don\'t have to be.',145.00,'Kestrel'),(7,2,'Atelier Leather Tote','Full-grain vegetable-tanned Tuscan leather. Hand-stitched in Florence. Develops a patina that becomes uniquely yours.',320.00,'Marlow & Co'),(8,3,'Cascade Pour-Over Set','Borosilicate glass server, ceramic cone, and 100 unbleached filters. The third-wave coffee ritual, distilled.',68.00,'Hearthworks'),(9,3,'Halcyon Floor Lamp','Hand-blown opal glass diffuser on a brushed-brass column. Warm-dimming LED from 2200K to 3000K.',240.00,'Hearthworks'),(10,3,'Modular Lounge Sofa','Reconfigurable five-piece system in boucle wool. Kiln-dried hardwood frame, eight-way hand-tied springs, and a lifetime structural warranty.',1899.00,'Atelier Nord'),(11,4,'The Cartographers\' Field Guide','A literary atlas of imaginary places, with foldout maps and silver-foil endpapers. A National Book Critics Circle finalist.',32.00,'Folio Press'),(12,4,'Quiet Architectures','A photographic survey of brutalist libraries across Europe. Smyth-sewn binding, 312 plates, with an essay by Juhani Pallasmaa.',45.00,'Folio Press'),(13,5,'Vetiver & Bergamot Eau de Parfum','Top notes of Calabrian bergamot give way to a heart of Haitian vetiver and a dry-down of warm tonka bean. Cruelty-free, made in Grasse.',125.00,'Ondine'),(14,5,'Renewal Night Serum','Time-release retinaldehyde with niacinamide and bakuchiol. Dermatologist-formulated for visible results in 28 nights.',88.00,'Ondine'),(15,6,'Trailhead 45L Backpack','Recycled ripstop nylon, custom-molded hipbelt, integrated rain cover. Tested above 14,000 ft in the Cordillera Blanca.',215.00,'Kestrel'),(16,6,'Ascent Climbing Rope 60m','9.5mm dynamic, dry-treated single rope. UIAA-certified for 8 falls. The redpoint workhorse of the sport-climbing world.',189.00,'Kestrel');
/*!40000 ALTER TABLE `PRODUCTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `REVIEWS`
--

DROP TABLE IF EXISTS `REVIEWS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `REVIEWS` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  PRIMARY KEY (`review_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `REVIEWS_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`user_id`),
  CONSTRAINT `REVIEWS_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `REVIEWS`
--

LOCK TABLES `REVIEWS` WRITE;
/*!40000 ALTER TABLE `REVIEWS` DISABLE KEYS */;
/*!40000 ALTER TABLE `REVIEWS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USERS`
--

DROP TABLE IF EXISTS `USERS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USERS` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USERS`
--

LOCK TABLES `USERS` WRITE;
/*!40000 ALTER TABLE `USERS` DISABLE KEYS */;
/*!40000 ALTER TABLE `USERS` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12 19:48:11
