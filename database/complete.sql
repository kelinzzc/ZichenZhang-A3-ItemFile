-- PROG2002 Assessment 3 - Complete Database Schema
-- Based on A2 database (1.sql) with A3 enhancements
-- Created for Charity Events Website

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

-- Create database
DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db;
USE charityevents_db;

-- =============================================
-- TABLE CREATION
-- =============================================

-- Organizations table (from A2)
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mission_statement TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_organization_name (name)
);

-- Categories table (from A2)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_category_name (name)
);

-- Events table (enhanced for A3 with latitude/longitude for weather API)
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    full_description TEXT,
    category_id INT,
    organization_id INT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    venue_details TEXT,
    ticket_price DECIMAL(10,2) DEFAULT 0.00,
    goal_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    max_attendees INT,
    image_url VARCHAR(500),
    
    -- A3 ENHANCEMENT: Added for weather API support
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    is_active BOOLEAN DEFAULT TRUE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_event_category (category_id),
    INDEX idx_event_organization (organization_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_location (location),
    INDEX idx_event_status (is_active, is_suspended),
    INDEX idx_event_geo (latitude, longitude)
);

-- Registrations table (completely redesigned for A3 requirements)
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    
    -- A3 ENHANCEMENT: Changed field names for consistency
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    ticket_count INT NOT NULL DEFAULT 1,
    
    -- A3 ENHANCEMENT: Added special requirements field
    special_requirements TEXT,
    
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- A3 CORE REQUIREMENT: One user can only register for an event once
    UNIQUE KEY unique_event_email (event_id, email),
    
    -- Foreign key constraint with RESTRICT to prevent deletion of events with registrations
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT,
    
    -- Indexes for performance
    INDEX idx_registration_event (event_id),
    INDEX idx_registration_date (registration_date DESC),
    INDEX idx_registration_email (email),
    INDEX idx_registration_name (full_name)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert organization data (from A2)
INSERT INTO organizations (name, description, mission_statement, contact_email, contact_phone, address) VALUES
('Hope Light Charity Foundation', 
 'Dedicated to helping underprivileged children and families improve their living conditions', 
 'Creating a better future for vulnerable groups through education and community support', 
 'contact@hopelight.org', 
 '+61 2 1234 5678', 
 '123 Charity Street, Sydney NSW 2000'),

('Care Aid Organization', 
 'Non-profit organization focused on medical assistance and health promotion', 
 'Ensuring everyone has access to basic medical services and health knowledge', 
 'info@careaid.org', 
 '+61 3 9876 5432', 
 '456 Hope Avenue, Melbourne VIC 3000');

-- Insert category data (from A2)
INSERT INTO categories (name, description) VALUES
('Gala Dinner', 'Formal charity dinner events'),
('Fun Run', 'Fun run fundraising events'),
('Silent Auction', 'Silent auction events'),
('Concert', 'Charity concert events'),
('Workshop', 'Educational and workshop events'),
('Community Fair', 'Community fair events');

