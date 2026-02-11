-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: gcd_db
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `magazine_content_type` enum('technical','ad') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actions`
--

LOCK TABLES `actions` WRITE;
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
INSERT INTO `actions` VALUES (13,'Webinar',NULL,'2026-02-04 09:10:40','2026-02-04 09:10:40'),(14,'Wide Banner (Banner envolvente)',NULL,'2026-02-04 09:10:47','2026-02-04 09:10:47'),(15,'Header Banner (Banner cabezal)',NULL,'2026-02-04 09:10:50','2026-02-04 09:10:50'),(16,'Square Banner (Banner robap├íginas)',NULL,'2026-02-04 09:10:53','2026-02-04 09:10:53'),(17,'Website Content (Contenido web)',NULL,'2026-02-04 09:10:57','2026-02-04 09:10:57'),(18,'Sponsored section (Secci├│n patrocinada)',NULL,'2026-02-04 09:11:03','2026-02-04 09:11:03'),(19,'IA sponsorship (Patrocinio de IA)',NULL,'2026-02-04 09:11:27','2026-02-04 09:11:27'),(20,'Full page AD (Anuncio p├ígina completa)','ad','2026-02-04 09:11:32','2026-02-10 09:05:23'),(21,'Technical Article (Art├¡culo T├®cnico)','technical','2026-02-04 09:11:36','2026-02-10 09:05:12'),(22,'Advertorial without advertisement (Reportaje sin anuncio)','technical','2026-02-04 09:11:40','2026-02-10 09:04:06'),(23,'2 pages Advertorial without advertisement ( Reportaje 2 p├íginas sin anuncio)','technical','2026-02-04 09:11:44','2026-02-10 09:03:43'),(24,'Interview (Entrevista)','technical','2026-02-04 09:12:13','2026-02-10 09:05:59'),(25,'2 pages Farm/company report (2 p├íginas Reportaje granja/empresa)','technical','2026-02-04 09:12:21','2026-02-10 09:03:52'),(26,'4 pages Farm/company report (4 p├íginas Reportaje granja/empresa)','technical','2026-02-04 09:12:32','2026-02-10 09:03:56'),(27,'8 pages Farm/company report (8 p├íginas Reportaje granja/empresa)','technical','2026-02-04 09:12:38','2026-02-10 09:03:58'),(28,'back cover (Contraportada)','ad','2026-02-04 09:12:42','2026-02-10 09:04:10'),(29,'Cover flap + inside page (Fald├│n portada + p├ígina interior)','ad','2026-02-04 09:12:47','2026-02-10 09:05:20'),(30,'Inside front cover double page (Doble p├ígina interior portada)','ad','2026-02-04 09:12:51','2026-02-10 09:05:39'),(31,'Half-page horizontal ad ( Media p├ígina H.)','ad','2026-02-04 09:12:56','2026-02-10 09:05:27'),(32,'Half-page Vertical ad ( Media p├ígina V.)','ad','2026-02-04 09:13:01','2026-02-10 09:05:31'),(33,'Quarter-page ad ( Cuarto de p├ígina)','ad','2026-02-04 09:13:06','2026-02-10 09:06:03'),(34,'Social Media Post (Post redes sociales)',NULL,'2026-02-04 09:13:11','2026-02-04 09:13:11'),(35,'Instagram Story (Historia de Instagram)',NULL,'2026-02-04 09:13:14','2026-02-04 09:13:14'),(36,'Highlight Story (Historia destacada)',NULL,'2026-02-04 09:13:19','2026-02-04 09:13:19'),(37,'Podcast Creation (Creaci├│n de podcast)',NULL,'2026-02-04 09:13:23','2026-02-04 09:13:23'),(38,'Newsletter content (Contenido en Newsletter)',NULL,'2026-02-04 09:13:41','2026-02-04 09:13:41'),(39,'Middle Banner (Banner medio) - News',NULL,'2026-02-04 09:13:45','2026-02-04 09:14:29'),(40,'1 year footer banner ( 1 a├▒o banner pie)',NULL,'2026-02-04 09:13:49','2026-02-04 09:13:49'),(41,'Header Banner (Banner cabezal) - News',NULL,'2026-02-04 09:14:02','2026-02-04 09:14:02'),(42,'Video',NULL,'2026-02-09 10:48:35','2026-02-09 10:48:35'),(43,'Highlight',NULL,'2026-02-09 10:48:42','2026-02-09 10:48:42'),(44,'Aftermovie',NULL,'2026-02-09 10:48:46','2026-02-09 10:48:46');
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_actions`
--

