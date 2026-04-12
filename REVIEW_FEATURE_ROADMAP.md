# Review Feature — Implementation Roadmap

> **Audience**: Claude Sonnet (and Rob as supervisor).
> **Purpose**: Step-by-step instructions for adding a Customer Reviews section to both sister sites.
> **Rule**: Follow these steps exactly. Do not improvise solutions, add extra features, or deviate from the patterns shown here.

---

## What Has Already Been Done (Do NOT Recreate)

The following files have already been created and are complete. **Do not modify them** unless a step below explicitly says to.

| File | Purpose |
|---|---|
| `netlify.toml` | Tells Netlify where serverless functions live |
| `package.json` | Declares the `@netlify/blobs` dependency |
| `netlify/functions/reviews-submit.mjs` | POST `/api/reviews/submit` — validates & stores a review |
| `netlify/functions/reviews-fetch.mjs` | GET `/api/reviews?site=<name>` — returns reviews array |
| `scripts/reviews.js` | Shared frontend JS — fetches, renders, handles modals, submit flow |

---

## Step 1 — Add Custom Scrollbar CSS

The reviews container uses `overflow-y: auto`. The default scrollbar clashes with the dark theme. Add a small CSS block to **both** style.css files.

### 1a. `the_house_surgeon/styles/style.css`

Append the following at the **end** of the file (after the `.flip-card-inner.is-flipped` rule on line 124):

```css
/* Review section scrollbar */
#reviews-container::-webkit-scrollbar {
    width: 6px;
}

#reviews-container::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 3px;
}

#reviews-container::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
}

#reviews-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}
```

### 1b. `crentoon_studios/styles/style.css`

Append the **exact same block** at the end of this file (after line 104).

---

## Step 2 — Add the Review Section HTML to The House Surgeon

Open `the_house_surgeon/index.html`. The About section ends at **line 366** (`</section>`). The Facetime Diagnostics section begins at **line 368**.

Insert the following HTML block **between line 366 and line 368** (i.e., between the closing `</section>` of About and the `<!-- FACETIME DIAGNOSTICS SECTION -->` comment):

```html

    <!-- CUSTOMER REVIEWS SECTION -->
    <section id="reviews-section" class="bg-[#121212] py-16 px-6 md:px-12" data-site="house_surgeon" data-accent="#22c55e">
      <div class="max-w-4xl mx-auto text-center mb-10">
        <div data-reveal class="reveal">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Customer Reviews</h2>
          <p class="text-gray-400 text-lg">See what our customers have to say.</p>
        </div>
      </div>

      <!-- Scrollable reviews container -->
      <div id="reviews-container" class="max-w-4xl mx-auto space-y-4 max-h-96 overflow-y-auto pr-2 mb-8">
        <!-- Reviews loaded dynamically by reviews.js -->
      </div>

      <!-- Leave a Review button -->
      <div class="text-center">
        <button id="leave-review-btn"
          class="inline-block bg-gradient-to-r from-[#1f7a3b] via-[#2aa42a] to-[#1f7a3b] text-white hover:brightness-110 font-semibold py-3 px-8 rounded transition duration-300 shadow-lg">
          Leave a Review
        </button>
      </div>
    </section>

    <!-- REVIEW FORM MODAL -->
    <div id="review-modal" class="hidden fixed inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-sm">
      <div class="bg-[#1a1a1a] rounded-xl p-6 md:p-8 w-full max-w-md mx-4 border border-gray-700 relative max-h-[90vh] overflow-y-auto">
        <button id="close-review-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        <h3 class="text-2xl font-bold text-white mb-6">Leave a Review</h3>
        <form id="review-form" class="space-y-4">
          <!-- Honeypot (invisible to humans) -->
          <input type="text" id="review-honeypot" name="website_url" class="hidden" tabindex="-1" autocomplete="off" />

          <!-- Name -->
          <div>
            <label for="review-name" class="block text-sm text-gray-400 mb-1">Name or nickname</label>
            <input type="text" id="review-name" required maxlength="50" placeholder="e.g. Big Jim"
              class="w-full p-3 rounded bg-[#1e1e1e] text-white border border-gray-700 focus:border-[#22c55e] outline-none transition" />
          </div>

          <!-- Star Rating -->
          <div>
            <label class="block text-sm text-gray-400 mb-1">Rating</label>
            <div id="star-rating" class="flex gap-1 text-3xl cursor-pointer select-none">
              <span data-star="1" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
              <span data-star="2" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
              <span data-star="3" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
              <span data-star="4" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
              <span data-star="5" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
            </div>
            <p id="rating-error" class="text-red-400 text-xs mt-1 hidden">Please select a rating.</p>
          </div>

          <!-- Comment -->
          <div>
            <label for="review-comment" class="block text-sm text-gray-400 mb-1">Comment <span class="text-gray-600">(optional unless 1-star)</span></label>
            <textarea id="review-comment" rows="3" maxlength="300" placeholder="Share your experience..."
              class="w-full p-3 rounded bg-[#1e1e1e] text-white border border-gray-700 focus:border-[#22c55e] outline-none transition resize-none"></textarea>
            <p id="char-count" class="text-gray-500 text-xs mt-1">300 characters remaining</p>
            <p id="comment-error" class="text-red-400 text-xs mt-1 hidden">A comment is required for 1-star ratings.</p>
          </div>

          <!-- Submit -->
          <button type="submit"
            class="w-full bg-gradient-to-r from-[#1f7a3b] via-[#2aa42a] to-[#1f7a3b] text-white hover:brightness-110 font-semibold py-3 rounded transition duration-300 shadow-lg">
            Submit
          </button>
        </form>
      </div>
    </div>

    <!-- REVIEW CONFIRM MODAL -->
    <div id="review-confirm-modal" class="hidden fixed inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-sm">
      <div class="bg-[#1a1a1a] rounded-xl p-6 md:p-8 w-full max-w-md mx-4 border border-gray-700">
        <h3 class="text-xl font-bold text-white mb-4">Confirm Your Review</h3>
        <div class="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 mb-6">
          <p class="font-semibold text-white mb-1" id="confirm-name"></p>
          <div class="mb-2" id="confirm-stars"></div>
          <p class="text-gray-400 text-sm" id="confirm-comment"></p>
        </div>
        <div class="flex gap-3">
          <button id="confirm-edit-btn"
            class="flex-1 py-3 rounded border border-gray-600 text-gray-300 hover:bg-[#2a2a2a] transition font-semibold">
            Edit
          </button>
          <button id="confirm-submit-btn"
            class="flex-1 py-3 rounded bg-gradient-to-r from-[#1f7a3b] via-[#2aa42a] to-[#1f7a3b] text-white hover:brightness-110 transition font-semibold">
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- REVIEW TOAST NOTIFICATION -->
    <div id="review-toast" class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white text-sm font-medium z-[60] opacity-0"></div>

```

