# URL_Fetch.md

## Feature: Fetch Product Image from URL

### Overview
On **Step 3: Enter Product URL** of the campaign builder, when a user enters a product URL and clicks the button, the app should:
1. Visit the provided product page.
2. Scrape the page for the best product image.
3. Store the image in the local database (localStorage).
4. Populate the Ad Preview section with the fetched image.

---

## User Flow

1. **User Action:**  
   - User enters a product URL in the input field.
   - User clicks the "Fetch Product & Continue" button.

2. **System Action:**  
   - The app fetches the HTML content of the provided URL.
   - The app parses the HTML to find the best product image.
   - The image is downloaded and converted to a base64 data URL.
   - The image is stored in localStorage, associated with the campaign/creative.
   - The Ad Preview section is updated to show the fetched image.

---

## Technical Specification

### 1. Fetching the Product Page

- Use a backend proxy (Node.js server or serverless function) to fetch the HTML of the product page.
  - **Reason:** Browsers block cross-origin requests to arbitrary sites (CORS).
  - The frontend sends the product URL to the backend endpoint: `/api/fetch-product-page?url=...`
  - The backend fetches the HTML and returns it to the frontend.

### 2. Parsing the HTML for the Best Product Image

- On the backend (preferred for reliability) or frontend (if CORS allows), parse the HTML to extract image candidates:
  - Look for `<meta property="og:image">` (Open Graph image).
  - Look for `<meta name="twitter:image">`.
  - Look for `<img>` tags with large dimensions or product-related class names/IDs.
  - Optionally, use heuristics (e.g., largest image, image near product title, etc.).

- Return the best image URL to the frontend.

### 3. Downloading and Storing the Image

- The frontend receives the image URL.
- The frontend fetches the image as a Blob, converts it to a base64 data URL.
- Store the base64 image in localStorage, associated with the current campaign/creative.

### 4. Populating the Ad Preview

- Update the Ad Preview section to use the fetched image.
- If the user edits the campaign later, load the image from localStorage.

---

## API Design

### Backend Endpoint

**POST /api/fetch-product-image**

**Request Body:**
```json
{
  "url": "https://example.com/product/123"
}
```

**Response:**
```json
{
  "imageUrl": "https://example.com/images/product123.jpg"
}
```

- Optionally, include a fallback image or error message if no image is found.

---

## Frontend Implementation Steps

1. **Update the URL Input Component:**
   - On submit, send the product URL to the backend endpoint.
   - Show a loading spinner while fetching.

2. **Handle the Backend Response:**
   - If an image URL is returned, fetch the image as a Blob.
   - Convert the Blob to a base64 data URL.
   - Store the base64 image in localStorage under the current campaign/creative.
   - Update the Ad Preview section with the new image.

3. **Error Handling:**
   - If no image is found, show a user-friendly error message.
   - Allow the user to retry or upload an image manually.

---

## Example Backend (Node.js/Express)

```js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
app.use(express.json());

app.post('/api/fetch-product-image', async (req, res) => {
  const { url } = req.body;
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Try Open Graph
    let imageUrl = $('meta[property="og:image"]').attr('content');
    // Try Twitter Card
    if (!imageUrl) imageUrl = $('meta[name="twitter:image"]').attr('content');
    // Fallback: first large <img>
    if (!imageUrl) {
      let maxArea = 0;
      $('img').each((i, el) => {
        const w = parseInt($(el).attr('width')) || 0;
        const h = parseInt($(el).attr('height')) || 0;
        const area = w * h;
        if (area > maxArea) {
          maxArea = area;
          imageUrl = $(el).attr('src');
        }
      });
    }
    if (imageUrl) {
      res.json({ imageUrl });
    } else {
      res.status(404).json({ error: 'No image found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch product page' });
  }
});

app.listen(3001, () => console.log('API running on port 3001'));
```

---

## Security & Privacy

- Sanitize and validate all URLs on the backend.
- Do not allow fetching of internal or private network addresses.
- Limit the size of fetched pages and images.

---

## Future Enhancements

- Use AI/ML to better identify product images.
- Allow user to select from multiple image candidates.
- Cache fetched images for performance.

---

## Summary

This feature will allow users to enter a product URL, automatically fetch the best product image, and use it in their ad creative, improving speed and user experience. 