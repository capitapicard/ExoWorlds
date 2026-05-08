Use this code in C# to determine the goldilocks range and adapt it to the currrent technology in the web page:
private bool CalculateHabitableZoneAu(out double innerAu, out double outerAu)
        {
            innerAu = 0;
            outerAu = 0;
            if (!_star.st_rad.HasValue || !_star.st_teff.HasValue)
                return false;

            double radiusSolar = _star.st_rad.Value;
            double tempK = _star.st_teff.Value;
            
            // L / L_sun = (R / R_sun)^2 * (T / T_sun)^4
            double tempRatio = tempK / 5778.0;
            double luminosity = (radiusSolar * radiusSolar) * Math.Pow(tempRatio, 4);

            if (luminosity <= 0) return false;

            innerAu = Math.Sqrt(luminosity / 1.1);
            outerAu = Math.Sqrt(luminosity / 0.53);
            return true;
        }