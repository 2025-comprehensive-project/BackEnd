-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: db25103
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP DATABASE IF EXISTS Flapper_Moonshine;

-- DATABASE: Flapper_Moonshine
CREATE DATABASE Flapper_Moonshine;
USE Flapper_Moonshine;

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `admin_name` varchar(255) NOT NULL DEFAULT '관리자',
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='관리자 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES
(1,'flappermoonshine2025@gmail.com','$2b$10$X9Qe5KZsvCO0VZkqdytVIe4Kvnl2cWyAequUP2qHH.KOVoxCoK9Ta','2025-04-09 17:29:01','PLA.I.');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cocktail_recipe`
--

DROP TABLE IF EXISTS `cocktail_recipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cocktail_recipe` (
  `recipe_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `ingredient1_id` int(11) NOT NULL,
  `ingredient1_amount` varchar(50) NOT NULL,
  `ingredient2_id` int(11) DEFAULT NULL,
  `ingredient2_amount` varchar(50) DEFAULT NULL,
  `ingredient3_id` int(11) DEFAULT NULL,
  `ingredient3_amount` varchar(50) DEFAULT NULL,
  `ingredient4_id` int(11) DEFAULT NULL,
  `ingredient4_amount` varchar(50) DEFAULT NULL,
  `garnish_id` int(11) DEFAULT NULL,
  `method` enum('shake','stir') NOT NULL,
  `ice_in_shake` tinyint(1) DEFAULT NULL,
  `is_on_the_rocks` tinyint(1) DEFAULT 0,
  `glass_type` enum('long_drink','on_the_rocks','margarita','martini','sour','coupe') NOT NULL,
  `abv` int(11) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`recipe_id`),
  KEY `ingredient1_id` (`ingredient1_id`),
  KEY `ingredient2_id` (`ingredient2_id`),
  KEY `ingredient3_id` (`ingredient3_id`),
  KEY `ingredient4_id` (`ingredient4_id`),
  KEY `garnish_id` (`garnish_id`),
  KEY `fk_recipe_creator` (`creator_id`),
  CONSTRAINT `cocktail_recipe_ibfk_1` FOREIGN KEY (`ingredient1_id`) REFERENCES `ingredient` (`ingredient_id`),
  CONSTRAINT `cocktail_recipe_ibfk_2` FOREIGN KEY (`ingredient2_id`) REFERENCES `ingredient` (`ingredient_id`),
  CONSTRAINT `cocktail_recipe_ibfk_3` FOREIGN KEY (`ingredient3_id`) REFERENCES `ingredient` (`ingredient_id`),
  CONSTRAINT `cocktail_recipe_ibfk_4` FOREIGN KEY (`ingredient4_id`) REFERENCES `ingredient` (`ingredient_id`),
  CONSTRAINT `cocktail_recipe_ibfk_5` FOREIGN KEY (`garnish_id`) REFERENCES `garnish_type` (`garnish_id`),
  CONSTRAINT `fk_recipe_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='칵테일 레시피 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cocktail_recipe`
--