-- Insert event data (from A2 with A3 enhancements - latitude/longitude added)
INSERT INTO events (
    title, description, full_description, category_id, organization_id, 
    event_date, location, venue_details, ticket_price, goal_amount, 
    current_amount, max_attendees, image_url, latitude, longitude
) VALUES
(
    'Hope Light Annual Charity Gala', 
    'Grand annual fundraising dinner', 
    'Join us for this unforgettable evening featuring exquisite dining, inspiring speeches, and wonderful entertainment. All proceeds will support education programs for underprivileged children.', 
    1, 1, 
    '2025-10-15 18:30:00', 
    'Sydney Convention Centre', 
    'Grand Ballroom, Level 3', 
    150.00, 50000.00, 32500.00, 300, 
    '/images/event1.jpg',
    -33.8765, 151.2005  -- Sydney Convention Centre coordinates
),
(
    'Urban Fun Run 2025', 
    '5km fun run event', 
    'Put on your running shoes and join our 5km fun run! Suitable for all ages and fitness levels. Includes T-shirt, medal, and post-race refreshments.', 
    2, 2, 
    '2025-09-20 08:00:00', 
    'Centennial Park', 
    'Main Entrance, Federation Way', 
    25.00, 20000.00, 12500.00, 500, 
    '/images/event2.jpg',
    -33.8946, 151.2605  -- Centennial Park coordinates
),
(
    'Art Treasures Auction', 
    'Exclusive art treasures auction evening', 
    'Experience a unique art night bidding on exclusive works from local and international artists. Includes cocktails and appetizers.', 
    3, 1, 
    '2025-11-05 19:00:00', 
    'Art Gallery of Sydney', 
    'Modern Art Wing', 
    75.00, 30000.00, 18000.00, 150, 
    '/images/event3.jpg',
    -33.8705, 151.2085  -- Art Gallery of Sydney coordinates
),
(
    'Care Concert', 
    'Charity concert by local musicians', 
    'Enjoy an evening of classical and contemporary music performed by renowned local musicians. All proceeds will go towards medical equipment purchases.', 
    4, 2, 
    '2025-10-28 19:30:00', 
    'Sydney Opera House', 
    'Utzon Room', 
    60.00, 15000.00, 8900.00, 200, 
    '/images/event4.jpg',
    -33.8572, 151.2151  -- Sydney Opera House coordinates
),
(
    'Children Coding Education', 
    'Free programming education course', 
    'A one-day introductory programming workshop teaching children basic programming concepts and creative thinking.', 
    5, 1, 
    '2025-09-12 10:00:00', 
    'University of Technology Sydney', 
    'Building 11, Room 302', 
    0.00, 5000.00, 3200.00, 30, 
    '/images/event5.jpg',
    -33.8832, 151.1995  -- UTS coordinates
),
(
    'Autumn Community Fair', 
    'Family-friendly community fair', 
    'Enjoy food, crafts, games, and entertainment. A wonderful weekend activity for the whole family.', 
    6, 1, 
    '2025-09-25 10:00:00', 
    'Hyde Park', 
    'North of Archibald Fountain', 
    5.00, 8000.00, 4500.00, 1000, 
    '/images/event6.jpg',
    -33.8746, 151.2105  -- Hyde Park coordinates
),
(
    'Healthy Living Seminar', 
    'Nutrition and healthy living education', 
    'Learn how to improve quality of life through healthy eating and lifestyle. Includes healthy lunch and information package.', 
    5, 2, 
    '2025-10-10 09:00:00', 
    'Royal Botanic Garden', 
    'The Calyx, Mrs Macquaries Road', 
    20.00, 6000.00, 3800.00, 80, 
    '/images/event7.jpg',
    -33.8643, 151.2175  -- Royal Botanic Garden coordinates
),
(
    'Winter Charity Ball', 
    'Formal winter ball fundraising event', 
    'Put on your finest attire and join our Winter Charity Ball. Includes dinner, dancing, and raffle activities.', 
    1, 2, 
    '2025-06-20 19:00:00', 
    'The Star Hotel', 
    'Crystal Ballroom', 
    120.00, 40000.00, 28500.00, 250, 
    '/images/event8.jpg',
    -33.8688, 151.1945  -- The Star Hotel coordinates
),
(
    'Beach Cleanup Day', 
    'Community beach cleaning environmental activity', 
    'Join our beach cleanup activity to protect the marine environment. Gloves, bags, and refreshments provided.', 
    6, 1, 
    '2025-08-15 09:00:00', 
    'Bondi Beach', 
    'South End, near Icebergs', 
    0.00, 2000.00, 1500.00, 100, 
    '/images/event9.jpg',
    -33.8894, 151.2770  -- Bondi Beach coordinates
),
(
    'Photography Exhibition Fundraising', 
    'Charity photography exhibition', 
    'Admire and purchase beautiful works by local photographers. All sales proceeds will be donated to charity projects.', 
    3, 2, 
    '2025-07-22 10:00:00', 
    'Paddington Arts District', 
    '45 Oxford Street Gallery', 
    10.00, 12000.00, 7500.00, 120, 
    '/images/event10.jpg',
    -33.8821, 151.2315  -- Paddington coordinates
);