---

## Step 3 — Add the Review Section HTML to Crentoon Studios

Open `crentoon_studios/index.html`. The About section ends at **line 387** (`</section>`). The Contact & Booking section begins at **line 389**.

Insert the following HTML block **between line 387 and line 389** (i.e., between the closing `</section>` of About and the `<!-- CONTACT & BOOKING SECTION -->` comment).

This is nearly identical to Step 2 but with **Crentoon Studios theming**:
- `data-site="crentoon_studios"` and `data-accent="#f97316"`
- Green gradients replaced with the red/crimson gradient: `from-[#7a1f1f] via-[#b42a2a] to-[#7a1f1f]`
- Focus borders use `focus:border-[#f97316]` (orange) instead of `focus:border-[#22c55e]` (green)

```html

    <!-- CUSTOMER REVIEWS SECTION -->
    <section id="reviews-section" class="bg-[#1a1a1a] py-16 px-6 md:px-12" data-site="crentoon_studios" data-accent="#f97316">
        <div class="max-w-4xl mx-auto text-center mb-10">
            <div data-reveal class="reveal">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Client Reviews</h2>
                <p class="text-gray-400 text-lg">See what our clients have to say.</p>
            </div>
        </div>

        <!-- Scrollable reviews container -->
        <div id="reviews-container" class="max-w-4xl mx-auto space-y-4 max-h-96 overflow-y-auto pr-2 mb-8">
            <!-- Reviews loaded dynamically by reviews.js -->
        </div>

        <!-- Leave a Review button -->
        <div class="text-center">
            <button id="leave-review-btn"
                class="inline-block bg-gradient-to-r from-[#7a1f1f] via-[#b42a2a] to-[#7a1f1f] text-white hover:brightness-110 font-semibold py-3 px-8 rounded transition duration-300 shadow-lg">
                Leave a Review
            </button>
        </div>
    </section>

    <!-- REVIEW FORM MODAL -->
    <div id="review-modal" class="hidden fixed inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-sm">
        <div class="bg-[#1a1a1a] rounded-xl p-6 md:p-8 w-full max-w-md mx-4 border border-gray-700 relative max-h-[90vh] overflow-y-auto">
            <button id="close-review-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            <h3 class="text-2xl font-bold text-white mb-6">Leave a Review</h3>
            <form id="review-form" class="space-y-4">
                <!-- Honeypot (invisible to humans) -->
                <input type="text" id="review-honeypot" name="website_url" class="hidden" tabindex="-1" autocomplete="off" />

                <!-- Name -->
                <div>
                    <label for="review-name" class="block text-sm text-gray-400 mb-1">Name or nickname</label>
                    <input type="text" id="review-name" required maxlength="50" placeholder="e.g. Big Jim"
                        class="w-full p-3 rounded bg-[#1e1e1e] text-white border border-gray-700 focus:border-[#f97316] outline-none transition" />
                </div>

                <!-- Star Rating -->
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Rating</label>
                    <div id="star-rating" class="flex gap-1 text-3xl cursor-pointer select-none">
                        <span data-star="1" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
                        <span data-star="2" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
                        <span data-star="3" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
                        <span data-star="4" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
                        <span data-star="5" class="text-gray-600 hover:text-yellow-400 transition">&#9733;</span>
                    </div>
                    <p id="rating-error" class="text-red-400 text-xs mt-1 hidden">Please select a rating.</p>
                </div>

                <!-- Comment -->
                <div>
                    <label for="review-comment" class="block text-sm text-gray-400 mb-1">Comment <span class="text-gray-600">(optional unless 1-star)</span></label>
                    <textarea id="review-comment" rows="3" maxlength="300" placeholder="Share your experience..."
                        class="w-full p-3 rounded bg-[#1e1e1e] text-white border border-gray-700 focus:border-[#f97316] outline-none transition resize-none"></textarea>
                    <p id="char-count" class="text-gray-500 text-xs mt-1">300 characters remaining</p>
                    <p id="comment-error" class="text-red-400 text-xs mt-1 hidden">A comment is required for 1-star ratings.</p>
                </div>

                <!-- Submit -->
                <button type="submit"
                    class="w-full bg-gradient-to-r from-[#7a1f1f] via-[#b42a2a] to-[#7a1f1f] text-white hover:brightness-110 font-semibold py-3 rounded transition duration-300 shadow-lg">
                    Submit
                </button>
            </form>
        </div>
    </div>

    <!-- REVIEW CONFIRM MODAL -->
    <div id="review-confirm-modal" class="hidden fixed inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-sm">
        <div class="bg-[#1a1a1a] rounded-xl p-6 md:p-8 w-full max-w-md mx-4 border border-gray-700">
            <h3 class="text-xl font-bold text-white mb-4">Confirm Your Review</h3>
            <div class="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 mb-6">
                <p class="font-semibold text-white mb-1" id="confirm-name"></p>
                <div class="mb-2" id="confirm-stars"></div>
                <p class="text-gray-400 text-sm" id="confirm-comment"></p>
            </div>
            <div class="flex gap-3">
                <button id="confirm-edit-btn"
                    class="flex-1 py-3 rounded border border-gray-600 text-gray-300 hover:bg-[#2a2a2a] transition font-semibold">
                    Edit
                </button>
                <button id="confirm-submit-btn"
                    class="flex-1 py-3 rounded bg-gradient-to-r from-[#7a1f1f] via-[#b42a2a] to-[#7a1f1f] text-white hover:brightness-110 transition font-semibold">
                    Confirm
                </button>
            </div>
        </div>
    </div>

    <!-- REVIEW TOAST NOTIFICATION -->
    <div id="review-toast" class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white text-sm font-medium z-[60] opacity-0"></div>

```

