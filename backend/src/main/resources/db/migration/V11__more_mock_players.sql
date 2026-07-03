-- V11: 15 additional mock players + 5 mock referees, attached to the existing tournament

DO $$
DECLARE
    tid BIGINT;
BEGIN
    SELECT MIN(id) INTO tid FROM tournament WHERE deleted = FALSE;

    IF tid IS NULL THEN
        RAISE NOTICE 'V11: no tournament found, skipping mock player seed';
        RETURN;
    END IF;

    INSERT INTO player (tournament_id, first_name, last_name, phone, email,
                        address_line1, address_city, address_province, address_postal_code, address_country,
                        tshirt_size, skill_level, years_experience, jersey_number_preference,
                        gender, date_of_birth, payment_status, waiver_accepted, photo_consent,
                        manual_entry, deleted, created_at, updated_at)
    VALUES
    -- 15 mock players
    (tid,'Owen','Bennett','416-555-0201','owen.bennett@mock.local','12 Cordova Ave','Etobicoke','ON','M8Y 2K9','Canada','L','ADVANCED',9,3,'Male','1989-02-11','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Grace','Coleman','416-555-0202','grace.coleman@mock.local','88 Berry Rd','Etobicoke','ON','M8Y 1V4','Canada','M','ADVANCED',8,NULL,'Female','1991-06-24','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Lucas','Ferreira','647-555-0203','lucas.ferreira@mock.local','230 Lake Promenade','Etobicoke','ON','M8W 1B6','Canada','XL','INTERMEDIATE',6,19,'Male','1994-09-02','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Zara','Ahmed','416-555-0204','zara.ahmed@mock.local','15 Delroy Dr','Etobicoke','ON','M8Y 3T2','Canada','S','INTERMEDIATE',5,NULL,'Female','1996-01-30','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Ethan','Brooks','647-555-0205','ethan.brooks@mock.local','101 Sherway Gardens Rd','Etobicoke','ON','M9C 1A5','Canada','L','INTERMEDIATE',5,NULL,'Male','1995-04-19','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Chloe','Reyes','416-555-0206','chloe.reyes@mock.local','5 Prince Edward Dr','Etobicoke','ON','M8X 2W5','Canada','M','INTERMEDIATE',4,NULL,'Female','1997-11-13','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Noah','Kaczmarek','647-555-0207','noah.kaczmarek@mock.local','40 Prince Edward Dr S','Etobicoke','ON','M8Y 3X8','Canada','XL','BEGINNER',2,NULL,'Male','1999-08-05','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Mia','Santos','416-555-0208','mia.santos@mock.local','77 Islington Ave S','Etobicoke','ON','M8V 3C2','Canada','S','BEGINNER',1,NULL,'Female','2000-12-27','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Liam','Osei','647-555-0209','liam.osei@mock.local','9 Sixth St','Etobicoke','ON','M8V 3A2','Canada','L','BEGINNER',2,NULL,'Male','1998-03-08','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Isla','Petrov','416-555-0210','isla.petrov@mock.local','21 Twenty Third St','Etobicoke','ON','M8V 3M2','Canada','M','BEGINNER',1,NULL,'Female','2001-05-16','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Mason','Iqbal','647-555-0211','mason.iqbal@mock.local','60 Fortieth St','Etobicoke','ON','M8W 3S6','Canada','L','ADVANCED',10,5,'Male','1987-10-21','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Ava','Nowak','416-555-0212','ava.nowak@mock.local','14 Superior Ave','Etobicoke','ON','M8V 2J4','Canada','M','ADVANCED',9,NULL,'Female','1990-07-09','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Elijah','Wong','647-555-0213','elijah.wong@mock.local','5 Palace Pier Ct','Etobicoke','ON','M8V 4A1','Canada','XL','INTERMEDIATE',6,27,'Male','1993-12-02','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Layla','Hassan','416-555-0214','layla.hassan@mock.local','2183 Lake Shore Blvd W','Etobicoke','ON','M8V 3X8','Canada','S','INTERMEDIATE',4,NULL,'Female','1996-08-17','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Benjamin','Costa','647-555-0215','benjamin.costa@mock.local','20 Fifth St','Etobicoke','ON','M8V 2Z6','Canada','L','BEGINNER',2,NULL,'Male','1999-01-23','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    -- 5 mock referees
    (tid,'Harold','Dunn','416-555-0216','harold.dunn@mock.local','33 Birmingham St','Etobicoke','ON','M8V 2A8','Canada','L','ADVANCED',11,NULL,'Male','1982-05-30','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Marie','Lefebvre','647-555-0217','marie.lefebvre@mock.local','18 Thirty First St','Etobicoke','ON','M8W 3E9','Canada','M','ADVANCED',9,NULL,'Female','1986-09-14','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Samuel','Okafor','416-555-0218','samuel.okafor@mock.local','48 Kingsway Cres','Etobicoke','ON','M8X 2S9','Canada','XL','INTERMEDIATE',7,NULL,'Male','1988-02-06','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Diane','Fortin','647-555-0219','diane.fortin@mock.local','62 Grenview Blvd S','Etobicoke','ON','M8Y 3G2','Canada','M','INTERMEDIATE',6,NULL,'Female','1991-11-27','UNPAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW()),
    (tid,'Victor','Palermo','416-555-0220','victor.palermo@mock.local','8 Grenview Blvd N','Etobicoke','ON','M8Y 3G3','Canada','L','ADVANCED',13,NULL,'Male','1979-04-04','PAID',TRUE,TRUE,FALSE,FALSE,NOW(),NOW());

    -- Positions: spread the 15 players roughly evenly across FRONT/BACK/CENTER/NETTY
    INSERT INTO player_position (player_id, position)
    SELECT id, 'FRONT' FROM player WHERE tournament_id = tid AND email IN (
      'owen.bennett@mock.local','grace.coleman@mock.local','lucas.ferreira@mock.local','zara.ahmed@mock.local');

    INSERT INTO player_position (player_id, position)
    SELECT id, 'BACK' FROM player WHERE tournament_id = tid AND email IN (
      'ethan.brooks@mock.local','chloe.reyes@mock.local','noah.kaczmarek@mock.local','mia.santos@mock.local');

    INSERT INTO player_position (player_id, position)
    SELECT id, 'CENTER' FROM player WHERE tournament_id = tid AND email IN (
      'liam.osei@mock.local','isla.petrov@mock.local','mason.iqbal@mock.local','ava.nowak@mock.local');

    INSERT INTO player_position (player_id, position)
    SELECT id, 'NETTY' FROM player WHERE tournament_id = tid AND email IN (
      'elijah.wong@mock.local','layla.hassan@mock.local','benjamin.costa@mock.local');

    -- 5 mock referees
    INSERT INTO player_position (player_id, position)
    SELECT id, 'REFEREE' FROM player WHERE tournament_id = tid AND email IN (
      'harold.dunn@mock.local','marie.lefebvre@mock.local','samuel.okafor@mock.local',
      'diane.fortin@mock.local','victor.palermo@mock.local');
END $$;
