/**
 * reviews.js — Shared review section logic for both sister sites.
 *
 * Usage: include this script after the review-section HTML block.
 * The <section id="reviews-section"> element MUST have two data attributes:
 *   data-site="house_surgeon" | "crentoon_studios"
 *   data-accent="#22c55e"     | "#f97316"
 */
(function () {
  "use strict";

  var section = document.getElementById("reviews-section");
  if (!section) return;

  var SITE = section.dataset.site;
  var MAX_COMMENT = 300;

  // --- DOM references ---
  var reviewsContainer = document.getElementById("reviews-container");
  var leaveReviewBtn = document.getElementById("leave-review-btn");
  var reviewModal = document.getElementById("review-modal");
  var reviewForm = document.getElementById("review-form");
  var confirmModal = document.getElementById("review-confirm-modal");
  var charCount = document.getElementById("char-count");
  var commentField = document.getElementById("review-comment");
  var nameField = document.getElementById("review-name");
  var ratingError = document.getElementById("rating-error");
  var commentError = document.getElementById("comment-error");
  var honeypot = document.getElementById("review-honeypot");
  var confirmSubmitBtn = document.getElementById("confirm-submit-btn");
  var confirmEditBtn = document.getElementById("confirm-edit-btn");
  var toast = document.getElementById("review-toast");

  var selectedRating = 0;
  var pendingReview = null;

  // =========================================================================
  // Fetch & Render
  // =========================================================================

  function fetchReviews() {
    fetch("/api/reviews?site=" + SITE)
      .then(function (res) { return res.json(); })
      .then(function (data) { renderReviews(data.reviews || []); })
      .catch(function () {
        reviewsContainer.innerHTML =
          '<p class="text-gray-500 text-center py-4">Awaiting reviews at this time.</p>';
      });
  }

  function renderStars(rating) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html +=
        '<span class="text-lg ' +
        (i <= rating ? "text-yellow-400" : "text-gray-600") +
        '">&#9733;</span>';
    }
    return html;
  }

  function renderReviews(reviews) {
    if (reviews.length === 0) {
      reviewsContainer.innerHTML =
        '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first!</p>';
      return;
    }

    reviewsContainer.innerHTML = reviews
      .map(function (r) {
        return (
          '<div class="bg-[#1e1e1e] rounded-lg p-4 border border-gray-700">' +
            '<div class="flex items-center justify-between mb-2">' +
              '<span class="font-semibold text-white">' + escapeHtml(r.name) + "</span>" +
              '<span class="text-xs text-gray-500">' + formatDate(r.createdAt) + "</span>" +
            "</div>" +
            '<div class="mb-2">' + renderStars(r.rating) + "</div>" +
            (r.comment
              ? '<p class="text-gray-400 text-sm">' + escapeHtml(r.comment) + "</p>"
              : "") +
          "</div>"
        );
      })
      .join("");
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // =========================================================================
  // Modal helpers
  // =========================================================================

  function openModal(modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    // Restore scroll only if neither modal is open
    if (
      reviewModal.classList.contains("hidden") &&
      confirmModal.classList.contains("hidden")
    ) {
      document.body.style.overflow = "";
    }
  }

  // =========================================================================
  // Star rating interaction
  // =========================================================================

  function initStarRating() {
    var container = document.getElementById("star-rating");
    var stars = container.querySelectorAll("[data-star]");

    function highlightUpTo(val) {
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (parseInt(s.dataset.star, 10) <= val) {
          s.classList.add("text-yellow-400");
          s.classList.remove("text-gray-600");
        } else {
          s.classList.remove("text-yellow-400");
          s.classList.add("text-gray-600");
        }
      }
    }

    for (var i = 0; i < stars.length; i++) {
      (function (star) {
        star.addEventListener("mouseenter", function () {
          highlightUpTo(parseInt(star.dataset.star, 10));
        });

        star.addEventListener("click", function () {
          selectedRating = parseInt(star.dataset.star, 10);
          ratingError.classList.add("hidden");
          highlightUpTo(selectedRating);
        });
      })(stars[i]);
    }

    container.addEventListener("mouseleave", function () {
      highlightUpTo(selectedRating);
    });
  }

  // =========================================================================
  // Character counter
  // =========================================================================

  function initCharCount() {
    commentField.addEventListener("input", function () {
      var remaining = MAX_COMMENT - commentField.value.length;
      charCount.textContent = remaining + " characters remaining";
      if (remaining < 30) {
        charCount.classList.add("text-red-400");
        charCount.classList.remove("text-gray-500");
      } else {
        charCount.classList.remove("text-red-400");
        charCount.classList.add("text-gray-500");
      }
    });
  }

  // =========================================================================
  // Form submission → Confirm flow
  // =========================================================================

  function initForm() {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = nameField.value.trim();
      var comment = commentField.value.trim();

      // Validate rating
      if (selectedRating === 0) {
        ratingError.classList.remove("hidden");
        return;
      }

      // Validate 1-star comment requirement
      if (selectedRating === 1 && comment.length === 0) {
        commentError.classList.remove("hidden");
        return;
      }
      commentError.classList.add("hidden");

      // Build the pending review payload
      pendingReview = {
        site: SITE,
        name: name,
        rating: selectedRating,
        comment: comment,
        website_url: honeypot.value,
      };

      // Close form modal, open confirm modal
      closeModal(reviewModal);
      document.getElementById("confirm-name").textContent = pendingReview.name;
      document.getElementById("confirm-stars").innerHTML = renderStars(
        pendingReview.rating
      );
      document.getElementById("confirm-comment").textContent =
        pendingReview.comment || "(no comment)";
      openModal(confirmModal);
    });
  }

  // --- Confirm & Edit buttons (bound once) ---

  confirmEditBtn.addEventListener("click", function () {
    closeModal(confirmModal);
    openModal(reviewModal);
  });

  confirmSubmitBtn.addEventListener("click", function () {
    if (!pendingReview) return;

    confirmSubmitBtn.disabled = true;
    confirmSubmitBtn.textContent = "Submitting\u2026";

    fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingReview),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          closeModal(confirmModal);
          resetForm();
          fetchReviews();
          showToast("Review submitted! Thank you.");
        } else {
          showToast(
            result.data.error || "Something went wrong. Please try again.",
            true
          );
        }
      })
      .catch(function () {
        showToast("Network error. Please try again.", true);
      })
      .finally(function () {
        confirmSubmitBtn.disabled = false;
        confirmSubmitBtn.textContent = "Confirm";
      });
  });

  // =========================================================================
  // Reset & Toast
  // =========================================================================

  function resetForm() {
    reviewForm.reset();
    selectedRating = 0;
    pendingReview = null;

    var stars = document.querySelectorAll("#star-rating [data-star]");
    for (var i = 0; i < stars.length; i++) {
      stars[i].classList.remove("text-yellow-400");
      stars[i].classList.add("text-gray-600");
    }

    charCount.textContent = MAX_COMMENT + " characters remaining";
    charCount.classList.remove("text-red-400");
    charCount.classList.add("text-gray-500");
  }

  function showToast(message, isError) {
    toast.textContent = message;
    toast.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg " +
      "text-white text-sm font-medium z-[60] transition-opacity duration-300 " +
      (isError ? "bg-red-600" : "bg-green-600");
    setTimeout(function () {
      toast.classList.add("opacity-0");
      setTimeout(function () {
        toast.classList.add("hidden");
      }, 300);
    }, 3000);
  }

  // =========================================================================
  // Backdrop & Escape key close
  // =========================================================================

  reviewModal.addEventListener("click", function (e) {
    if (e.target === reviewModal) closeModal(reviewModal);
  });

  confirmModal.addEventListener("click", function (e) {
    if (e.target === confirmModal) closeModal(confirmModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!confirmModal.classList.contains("hidden")) closeModal(confirmModal);
      else if (!reviewModal.classList.contains("hidden"))
        closeModal(reviewModal);
    }
  });

  // =========================================================================
  // Init
  // =========================================================================

  leaveReviewBtn.addEventListener("click", function () {
    openModal(reviewModal);
  });

  document
    .getElementById("close-review-modal")
    .addEventListener("click", function () {
      closeModal(reviewModal);
    });

  initStarRating();
  initCharCount();
  initForm();
  fetchReviews();
})();