---

## Step 4 — Add the `reviews.js` Script Tag

The shared `scripts/reviews.js` file already exists at the project root's `scripts/` directory. Each site needs a `<script>` tag that loads it **after** the page content but **before** `main.js` (so the DOM elements exist when the script runs).

### 4a. `the_house_surgeon/index.html`

Find the script block near the bottom of the file (around line 705–709 after your Step 2 insertion shifts line numbers). Insert the reviews script **before** the `clips.js` script tag:

```html
    <!-- Reviews Script -->
    <script src="../scripts/reviews.js"></script>

    <!-- Video Clips Script -->
    <script src="./scripts/clips.js"></script>
```

Specifically, add the reviews `<script>` tag **immediately before** the line `<!-- Video Clips Script -->`.

### 4b. `crentoon_studios/index.html`

Same approach. Insert **immediately before** the `<!-- Video Clips Script -->` comment (around line 489 after your Step 3 insertion shifts line numbers):

```html
    <!-- Reviews Script -->
    <script src="../scripts/reviews.js"></script>

    <!-- Video Clips Script -->
    <script src="./scripts/clips.js"></script>
```

---

## Step 5 — Add a "Reviews" Link to Each Site's Navigation (Optional but Recommended)

Each site has a nav bar with anchor links. Adding a "Reviews" link lets users jump directly to the section.

### 5a. `the_house_surgeon/index.html`

