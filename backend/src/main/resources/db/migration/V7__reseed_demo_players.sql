-- V7: clean up V6 data (wrong tournament) and re-seed 70 players correctly

-- Remove any @test.local players V6 may have inserted into the wrong tournament
DELETE FROM player_position WHERE player_id IN (SELECT id FROM player WHERE email LIKE '%@test.local');
DELETE FROM player WHERE email LIKE '%@test.local';

-- Remove the accidental demo tournament if V6 created one
DELETE FROM tournament WHERE name = 'Etobicoke Summer 2025';

-- Use SET with subquery — reliable in Flyway + MySQL (avoids SELECT INTO syntax)
SET @tid = (SELECT MIN(id) FROM tournament WHERE deleted = 0);

-- If still no tournament, create one
INSERT INTO tournament (name, tournament_date, start_time, number_of_courts, break_minutes,
                        pool_match_duration_minutes, pool_sets_to_win, pool_points_per_set,
                        final_sets_to_win, final_points_per_set, target_roster_size,
                        captain_counts_in_roster, registration_open, status, deleted,
                        created_at, updated_at)
SELECT 'Etobicoke Summer 2025', '2025-08-16', '09:00:00', 4, 10,
       20, 1, 25, 2, 15, 6, 1, 1, 'SETUP', 0, NOW(), NOW()
WHERE @tid IS NULL;

SET @tid = COALESCE(@tid, LAST_INSERT_ID());

-- 70 players: 20 ADVANCED, 30 INTERMEDIATE, 15 BEGINNER, 5 REFEREES
INSERT INTO player (tournament_id, first_name, last_name, phone, email,
                    address_line1, address_city, address_province, address_postal_code, address_country,
                    tshirt_size, skill_level, years_experience, jersey_number_preference,
                    gender, date_of_birth, payment_status, waiver_accepted, photo_consent,
                    manual_entry, deleted, created_at, updated_at)
