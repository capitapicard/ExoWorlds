# Drop down content
This file contains the names of notable searches. The list is the following:
"-- Select Preset --",
"Nearby Systems (< 50 ly)",
"Habitable Zone (Goldilocks)",
"Rich Systems (4+ Planets)",
"Hot Jupiters (Exotic Giants)",
"Earth 2.0 (Rocky Habitable)"

# Logic to implement for each selection
Using the above list, impement this logic to update the query to look for the information. As you can see, use the index in the drop down to complete the query with a maximum of 100 results.

 string hzPart = "(pl_orbsmax >= SQRT((st_rad * st_rad * POWER(st_teff / 5778.0, 4)) / 1.1) AND pl_orbsmax <= SQRT((st_rad * st_rad * POWER(st_teff / 5778.0, 4)) / 0.53))";
                
                string whereClause = index switch
                {
                    1 => "sy_dist <= 15.33", // Nearby (< 50 ly)
                    2 => hzPart,            // Habitable Zone
                    3 => "sy_pnum >= 4",      // Rich Systems
                    4 => "pl_bmasse > 100 AND pl_orbper < 10", // Hot Jupiters
                    5 => hzPart + " AND pl_rade BETWEEN 0.8 AND 1.25", // Earth 2.0
                    _ => "1=1"
                };