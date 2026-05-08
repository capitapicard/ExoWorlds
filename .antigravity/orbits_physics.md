# Technical Guide: Orbital Rendering Logic

To render orbits in the Center Pane, follow these geometric rules:

## 1. The Orbital Ellipse
The orbit is defined by the Semi-major axis ($a$) and Eccentricity ($e$).
* **Semi-minor axis ($b$):** $b = a \times \sqrt{1 - e^2}$
* **Focus Offset:** The star is not at the center, but at a focus. Offset = $a \times e$.

## 2. Coordinate Mapping
Convert Keplerian elements to 3D Space:
$$x = a \times (\cos(E) - e)$$
$$y = b \times \sin(E)$$
*(Where $E$ is the eccentric anomaly)*.

## 3. Visual Assets
* **Planets:** Use procedural noise textures based on `st_teff` (Star Temp). If high temp, use "Lava/Rock" textures; if low, use "Ice/Gas" textures.
* **Orbits:** Render as a `THREE.LineLoop` using a `BufferGeometry` to minimize memory overhead.