# Exoplanet Explorer: Project Constitution

## 1. UI Architecture (The "Three-Pane" Rule)
* **Layout:** The application MUST maintain a three-pane docked layout.
    * **Left Pane (Sidebar):** Search, filtering, and a scrollable list of exoplanets.
    * **Center Pane (Viewport):** A high-performance Three.js/React-Three-Fiber stage for 3D orbit and planet rendering.
    * **Bottom Pane (Data Desk):** Detailed physical characteristics, NASA TAP service metadata, and discovery info.
* **Interactivity:** Selecting a planet in the Sidebar must instantly update the Center and Bottom panes via a global state (Zustand).

## 2. Technical Standards
* **Performance:** The 3D Viewport must use `requestAnimationFrame` and optimized geometries to handle complex orbital paths without dropping below 60 FPS.
* **Data Integrity:** All astronomical units must be standardized (e.g., convert Parsecs to Light Years for display where appropriate).
* **State:** Use a "Stateless Backend" (Node.js) to proxy NASA API calls and a "Stateful Frontend" (React + Zustand).

## 3. Visual Language
* **Theme:** Dark/Space aesthetic (Slate-950/Zinc-900).
* **Graphics:** Use realistic Keplerian orbital paths (ellipses) rather than perfect circles.