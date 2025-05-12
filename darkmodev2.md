# Plan: Implement Automatic Dark Mode

**Goal:** Add support for dark mode to the application, automatically activated based on the user's operating system preference (`prefers-color-scheme`), without breaking existing light mode styles.

**Strategy:**

1.  **Detection:** Use the browser's built-in `window.matchMedia` API to detect the user's `prefers-color-scheme` setting.
2.  **Styling:** Leverage CSS variables or Tailwind CSS's dark mode features to define and apply theme-specific styles.
3.  **Activation:** Dynamically apply dark mode styles based on the detected preference.

**Detailed Steps:**

1.  **Identify Styling Approach:**
    *   Determine the current styling method (e.g., Tailwind CSS, CSS Modules, Styled Components, plain CSS/SCSS). The implementation details below might need minor adjustments based on this. *This plan primarily assumes Tailwind CSS or standard CSS variables.*

2.  **Configure Tailwind CSS (If Applicable):**
    *   If using Tailwind CSS, the simplest approach is to use the `media` strategy.
    *   Open `tailwind.config.js`.
    *   Set the `darkMode` option: `darkMode: 'media'`.
    *   This tells Tailwind to apply `dark:` prefixed utilities based on the `prefers-color-scheme` media query directly. No JavaScript intervention is needed for toggling.
    *   If you choose `darkMode: 'class'`, you will need JavaScript to toggle a class (e.g., `dark`) on the `<html>` or `<body>` element (See Step 3).

3.  **Theme Detection Logic (If *not* using Tailwind `media` strategy or need manual toggle later):**
    *   Create a mechanism (e.g., a React hook `useDarkMode` or logic within `App.tsx` or a layout component) to manage the theme.
    *   **Initial Detection:** Use `window.matchMedia('(prefers-color-scheme: dark)').matches` to get the initial state.
    *   **State Management:** Use `useState` to keep track of the current mode (e.g., `'light'` or `'dark'`).
    *   **Listen for Changes:** Use `useEffect` to subscribe to changes in the media query. Add an event listener to `window.matchMedia('(prefers-color-scheme: dark)')` for the `'change'` event and update the state accordingly. Remember to clean up the listener on component unmount.
    *   **Apply Theme Class/Attribute:** Use another `useEffect` to conditionally add/remove a class (e.g., `dark`) or a data attribute (e.g., `data-theme="dark"`) to the `<html>` or `<body>` element based on the theme state.

4.  **Define Color Palette (If using CSS Variables):**
    *   In your global CSS file (e.g., `src/index.css` or similar):
    *   Define CSS variables for your light theme colors under the `:root` selector.
        ```css
        :root {
          --background-primary: #ffffff;
          --text-primary: #1f2937;
          --accent-color: #3b82f6;
          /* ... other light theme variables */
        }
        ```
    *   Define the dark theme overrides within a selector that targets the class or attribute set in Step 3 (or using the media query directly if not using JS toggling).
        ```css
        /* Option A: Using media query directly */
        @media (prefers-color-scheme: dark) {
          :root {
            --background-primary: #111827; /* Darker background */
            --text-primary: #f9fafb;      /* Lighter text */
            --accent-color: #60a5fa;     /* Potentially adjusted accent */
            /* ... other dark theme variables */
          }
        }

        /* Option B: Using a class (if darkMode: 'class' or manual toggle) */
        html.dark { /* or body.dark, or body[data-theme='dark'] */
          --background-primary: #111827;
          --text-primary: #f9fafb;
          --accent-color: #60a5fa;
          /* ... other dark theme variables */
        }
        ```

5.  **Refactor Component Styles:**
    *   **Tailwind CSS (`media` or `class` strategy):**
        *   Go through all components and views.
        *   Identify elements whose colors need to change in dark mode.
        *   Add the `dark:` prefix variant for the necessary utility classes.
        *   Example: `className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"`
    *   **CSS Variables:**
        *   Go through all components and their associated CSS (or style definitions).
        *   Replace hardcoded color values with the corresponding CSS variables.
        *   Example: `background-color: var(--background-primary); color: var(--text-primary);`

6.  **Testing:**
    *   **System Toggle:** Change your operating system's appearance setting between light and dark mode. Verify the application theme updates automatically.
    *   **Visual Regression:** Carefully review all pages, components, and states (e.g., hover, focus, disabled) in both light and dark modes. Ensure readability, contrast, and aesthetic consistency. Fix any elements that look broken or out of place.
    *   **Cross-Browser:** Test in major browsers (Chrome, Firefox, Safari, Edge) as media query support or rendering might have subtle differences.

**Considerations:**

*   **Manual Override:** Decide if you want to add a user-controlled toggle button later. This would typically involve storing the user's preference (e.g., in `localStorage`) and overriding the system preference detection logic.
*   **Images and Assets:** Check if any logos, icons, or images need alternative versions for dark mode to maintain visibility or brand consistency.
*   **Third-Party Components:** Verify if any third-party UI libraries or components used have their own dark mode support or require specific configuration. Consult their documentation.
*   **User Experience:** Ensure sufficient contrast ratios for text and interactive elements in dark mode to meet accessibility standards (WCAG).

This plan provides a roadmap for implementing dark mode. Review it, and let me know when you're ready to start implementing the steps! 