-- =============================================
-- A3 REGISTRATION DATA (Minimum 10 registrations)
-- =============================================

-- Insert registration data (A3 requirement: at least 10 registrations)
-- We're inserting 14 registrations to exceed the requirement

-- Event 1: Hope Light Annual Charity Gala (3 registrations)
INSERT INTO registrations (event_id, full_name, email, phone, ticket_count, special_requirements, registration_date) VALUES
(1, 'Zhang Wei', 'zhang.wei@email.com', '0412345678', 2, 'Vegetarian meal required', '2025-01-15 10:30:00'),
(1, 'Li Na', 'li.na@email.com', '0423456789', 1, NULL, '2025-01-16 14:20:00'),
(1, 'Wang Xiaoming', 'wang.xiaoming@email.com', '0434567890', 2, 'Wheelchair access required', '2025-01-17 09:15:00'),

-- Event 2: Urban Fun Run 2025 (2 registrations)
(2, 'Chen Dawen', 'chen.dawen@email.com', '0456789012', 1, NULL, '2025-01-18 11:45:00'),
(2, 'Sarah Johnson', 'sarah.j@email.com', '0467890123', 2, 'Beginner, needs guidance', '2025-01-19 16:30:00'),

-- Event 3: Art Treasures Auction (2 registrations)
(3, 'Robert Smith', 'robert.smith@email.com', '0478901234', 1, NULL, '2025-01-20 13:10:00'),
(3, 'Huang Meili', 'huang.meili@email.com', '0489012345', 3, 'Group tickets, need adjacent seats', '2025-01-21 15:25:00'),

-- Event 4: Care Concert (1 registration)
(4, 'David Wilson', 'david.wilson@email.com', '0490123456', 2, NULL, '2025-01-22 10:05:00'),

-- Event 5: Children Coding Education (1 registration)
(5, 'Sun Xiaomei', 'sun.xiaomei@email.com', '0401234567', 1, 'Student, needs learning materials', '2025-01-23 14:50:00'),

-- Event 6: Autumn Community Fair (1 registration)
(6, 'Michael Chen', 'michael.chen@email.com', '0411122233', 4, 'Family ticket, 2 children', '2025-01-24 12:15:00'),

-- Event 7: Healthy Living Seminar (1 registration)
(7, 'Wu Dazhi', 'wu.dazhi@email.com', '0422233344', 1, NULL, '2025-01-25 09:40:00'),

-- Event 8: Winter Charity Ball (1 registration)
(8, 'Emma Zhang', 'emma.zhang@email.com', '0433344455', 2, 'Vegetarian meal required', '2025-01-26 17:20:00'),

-- Event 9: Beach Cleanup Day (1 registration)
(9, 'Zheng Chenggong', 'zheng.chenggong@email.com', '0444455566', 1, 'Bringing own gloves and trash bags', '2025-01-27 11:30:00'),

-- Event 10: Photography Exhibition Fundraising (1 registration)
(10, 'Olivia Wang', 'olivia.wang@email.com', '0455566677', 1, NULL, '2025-01-28 14:00:00');

-- =============================================
-- DATABASE VIEWS (For easier querying)
-- =============================================

