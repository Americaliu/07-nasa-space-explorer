
// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get button and gallery
const button = document.querySelector(".filters button");
const gallery = document.getElementById("gallery");

button.addEventListener("click", getImages);

async function getImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (startDate > endDate) {
    gallery.textContent = "Please select a valid date range.";
    return;
  }

  gallery.textContent = "Loading space photos...";

  // Dates
  const start = startDate.replaceAll("-", "").slice(2);
  const end = endDate.replaceAll("-", "").slice(2);

  // NASA API
  const url = "https://science.nasa.gov/wp-json/wp/v2/apod-basic"
    + "?date_from=" + start
    + "&date_to=" + end;

  try {
    // Get data
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not get NASA data");
    }

    let photos = await response.json();

    // Make sure photos is an array
    if (!Array.isArray(photos)) {
      photos = [photos];
    }

    // Clear
    gallery.innerHTML = "";

    if (photos.length === 0) {
      gallery.textContent = "No photos found.";
      return;
    }

    // Create card
    photos.forEach(function(photo) {
      const card = document.createElement("div");
      card.className = "gallery-item";

      // Show image or link
      if (photo.media_type === "image" && photo.hdurl) {
        const image = document.createElement("img");
        image.src = photo.hdurl;
        image.alt = photo.title;
        image.loading = "lazy";
        card.appendChild(image);
      

      } else {
        // Find video from NASA's HTML
        const page = new DOMParser().parseFromString(
          photo.basic_html || "",
          "text/html"
        );

        const videoSource = page.querySelector("video source");
        const youtubeVideo = page.querySelector("iframe");

        if (videoSource) {
          // Show MP4 video
          const video = document.createElement("video");
          video.src = videoSource.src;
          video.controls = true;
          video.preload = "metadata";
          video.className = "video-preview";
          card.appendChild(video);

        } else if (youtubeVideo) {
          // Show embedded video
          const iframe = document.createElement("iframe");
          iframe.src = youtubeVideo.src;
          iframe.className = "video-preview";
          iframe.title = photo.title;
          iframe.allow = "autoplay; encrypted-media; picture-in-picture";
          iframe.allowFullscreen = true;
          card.appendChild(iframe);

        } else {
          // Show placeholder if video is unavailable
          const videoBox = document.createElement("div");
          videoBox.className = "video-preview";
          videoBox.textContent = "🎬 Video unavailable";
          card.appendChild(videoBox);
        }

        // Link to NASA
        const link = document.createElement("a");
        link.href = photo.url;
        link.textContent = "Watch on NASA";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }


      // Add photo title
      const title = document.createElement("h3");
      title.textContent = photo.title;

      // Add photo date
      const date = document.createElement("p");
      date.textContent = photo.date;

      // Put everything inside the card
      card.appendChild(title);
      card.appendChild(date);

      // Open photo details
      if (photo.media_type === "image" && photo.hdurl) {
      card.classList.add("clickable");

      card.addEventListener("click", function() {
      openModal(photo);
      });
    }

      // Add the card to gallery
      gallery.appendChild(card);
    });

  } catch (error) {
    gallery.textContent = "Something went wrong. Please try again.";
    console.log(error);
  }
}

// Open photo popup
function openModal(photo) {
  document.getElementById("modalImage").src = photo.hdurl;
  document.getElementById("modalImage").alt = photo.title;
  document.getElementById("modalTitle").textContent = photo.title;
  document.getElementById("modalDate").textContent = photo.date;

  // Show explanation without HTML tags
  const text = new DOMParser().parseFromString(
    photo.explanation || "",
    "text/html"
  ).body.textContent;

  document.getElementById("modalText").textContent = text;

  document.getElementById("photoModal").hidden = false;
}

// Close photo
function closeModal() {
  document.getElementById("photoModal").hidden = true;
}

// Close function
document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("photoModal").addEventListener("click", function(event) {
  if (event.target.id === "photoModal") {
    closeModal();
  }
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Random space facts
const spaceFacts = [
  "Sunlight takes about 8 minutes to reach Earth.",

  "One day on Venus is longer than one year on Venus.",

  "Neptune takes about 165 Earth years to orbit the Sun.",

  "The Moon is slowly moving away from Earth every year.",

  "The Sun contains about 99.8% of the mass in our Solar System.",

  "The International Space Station orbits Earth about every 90 minutes.",

  "Jupiter is the largest planet in our Solar System."
];

// Pick a random 
const randomNumber = Math.floor(Math.random() * spaceFacts.length);

// display
document.getElementById("spaceFact").textContent = spaceFacts[randomNumber];
