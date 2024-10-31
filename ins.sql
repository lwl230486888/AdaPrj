-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-10-31 03:33:18
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `ins`
--

-- --------------------------------------------------------

--
-- 資料表結構 `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `inquiries`
--

CREATE TABLE `inquiries` (
  `inquiry_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `inquiry_date` date NOT NULL,
  `inquiry_status` varchar(50) NOT NULL,
  `sales_person_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `insurance_requests`
--

CREATE TABLE `insurance_requests` (
  `id` int(11) NOT NULL,
  `vehicle_year` varchar(4) DEFAULT NULL,
  `cc` varchar(10) DEFAULT NULL,
  `vehicle_model` varchar(100) DEFAULT NULL,
  `driver_age` varchar(3) DEFAULT NULL,
  `driver_occupation` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `insurance_requests`
--

INSERT INTO `insurance_requests` (`id`, `vehicle_year`, `cc`, `vehicle_model`, `driver_age`, `driver_occupation`, `name`, `phone`, `email`) VALUES
(2, '2018', '1500', 'jazz', '18-', 'student', 'Wong Chun Wing', '67002314', 'asddd@gmail.com');

-- --------------------------------------------------------

--
-- 資料表結構 `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `delivery_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `salespersonnel`
--

CREATE TABLE `salespersonnel` (
  `sales_person_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `region` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `customersOrderID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`id`, `region`, `first_name`, `last_name`, `email`, `password`, `created_at`, `customersOrderID`) VALUES
(61, 'United States', 'WONG CHAK YUEN', '黃澤元', '1@gmail.com', '$2y$10$b2Tr.tV/FVOvBnKdq/YWk.3soKu2BeeGYj2JfxnPgwImA8DEQujnq', '2024-10-12 13:09:54', NULL),
(62, 'United States', 'WONG CHAK YUEN', '黃澤元', '2@gmail.com', '$2y$10$CEK/U2Cz4xQxV5dGfR2Gc.hvJz8DVrVCpSSlQNegWI4yZ2Q0FQcGG', '2024-10-18 03:16:28', NULL),
(63, '', '', '', '', '$2y$10$PfCRQG1GvSD2ItHngDk9Z.yn9XdtFyZBZmu.dt7GE51SgcgeNknu6', '2024-10-30 08:02:33', NULL),
(68, 'Nicaragua', 'Wong', 'Wing', 'asddd@gmail.com', '$2y$10$pndlaXR72M5wHMiCvHfYR.sBYC.Trpwg60TFFHPbFPBRr92z2W/Q6', '2024-10-30 08:12:34', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `model_name` varchar(50) NOT NULL,
  `vehicle_type` varchar(50) NOT NULL,
  `engine_type` varchar(50) NOT NULL,
  `performance` text DEFAULT NULL,
  `technology` text DEFAULT NULL,
  `luxury_comfort` text DEFAULT NULL,
  `sustainability` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `model_name`, `vehicle_type`, `engine_type`, `performance`, `technology`, `luxury_comfort`, `sustainability`, `price`, `stock_status`) VALUES
(1, 'Aether X', 'Electric Car', 'Electric', 'High-performance electric drivetrain with rapid acceleration', 'Advanced battery technology and smart connectivity', 'Premium interior with spacious design', 'Zero emissions for eco-conscious driving', 45000.00, 'In Stock'),
(2, 'Ignis Turbo', 'Sports Car', 'Gasoline', 'Turbocharged engine with 500 hp', 'Enhanced driver-assist features and racing technology', 'Luxury seats with in-car entertainment system', 'Fuel-efficient with low CO2 emissions', 70000.00, 'On Order'),
(3, 'EcoRide 2024', 'Hybrid', 'Hybrid', 'Balanced hybrid powertrain with excellent fuel economy', 'Hybrid engine management and regenerative braking', 'Quiet cabin with smart infotainment', 'Environmentally friendly hybrid technology', 30000.00, 'In Stock'),
(4, 'Solaris EV', 'SUV', 'Electric', 'Powerful off-road capabilities with electric torque', 'Advanced solar-charging technology', 'Spacious interior with ergonomic seating', 'Zero emissions with sustainable materials', 60000.00, 'Out of Stock'),
(5, 'Velocity GT', 'Coupe', 'Gasoline', 'Precision handling with 0-60 mph in 3.5 seconds', 'Performance-oriented telemetry system', 'Leather interior with advanced climate control', 'High fuel efficiency with eco-mode', 80000.00, 'In Stock'),
(6, 'Zenith LX', 'Sedan', 'Hybrid', 'Seamless hybrid transition between electric and gasoline', 'Enhanced safety and autonomous driving features', 'Luxury interior with reclining rear seats', 'Low emissions with reduced fuel consumption', 55000.00, 'On Order');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`);

--
-- 資料表索引 `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`inquiry_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `sales_person_id` (`sales_person_id`);

--
-- 資料表索引 `insurance_requests`
--
ALTER TABLE `insurance_requests`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- 資料表索引 `salespersonnel`
--
ALTER TABLE `salespersonnel`
  ADD PRIMARY KEY (`sales_person_id`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 資料表索引 `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `inquiry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `insurance_requests`
--
ALTER TABLE `insurance_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `salespersonnel`
--
ALTER TABLE `salespersonnel`
  MODIFY `sales_person_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`),
  ADD CONSTRAINT `inquiries_ibfk_3` FOREIGN KEY (`sales_person_id`) REFERENCES `salespersonnel` (`sales_person_id`);

--
-- 資料表的限制式 `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