VALUES
-- ADVANCED (1-20)
(@tid,'James','Mitchell','416-555-0101','james.mitchell@test.local','123 Kipling Ave, Apt 1','Etobicoke','ON','M8Z 5G4','Canada','L','ADVANCED',12,7,'Male','1985-03-15','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Sarah','Thompson','416-555-0102','sarah.thompson@test.local','456 Islington Ave, Apt 2','Etobicoke','ON','M8V 3A1','Canada','M','ADVANCED',10,10,'Female','1988-07-22','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'David','Chen','647-555-0103','david.chen@test.local','789 Bloor St W, Unit 3','Toronto','ON','M6G 1L5','Canada','XL','ADVANCED',15,15,'Male','1980-11-08','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Emily','Rodriguez','416-555-0104','emily.rodriguez@test.local','321 The Queensway, Apt 4','Etobicoke','ON','M8Y 1H9','Canada','S','ADVANCED',8,NULL,'Female','1992-04-17','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Michael','Patel','647-555-0105','michael.patel@test.local','654 Dixon Rd, Unit 5','Etobicoke','ON','M9P 1Y3','Canada','L','ADVANCED',11,3,'Male','1986-09-30','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Aisha','Johnson','416-555-0106','aisha.johnson@test.local','987 Dundas St W, Apt 6','Mississauga','ON','L5B 1K2','Canada','M','ADVANCED',9,NULL,'Female','1990-12-05','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Ryan','Kumar','647-555-0107','ryan.kumar@test.local','147 Burnhamthorpe Rd, Unit 7','Mississauga','ON','L5B 3C9','Canada','XL','ADVANCED',13,22,'Male','1983-06-19','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Jennifer','Lee','416-555-0108','jennifer.lee@test.local','258 Rexdale Blvd, Apt 8','Etobicoke','ON','M9W 1P9','Canada','M','ADVANCED',7,NULL,'Female','1993-02-28','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Kevin','Singh','647-555-0109','kevin.singh@test.local','369 Evans Ave, Unit 9','Etobicoke','ON','M8Z 1K2','Canada','L','ADVANCED',10,NULL,'Male','1987-08-11','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Nicole','Williams','416-555-0110','nicole.williams@test.local','741 Royal York Rd, Apt 10','Etobicoke','ON','M8Y 2T2','Canada','S','ADVANCED',8,NULL,'Female','1991-05-24','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Brandon','Harris','647-555-0111','brandon.harris@test.local','123 Kipling Ave, Apt 11','Etobicoke','ON','M8Z 5G4','Canada','XXL','ADVANCED',14,44,'Male','1982-01-09','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Priya','Sharma','416-555-0112','priya.sharma@test.local','456 Islington Ave, Apt 12','Etobicoke','ON','M8V 3A1','Canada','M','ADVANCED',9,NULL,'Female','1989-10-16','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Tyler','Anderson','647-555-0113','tyler.anderson@test.local','789 Bloor St W, Unit 13','Toronto','ON','M6G 1L5','Canada','L','ADVANCED',11,12,'Male','1984-07-03','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Melissa','Brown','416-555-0114','melissa.brown@test.local','321 The Queensway, Apt 14','Etobicoke','ON','M8Y 1H9','Canada','M','ADVANCED',10,NULL,'Female','1988-03-21','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Andrew','Kim','647-555-0115','andrew.kim@test.local','654 Dixon Rd, Unit 15','Etobicoke','ON','M9P 1Y3','Canada','L','ADVANCED',12,9,'Male','1985-11-14','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Stephanie','Wilson','416-555-0116','stephanie.wilson@test.local','987 Dundas St W, Apt 16','Mississauga','ON','L5B 1K2','Canada','S','ADVANCED',8,NULL,'Female','1991-08-07','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Eric','Park','647-555-0117','eric.park@test.local','147 Burnhamthorpe Rd, Unit 17','Mississauga','ON','L5B 3C9','Canada','M','ADVANCED',9,17,'Male','1990-04-25','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Rachel','Davis','416-555-0118','rachel.davis@test.local','258 Rexdale Blvd, Apt 18','Etobicoke','ON','M9W 1P9','Canada','M','ADVANCED',7,NULL,'Female','1994-01-18','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Jordan','Nguyen','647-555-0119','jordan.nguyen@test.local','369 Evans Ave, Unit 19','Etobicoke','ON','M8Z 1K2','Canada','L','ADVANCED',10,8,'Male','1988-09-02','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Lauren','Martinez','416-555-0120','lauren.martinez@test.local','741 Royal York Rd, Apt 20','Etobicoke','ON','M8Y 2T2','Canada','S','ADVANCED',11,NULL,'Female','1986-06-30','PAID',1,1,0,0,NOW(),NOW()),
-- INTERMEDIATE (21-50)
(@tid,'Chris','Walker','647-555-0121','chris.walker@test.local','123 Kipling Ave, Apt 21','Etobicoke','ON','M8Z 5G4','Canada','L','INTERMEDIATE',5,5,'Male','1994-02-14','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Amanda','Taylor','416-555-0122','amanda.taylor@test.local','456 Islington Ave, Apt 22','Etobicoke','ON','M8V 3A1','Canada','M','INTERMEDIATE',4,NULL,'Female','1997-09-28','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Jason','White','647-555-0123','jason.white@test.local','789 Bloor St W, Unit 23','Toronto','ON','M6G 1L5','Canada','XL','INTERMEDIATE',6,14,'Male','1993-05-11','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Danielle','Hall','416-555-0124','danielle.hall@test.local','321 The Queensway, Apt 24','Etobicoke','ON','M8Y 1H9','Canada','M','INTERMEDIATE',5,NULL,'Female','1995-12-03','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Patrick','Allen','647-555-0125','patrick.allen@test.local','654 Dixon Rd, Unit 25','Etobicoke','ON','M9P 1Y3','Canada','L','INTERMEDIATE',4,NULL,'Male','1996-07-19','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Brittany','Young','416-555-0126','brittany.young@test.local','987 Dundas St W, Apt 26','Mississauga','ON','L5B 1K2','Canada','S','INTERMEDIATE',5,NULL,'Female','1996-03-08','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Daniel','Garcia','647-555-0127','daniel.garcia@test.local','147 Burnhamthorpe Rd, Unit 27','Mississauga','ON','L5B 3C9','Canada','M','INTERMEDIATE',6,6,'Male','1993-10-27','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Samantha','Hernandez','416-555-0128','samantha.hernandez@test.local','258 Rexdale Blvd, Apt 28','Etobicoke','ON','M9W 1P9','Canada','M','INTERMEDIATE',3,NULL,'Female','1999-06-16','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Matthew','King','647-555-0129','matthew.king@test.local','369 Evans Ave, Unit 29','Etobicoke','ON','M8Z 1K2','Canada','XL','INTERMEDIATE',7,21,'Male','1992-01-05','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Ashley','Wright','416-555-0130','ashley.wright@test.local','741 Royal York Rd, Apt 30','Etobicoke','ON','M8Y 2T2','Canada','S','INTERMEDIATE',5,NULL,'Female','1995-08-22','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Robert','Scott','647-555-0131','robert.scott@test.local','123 Kipling Ave, Apt 31','Etobicoke','ON','M8Z 5G4','Canada','L','INTERMEDIATE',4,NULL,'Male','1997-04-10','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Megan','Lewis','416-555-0132','megan.lewis@test.local','456 Islington Ave, Apt 32','Etobicoke','ON','M8V 3A1','Canada','M','INTERMEDIATE',6,NULL,'Female','1993-11-29','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'William','Robinson','647-555-0133','william.robinson@test.local','789 Bloor St W, Unit 33','Toronto','ON','M6G 1L5','Canada','XXL','INTERMEDIATE',5,NULL,'Male','1994-07-17','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Kaitlyn','Clark','416-555-0134','kaitlyn.clark@test.local','321 The Queensway, Apt 34','Etobicoke','ON','M8Y 1H9','Canada','S','INTERMEDIATE',4,NULL,'Female','1997-02-06','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Anthony','Martinez','647-555-0135','anthony.martinez@test.local','654 Dixon Rd, Unit 35','Etobicoke','ON','M9P 1Y3','Canada','L','INTERMEDIATE',7,NULL,'Male','1992-09-24','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Tiffany','Jones','416-555-0136','tiffany.jones@test.local','987 Dundas St W, Apt 36','Mississauga','ON','L5B 1K2','Canada','M','INTERMEDIATE',5,NULL,'Female','1995-05-13','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Mark','Thomas','647-555-0137','mark.thomas@test.local','147 Burnhamthorpe Rd, Unit 37','Mississauga','ON','L5B 3C9','Canada','M','INTERMEDIATE',4,NULL,'Male','1997-12-01','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Crystal','Jackson','416-555-0138','crystal.jackson@test.local','258 Rexdale Blvd, Apt 38','Etobicoke','ON','M9W 1P9','Canada','M','INTERMEDIATE',6,NULL,'Female','1993-08-20','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Steven','Green','647-555-0139','steven.green@test.local','369 Evans Ave, Unit 39','Etobicoke','ON','M8Z 1K2','Canada','L','INTERMEDIATE',5,NULL,'Male','1995-03-09','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Heather','Baker','416-555-0140','heather.baker@test.local','741 Royal York Rd, Apt 40','Etobicoke','ON','M8Y 2T2','Canada','S','INTERMEDIATE',4,NULL,'Female','1997-10-28','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Derek','Nelson','647-555-0141','derek.nelson@test.local','123 Kipling Ave, Apt 41','Etobicoke','ON','M8Z 5G4','Canada','XL','INTERMEDIATE',6,11,'Male','1993-06-16','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Amber','Carter','416-555-0142','amber.carter@test.local','456 Islington Ave, Apt 42','Etobicoke','ON','M8V 3A1','Canada','M','INTERMEDIATE',5,NULL,'Female','1995-01-04','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Nathan','Mitchell','647-555-0143','nathan.mitchell2@test.local','789 Bloor St W, Unit 43','Toronto','ON','M6G 1L5','Canada','L','INTERMEDIATE',4,NULL,'Male','1997-08-23','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Kayla','Perez','416-555-0144','kayla.perez@test.local','321 The Queensway, Apt 44','Etobicoke','ON','M8Y 1H9','Canada','S','INTERMEDIATE',5,NULL,'Female','1995-04-12','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Adam','Roberts','647-555-0145','adam.roberts@test.local','654 Dixon Rd, Unit 45','Etobicoke','ON','M9P 1Y3','Canada','M','INTERMEDIATE',6,NULL,'Male','1993-11-01','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Taylor','Evans','416-555-0146','taylor.evans@test.local','987 Dundas St W, Apt 46','Mississauga','ON','L5B 1K2','Canada','M','INTERMEDIATE',4,NULL,'Female','1997-07-20','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Kyle','Turner','647-555-0147','kyle.turner@test.local','147 Burnhamthorpe Rd, Unit 47','Mississauga','ON','L5B 3C9','Canada','L','INTERMEDIATE',5,NULL,'Male','1995-02-08','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Chloe','Collins','416-555-0148','chloe.collins@test.local','258 Rexdale Blvd, Apt 48','Etobicoke','ON','M9W 1P9','Canada','S','INTERMEDIATE',6,NULL,'Female','1993-09-27','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Justin','Phillips','647-555-0149','justin.phillips@test.local','369 Evans Ave, Unit 49','Etobicoke','ON','M8Z 1K2','Canada','XL','INTERMEDIATE',4,NULL,'Male','1997-05-16','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Emma','Campbell','416-555-0150','emma.campbell@test.local','741 Royal York Rd, Apt 50','Etobicoke','ON','M8Y 2T2','Canada','M','INTERMEDIATE',5,NULL,'Female','1995-12-04','PAID',1,1,0,0,NOW(),NOW()),
-- BEGINNER (51-65)
(@tid,'Trevor','Stewart','647-555-0151','trevor.stewart@test.local','123 Kipling Ave, Apt 51','Etobicoke','ON','M8Z 5G4','Canada','M','BEGINNER',1,NULL,'Male','2000-03-23','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Olivia','Sanders','416-555-0152','olivia.sanders@test.local','456 Islington Ave, Apt 52','Etobicoke','ON','M8V 3A1','Canada','S','BEGINNER',1,NULL,'Female','2001-10-12','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Scott','Morris','647-555-0153','scott.morris@test.local','789 Bloor St W, Unit 53','Toronto','ON','M6G 1L5','Canada','L','BEGINNER',2,NULL,'Male','1999-07-01','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Neha','Patel','416-555-0154','neha.patel@test.local','321 The Queensway, Apt 54','Etobicoke','ON','M8Y 1H9','Canada','M','BEGINNER',1,NULL,'Female','2002-04-19','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Aaron','Reed','647-555-0155','aaron.reed@test.local','654 Dixon Rd, Unit 55','Etobicoke','ON','M9P 1Y3','Canada','M','BEGINNER',2,NULL,'Male','1999-11-08','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Lisa','Morgan','416-555-0156','lisa.morgan@test.local','987 Dundas St W, Apt 56','Mississauga','ON','L5B 1K2','Canada','S','BEGINNER',1,NULL,'Female','2001-06-27','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Brian','Bell','647-555-0157','brian.bell@test.local','147 Burnhamthorpe Rd, Unit 57','Mississauga','ON','L5B 3C9','Canada','L','BEGINNER',2,NULL,'Male','2000-01-15','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Nancy','Cook','416-555-0158','nancy.cook@test.local','258 Rexdale Blvd, Apt 58','Etobicoke','ON','M9W 1P9','Canada','M','BEGINNER',1,NULL,'Female','2001-08-04','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Raj','Mehta','647-555-0159','raj.mehta@test.local','369 Evans Ave, Unit 59','Etobicoke','ON','M8Z 1K2','Canada','M','BEGINNER',2,NULL,'Male','1999-05-22','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Vikram','Shah','416-555-0160','vikram.shah@test.local','741 Royal York Rd, Apt 60','Etobicoke','ON','M8Y 2T2','Canada','L','BEGINNER',3,NULL,'Male','1998-12-11','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Rohit','Gupta','647-555-0161','rohit.gupta@test.local','123 Kipling Ave, Apt 61','Etobicoke','ON','M8Z 5G4','Canada','M','BEGINNER',2,NULL,'Male','2000-09-30','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Kiran','Desai','416-555-0162','kiran.desai@test.local','456 Islington Ave, Apt 62','Etobicoke','ON','M8V 3A1','Canada','S','BEGINNER',1,NULL,'Female','2002-02-18','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Amy','Liu','647-555-0163','amy.liu@test.local','789 Bloor St W, Unit 63','Toronto','ON','M6G 1L5','Canada','M','BEGINNER',2,NULL,'Female','1999-07-07','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Linda','Huang','416-555-0164','linda.huang@test.local','321 The Queensway, Apt 64','Etobicoke','ON','M8Y 1H9','Canada','S','BEGINNER',1,NULL,'Female','2001-03-26','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Arjun','Reddy','647-555-0165','arjun.reddy@test.local','654 Dixon Rd, Unit 65','Etobicoke','ON','M9P 1Y3','Canada','L','BEGINNER',2,NULL,'Male','2000-10-14','UNPAID',1,1,0,0,NOW(),NOW()),
-- REFEREES (66-70)
(@tid,'Greg','Lawson','416-555-0166','greg.lawson@test.local','987 Dundas St W, Apt 66','Mississauga','ON','L5B 1K2','Canada','L','INTERMEDIATE',8,NULL,'Male','1990-05-03','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Patricia','Newman','647-555-0167','patricia.newman@test.local','147 Burnhamthorpe Rd, Unit 67','Mississauga','ON','L5B 3C9','Canada','M','ADVANCED',12,NULL,'Female','1984-11-21','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Bruce','Olson','416-555-0168','bruce.olson@test.local','258 Rexdale Blvd, Apt 68','Etobicoke','ON','M9W 1P9','Canada','XL','INTERMEDIATE',6,NULL,'Male','1993-08-10','PAID',1,1,0,0,NOW(),NOW()),
(@tid,'Karen','Hughes','647-555-0169','karen.hughes@test.local','369 Evans Ave, Unit 69','Etobicoke','ON','M8Z 1K2','Canada','M','INTERMEDIATE',5,NULL,'Female','1995-03-29','UNPAID',1,1,0,0,NOW(),NOW()),
(@tid,'Thomas','Rivera','416-555-0170','thomas.rivera@test.local','741 Royal York Rd, Apt 70','Etobicoke','ON','M8Y 2T2','Canada','L','ADVANCED',10,NULL,'Male','1987-06-18','PAID',1,1,0,0,NOW(),NOW());

-- Player positions
-- FRONT + BACK (23 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'FRONT' FROM player WHERE tournament_id = @tid AND email IN (
  'james.mitchell@test.local','david.chen@test.local','aisha.johnson@test.local',
  'nicole.williams@test.local','brandon.harris@test.local','melissa.brown@test.local',
  'eric.park@test.local','chris.walker@test.local','danielle.hall@test.local',
  'daniel.garcia@test.local','megan.lewis@test.local','kaitlyn.clark@test.local',
  'crystal.jackson@test.local','heather.baker@test.local','nathan.mitchell2@test.local',
  'taylor.evans@test.local','justin.phillips@test.local','trevor.stewart@test.local',
  'scott.morris@test.local','brian.bell@test.local','raj.mehta@test.local',
  'kiran.desai@test.local','arjun.reddy@test.local');

INSERT INTO player_position (player_id, position)
SELECT id, 'BACK' FROM player WHERE tournament_id = @tid AND email IN (
  'james.mitchell@test.local','david.chen@test.local','aisha.johnson@test.local',
  'nicole.williams@test.local','brandon.harris@test.local','melissa.brown@test.local',
  'eric.park@test.local','chris.walker@test.local','danielle.hall@test.local',
  'daniel.garcia@test.local','megan.lewis@test.local','kaitlyn.clark@test.local',
  'crystal.jackson@test.local','heather.baker@test.local','nathan.mitchell2@test.local',
  'taylor.evans@test.local','justin.phillips@test.local','trevor.stewart@test.local',
  'scott.morris@test.local','brian.bell@test.local','raj.mehta@test.local',
  'kiran.desai@test.local','arjun.reddy@test.local');

-- CENTER + NETTY (16 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'CENTER' FROM player WHERE tournament_id = @tid AND email IN (
  'sarah.thompson@test.local','emily.rodriguez@test.local','jennifer.lee@test.local',
  'stephanie.wilson@test.local','lauren.martinez@test.local','amanda.taylor@test.local',
  'brittany.young@test.local','ashley.wright@test.local','william.robinson@test.local',
  'steven.green@test.local','kayla.perez@test.local','chloe.collins@test.local',
  'olivia.sanders@test.local','lisa.morgan@test.local','rohit.gupta@test.local',
  'linda.huang@test.local');

INSERT INTO player_position (player_id, position)
SELECT id, 'NETTY' FROM player WHERE tournament_id = @tid AND email IN (
  'sarah.thompson@test.local','emily.rodriguez@test.local','jennifer.lee@test.local',
  'stephanie.wilson@test.local','lauren.martinez@test.local','amanda.taylor@test.local',
  'brittany.young@test.local','ashley.wright@test.local','william.robinson@test.local',
  'steven.green@test.local','kayla.perez@test.local','chloe.collins@test.local',
  'olivia.sanders@test.local','lisa.morgan@test.local','rohit.gupta@test.local',
  'linda.huang@test.local');

-- FRONT + CENTER (11 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'FRONT' FROM player WHERE tournament_id = @tid AND email IN (
  'michael.patel@test.local','kevin.singh@test.local','andrew.kim@test.local',
  'jason.white@test.local','matthew.king@test.local','anthony.martinez@test.local',
  'derek.nelson@test.local','adam.roberts@test.local','emma.campbell@test.local',
  'aaron.reed@test.local','vikram.shah@test.local');

INSERT INTO player_position (player_id, position)
SELECT id, 'CENTER' FROM player WHERE tournament_id = @tid AND email IN (
  'michael.patel@test.local','kevin.singh@test.local','andrew.kim@test.local',
  'jason.white@test.local','matthew.king@test.local','anthony.martinez@test.local',
  'derek.nelson@test.local','adam.roberts@test.local','emma.campbell@test.local',
  'aaron.reed@test.local','vikram.shah@test.local');

-- BACK + NETTY (11 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'BACK' FROM player WHERE tournament_id = @tid AND email IN (
  'ryan.kumar@test.local','tyler.anderson@test.local','jordan.nguyen@test.local',
  'patrick.allen@test.local','robert.scott@test.local','mark.thomas@test.local',
  'amber.carter@test.local','kyle.turner@test.local','neha.patel@test.local',
  'nancy.cook@test.local','amy.liu@test.local');

INSERT INTO player_position (player_id, position)
SELECT id, 'NETTY' FROM player WHERE tournament_id = @tid AND email IN (
  'ryan.kumar@test.local','tyler.anderson@test.local','jordan.nguyen@test.local',
  'patrick.allen@test.local','robert.scott@test.local','mark.thomas@test.local',
  'amber.carter@test.local','kyle.turner@test.local','neha.patel@test.local',
  'nancy.cook@test.local','amy.liu@test.local');

-- CENTER + BACK (2 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'CENTER' FROM player WHERE tournament_id = @tid AND email IN ('priya.sharma@test.local','tiffany.jones@test.local');
INSERT INTO player_position (player_id, position)
SELECT id, 'BACK' FROM player WHERE tournament_id = @tid AND email IN ('priya.sharma@test.local','tiffany.jones@test.local');

-- FRONT + NETTY (2 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'FRONT' FROM player WHERE tournament_id = @tid AND email IN ('rachel.davis@test.local','samantha.hernandez@test.local');
INSERT INTO player_position (player_id, position)
SELECT id, 'NETTY' FROM player WHERE tournament_id = @tid AND email IN ('rachel.davis@test.local','samantha.hernandez@test.local');

-- REFEREE solo (5 players)
INSERT INTO player_position (player_id, position)
SELECT id, 'REFEREE' FROM player WHERE tournament_id = @tid AND email IN (
  'greg.lawson@test.local','patricia.newman@test.local','bruce.olson@test.local',
  'karen.hughes@test.local','thomas.rivera@test.local');