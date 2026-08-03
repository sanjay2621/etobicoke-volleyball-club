-- One shared t-shirt color for every referee in the tournament (distinct from each team's own color).
ALTER TABLE tournament ADD COLUMN referee_tshirt_color VARCHAR(30);