DROP TABLE IF EXISTS `campaign_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `medium_id` int NOT NULL,
  `channel_id` int NOT NULL,
  `action_id` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `newsletter_schedule_id` int DEFAULT NULL,
  `magazine_edition_id` int DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campaign_action` (`campaign_id`,`medium_id`,`channel_id`,`action_id`),
  KEY `medium_id` (`medium_id`),
  KEY `channel_id` (`channel_id`),
  KEY `action_id` (`action_id`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_status` (`status`),
  KEY `idx_newsletter_schedule` (`newsletter_schedule_id`),
  KEY `magazine_edition_id` (`magazine_edition_id`),
  CONSTRAINT `campaign_actions_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_actions_ibfk_2` FOREIGN KEY (`medium_id`) REFERENCES `mediums` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_actions_ibfk_3` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_actions_ibfk_4` FOREIGN KEY (`action_id`) REFERENCES `actions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_actions_ibfk_5` FOREIGN KEY (`magazine_edition_id`) REFERENCES `magazine_editions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_newsletter_schedule` FOREIGN KEY (`newsletter_schedule_id`) REFERENCES `newsletter_schedules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_actions`
--

LOCK TABLES `campaign_actions` WRITE;
/*!40000 ALTER TABLE `campaign_actions` DISABLE KEYS */;
INSERT INTO `campaign_actions` VALUES (95,7,5,5,23,'2026-03-15','2026-03-15',NULL,2,'pending',NULL,'2026-02-10 17:52:55','2026-02-10 17:52:55'),(96,7,5,5,22,'2026-03-15','2026-03-15',NULL,2,'pending',NULL,'2026-02-10 17:52:55','2026-02-10 17:52:55'),(97,7,5,5,28,'2026-03-15','2026-03-15',NULL,2,'pending',NULL,'2026-02-10 17:52:55','2026-02-10 17:52:55');
/*!40000 ALTER TABLE `campaign_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_installments`
--

DROP TABLE IF EXISTS `campaign_installments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_installments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `installment_number` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','paid','overdue') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `paid_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campaign_installment` (`campaign_id`,`installment_number`),
  KEY `idx_campaign` (`campaign_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `campaign_installments_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_installments`
--

LOCK TABLES `campaign_installments` WRITE;
/*!40000 ALTER TABLE `campaign_installments` DISABLE KEYS */;
/*!40000 ALTER TABLE `campaign_installments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_mediums`
--

DROP TABLE IF EXISTS `campaign_mediums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_mediums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `medium_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campaign_medium` (`campaign_id`,`medium_id`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_medium_id` (`medium_id`),
  CONSTRAINT `campaign_mediums_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_mediums_ibfk_2` FOREIGN KEY (`medium_id`) REFERENCES `mediums` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_mediums`
--

LOCK TABLES `campaign_mediums` WRITE;
/*!40000 ALTER TABLE `campaign_mediums` DISABLE KEYS */;
INSERT INTO `campaign_mediums` VALUES (8,7,5,'2026-02-10 17:52:34'),(9,8,5,'2026-02-10 17:55:26');
/*!40000 ALTER TABLE `campaign_mediums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `company_id` int NOT NULL,
  `contact_id` int NOT NULL,
  `contract_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `number_of_installments` int DEFAULT NULL,
  `currency` enum('EUR','USD','BRL') COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `billing_zone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `completed` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `contact_id` (`contact_id`),
  KEY `idx_company` (`company_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_completed` (`completed`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `campaigns_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `campaigns_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (7,'Campa├▒a test para revista','Campa├▒a test para revista',2,1,NULL,1500.00,1,'EUR','Spain','asd',0,1,'2026-02-10 17:52:34','2026-02-10 17:52:34'),(8,'Campa├▒a test 2 avinews espa├▒a','Campa├▒a test 2 avinews espa├▒a',2,1,NULL,1500.00,1,'EUR','Spain','asdasd',0,1,'2026-02-10 17:55:26','2026-02-10 17:55:26');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `channel_actions`
--

DROP TABLE IF EXISTS `channel_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channel_actions` (
  `channel_id` int NOT NULL,
  `action_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`channel_id`,`action_id`),
  KEY `action_id` (`action_id`),
  CONSTRAINT `channel_actions_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `channel_actions_ibfk_2` FOREIGN KEY (`action_id`) REFERENCES `actions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_actions`
--

LOCK TABLES `channel_actions` WRITE;
/*!40000 ALTER TABLE `channel_actions` DISABLE KEYS */;
INSERT INTO `channel_actions` VALUES (5,20,'2026-02-04 09:17:56'),(5,21,'2026-02-04 09:17:56'),(5,22,'2026-02-04 09:17:56'),(5,23,'2026-02-04 09:17:56'),(5,24,'2026-02-04 09:17:56'),(5,25,'2026-02-04 09:17:56'),(5,26,'2026-02-04 09:17:56'),(5,27,'2026-02-04 09:17:56'),(5,28,'2026-02-04 09:17:56'),(5,29,'2026-02-04 09:17:56'),(5,30,'2026-02-04 09:17:56'),(5,31,'2026-02-04 09:17:56'),(5,32,'2026-02-04 09:17:56'),(5,33,'2026-02-04 09:17:56'),(6,14,'2026-02-04 09:16:56'),(6,15,'2026-02-04 09:16:56'),(6,16,'2026-02-04 09:16:56'),(6,17,'2026-02-04 09:16:56'),(6,18,'2026-02-04 09:16:56'),(6,19,'2026-02-04 09:16:56'),(7,37,'2026-02-09 10:49:06'),(7,42,'2026-02-09 10:49:06'),(7,43,'2026-02-09 10:49:06'),(7,44,'2026-02-09 10:49:06'),(8,34,'2026-02-04 09:16:19'),(8,35,'2026-02-04 09:16:19'),(8,36,'2026-02-04 09:16:19'),(9,13,'2026-02-04 09:18:09'),(10,38,'2026-02-04 09:18:23'),(10,39,'2026-02-04 09:18:23'),(10,40,'2026-02-04 09:18:23'),(10,41,'2026-02-04 09:18:23');
/*!40000 ALTER TABLE `channel_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES (5,'Revista impresa','2026-02-04 09:08:16','2026-02-04 09:08:16'),(6,'Web','2026-02-04 09:08:21','2026-02-04 09:08:21'),(7,'Audiovisual','2026-02-04 09:08:25','2026-02-09 10:48:25'),(8,'Redes Sociales','2026-02-04 09:08:32','2026-02-04 09:08:32'),(9,'Webinar','2026-02-04 09:08:37','2026-02-04 09:08:37'),(10,'Newsletters','2026-02-04 09:08:55','2026-02-04 09:08:55');
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (2,'Acme Corporation','Calle Principal 123','28001','Madrid','Madrid','Espa├▒a','B12345678','ES7921000813610123456789','2026-02-03 16:08:38','2026-02-03 16:08:38');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company` (`company_id`),
  CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,2,'Juan','Garc├¡a','juan.garcia@acme.com','+34 600 123 456','2026-02-03 16:08:49','2026-02-03 16:08:49'),(2,2,'Samuel','Espinosa','samu.espiinosa@gmail.com','666666666','2026-02-03 17:49:01','2026-02-03 17:49:01');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magazine_deadline_confirmations`
--

DROP TABLE IF EXISTS `magazine_deadline_confirmations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `magazine_deadline_confirmations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_action_id` int NOT NULL,
  `deadline_type` enum('client','send_to_edition','edition','changes_commercial','changes_post_sale') NOT NULL,
  `confirmed_by` int NOT NULL,
  `confirmed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `link` varchar(500) DEFAULT NULL,
  `reverted` tinyint(1) DEFAULT '0',
  `reverted_at` timestamp NULL DEFAULT NULL,
  `reverted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `confirmed_by` (`confirmed_by`),
  KEY `reverted_by` (`reverted_by`),
  KEY `idx_campaign_action_deadline` (`campaign_action_id`,`deadline_type`),
  CONSTRAINT `magazine_deadline_confirmations_ibfk_1` FOREIGN KEY (`campaign_action_id`) REFERENCES `campaign_actions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `magazine_deadline_confirmations_ibfk_2` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `magazine_deadline_confirmations_ibfk_3` FOREIGN KEY (`reverted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magazine_deadline_confirmations`
--

LOCK TABLES `magazine_deadline_confirmations` WRITE;
/*!40000 ALTER TABLE `magazine_deadline_confirmations` DISABLE KEYS */;
INSERT INTO `magazine_deadline_confirmations` VALUES (51,96,'client',1,'2026-02-10 18:02:06',NULL,0,NULL,NULL),(52,96,'send_to_edition',1,'2026-02-10 18:02:14','http://localhost:5173/revistas/2',0,NULL,NULL),(53,96,'edition',1,'2026-02-10 18:02:17',NULL,0,NULL,NULL),(54,96,'changes_commercial',1,'2026-02-10 18:02:21',NULL,0,NULL,NULL),(55,96,'changes_post_sale',1,'2026-02-10 18:02:44','http://localhost:5173/revistas/2',1,'2026-02-10 18:04:54',1),(56,95,'client',1,'2026-02-10 18:03:00',NULL,0,NULL,NULL),(57,95,'send_to_edition',1,'2026-02-10 18:03:01','http://localhost:5173/revistas/2',0,NULL,NULL),(58,95,'edition',1,'2026-02-10 18:03:01',NULL,0,NULL,NULL),(59,95,'changes_commercial',1,'2026-02-10 18:03:02',NULL,0,NULL,NULL),(60,95,'changes_post_sale',1,'2026-02-10 18:03:03','http://localhost:5173/revistas/2',0,NULL,NULL),(61,97,'client',1,'2026-02-10 18:03:16',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `magazine_deadline_confirmations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magazine_editions`
--

DROP TABLE IF EXISTS `magazine_editions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `magazine_editions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medium_id` int NOT NULL,
  `publication_date` date NOT NULL,
  `status` enum('draft','active','published') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `publication_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_medium_publication` (`medium_id`,`publication_date`),
  KEY `idx_medium_id` (`medium_id`),
  KEY `idx_publication_date` (`publication_date`),
  CONSTRAINT `magazine_editions_ibfk_1` FOREIGN KEY (`medium_id`) REFERENCES `mediums` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magazine_editions`
--

LOCK TABLES `magazine_editions` WRITE;
/*!40000 ALTER TABLE `magazine_editions` DISABLE KEYS */;
INSERT INTO `magazine_editions` VALUES (2,5,'2026-03-16','draft','http://localhost:5173/revistas/2',1,'2026-02-10 17:52:11','2026-02-10 18:04:18'),(3,5,'2026-05-04','draft',NULL,0,'2026-02-10 17:55:03','2026-02-10 17:55:03');
/*!40000 ALTER TABLE `magazine_editions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medium_channels`
--

DROP TABLE IF EXISTS `medium_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medium_channels` (
  `medium_id` int NOT NULL,
  `channel_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`medium_id`,`channel_id`),
  KEY `channel_id` (`channel_id`),
  CONSTRAINT `medium_channels_ibfk_1` FOREIGN KEY (`medium_id`) REFERENCES `mediums` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medium_channels_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medium_channels`
--

LOCK TABLES `medium_channels` WRITE;
/*!40000 ALTER TABLE `medium_channels` DISABLE KEYS */;
INSERT INTO `medium_channels` VALUES (1,5,'2026-02-04 09:14:59'),(1,6,'2026-02-04 09:14:59'),(1,7,'2026-02-04 09:14:59'),(1,8,'2026-02-04 09:14:59'),(1,9,'2026-02-04 09:14:59'),(1,10,'2026-02-04 09:14:59'),(2,5,'2026-02-04 09:14:57'),(2,6,'2026-02-04 09:14:57'),(2,7,'2026-02-04 09:14:57'),(2,8,'2026-02-04 09:14:57'),(2,9,'2026-02-04 09:14:57'),(2,10,'2026-02-04 09:14:57'),(5,5,'2026-02-04 09:14:55'),(5,6,'2026-02-04 09:14:55'),(5,7,'2026-02-04 09:14:55'),(5,8,'2026-02-04 09:14:55'),(5,9,'2026-02-04 09:14:55'),(5,10,'2026-02-04 09:14:55'),(6,5,'2026-02-04 09:15:10'),(6,6,'2026-02-04 09:15:10'),(6,7,'2026-02-04 09:15:10'),(6,8,'2026-02-04 09:15:10'),(6,9,'2026-02-04 09:15:10'),(6,10,'2026-02-04 09:15:10'),(7,5,'2026-02-04 09:15:14'),(7,6,'2026-02-04 09:15:14'),(7,7,'2026-02-04 09:15:14'),(7,8,'2026-02-04 09:15:14'),(7,9,'2026-02-04 09:15:14'),(7,10,'2026-02-04 09:15:14'),(8,5,'2026-02-04 09:15:04'),(8,6,'2026-02-04 09:15:04'),(8,7,'2026-02-04 09:15:04'),(8,8,'2026-02-04 09:15:04'),(8,9,'2026-02-04 09:15:04'),(8,10,'2026-02-04 09:15:04'),(9,5,'2026-02-04 09:15:12'),(9,6,'2026-02-04 09:15:12'),(9,7,'2026-02-04 09:15:12'),(9,8,'2026-02-04 09:15:12'),(9,9,'2026-02-04 09:15:12'),(9,10,'2026-02-04 09:15:12'),(10,5,'2026-02-04 09:15:08'),(10,6,'2026-02-04 09:15:08'),(10,7,'2026-02-04 09:15:08'),(10,8,'2026-02-04 09:15:08'),(10,9,'2026-02-04 09:15:08'),(10,10,'2026-02-04 09:15:08'),(11,5,'2026-02-04 09:15:11'),(11,6,'2026-02-04 09:15:11'),(11,7,'2026-02-04 09:15:11'),(11,8,'2026-02-04 09:15:11'),(11,9,'2026-02-04 09:15:11'),(11,10,'2026-02-04 09:15:11'),(12,5,'2026-02-04 09:15:06'),(12,6,'2026-02-04 09:15:06'),(12,7,'2026-02-04 09:15:06'),(12,8,'2026-02-04 09:15:06'),(12,9,'2026-02-04 09:15:06'),(12,10,'2026-02-04 09:15:06'),(13,5,'2026-02-04 09:14:54'),(13,6,'2026-02-04 09:14:54'),(13,7,'2026-02-04 09:14:54'),(13,8,'2026-02-04 09:14:54'),(13,9,'2026-02-04 09:14:54'),(13,10,'2026-02-04 09:14:54'),(14,6,'2026-02-04 09:09:28'),(14,8,'2026-02-04 09:09:28'),(14,10,'2026-02-04 09:09:28'),(15,6,'2026-02-04 09:09:14'),(15,8,'2026-02-04 09:09:14'),(15,10,'2026-02-04 09:09:14'),(16,6,'2026-02-04 09:10:09'),(16,8,'2026-02-04 09:10:09'),(16,10,'2026-02-04 09:10:09'),(17,6,'2026-02-04 09:09:56'),(17,8,'2026-02-04 09:09:56'),(17,10,'2026-02-04 09:09:56'),(18,6,'2026-02-04 09:09:41'),(18,8,'2026-02-04 09:09:41'),(18,10,'2026-02-04 09:09:41'),(19,5,'2026-02-04 09:14:45'),(19,6,'2026-02-04 09:14:45'),(19,7,'2026-02-04 09:14:45'),(19,8,'2026-02-04 09:14:45'),(19,9,'2026-02-04 09:14:45'),(19,10,'2026-02-04 09:14:45');
/*!40000 ALTER TABLE `medium_channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mediums`
--

DROP TABLE IF EXISTS `mediums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mediums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mediums`
--

LOCK TABLES `mediums` WRITE;
/*!40000 ALTER TABLE `mediums` DISABLE KEYS */;
INSERT INTO `mediums` VALUES (1,'aviNews Latam','Latam','2026-02-03 15:30:32','2026-02-06 10:22:08'),(2,'aviNews Internacional','International','2026-02-03 15:30:32','2026-02-06 10:22:08'),(5,'aviNews Espa├▒a','Spain','2026-02-03 17:51:34','2026-02-06 10:22:15'),(6,'porciNews Espa├▒a','Spain','2026-02-04 09:04:27','2026-02-06 10:22:15'),(7,'rumiNews Espa├▒a','Spain','2026-02-04 09:04:33','2026-02-06 10:22:15'),(8,'nutriNews Espa├▒a','Spain','2026-02-04 09:04:39','2026-02-06 10:22:15'),(9,'PorciSapiens',NULL,'2026-02-04 09:05:09','2026-02-04 09:05:09'),(10,'nutriNews Latam','Latam','2026-02-04 09:05:21','2026-02-06 10:22:08'),(11,'porciNews Latam','Latam','2026-02-04 09:05:29','2026-02-06 10:22:08'),(12,'nutriNews International','International','2026-02-04 09:05:39','2026-02-06 10:22:08'),(13,'aviNews Brasil','Brasil','2026-02-04 09:05:46','2026-02-06 10:22:15'),(14,'aviFORUM Puesta',NULL,'2026-02-04 09:06:00','2026-02-04 09:06:00'),(15,'aviFORUM Carne',NULL,'2026-02-04 09:06:10','2026-02-04 09:06:10'),(16,'rumiFORUM',NULL,'2026-02-04 09:06:16','2026-02-04 09:06:16'),(17,'porciFORUM',NULL,'2026-02-04 09:06:21','2026-02-04 09:06:21'),(18,'nutriFORUM',NULL,'2026-02-04 09:06:27','2026-02-04 09:06:27'),(19,'aviNews ASIA','Asia','2026-02-04 09:07:28','2026-02-06 10:22:15'),(20,'aviNews','International','2026-02-06 09:29:19','2026-02-06 10:22:15'),(21,'nutriNews','International','2026-02-06 09:29:19','2026-02-06 10:22:15'),(22,'aviNews Arabic',NULL,'2026-02-09 10:15:07','2026-02-09 10:15:07'),(23,'aviNews Indonesia',NULL,'2026-02-09 10:18:50','2026-02-09 10:18:50'),(24,'aviNews Vietnam',NULL,'2026-02-09 10:23:39','2026-02-09 10:23:39'),(25,'aviNews Thailand',NULL,'2026-02-09 10:23:45','2026-02-09 10:23:45');
/*!40000 ALTER TABLE `mediums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_schedules`
--

DROP TABLE IF EXISTS `newsletter_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `newsletter_type_id` int NOT NULL,
  `scheduled_date` date NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `is_available` tinyint(1) DEFAULT '1' COMMENT 'FALSE cuando se asigna a una campa??a',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_schedule` (`newsletter_type_id`,`scheduled_date`),
  KEY `idx_date` (`scheduled_date`),
  KEY `idx_available` (`is_available`,`scheduled_date`),
  KEY `idx_type_available` (`newsletter_type_id`,`is_available`),
  CONSTRAINT `newsletter_schedules_ibfk_1` FOREIGN KEY (`newsletter_type_id`) REFERENCES `newsletter_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=925 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_schedules`
--

LOCK TABLES `newsletter_schedules` WRITE;
/*!40000 ALTER TABLE `newsletter_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_types`
--

DROP TABLE IF EXISTS `newsletter_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medium_id` int NOT NULL,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Spain, International, Brazil, etc.',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del newsletter: aviNews Espa??a, ovoNews, etc.',
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `week_of_month` enum('1','2','3','4','5') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '1=primera semana, 2=segunda, etc.',
  `frequency` enum('monthly','bimonthly','quarterly') COLLATE utf8mb4_unicode_ci DEFAULT 'monthly',
  `frequency_offset` int DEFAULT '0' COMMENT 'Para bimonthly: 0=meses pares, 1=meses impares',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_newsletter` (`medium_id`,`region`,`name`),
  KEY `idx_medium_region` (`medium_id`,`region`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `newsletter_types_ibfk_1` FOREIGN KEY (`medium_id`) REFERENCES `mediums` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_types`
--

LOCK TABLES `newsletter_types` WRITE;
/*!40000 ALTER TABLE `newsletter_types` DISABLE KEYS */;
INSERT INTO `newsletter_types` VALUES (13,5,'Spain','aviNews Espa├▒a Insight','Wednesday','1','monthly',0,1,'2026-02-06 11:39:19','2026-02-06 11:39:19'),(14,5,'Spain','OvoNews','Wednesday','2','monthly',0,1,'2026-02-06 11:39:45','2026-02-06 11:39:45'),(15,5,'Spain','PoultryPro','Wednesday','2','monthly',0,1,'2026-02-06 11:40:04','2026-02-06 11:40:04'),(16,5,'Spain','On Air','Wednesday','3','monthly',0,1,'2026-02-06 12:23:40','2026-02-06 12:23:40'),(17,5,'Spain','MeatPro','Wednesday','4','monthly',0,1,'2026-02-06 12:23:55','2026-02-06 12:23:55'),(18,5,'Spain','IncubaNews','Wednesday','4','bimonthly',1,1,'2026-02-06 12:24:21','2026-02-09 10:05:46'),(19,2,'International','aviNews International Insight','Thursday','1','monthly',0,1,'2026-02-06 12:24:51','2026-02-06 12:24:51'),(20,2,'International','OvoNews','Thursday','2','monthly',0,1,'2026-02-06 12:25:11','2026-02-06 12:25:11'),(21,2,'International','PoultryPro','Thursday','2','monthly',0,1,'2026-02-06 12:25:30','2026-02-06 12:25:30'),(22,2,'International','On Air','Thursday','3','monthly',0,1,'2026-02-06 12:26:06','2026-02-06 12:26:06'),(23,2,'International','MeatPro','Thursday','4','monthly',0,1,'2026-02-06 12:26:23','2026-02-06 12:26:23'),(24,2,'International','IncubaNews','Thursday','4','bimonthly',0,1,'2026-02-06 12:26:54','2026-02-06 12:26:54'),(25,1,'Latam','aviNews Latam Insight','Tuesday','1','monthly',0,1,'2026-02-09 10:04:01','2026-02-09 10:04:01'),(26,1,'Latam','OvoNews','Tuesday','2','monthly',0,1,'2026-02-09 10:04:19','2026-02-09 10:04:19'),(27,1,'Latam','PoultryPro','Tuesday','2','monthly',0,1,'2026-02-09 10:04:37','2026-02-09 10:04:37'),(28,1,'Latam','On Air','Tuesday','3','monthly',0,1,'2026-02-09 10:04:48','2026-02-09 10:04:48'),(29,1,'Latam','MeatPro','Tuesday','4','monthly',0,1,'2026-02-09 10:05:01','2026-02-09 10:05:01'),(30,1,'Latam','IncubaNews','Wednesday','4','bimonthly',0,1,'2026-02-09 10:05:22','2026-02-09 10:05:22'),(31,13,'Brasil','aviNews Brasil Insight ','Wednesday','1','monthly',0,1,'2026-02-09 10:08:30','2026-02-09 10:16:01'),(32,13,'Brasil','On Air','Wednesday','3','monthly',0,1,'2026-02-09 10:08:52','2026-02-09 10:08:52'),(33,13,'Brasil','MeatPro','Wednesday','4','monthly',0,1,'2026-02-09 10:14:19','2026-02-09 10:14:19'),(34,22,'Arabic','aviNews Arabic Insight ','Thursday','1','monthly',0,1,'2026-02-09 10:15:42','2026-02-09 10:15:56'),(35,22,'Arabic','On Air','Thursday','3','monthly',0,1,'2026-02-09 10:16:37','2026-02-09 10:16:37'),(36,22,'Arabic','Incubanews','Thursday','4','bimonthly',1,1,'2026-02-09 10:17:06','2026-02-09 10:17:06'),(37,19,'Asia','aviNews Asia Insight','Monday','1','monthly',0,1,'2026-02-09 10:18:01','2026-02-09 10:18:01'),(38,19,'Asia','On Air','Monday','3','monthly',0,1,'2026-02-09 10:18:25','2026-02-09 10:18:25'),(39,23,'Asia','aviNews Indonesia Insight','Monday','2','monthly',0,1,'2026-02-09 10:22:59','2026-02-09 10:22:59'),(40,23,'Asia','On Air','Monday','4','monthly',0,1,'2026-02-09 10:23:19','2026-02-09 10:23:19'),(41,24,'Asia','aviNews Vietnam Insight','Tuesday','2','monthly',0,1,'2026-02-09 10:24:12','2026-02-09 10:24:12'),(43,24,'Asia','On Air','Tuesday','4','monthly',0,1,'2026-02-09 10:24:46','2026-02-09 10:24:46'),(44,25,'Asia','aviNews Thailand Insight','Tuesday','2','monthly',0,1,'2026-02-09 10:25:15','2026-02-09 10:25:15'),(45,25,'Asia','On Air','Tuesday','4','monthly',0,1,'2026-02-09 10:25:39','2026-02-09 10:25:39');
/*!40000 ALTER TABLE `newsletter_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_status` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `sent_email` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_read` (`read_status`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','2026-02-03 15:30:32'),(2,'comercial','2026-02-03 15:30:32'),(3,'post-venta','2026-02-03 15:30:32'),(4,'analista','2026-02-03 15:30:32');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,'2026-02-03 15:30:32'),(2,2,'2026-02-03 16:08:25'),(3,2,'2026-02-05 12:26:22');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','User','admin@gcd.com','$2b$10$xjqjuAN.hsbF8rbhSmrqj.v/KqY7yr4K.EW904zSNDHU6uYwWh1Iy','2026-02-03 15:30:32','2026-02-03 15:55:22'),(2,'Test','User','test@gcd.com','$2b$10$B5idEH3F1uNXSspNB4p9g.GixdXcDgP26U0VMvfR60eyAAbkLugQS','2026-02-03 16:08:25','2026-02-03 16:08:25'),(3,'Carlos','Comercial','comercial@gcd.com','$2b$10$TaIE.B46xViOD2NUsiMaturtnXLrFAaENiW.7tbqtpt0LIQFNfetu','2026-02-05 12:26:22','2026-02-05 12:26:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11 10:11:30