-- View for event details with organization and category information
CREATE VIEW event_details_view AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.full_description,
    e.event_date,
    e.location,
    e.venue_details,
    e.ticket_price,
    e.goal_amount,
    e.current_amount,
    e.max_attendees,
    e.image_url,
    e.latitude,
    e.longitude,
    e.is_active,
    e.is_suspended,
    e.created_at,
    e.updated_at,
    o.name as organization_name,
    o.contact_email as organization_contact,
    o.contact_phone as organization_phone,
    o.address as organization_address,
    c.name as category_name,
    c.description as category_description,
    COUNT(r.id) as registration_count,
    SUM(r.ticket_count) as total_tickets_sold,
    (e.current_amount / e.goal_amount * 100) as funding_progress,
    (e.max_attendees - COALESCE(SUM(r.ticket_count), 0)) as available_tickets
FROM events e
LEFT JOIN organizations o ON e.organization_id = o.id
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id;

-- View for registration details with event information
CREATE VIEW registration_details AS
SELECT 
    r.id,
    r.full_name,
    r.email,
    r.phone,
    r.ticket_count,
    r.special_requirements,
    r.registration_date,
    e.id as event_id,
    e.title as event_title,
    e.event_date,
    e.location,
    e.venue_details,
    e.ticket_price,
    c.name as category_name,
    o.name as organization_name
FROM registrations r
JOIN events e ON r.event_id = e.id
JOIN categories c ON e.category_id = c.id
JOIN organizations o ON e.organization_id = o.id
ORDER BY r.registration_date DESC;

-- View for event statistics
CREATE VIEW event_statistics AS
SELECT 
    o.name as organization_name,
    c.name as category_name,
    COUNT(e.id) as total_events,
    COUNT(CASE WHEN e.is_active = TRUE AND e.is_suspended = FALSE THEN 1 END) as active_events,
    SUM(e.goal_amount) as total_goal_amount,
    SUM(e.current_amount) as total_current_amount,
    COUNT(r.id) as total_registrations,
    SUM(r.ticket_count) as total_tickets_sold,
    AVG(r.ticket_count) as avg_tickets_per_registration
FROM organizations o
LEFT JOIN events e ON o.id = e.organization_id
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY o.id, o.name, c.id, c.name;

-- =============================================
-- DATABASE TRIGGERS (For data integrity)
-- =============================================

-- Trigger to update current_amount when registrations are added
-- Note: This is a simplified example. In a real system, you might have a payments table.
DELIMITER //

CREATE TRIGGER after_registration_insert
AFTER INSERT ON registrations
FOR EACH ROW
BEGIN
    UPDATE events 
    SET current_amount = current_amount + (NEW.ticket_count * ticket_price)
    WHERE id = NEW.event_id;
END//

DELIMITER ;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Reset SQL mode and checks
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- Display success message and verification data
SELECT 'PROG2002 A3 Database Creation Completed Successfully!' as message;

-- Verification queries
SELECT 
    'Database Verification' as title,
    (SELECT COUNT(*) FROM organizations) as organization_count,
    (SELECT COUNT(*) FROM categories) as category_count,
    (SELECT COUNT(*) FROM events) as event_count,
    (SELECT COUNT(*) FROM registrations) as registration_count,
    (SELECT COUNT(*) FROM events WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as events_with_geodata;

-- Show sample data verification
SELECT 
    'Sample Data Verification' as title,
    e.title as event_title,
    o.name as organization,
    c.name as category,
    COUNT(r.id) as registration_count,
    SUM(r.ticket_count) as total_tickets,
    e.latitude,
    e.longitude
FROM events e
JOIN organizations o ON e.organization_id = o.id
JOIN categories c ON e.category_id = c.id
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id, e.title, o.name, c.name, e.latitude, e.longitude
ORDER BY e.id;

-- Test the unique constraint (A3 core requirement)
SELECT 
    'A3 Requirement Test: Unique Event-Email Constraint' as test_name,
    COUNT(*) as duplicate_count
FROM (
    SELECT event_id, email, COUNT(*) as count
    FROM registrations
    GROUP BY event_id, email
    HAVING count > 1
) as duplicates;

-- Expected result: duplicate_count should be 0