Find the navigation links in the header. Look for the existing anchor links (e.g., `<a href="#services"`, `<a href="#about"`). Add a new link for reviews:

```html
<a href="#reviews-section" class="hover:text-[#22c55e] transition">Reviews</a>
```

Place it **after** the "About" link and **before** whatever link follows it (likely "Contact" or "FaceTime").

### 5b. `crentoon_studios/index.html`

Same approach. Add to the navigation:

```html
<a href="#reviews-section" class="hover:text-[#f97316] transition">Reviews</a>
```

Place it **after** the "About" link and **before** the "Contact" link.

> **Note for Sonnet**: Look at the existing nav links to match the exact class pattern and spacing. Both sites use slightly different nav structures — match whichever pattern is already in use.

---

## Step 6 — Verify and Test

After all changes are made, verify the following:

### Structural Checks
1. Both `index.html` files have valid HTML (no unclosed tags introduced by the insertion).
2. The `reviews.js` script tag path is `../scripts/reviews.js` (one directory up from each sub-site).
3. The `data-site` attribute is `"house_surgeon"` on the plumbing site and `"crentoon_studios"` on the videography site.
4. The honeypot `<input>` has `class="hidden"` and `tabindex="-1"`.

### Visual / Functional Checks (requires deployment or `netlify dev`)
1. The review section appears between "About Floyd" and the next section on both sites.
2. The "Leave a Review" button opens the form modal.
3. Star rating highlights on hover and locks on click.
4. Character counter counts down from 300 and turns red below 30.
5. Submitting without a star rating shows the "Please select a rating" error.
6. Submitting a 1-star review without a comment shows the "comment required" error.
7. After valid submission, the confirm modal appears showing the preview.
8. "Edit" returns to the form with fields pre-filled.
9. "Confirm" submits to the API and shows a success toast.
10. The review appears in the scrollable container after confirmation.
11. Clicking the backdrop or pressing Escape closes modals.
12. The section is fully responsive on mobile.

---

## Architecture Summary

```
Frontend (both sites)                    Backend (Netlify)
┌─────────────────────┐                   ┌──────────────────────────┐
│ reviews-section HTML │                  │ Netlify Functions (ESM)  │
│ + review-modal HTML  │                  │                          │
│ + confirm-modal HTML │──fetch reviews──▶│ GET  /api/reviews        │
│                      │                  │   → reads Netlify Blobs  │
│ scripts/reviews.js   │──submit review──▶│ POST /api/reviews/submit │
│ (shared, loaded via  │                  │   → validates + stores   │
│  ../scripts/reviews) │                  │   → honeypot check       │
└─────────────────────┘                   │   → rate limit (1/min)   │
                                          └──────────────────────────┘
                                                      │
                                         ┌─────────────▼──────────────┐
                                         │ Netlify Blobs              │
                                         │ Store: "reviews"           │
                                         │   Key: "house_surgeon"     │
                                         │   Key: "crentoon_studios"  │
                                         │ Store: "rate-limits"       │
                                         │   Key: <ip-address>        │
                                         └────────────────────────────┘
```

### Data Shape (each review in the array)

```json
{
  "id": "m3x7k9ab",
  "name": "Big Jim",
  "rating": 5,
  "comment": "Floyd fixed my sink in under an hour. Highly recommend!",
  "createdAt": "2026-04-12T18:30:00.000Z"
}
```

### Admin Deletion

Rob can delete individual reviews by:
1. Logging into the Netlify dashboard → select site → Blobs
2. Opening the `reviews` store → selecting the `house_surgeon` or `crentoon_studios` key
3. Editing the JSON array to remove the unwanted review object
4. Saving

---

## Files Modified by Sonnet (Checklist)

- [ ] `the_house_surgeon/styles/style.css` — append scrollbar CSS (Step 1a)
- [ ] `crentoon_studios/styles/style.css` — append scrollbar CSS (Step 1b)
- [ ] `the_house_surgeon/index.html` — insert review section HTML (Step 2)
- [ ] `the_house_surgeon/index.html` — add `reviews.js` script tag (Step 4a)
- [ ] `the_house_surgeon/index.html` — add "Reviews" nav link (Step 5a)
- [ ] `crentoon_studios/index.html` — insert review section HTML (Step 3)
- [ ] `crentoon_studios/index.html` — add `reviews.js` script tag (Step 4b)
- [ ] `crentoon_studios/index.html` — add "Reviews" nav link (Step 5b)

### Files NOT To Be Modified

- `netlify.toml` — already complete
- `package.json` — already complete
- `netlify/functions/reviews-submit.mjs` — already complete
- `netlify/functions/reviews-fetch.mjs` — already complete
- `scripts/reviews.js` — already complete