LOCK TABLES `cocktail_recipe` WRITE;
/*!40000 ALTER TABLE `cocktail_recipe` DISABLE KEYS */;
INSERT INTO `cocktail_recipe` VALUES
(1,'알렉산더',5,'1oz',17,'1oz',24,'1oz',NULL,NULL,10,'shake',1,0,'martini',20,'브랜디, 아몬드 리큐르, 우유가 어우러진 달콤하고 부드러운 칵테일','\"새하얀 드레스를 입는 것은 시커먼 속내를 감추기 위함이지. 마치 이 술 처럼.\"',NULL,'2025-04-09 01:44:04'),
(2,'애비에이션',1,'1.5oz',12,'1oz',14,'2dash',NULL,NULL,1,'shake',1,0,'martini',28,'상큼한 레몬주스에 체리 리큐르가 어우러진, 보랏빛 칵테일','\"구름 위를 나는 기분이 어떤 건지 궁금하다면, 이 술을 마셔보는걸 추천합니다.\"',NULL,'2025-04-09 01:44:04'),
(3,'비스 니즈',1,'1.5oz',13,'0.5oz',18,'0.5oz',NULL,NULL,1,'shake',1,0,'martini',25,'진과 레몬주스, 심플 시럽이 어우러진 산뜻한 칵테일','\"최고의 비즈니스 맨을 위한 달콤한 한 잔.\"',NULL,'2025-04-09 01:44:04'),
(4,'비트윈 더 시트',5,'1oz',2,'1oz',9,'1oz',13,'1oz',NULL,'shake',1,0,'martini',33,'브랜디와 럼, 상큼한 오렌지향이 어우러진 강한 칵테일','\"달콤한 말과 술에는 다 이유가 있는 법.\"',NULL,'2025-04-09 01:44:04'),
(5,'블랙 러시안',3,'2oz',19,'1oz',NULL,NULL,NULL,NULL,NULL,'stir',0,1,'on_the_rocks',25,'보드카와 커피 리큐르가 어우러진 깔끔한 달콤 씁쓸함','\"소련놈들은 아침에 커피 대신에 이걸 한잔 마신다던데,\"',NULL,'2025-04-09 01:44:04'),
(6,'브랜디 크러스타',5,'2oz',9,'1dash',14,'0.5oz',13,'0.5oz',7,'shake',0,0,'coupe',30,'다양한 재료가 조화된 브랜디 베이스의 클래식 칵테일','\"19세기 바텐더 예술의 정점. 칵테일도 예술이 될 수 있다네.\"',NULL,'2025-04-09 01:44:04'),
(7,'불바디에',4,'1oz',20,'1oz',23,'2dash',NULL,NULL,NULL,'stir',0,1,'on_the_rocks',30,'강렬하고 묵직한 위스키 기반의 칵테일','\"네그로니가 너무 쓰다고? 이거 먼저 마셔보는건 어때?\"',NULL,'2025-04-09 01:44:04'),
(8,'쿠바 리브레',2,'2oz',12,'0.5oz',18,'1oz',25,'filling',NULL,'stir',0,1,'long_drink',12,'럼과 라임의 상큼한 조화가 돋보이는 클래식 하이볼','\"Viva, Cuba Libre!\"',NULL,'2025-04-09 01:44:04'),
(9,'다이키리',2,'2oz',12,'1oz',18,'0.5oz',NULL,NULL,NULL,'shake',1,0,'martini',25,'럼 베이스의 새콤달콤하고 시원한 라임 칵테일','\"헤밍웨이가 사랑한 칵테일이라는데, 한 모금이면 이유를 알겠지.\"',NULL,'2025-04-09 01:44:04'),
(10,'드라이 마티니',1,'1oz',21,'1oz',NULL,NULL,NULL,NULL,7,'stir',0,0,'martini',30,'진과 드라이 베르무트의 깔끔한 조화, 고전적인 드라이 칵테일','\"한 잔이면 신사, 두 잔이면 철학자, 세 잔이면 골칫거리.\"',NULL,'2025-04-09 01:44:04'),
(11,'프렌치 커넥션',5,'1oz',17,'1oz',NULL,NULL,NULL,NULL,NULL,'stir',0,1,'on_the_rocks',35,'브랜디와 아몬드 리큐르의 부드럽고 달콤한 조화','\"프랑스의 하드보일드, 너무 깊숙이 알려 하지 말 것.\"',NULL,'2025-04-09 01:44:04'),
(12,'행키팽키',1,'1.5oz',22,'1.5oz',23,'1dash',NULL,NULL,NULL,'stir',0,0,'martini',29,'진과 스위트 베르무트, 허브 리큐르의 씁쓸하고 달콤한 매력','\"이 칵테일 정말 쌔끈하구먼! 아, 물론 세련되고 끝내준다는 뜻일세.\"',NULL,'2025-04-09 01:44:04'),
(13,'라스트 워드',1,'1oz',20,'1oz',14,'1oz',12,'1oz',NULL,'shake',1,0,'martini',30,'진과 체리, 허브, 라임이 어우러진 새콤하고 씁쓸한 칵테일','\"이걸 마시면 마지막 말을 남길 필요도 없다. 이 한 잔이 곧 마지막 말이 될테니.\"',NULL,'2025-04-09 01:44:04'),
(14,'맨해튼',4,'1oz',22,'1oz',23,'2dash',NULL,NULL,10,'stir',0,0,'martini',30,'위스키와 스위트 베르무트, 비터스의 조화로운 스파이시함','\"칵테일의 여왕이라던데, 그럼 왕은 누구지?\"',NULL,'2025-04-09 01:44:04'),
(15,'마가리타',6,'2oz',9,'1oz',12,'0.5oz',NULL,NULL,NULL,'shake',1,0,'margarita',30,'데킬라와 시트러스의 상큼한 멕시칸 대표 칵테일','\"신맛과 짠맛이 합쳐지면 의외의 단맛이 난다는 사실, 알고 계셨나요?\"',NULL,'2025-04-09 01:44:04'),
(16,'마르티네스',1,'1.5oz',21,'1oz',23,'1dash',NULL,NULL,NULL,'stir',0,0,'martini',32,'마티니의 시초가 된 고전적인 진 칵테일','\"여왕은 곧 왕의 아버지가 되었나니-.\"',NULL,'2025-04-09 01:44:04'),
(17,'메리 픽포드',2,'1.5oz',16,'1.5oz',13,'0.5oz',10,'1oz',9,'shake',1,0,'martini',23,'럼과 파인애플의 달콤한 조화, 체리의 포인트가 살아 있는 클래식한 열대풍 칵테일','\"영화계의 영원한 여왕을 위하여, -프레드 카우프만-\"',NULL,'2025-04-09 01:44:04'),
(18,'코스모폴리탄',3,'1.5oz',15,'0.5oz',9,'0.5oz',12,'0.5oz',NULL,'shake',1,0,'martini',30,'크랜베리와 감귤류의 산미가 조화를 이루는 도시적이고 세련된 보드카 베이스 칵테일','\"누가 만들었는지는 몰라도, 크렌베리 주스를 너무나도 예쁜 분홍색을 낼 수 있을 만큼 넣었더군.\"',NULL,'2025-04-09 01:44:04'),
(19,'민트 줄렙',4,'2oz',18,'0.5oz',23,'2dash',NULL,NULL,11,'shake',1,1,'long_drink',20,'위스키와 민트의 상쾌함이 어우러진 더운 여름에 어울리는 청량한 칵테일','\"소화제였지만, 너무 맛있어서 결국 칵테일로 탈바꿈 되었다지, 아마?\"',NULL,'2025-04-09 01:44:04'),
(20,'몽키 글랜드',1,'1.5oz',11,'1.5oz',7,'0.5oz',26,'0.5oz',NULL,'shake',1,0,'martini',25,'진한 오렌지와 허브 향이 어우러진 독특한 이름의 클래식 칵테일','\"원숭이한테 필요한 건 술이 아니라 바나나겠지만, 인간이라면 이야기가 다르지.\"',NULL,'2025-04-09 01:44:04'),
(21,'네그로니',1,'1oz',20,'1oz',22,'1oz',NULL,NULL,1,'stir',1,1,'on_the_rocks',21,'진, 베르무트, 리큐르의 쌉쌀하고 깊은 맛이 조화를 이루는 대표적인 이탈리안 칵테일','\"쓴맛이 인생을 망치는 게 아니라, 되려 풍미를 더하는 법이지.\"',NULL,'2025-04-09 01:44:04'),
(22,'올드 패션드',4,'1oz',18,'1oz',23,'2dash',NULL,NULL,NULL,'stir',0,1,'on_the_rocks',35,'위스키 본연의 맛을 살린 클래식 중의 클래식, 쌉쌀함과 단맛의 밸런스','\"너무 올드하다고? 이건 그냥 클래식이야.\"',NULL,'2025-04-09 01:44:04'),
(23,'리멤버 더 메인',4,'2oz',22,'1oz',14,'0.5oz',7,'2dash',NULL,'shake',1,0,'martini',30,'쌉쌀함과 스파이스가 어우러진 역사적 의미가 담긴 위스키 기반 칵테일','\"메인 함을 기억하라, 스페인에게 지옥을!\"',NULL,'2025-04-09 01:44:04'),
(24,'러스티 네일',4,'1.5oz',20,'1oz',18,'0.5oz',NULL,NULL,1,'stir',0,1,'on_the_rocks',30,'스카치와 리큐르의 깊고 부드러운 조화, 진한 풍미의 스피릿 칵테일','\"문샤인을 담을 곳이 없어서 녹슨 못통에 담갔더니, 딱 이 색깔이었어.\"',NULL,'2025-04-09 01:44:04'),
(25,'사제락',5,'2oz',7,'0.5oz',18,'0.5oz',23,'2dash',1,'stir',0,1,'on_the_rocks',30,'브랜디와 압생트, 비터스의 조화가 돋보이는 강한 칵테일','\"도수도 높고 향도 쎄지. 마시기 전엔 각오부터 해야 해.\"',NULL,'2025-04-09 01:44:04'),
(26,'사이드카',5,'2oz',9,'1oz',13,'1oz',NULL,NULL,7,'shake',0,0,'martini',30,'브랜디에 오렌지 리큐르와 레몬 주스가 더해진 상큼한 클래식','\"개발자의 레시피 북에 단위가 없어서 막 만들다보니 한 잔에 담고도 남아서 이름이 \'사이드 카\'라더군.\"',NULL,'2025-04-09 01:44:04'),
(27,'사우스사이드',1,'2oz',13,'1oz',18,'0.5oz',NULL,NULL,11,'shake',0,0,'martini',23,'민트 향과 시트러스가 어우러진 상쾌한 진 칵테일','\"이런 걸 두고 진짜 교양 있게 취한다고 하지.\"',NULL,'2025-04-09 01:44:04'),
(28,'스팅어',5,'2oz',20,'1oz',NULL,NULL,NULL,NULL,NULL,'stir',0,1,'on_the_rocks',30,'브랜디와 허브 리큐르가 어우러져 강렬하고 드라이한 풍미를 전하는 클래식 칵테일','\"민트 향으로 입안을 콕콕 쏘아 침을 마르게 하는 맛이 있어.\"',NULL,'2025-04-09 01:44:04'),
(29,'톰 콜린스',1,'2oz',13,'1oz',18,'1oz',25,'filling',1,'shake',1,1,'long_drink',10,'진과 시트러스, 소다가 어우러진 청량감 넘치는 클래식 칵테일','\"본인 이름을 칵테일 이름으로 만들다니, 맛있으니 망정이지.\"',NULL,'2025-04-09 01:44:04'),
(30,'턱시도',1,'1oz',21,'1oz',14,'1dash',23,'1dash',1,'shake',1,0,'martini',33,'드라이하고 독특한 풍미가 특징인 고전적인 진 베이스 칵테일','\"이 녀석을 마실 때는 턱시도를 입으라는 규칙이라도 있나?\"',NULL,'2025-04-09 01:44:04'),
(31,'워드 8',4,'2oz',11,'1oz',13,'1oz',26,'0.5oz',8,'shake',0,0,'martini',30,'위스키와 과일 주스가 조화를 이루는 상큼한 맛의 칵테일','\"랜싱턴 시를 8개의 구로 나눈 구정 개시를 기념하여 만든 기념주입니다. 뉴 랜싱턴을 위하여!\"',NULL,'2025-04-09 01:44:04'),
(32,'위스키 사워',4,'2oz',13,'1oz',18,'1oz',NULL,NULL,1,'shake',1,0,'sour',25,'위스키의 묵직함과 레몬의 상큼함이 어우러진 대표적인 사워 계열 칵테일','\"위스키가 쓸 땐, 새콤함을 더해 달게 마셔보는건 어떨까라는 궁금증에서 나온 칵테일.\"',NULL,'2025-04-09 01:44:04'),
(33,'화이트 레이디',1,'1.5oz',9,'1oz',13,'0.5oz',NULL,NULL,1,'shake',1,0,'martini',28,'상큼한 시트러스와 부드러운 진이 어우러진 클래식 칵테일','\"아침식사와 함께 마시기 좋은 칵테일이지만, 그렇다고 너무 마시진 마라.\"',NULL,'2025-04-09 01:44:04'),
(34,'뷰 카레',4,'1oz',5,'1oz',22,'1oz',23,'2dash',10,'stir',0,1,'on_the_rocks',30,'위스키, 브랜디, 베르무트가 어우러진 뉴올리언스 스타일의 풍부한 칵테일','\"칵테일이 꼭 술과 술의 조합으로 만들 필요는 없잖아?\"',NULL,'2025-04-09 01:44:04'),
(35,'파우스트',2,'2oz',3,'1oz',15,'0.5oz',NULL,NULL,NULL,'shake',0,0,'martini',33,'럼과 크렌베리 주스의 조합으로 묵직하고 달콤한 향을 지닌 칵테일','\"멈추어라! 너는 참으로 아름답구나!\"',NULL,'2025-04-09 01:44:04'),
(36,'플랜터즈 펀치',2,'1.5oz',12,'0.5oz',16,'1oz',NULL,NULL,9,'shake',1,1,'long_drink',17,'상큼한 라임과 달콤한 럼이 어우러진 트로피컬 스타일 칵테일','\"1 Sour, 2 Sweet, 3 Strong, 4 Weak.\"',NULL,'2025-04-09 01:44:04'),
(37,'레모네이드',8,'2oz',13,'1oz',18,'0.5oz',25,'filling',2,'shake',0,1,'long_drink',15,'문샤인 기반의 상큼한 여름 음료','\"금주법 시절, 단속을 피하며 술을 마시기 위해 개발한 칵테일이다.\"',NULL,'2025-04-09 01:44:04'),
(38,'리베르탱고',1,'2oz',21,'1oz',14,'0.5oz',26,'0.5oz',10,'shake',1,0,'martini',30,'체리 향과 드라이함이 어우러지는 관능적인 칵테일','\"나에게 있어 탱고는 발보다 귀를 위한 것이다, -아스토르 피아졸라-\"',NULL,'2025-04-09 01:44:04'),
(39,'마제스틱',5,'1.5oz',19,'1oz',22,'0.5oz',9,'0.5oz',7,'shake',1,0,'sour',30,'브랜디와 커피의 조화, 깊이 있는 단맛과 쌉쌀함','\"커피처럼 부드럽고, 브랜디처럼 진하다.\"',NULL,'2025-04-09 01:44:04'),
(40,'문샤인 펀치',8,'1.5oz',11,'1.5oz',15,'1.5oz',16,'1.5oz',NULL,'shake',1,1,'long_drink',15,'문샤인과 과일 주스의 상큼한 펀치 칵테일','\"아무리 싸구려 술이라도, 달콤하게 포장할 수 있는 방법이 바로 이거 아닐까?\"',NULL,'2025-04-09 01:44:04'),
(41,'불멸의 커피',5,'2oz',19,'1.5oz',18,'1oz',23,'1dash',NULL,'shake',0,1,'on_the_rocks',25,'브랜디와 커피의 깊이 있는 조화, 깔끔한 마무리','\"주사가 자는 사람이라면, 이 칵테일을 적극 추천함.\"',NULL,'2025-04-09 01:44:04'),
(42,'스윗 리버티',5,'2oz',13,'0.5oz',18,'0.5oz',23,'2dash',7,'shake',1,0,'coupe',25,'단맛과 쌉쌀함이 공존하는 리버티 스타일 칵테일','\"How\'d you like the taste of Freedom?\"',NULL,'2025-04-09 01:44:04'),
(43,'엘 도라도',6,'1oz',2,'1oz',11,'2oz',16,'2oz',9,'stir',0,1,'long_drink',10,'선라이즈 스타일 데킬라 칵테일','\"엘 도라도의 태양은 불타오르는 황금색이지.\"',NULL,'2025-04-09 01:44:04'),
(44,'오렌지 밤',3,'1.5oz',11,'4oz',NULL,NULL,NULL,NULL,9,'stir',0,1,'on_the_rocks',15,'상큼하고 깔끔한 보드카 기반 칵테일','\"리얼 오렌지가 보드카 속으로, 폭탄처럼 터지는 맛.\"',NULL,'2025-04-09 01:44:04'),
(45,'칼립소',2,'2oz',16,'1oz',13,'0.5oz',18,'0.5oz',8,'shake',1,1,'long_drink',15,'럼과 열대과일의 달콤한 조화','\"이 술이 \'바다의 여신\'이라는 이름을 갖게 된 것은, 옛날 해적들이 항해의 안전을 기원하며 이 술을 마셨기 때문이다.\"',NULL,'2025-04-09 01:44:04'),
(46,'타이푼',2,'2oz',15,'1oz',11,'1oz',13,'0.5oz',8,'shake',1,1,'long_drink',15,'폭풍처럼 강렬한 과일풍 럼 칵테일','\"허리케인, 타이푼, 사이클론.. 사실은 다 똑같은 회오리 아니야?\"',NULL,'2025-04-09 01:44:04'),
(47,'포스포러스',1,'3oz',3,'1oz',22,'0.5oz',10,'0.5oz',1,'shake',1,0,'sour',30,'푸른 빛처럼 빛나는 시그니처 칵테일','\"진 세번, 보드카 한 번 허브 리큐르 절반… 다음 대사가 떠오른다고? 음, 그건 아마 착각일거야.\"',NULL,'2025-04-09 01:44:04'),
(48,'허브 가든',1,'2oz',20,'1oz',12,'1oz',18,'0.5oz',11,'shake',1,1,'long_drink',20,'허브의 향긋함이 가득한 정원 같은 칵테일','\"정원을 한 잔에 담았다. 그러면 이건 마시는 정원인가?\"',NULL,'2025-04-09 01:44:04'),
(49,'디버깅 칵테일',1,'1oz',5,'0.5oz',6,'0.5oz',14,'1dash',3,'shake',1,0,'martini',39,NULL,NULL,1,'2025-04-22 22:49:25'),
(69,'선라이즈 오브 뉴 랜싱턴',2,'1.5oz',16,'1oz',26,'0.5oz',NULL,NULL,9,'shake',1,1,'long_drink',14,'트로피컬한 느낌의 상큼한 칵테일','여름 아침이 생각나는 맛입니다.',35,'2025-05-24 00:04:11'),
(70,'블루 미스트',1,'2oz',10,'1oz',13,'0.5oz',NULL,NULL,1,'shake',1,0,'martini',27,'진과 시트러스의 조화','잔잔한 밤에 어울리는 술',36,'2025-05-24 00:04:11'),
(71,'허브 나잇',1,'1oz',20,'1oz',18,'0.5oz',NULL,NULL,11,'shake',0,0,'martini',28,'허브 향 가득한 신비로운 칵테일','고요한 분위기에 딱이에요.',37,'2025-05-24 00:04:11'),
(72,'버번 솔트',4,'2oz',18,'0.5oz',23,'2dash',NULL,NULL,6,'stir',0,1,'on_the_rocks',32,'짠맛과 바닐라 향이 공존하는 무거운 칵테일','묵직한 한 방이 필요할 때.',38,'2025-05-24 00:04:11'),
(73,'로맨틱 체리',5,'1.5oz',14,'1oz',13,'0.5oz',NULL,NULL,10,'shake',1,0,'martini',26,'체리와 브랜디의 조화','디저트와 함께 좋아요.',39,'2025-05-24 00:04:11'),
(74,'애프터 글로우',3,'2oz',15,'1oz',12,'0.5oz',NULL,NULL,5,'shake',0,1,'long_drink',18,'과일과 보드카의 산뜻한 칵테일','산책 후 한잔에 좋아요.',40,'2025-05-24 00:04:11'),
(75,'문나잇 진저',8,'1.5oz',16,'1oz',18,'0.5oz',NULL,NULL,2,'shake',1,1,'long_drink',19,'문샤인과 진저 계열의 조합','한밤의 열기와 어울리는 칵테일',41,'2025-05-24 00:04:11'),
(76,'그린 페어리 드림',7,'1oz',20,'1oz',12,'0.5oz',NULL,NULL,11,'stir',0,0,'martini',31,'압생트와 허브의 몽환적인 조합','꿈과 현실 사이에서.',42,'2025-05-24 00:04:11'),
(77,'러스티 플레어',4,'1.5oz',20,'1oz',18,'0.5oz',NULL,NULL,1,'stir',0,1,'on_the_rocks',30,'스모키하고 깊은 맛의 위스키 칵테일','조용한 위로를 담은 한잔.',43,'2025-05-24 00:04:11'),
(78,'핑크 아르모닉',3,'2oz',14,'1oz',15,'1oz',NULL,NULL,10,'shake',1,0,'martini',24,'상큼한 베리계열 칵테일','달콤하고도 균형잡힌 마무리',44,'2025-05-24 00:04:11');
/*!40000 ALTER TABLE `cocktail_recipe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `furniture`
--

DROP TABLE IF EXISTS `furniture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `furniture` (
  `furniture_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`furniture_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='게임 내 가구 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `furniture`
--

LOCK TABLES `furniture` WRITE;
/*!40000 ALTER TABLE `furniture` DISABLE KEYS */;
INSERT INTO `furniture` VALUES
(1,'머핀 스툴','고급 가죽과 황동 리벳으로 마감된 바 스툴. 은밀한 대화를 위한 완벽한 높이.',120000),
(2,'글로브 미니바','뚜껑을 열면 내부에 술잔과 병을 숨길 수 있다.',240000),
(3,'아르 데코 백바 캐비닛','유리 장식과 대칭 디자인이 돋보이는 원목 캐비닛.',380000),
(4,'재즈 플레이어 포스터','바 분위기를 살려주는 빈티지 벽걸이 포스터.',40000),
(5,'빈티지 포커 테이블','벨벳과 월넛 목재로 제작된 원형 테이블.',200000),
(6,'발받침대','바 카운터 아래 설치해 손님의 편안함을 높인다.',60000),
(7,'은닉형 주류장','평범한 책장처럼 보이지만, 비밀 문을 열면 술이 가득.',310000),
(8,'유리 펜던트 조명','유리 조명으로, 공간에 고급스러운 빛을 더함.',90000);
/*!40000 ALTER TABLE `furniture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garnish_type`
--

DROP TABLE IF EXISTS `garnish_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `garnish_type` (
  `garnish_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `note_category_id` int(11) NOT NULL,
  PRIMARY KEY (`garnish_id`),
  KEY `note_category_id` (`note_category_id`),
  CONSTRAINT `garnish_type_ibfk_1` FOREIGN KEY (`note_category_id`) REFERENCES `note_category` (`note_category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='가니시 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garnish_type`
--

LOCK TABLES `garnish_type` WRITE;
/*!40000 ALTER TABLE `garnish_type` DISABLE KEYS */;
INSERT INTO `garnish_type` VALUES
(1,'레몬 필',2),
(2,'레몬 웨지',2),
(3,'레몬 슬라이스',2),
(4,'라임 필',2),
(5,'라임 웨지',2),
(6,'라임 슬라이스',2),
(7,'오렌지 필',2),
(8,'오렌지 웨지',2),
(9,'오렌지 슬라이스',2),
(10,'체리',4),
(11,'애플 민트',3),
(16,'test',8);
/*!40000 ALTER TABLE `garnish_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient`
--

DROP TABLE IF EXISTS `ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ingredient` (
  `ingredient_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sweetness` tinyint(4) NOT NULL,
  `sourness` tinyint(4) NOT NULL,
  `bitterness` tinyint(4) NOT NULL,
  `abv` int(11) NOT NULL,
  PRIMARY KEY (`ingredient_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='칵테일 재료 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient`
--

LOCK TABLES `ingredient` WRITE;
/*!40000 ALTER TABLE `ingredient` DISABLE KEYS */;
INSERT INTO `ingredient` VALUES
(1,'진','허브와 향신료로 증류한 드라이하고 강렬한 술. 시원한 향이 특징이다.',0,0,2,40),
(2,'럼','사탕수수로 만들어진 달콤하고 묵직한 향의 술. 열대 지역의 향취를 담고 있다.',1,0,1,40),
(3,'보드카','중립적이고 깔끔한 맛의 증류주. 어떤 재료와도 잘 섞인다.',0,0,0,40),
(4,'위스키','오크통에서 숙성된 깊은 풍미와 스모키한 향을 지닌 술.',1,0,3,40),
(5,'브랜디','과실주를 증류하여 만든 달콤하고 부드러운 풍미의 고급 술.',2,0,1,40),
(6,'데킬라','용설란에서 추출한 강렬하고 향긋한 술, 실은 본명이 따로 있다던데..',0,1,2,40),
(7,'압생트','쌉싸름한 향신료와 허브 향이 강하게 풍기는 녹색의 술. 천사인가, 악마인가.',1,0,4,40),
(8,'문샤인','세 번 증류한 싸구려 증류주, 규칙 밖의 자유를 담고 있다. 과거 금주법 시절, 단속을 피해 달빛을 받으며 제조하였기에 이런 이름이 붙었다.',0,0,2,45),
(9,'오렌지 리큐르','상큼한 오렌지 향과 달콤한 맛이 어우러진 리큐르.',4,0,3,30),
(10,'블루 큐라소','푸른 색감이 인상적인 오렌지 리큐르. 칵테일에 시각적 매력을 더한다.',4,0,3,30),
(11,'오렌지 주스','새콤달콤한 오렌지 주스, 다수의 칵테일에서 재료로 자주 사용된다.',4,3,0,0),
(12,'라임 주스','신선한 라임을 짜서 만든 새콤씁쓸한 주스, 잘 어울리는 술이 있다던데, 이름이 뭐였더라..',0,4,2,0),
(13,'레몬 주스','신선한 레몬을 짜서 만든 새콤달콤한 주스. 졸릴 땐 그냥 생으로 마셔보자.',0,5,0,0),
(14,'체리 리큐르','진한 체리향과 단맛이 어우러진 깊은 풍미의 리큐르. 금주법 시절, 약용목적으로 음용하곤  했다.',5,0,3,25),
(15,'크랜베리 주스','신선한 크렌베리 주스, 새콤하면서도 상쾌한 베리 향이 매력적이다.',2,5,0,0),
(16,'파인애플 주스','열대의 신선한 파인애플 주스, 열대 과일 특유의 달콤함과 산뜻함이 조화를 이룬다.',4,3,0,0),
(17,'아몬드 리큐르','고소하고 달콤한 아몬드 향이 나는 리큐르. 실은 아몬드가 거의 안들어갔다.',5,0,3,25),
(18,'심플 시럽','물과 설탕을 1:1로 녹인 단순한 감미료. 맛의 균형을 잡아준다. 그냥 설탕물 아니냐고?',5,0,0,0),
(19,'커피 리큐르','쌉싸름한 커피 향과 달콤함이 공존하는 리큐르. 무게감 있는 맛을 낸다.',3,0,3,20),
(20,'허브 리큐르','다양한 약초의 향을 응축한 리큐르. 복잡하고 묘한 여운을 남긴다. 이 정도면 약으로 쳐도 되지 않나?',3,0,3,35),
(21,'드라이 베르무트','쌉싸름하고 깔끔한 허브 풍미의 주정 강화 와인.',0,0,5,20),
(22,'스위트 베르무트','달콤함과 약초향이 절묘하게 어우러진 주정 강화 와인.',4,0,3,15),
(23,'비터스','약용 목적으로 만들어진 허브 추출물, 극소량으로도 전체 칵테일의 풍미를 조절한다. 이 녀석을 샷으로 마시는 클럽이 있다던데..',0,0,5,45),
(24,'우유','신선한 우유, 부드럽고 크리미한 질감을 더해준다. 알콜의 거친 맛을 감싼다.',4,0,0,0),
(25,'탄산수','청량감을 더해주는 무미의 탄산. 칵테일을 가볍게 만들어준다.',0,0,0,0),
(26,'그레나딘 시럽','석류로 만든 진한 단맛의 시럽. 붉은 색감과 달콤한 맛을 더한다.',5,2,0,0),
(47,'ABCD',NULL,1,2,3,4);
/*!40000 ALTER TABLE `ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient_note`
--

DROP TABLE IF EXISTS `ingredient_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ingredient_note` (
  `ingredient_id` int(11) NOT NULL,
  `note_category_id` int(11) NOT NULL,
  PRIMARY KEY (`ingredient_id`,`note_category_id`),
  KEY `note_category_id` (`note_category_id`),
  CONSTRAINT `ingredient_note_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient` (`ingredient_id`) ON DELETE CASCADE,
  CONSTRAINT `ingredient_note_ibfk_2` FOREIGN KEY (`note_category_id`) REFERENCES `note_category` (`note_category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='재료와 향미 노트 카테고리 간 관계 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient_note`
--

LOCK TABLES `ingredient_note` WRITE;
/*!40000 ALTER TABLE `ingredient_note` DISABLE KEYS */;
INSERT INTO `ingredient_note` VALUES
(1,1),
(1,3),
(2,1),
(2,6),
(3,1),
(3,11),
(4,1),
(4,8),
(5,1),
(5,6),
(6,1),
(6,9),
(7,1),
(7,3),
(8,1),
(8,8),
(9,2),
(9,6),
(10,2),
(10,6),
(11,2),
(11,6),
(12,2),
(12,9),
(13,2),
(13,6),
(14,4),
(14,6),
(15,2),
(15,4),
(16,5),
(16,6),
(17,6),
(17,10),
(18,6),
(19,6),
(19,7),
(20,3),
(20,6),
(21,3),
(22,4),
(22,6),
(23,3),
(24,11),
(24,12),
(25,11),
(26,4),
(26,6),
(47,1),
(47,2);
/*!40000 ALTER TABLE `ingredient_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `long_playing_record`
--

DROP TABLE IF EXISTS `long_playing_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `long_playing_record` (
  `record_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`record_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='게임 내 LP 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `long_playing_record`
--

LOCK TABLES `long_playing_record` WRITE;
/*!40000 ALTER TABLE `long_playing_record` DISABLE KEYS */;
INSERT INTO `long_playing_record` VALUES
(1,'Midnight Sax','색소폰의 부드러운 선율을 담은 재즈 컬렉션.',45000),
(2,'The Velvet Trumpet','황금빛 트럼펫과 아르데코 조명의 리듬이 어우러진 스윙 앨범.',50000),
(3,'Bootleg Blues','지하바에서 은밀히 녹음된 블루스의 진수.',40000),
(4,'Smoke & Whiskey','거친 남성 보컬과 피아노 선율이 어우러진 재즈 보컬 앨범.',55000),
(5,'Speakeasy Sessions Vol. 1','실제 연주된 세트리스트를 복원한 희귀 LP.',60000),
(6,'Gin & Gramophone','경쾌한 피아노와 여성 보컬의 달콤쌉싸름한 조화.',48000);
/*!40000 ALTER TABLE `long_playing_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_category`
--

DROP TABLE IF EXISTS `note_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `note_category` (
  `note_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`note_category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='노트(향미) 카테고리 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_category`
--

LOCK TABLES `note_category` WRITE;
/*!40000 ALTER TABLE `note_category` DISABLE KEYS */;
INSERT INTO `note_category` VALUES
(4,'Berry'),
(2,'Citrus'),
(7,'Coffee'),
(12,'Creamy'),
(3,'Herbal'),
(10,'Nutty'),
(11,'Plain'),
(8,'Smoky'),
(9,'Spicy'),
(1,'Spirit'),
(6,'Sweet'),
(5,'Tropical');
/*!40000 ALTER TABLE `note_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unlocked_ingredient`
--

DROP TABLE IF EXISTS `unlocked_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unlocked_ingredient` (
  `user_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`slot_id`,`ingredient_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `unlocked_ingredient_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `unlocked_ingredient_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='유저별 해금된 재료 관리 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unlocked_ingredient`
--

LOCK TABLES `unlocked_ingredient` WRITE;
/*!40000 ALTER TABLE `unlocked_ingredient` DISABLE KEYS */;
INSERT INTO `unlocked_ingredient` VALUES
(1,1,1),
(1,1,2),
(1,1,3);
/*!40000 ALTER TABLE `unlocked_ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `google_sub` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `profile_image` text DEFAULT NULL,
  `registered_at` datetime DEFAULT current_timestamp(),
  `signature_cocktail_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `google_sub` (`google_sub`),
  KEY `fk_user_signature_cocktail` (`signature_cocktail_id`),
  CONSTRAINT `fk_user_signature_cocktail` FOREIGN KEY (`signature_cocktail_id`) REFERENCES `cocktail_recipe` (`recipe_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='유저 기본 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'test-google-sub-123','test@example.com','테스트유저','https://example.com/profile.png','2025-04-17 21:59:19',NULL),
(2,'a_7523656884715185868',NULL,'gamemaker8684','https://lh3.googleusercontent.com/mVGjeQUdZJI0CXJHbz2yO0_gnxQiQu6Bo-KAtqQ5bHUXbZ2UrSdHBd0vmb2Qw2Vnn714','2025-04-25 04:28:26',NULL),
(3,'a_8634519308736895451',NULL,'UniqueHero2143','https://lh3.googleusercontent.com/4xKyR2m7cv2i3eMq-4B8tZpud0785b5jyHmQE7zLYE84ifQsAwWLyb6BWD_0OaA0Kow','2025-04-25 14:37:18',NULL),
(4,'a_7129759791314125181',NULL,'PureInstructor97','https://lh3.googleusercontent.com/BDYz2mEEqtB9JGCH_uR0rE6lIIJOnoRhAzdla91I-sFg-cdl1NUi79AYciv5iujzL7711Q','2025-04-25 14:55:23',NULL),
(35,'a_0000000000000000001',NULL,'gamemaker8684','https://randomuser.me/api/portraits/men/1.jpg','2025-04-25 00:00:00',NULL),
(36,'a_0000000000000000002',NULL,'UniqueHero2143','https://randomuser.me/api/portraits/men/2.jpg','2025-04-25 00:00:00',NULL),
(37,'a_0000000000000000003',NULL,'PureInstructor97','https://randomuser.me/api/portraits/men/3.jpg','2025-04-25 00:00:00',NULL),
(38,'a_0000000000000000004',NULL,'MagicFlame1023','https://randomuser.me/api/portraits/women/4.jpg','2025-04-26 00:00:00',NULL),
(39,'a_0000000000000000005',NULL,'OceanHunter2288','https://randomuser.me/api/portraits/men/5.jpg','2025-04-26 00:00:00',NULL),
(40,'a_0000000000000000006',NULL,'FireDancer1142','https://randomuser.me/api/portraits/women/6.jpg','2025-04-26 00:00:00',NULL),
(41,'a_0000000000000000007',NULL,'CrystalShadow3301','https://randomuser.me/api/portraits/men/7.jpg','2025-04-26 00:00:00',NULL),
(42,'a_0000000000000000008',NULL,'EchoGuardian7182','https://randomuser.me/api/portraits/women/8.jpg','2025-04-26 00:00:00',NULL),
(43,'a_0000000000000000009',NULL,'LunarForge9024','https://randomuser.me/api/portraits/men/9.jpg','2025-04-26 00:00:00',NULL),
(44,'a_0000000000000000010',NULL,'SkyBreaker5580','https://randomuser.me/api/portraits/women/10.jpg','2025-04-26 00:00:00',NULL),
(45,'a_0000000000000000011',NULL,'DreamWeaver6441','https://randomuser.me/api/portraits/men/11.jpg','2025-04-26 00:00:00',NULL),
(46,'a_0000000000000000012',NULL,'CyberFlare7217','https://randomuser.me/api/portraits/women/12.jpg','2025-04-26 00:00:00',NULL),
(47,'a_0000000000000000013',NULL,'WhiskeyFalcon3890','https://randomuser.me/api/portraits/men/13.jpg','2025-04-26 00:00:00',NULL),
(48,'a_0000000000000000014',NULL,'NeonScholar2421','https://randomuser.me/api/portraits/women/14.jpg','2025-04-26 00:00:00',NULL),
(49,'a_0000000000000000015',NULL,'ThunderCleric8011','https://randomuser.me/api/portraits/men/15.jpg','2025-04-26 00:00:00',NULL),
(50,'a_0000000000000000016',NULL,'AetherKnight1244','https://randomuser.me/api/portraits/women/16.jpg','2025-04-26 00:00:00',NULL),
(51,'a_0000000000000000017',NULL,'GlassTiger3609','https://randomuser.me/api/portraits/men/17.jpg','2025-04-26 00:00:00',NULL),
(52,'a_0000000000000000018',NULL,'SilentFox4272','https://randomuser.me/api/portraits/women/18.jpg','2025-04-26 00:00:00',NULL),
(53,'a_0000000000000000019',NULL,'IvoryMonk1138','https://randomuser.me/api/portraits/men/19.jpg','2025-04-26 00:00:00',NULL),
(54,'a_0000000000000000020',NULL,'VelvetSage2765','https://randomuser.me/api/portraits/women/20.jpg','2025-04-26 00:00:00',NULL),
(55,'a_0000000000000000021',NULL,'NebulaTinker3388','https://randomuser.me/api/portraits/men/21.jpg','2025-04-26 00:00:00',NULL),
(56,'a_0000000000000000022',NULL,'QuantumNomad1211','https://randomuser.me/api/portraits/women/22.jpg','2025-04-26 00:00:00',NULL),
(57,'a_0000000000000000023',NULL,'ChromeOracle5012','https://randomuser.me/api/portraits/men/23.jpg','2025-04-26 00:00:00',NULL),
(58,'a_0000000000000000024',NULL,'PlasmaWizard9484','https://randomuser.me/api/portraits/women/24.jpg','2025-04-26 00:00:00',NULL),
(59,'a_0000000000000000025',NULL,'RetroBaron4115','https://randomuser.me/api/portraits/men/25.jpg','2025-04-26 00:00:00',NULL),
(60,'a_0000000000000000026',NULL,'NovaPilot3243','https://randomuser.me/api/portraits/women/26.jpg','2025-04-26 00:00:00',NULL),
(61,'a_0000000000000000027',NULL,'BinaryScribe8519','https://randomuser.me/api/portraits/men/27.jpg','2025-04-26 00:00:00',NULL),
(62,'a_0000000000000000028',NULL,'WhisperLancer6591','https://randomuser.me/api/portraits/women/28.jpg','2025-04-26 00:00:00',NULL),
(63,'a_0000000000000000029',NULL,'EchoAlchemist7070','https://randomuser.me/api/portraits/men/29.jpg','2025-04-26 00:00:00',NULL),
(64,'a_0000000000000000030',NULL,'StaticShade3773','https://randomuser.me/api/portraits/women/30.jpg','2025-04-26 00:00:00',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_dialogs`
--

DROP TABLE IF EXISTS `user_dialogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_dialogs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `npc_id` varchar(100) NOT NULL,
  `speaker` enum('user','npc') NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `emotion_tag` varchar(50) DEFAULT NULL,
  `is_training_data` tinyint(1) DEFAULT 1,
  `version_tag` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_dialogs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_dialogs`
--

LOCK TABLES `user_dialogs` WRITE;
/*!40000 ALTER TABLE `user_dialogs` DISABLE KEYS */;
INSERT INTO `user_dialogs` VALUES
(1,'1_silvia_1_1',1,1,'silvia','npc','안녕하세요. 여기 분위기가 정말 좋네요.','2025-04-17 21:59:51',NULL,1,NULL),
(2,'1_silvia_1_1',1,1,'silvia','user','어서 오세요. 바에 처음 오셨나요?','2025-04-17 21:59:51',NULL,1,NULL),
(3,'1_silvia_1_1',1,1,'silvia','npc','네, 지인 소개로 오게 됐어요.','2025-04-17 21:59:51',NULL,1,NULL),
(4,'1_silvia_1_1',1,1,'silvia','user','좋은 선택이시네요. 오늘은 어떤 기분이신가요?','2025-04-17 21:59:51',NULL,1,NULL),
(5,'1_silvia_1_1',1,1,'silvia','npc','음… 상큼하면서도 진한 맛이 땡기네요.','2025-04-17 21:59:51',NULL,1,NULL),
(6,'1_silvia_1_1',1,1,'silvia','user','그렇다면 문샤인 베이스의 선셋 드림을 추천드릴게요.','2025-04-17 21:59:51',NULL,1,NULL),
(7,'1_silvia_1_1',1,1,'silvia','npc','이름이 멋지네요. 한 잔 부탁드릴게요.','2025-04-17 21:59:51',NULL,1,NULL),
(8,'1_silvia_1_1',1,1,'silvia','user','금방 만들어드릴게요. 잠시만 기다려주세요.','2025-04-17 21:59:51',NULL,1,NULL),
(9,'1_silvia_1_1',1,1,'silvia','npc','여유로운 이 공간, 마음에 들어요.','2025-04-17 21:59:51',NULL,1,NULL),
(10,'1_silvia_1_1',1,1,'silvia','user','그렇게 말씀해주시니 정말 보람 있네요. 감사합니다.','2025-04-17 21:59:51',NULL,1,NULL),
(11,'2_silvia_1_3',1,1,'Charles','npc','안녕하세요. 여기 분위기가 정말 좋네요.','2025-04-18 00:57:21',NULL,1,NULL),
(12,'2_silvia_1_3',1,1,'Charles','user','어서 오세요. 바에 처음 오셨나요?','2025-04-18 00:57:21',NULL,1,NULL),
(13,'2_silvia_1_3',1,1,'Charles','npc','네, 지인 소개로 오게 됐어요.','2025-04-18 00:57:21',NULL,1,NULL),
(14,'2_silvia_1_3',1,1,'Charles','user','좋은 선택이시네요. 오늘은 어떤 기분이신가요?','2025-04-18 00:57:21',NULL,1,NULL),
(15,'2_silvia_1_3',1,1,'Charles','npc','음… 상큼하면서도 진한 맛이 땡기네요.','2025-04-18 00:57:21',NULL,1,NULL),
(16,'2_silvia_1_3',1,1,'Charles','user','그렇다면 문샤인 베이스의 선셋 드림을 추천드릴게요.','2025-04-18 00:57:21',NULL,1,NULL),
(17,'2_silvia_1_3',1,1,'Charles','npc','이름이 멋지네요. 한 잔 부탁드릴게요.','2025-04-18 00:57:21',NULL,1,NULL),
(18,'2_silvia_1_3',1,1,'Charles','user','금방 만들어드릴게요. 잠시만 기다려주세요.','2025-04-18 00:57:21',NULL,1,NULL),
(19,'2_silvia_1_3',1,1,'Charles','npc','여유로운 이 공간, 마음에 들어요.','2025-04-18 00:57:21',NULL,1,NULL),
(20,'2_silvia_1_3',1,1,'Charles','user','그렇게 말씀해주시니 정말 보람 있네요. 감사합니다.','2025-04-18 00:57:21',NULL,1,NULL),
(111,'3_sol_1_2',1,1,'sol','user','랜싱턴시의 미래는 어떻게 될까','2025-05-15 03:18:30',NULL,1,'sol-v1.6.2'),
(112,'3_sol_1_2',1,1,'sol','npc','? 미래에 대한 예측은 불확실하며, 랜싱턴시의 미래를 예측하는 것은 어렵습니다.','2025-05-15 03:18:30',NULL,1,'sol-v1.6.2'),
(145,'3_sol_1_3',1,1,'sol','user','술 마시고 무슨 생각 하세요?','2025-05-15 18:14:47',NULL,1,'sol-v1.7.1'),
(146,'3_sol_1_3',1,1,'sol','npc','상황이 마땅하지 않아. - 잔이 비어지지 않기 때문이다.','2025-05-15 18:14:47',NULL,1,'sol-v1.7.1'),
(147,'3_sol_1_3',1,1,'sol','user','웃으시는 거 처음 봬요.','2025-05-15 18:15:08',NULL,1,'sol-v1.7.1'),
(148,'3_sol_1_3',1,1,'sol','npc','그런 건 단순한 표정일 뿐. 그건, 당신이 마음에 들지 않으셨을 거야.','2025-05-15 18:15:08',NULL,1,'sol-v1.7.1'),
(159,'3_sol_1_3',1,1,'sol','user','이 시간에 여기 계실 줄은 몰랐어요.','2025-05-15 18:48:16',NULL,1,'sol-v1.7.1'),
(160,'3_sol_1_3',1,1,'sol','npc','그런 경우는 불편해지겠지. 난 그 상황을 잡고 나가는 것이 제일 좋다고 생각해...','2025-05-15 18:48:16',NULL,1,'sol-v1.7.1'),
(161,'3_sol_1_3',1,1,'sol','user','이 시간에 여기 계실 줄은 몰랐어요.','2025-05-15 23:55:53',NULL,1,'sol-v1.7.1'),
(162,'3_sol_1_3',1,1,'sol','npc','그렇다. 난 그 안에서 내릴 수 없을 뿐이지........','2025-05-15 23:55:53',NULL,1,'sol-v1.7.1'),
(163,'3_sol_1_3',1,1,'sol','user','기억에 남는 술자리가 있다면요?','2025-05-15 23:58:54',NULL,1,'sol-v1.7.1'),
(164,'3_sol_1_3',1,1,'sol','npc','그런 생각은 하지 않아도 괜찮다. 기억에 남는 술자리더라도, 그 안에서 당신이 선택할 수 있는........, 아니죠.., 기억은 단지 지나가는 거지.','2025-05-15 23:58:54',NULL,1,'sol-v1.7.1'),
(165,'3_sol_1_3',1,1,'sol','user','늘 같은 시간에 오시네요.','2025-05-15 23:59:07',NULL,1,'sol-v1.7.1'),
(166,'3_sol_1_3',1,1,'sol','npc','이제는 예상보다 더 빨리 움직이다... 결론은 이렇다.','2025-05-15 23:59:07',NULL,1,'sol-v1.7.1'),
(169,'3_silvia_1_3',1,1,'silvia','user','늘 같은 시간에 오시네요.','2025-05-16 00:25:39',NULL,1,'silvia-v1.6.1'),
(170,'3_silvia_1_3',1,1,'silvia','npc','그런 날은 항상 기분이 좋으니까. 같이 조찬을 즐기고 움직이는 게 좋지 않아.조가 올 때마다 같은 시간에 오는 건지, 아니면 그런 계기가 있어서 오는지 궁금해요.','2025-05-16 00:25:39',NULL,1,'silvia-v1.6.1'),
(173,'user35_silvia_1_1',35,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(174,'user35_silvia_1_1',35,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(175,'user35_silvia_1_1',35,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(176,'user35_silvia_1_1',35,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(177,'user36_silvia_1_1',36,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(178,'user36_silvia_1_1',36,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(179,'user36_silvia_1_1',36,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(180,'user36_silvia_1_1',36,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(181,'user37_silvia_1_1',37,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(182,'user37_silvia_1_1',37,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(183,'user37_silvia_1_1',37,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(184,'user37_silvia_1_1',37,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(185,'user38_silvia_1_1',38,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(186,'user38_silvia_1_1',38,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(187,'user38_silvia_1_1',38,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(188,'user38_silvia_1_1',38,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(189,'user39_silvia_1_1',39,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(190,'user39_silvia_1_1',39,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(191,'user39_silvia_1_1',39,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(192,'user39_silvia_1_1',39,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(193,'user40_silvia_1_1',40,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(194,'user40_silvia_1_1',40,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(195,'user40_silvia_1_1',40,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(196,'user40_silvia_1_1',40,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(197,'user41_silvia_1_1',41,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(198,'user41_silvia_1_1',41,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(199,'user41_silvia_1_1',41,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(200,'user41_silvia_1_1',41,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(201,'user42_silvia_1_1',42,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(202,'user42_silvia_1_1',42,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(203,'user42_silvia_1_1',42,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(204,'user42_silvia_1_1',42,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(205,'user43_silvia_1_1',43,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(206,'user43_silvia_1_1',43,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(207,'user43_silvia_1_1',43,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(208,'user43_silvia_1_1',43,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(209,'user44_silvia_1_1',44,1,'silvia','npc','어서 오세요, 처음 뵙는 얼굴이네요.','2025-05-24 00:02:37',NULL,1,NULL),
(210,'user44_silvia_1_1',44,1,'silvia','user','네, 오늘 처음 방문했어요.','2025-05-24 00:02:37',NULL,1,NULL),
(211,'user44_silvia_1_1',44,1,'silvia','npc','그렇군요, 편하게 즐기다 가세요.','2025-05-24 00:02:37',NULL,1,NULL),
(212,'user44_silvia_1_1',44,1,'silvia','user','감사해요. 분위기가 정말 좋네요.','2025-05-24 00:02:37',NULL,1,NULL),
(213,'11_sol_1_1',2,1,'sol','user','안녕하세요​','2025-05-16 15:56:07',NULL,1,'sol-v1.7.2'),
(214,'11_sol_1_1',2,1,'sol','npc','인사는 형식이야. 난 그걸 생략하지.','2025-05-16 15:56:07',NULL,1,'sol-v1.7.2'),
(215,'11_sol_1_1',2,1,'sol','user','그래서 뭐 어떡할까요?​','2025-05-16 15:56:44',NULL,1,'sol-v1.7.2'),
(216,'11_sol_1_1',2,1,'sol','npc','표기만 하면 충분해. 면세점은 분류에 상관이 없군.','2025-05-16 15:56:44',NULL,1,'sol-v1.7.2'),
(217,'11_sol_1_1',2,1,'sol','user','술은 뭘 드릴까요?​','2025-05-16 15:57:22',NULL,1,'sol-v1.7.2'),
(218,'11_sol_1_1',2,1,'sol','npc','술은 맛이 중요하지. 혹시 맛에 민감하신 분이 있다면,라도 잘 드릴 수 있지.','2025-05-16 15:57:22',NULL,1,'sol-v1.7.2'),
(219,'11_sol_1_1',2,1,'sol','user','그게 제 역할이니까요​','2025-05-16 15:57:59',NULL,1,'sol-v1.7.2'),
(220,'11_sol_1_1',2,1,'sol','npc','필요할 때만 언급하는 건 한 쪽 조작의 일반이다. : ~하나만 밝혀진다는 것이 지저기 되지 않나요?','2025-05-16 15:57:59',NULL,1,'sol-v1.7.2'),
(221,'11_sol_1_1',2,1,'sol','user','지저기가 뭘까요?​','2025-05-16 15:58:51',NULL,1,'sol-v1.7.2'),
(222,'11_sol_1_1',2,1,'sol','npc','지바란 말하는 법을 잘 아는 사람이야. > 지바란 말하면, 세상이 움직인다고.','2025-05-16 15:58:51',NULL,1,'sol-v1.7.2'),
(223,'11_sol_1_1',2,1,'sol','user','지바란은 뭐죠?​','2025-05-16 15:59:17',NULL,1,'sol-v1.7.2'),
(224,'11_sol_1_1',2,1,'sol','npc','지바라는 말 그대로, 기슷하게 엎는 건을 찾는 사람들을 위한 공간. 이 쪽은 일종의 미적 요소, 아니냐?','2025-05-16 15:59:17',NULL,1,'sol-v1.7.2'),
(225,'11_sol_1_1',2,1,'sol','user','지바란은 뭐죠?​','2025-05-16 15:59:30',NULL,1,'sol-v1.7.2'),
(226,'11_sol_1_1',2,1,'sol','npc','지바라는 말 그대로, 기존에 쓰던 것 대신 나쁜 습관이 생긴 경우 때로 대답해. 기본은 확인 필요가 있으니까.','2025-05-16 15:59:30',NULL,1,'sol-v1.7.2'),
(227,'11_sol_1_1',2,1,'sol','user','지바란은 뭐죠?​','2025-05-16 16:00:16',NULL,1,'sol-v1.7.2'),
(228,'11_sol_1_1',2,1,'sol','npc','지바라는 말과, 기록으로 표현돼. 문구는 일종의 방법이지.','2025-05-16 16:00:16',NULL,1,'sol-v1.7.2'),
(229,'11_sol_1_1',2,1,'sol','user','지바겐도 아니구요?​','2025-05-16 16:00:39',NULL,1,'sol-v1.7.2'),
(230,'11_sol_1_1',2,1,'sol','npc','지바겐은 예외적인 경우에만 사용하니. ~을통할 때 쓰이는 방법은 여러가지가 있지만.','2025-05-16 16:00:39',NULL,1,'sol-v1.7.2'),
(231,'11_sol_1_1',2,1,'sol','user','안녕하세요​','2025-05-16 16:08:13',NULL,1,'sol-v1.7.2'),
(232,'11_sol_1_1',2,1,'sol','npc','인사는 형식이야. 난 그걸 생략하지.','2025-05-16 16:08:13',NULL,1,'sol-v1.7.2'),
(233,'11_sol_1_1',2,1,'sol','user','그럼 무엇을 도와드릴까요?​','2025-05-16 16:08:32',NULL,1,'sol-v1.7.2'),
(234,'11_sol_1_1',2,1,'sol','npc','당신이 떠나기 전에 말해야 하는 것 같아. *|assistant|].','2025-05-16 16:08:32',NULL,1,'sol-v1.7.2'),
(235,'11_sol_1_1',2,1,'sol','user','안녕하세요​','2025-05-16 16:17:31',NULL,1,'sol-v1.7.2'),
(236,'11_sol_1_1',2,1,'sol','npc','인사는 형식이야. 난 그걸 생략하지.','2025-05-16 16:17:31',NULL,1,'sol-v1.7.2'),
(237,'11_sol_1_1',2,1,'sol','user','그렇구나​','2025-05-16 16:17:43',NULL,1,'sol-v1.7.2'),
(238,'11_sol_1_1',2,1,'sol','npc','맞습니다. > : 모든 예상은 필요이다.','2025-05-16 16:17:43',NULL,1,'sol-v1.7.2'),
(239,'11_sol_1_1',2,1,'sol','user','ㅎㅇ​','2025-05-16 16:25:58',NULL,1,'sol-v1.7.2'),
(240,'11_sol_1_1',2,1,'sol','npc','그래서, 이제라도 제대로 처리할 수 있을 거라고 생각하니까. > 물론일 거야.','2025-05-16 16:25:58',NULL,1,'sol-v1.7.2'),
(241,'11_sol_1_1',2,1,'sol','user','ㅇㄹㅇ​','2025-05-16 16:26:11',NULL,1,'sol-v1.7.2'),
(242,'11_sol_1_1',2,1,'sol','npc','괜찮습니다. 지금도 편안하게 계실 수 있을 거예.','2025-05-16 16:26:11',NULL,1,'sol-v1.7.2');
/*!40000 ALTER TABLE `user_dialogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_furniture`
--

DROP TABLE IF EXISTS `user_furniture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_furniture` (
  `user_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `furniture_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`slot_id`,`furniture_id`),
  KEY `furniture_id` (`furniture_id`),
  CONSTRAINT `user_furniture_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_furniture_ibfk_2` FOREIGN KEY (`furniture_id`) REFERENCES `furniture` (`furniture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_furniture`
--

LOCK TABLES `user_furniture` WRITE;
/*!40000 ALTER TABLE `user_furniture` DISABLE KEYS */;
INSERT INTO `user_furniture` VALUES
(35,1,1),
(35,1,4),
(36,1,2),
(36,1,6),
(37,1,3),
(37,1,5),
(38,1,7),
(38,1,8),
(39,1,1),
(39,1,2),
(40,1,4),
(40,1,5),
(41,1,6),
(41,1,7),
(42,1,1),
(42,1,8),
(43,1,2),
(43,1,3),
(44,1,4),
(44,1,6),
(45,1,5),
(45,1,7),
(46,1,3),
(46,1,6),
(47,1,1),
(47,1,8),
(48,1,2),
(48,1,5),
(49,1,4),
(49,1,7),
(50,1,3),
(50,1,8),
(51,1,1),
(51,1,6),
(52,1,2),
(52,1,4),
(53,1,3),
(53,1,7),
(54,1,5),
(54,1,8),
(55,1,1),
(55,1,5),
(56,1,2),
(56,1,7),
(57,1,3),
(57,1,4),
(58,1,6),
(58,1,8),
(59,1,2),
(59,1,3),
(60,1,4),
(60,1,5),
(61,1,7),
(61,1,8),
(62,1,1),
(62,1,2),
(63,1,3),
(63,1,6),
(64,1,5),
(64,1,7);
/*!40000 ALTER TABLE `user_furniture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_long_playing_record`
--

DROP TABLE IF EXISTS `user_long_playing_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_long_playing_record` (
  `user_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `record_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`slot_id`,`record_id`),
  KEY `record_id` (`record_id`),
  CONSTRAINT `user_long_playing_record_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_long_playing_record_ibfk_2` FOREIGN KEY (`record_id`) REFERENCES `long_playing_record` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_long_playing_record`
--

LOCK TABLES `user_long_playing_record` WRITE;
/*!40000 ALTER TABLE `user_long_playing_record` DISABLE KEYS */;
INSERT INTO `user_long_playing_record` VALUES
(35,1,1),
(35,1,2),
(36,1,3),
(36,1,4),
(37,1,5),
(37,1,6),
(38,1,2),
(38,1,5),
(39,1,1),
(39,1,3),
(40,1,4),
(40,1,6),
(41,1,2),
(41,1,3),
(42,1,5),
(42,1,6),
(43,1,1),
(43,1,4),
(44,1,3),
(44,1,5),
(45,1,2),
(45,1,6),
(46,1,1),
(46,1,5),
(47,1,4),
(47,1,6),
(48,1,3),
(48,1,6),
(49,1,2),
(49,1,5),
(50,1,1),
(50,1,4),
(51,1,3),
(51,1,5),
(52,1,4),
(52,1,6),
(53,1,2),
(53,1,3),
(54,1,1),
(54,1,5),
(55,1,3),
(55,1,4),
(56,1,5),
(56,1,6),
(57,1,1),
(57,1,2),
(58,1,2),
(58,1,4),
(59,1,3),
(59,1,5),
(60,1,4),
(60,1,6),
(61,1,1),
(61,1,6),
(62,1,2),
(62,1,3),
(63,1,5),
(63,1,6),
(64,1,4),
(64,1,5);
/*!40000 ALTER TABLE `user_long_playing_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_save`
--

DROP TABLE IF EXISTS `user_save`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_save` (
  `save_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `play_time` int(11) DEFAULT 0,
  `chapter` int(11) DEFAULT 1,
  `in_game_day` int(11) DEFAULT NULL,
  `money` int(11) DEFAULT 0,
  `reputation_score` int(11) DEFAULT 0,
  `saved_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`save_id`),
  UNIQUE KEY `user_id` (`user_id`,`slot_id`),
  CONSTRAINT `user_save_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='유저의 세이브 슬롯 데이터 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_save`
--

LOCK TABLES `user_save` WRITE;
/*!40000 ALTER TABLE `user_save` DISABLE KEYS */;
INSERT INTO `user_save` VALUES
(1,1,1,350,3,4,775,85,'2025-05-16 00:26:10'),
(4,1,666,999,3,7,5000,40000,'2025-04-17 22:31:03'),
(6,1,2,350,3,4,2100,82,'2025-05-14 03:02:10'),
(7,1,3,0,0,0,40000,40,'2025-04-17 22:45:40'),
(8,1,4,0,0,0,40000,40,'2025-04-17 22:45:41'),
(9,1,5,2,3,4,5000,123345,'2025-04-17 22:45:49'),
(11,3,1,777,7,6,77777,40,'2025-04-25 15:29:50'),
(12,2,1,0,0,2,26000,57,'2025-05-26 16:38:28'),
(14,4,3,0,0,0,40000,0,'2025-04-25 17:18:21'),
(15,4,1,0,0,0,30000,0,'2025-04-25 16:51:50'),
(85,35,1,100,1,1,5000,0,'2025-05-24 00:00:46'),
(86,36,1,120,1,2,4200,5,'2025-05-24 00:00:46'),
(87,37,1,90,1,1,6000,3,'2025-05-24 00:00:46'),
(88,38,1,200,2,3,3100,8,'2025-05-24 00:00:46'),
(89,39,1,150,2,2,4500,6,'2025-05-24 00:00:46'),
(90,40,1,80,1,1,3900,2,'2025-05-24 00:00:46'),
(91,41,1,50,1,1,2500,0,'2025-05-24 00:00:46'),
(92,42,1,180,2,4,7100,10,'2025-05-24 00:00:46'),
(93,43,1,60,1,1,4800,3,'2025-05-24 00:00:46'),
(94,44,1,100,1,2,5100,4,'2025-05-24 00:00:46'),
(95,45,1,40,1,1,3500,1,'2025-05-24 00:00:46'),
(96,46,1,130,1,2,4400,2,'2025-05-24 00:00:46'),
(97,47,1,75,1,1,5200,5,'2025-05-24 00:00:46'),
(98,48,1,110,2,3,3800,4,'2025-05-24 00:00:46'),
(99,49,1,60,1,1,3300,1,'2025-05-24 00:00:46'),
(100,50,1,90,1,1,4900,6,'2025-05-24 00:00:46'),
(101,51,1,30,1,1,2200,0,'2025-05-24 00:00:46'),
(102,52,1,200,3,4,8500,12,'2025-05-24 00:00:46'),
(103,53,1,105,2,2,5500,3,'2025-05-24 00:00:46'),
(104,54,1,85,1,1,3000,2,'2025-05-24 00:00:46'),
(105,55,1,170,2,3,6700,9,'2025-05-24 00:00:46'),
(106,56,1,95,1,2,4700,3,'2025-05-24 00:00:46'),
(107,57,1,125,1,2,5800,4,'2025-05-24 00:00:46'),
(108,58,1,155,2,3,6200,7,'2025-05-24 00:00:46'),
(109,59,1,60,1,1,3900,2,'2025-05-24 00:00:46'),
(110,60,1,50,1,1,2800,1,'2025-05-24 00:00:46'),
(111,61,1,140,2,2,4900,5,'2025-05-24 00:00:46'),
(112,62,1,180,3,5,9100,13,'2025-05-24 00:00:46'),
(113,63,1,40,1,1,2700,0,'2025-05-24 00:00:46'),
(114,64,1,90,1,1,4500,4,'2025-05-24 00:00:46'),
(118,2,2,0,0,3,26000,57,'2025-05-25 17:12:36');
/*!40000 ALTER TABLE `user_save` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-28 15:13:25
