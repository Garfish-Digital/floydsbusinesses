// const heroVideo = document.getElementById('heroVideo');
// heroVideo.addEventListener('loadedmetadata', () => {
//     if (heroVideo.duration > 2) {
//         heroVideo.currentTime = 2;
//     }
// });
//   <!-- Cropped Hero Video -->
// <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1]">
//   <video autoplay muted loop playsinline class="w-full h-[200%] object-cover object-[center_50%]">
//     <source src="/assets/hero-bg.mp4" type="video/mp4" />
//   </video>
// </div>

// Toggle Play/Pause on Hero Video
// function togglePlay(videoId) {
//     const videos = document.querySelectorAll('video');
//     const currentVideo = document.getElementById(videoId);
  
//     videos.forEach(v => {
//       if (v !== currentVideo) {
//         v.pause();
//         v.currentTime = 0;
//         v.load(); // Reset to poster
//       }
//     });
  
//     if (currentVideo.paused) {
//       currentVideo.play();
//     } else {
//       currentVideo.pause();
//     }
//   }
  
// function togglePlay(videoId) {
//     const video = document.getElementById(videoId);
//     if (video.paused) {
//         video.play();
//     } else {
//         video.pause();
//     }
// }

// Hover-to-preview video
// document.querySelectorAll('video').forEach(video => {
//     let clicked = false;
  
//     video.addEventListener('click', () => {
//       clicked = true;
//     });
  
//     video.addEventListener('mouseenter', () => {
//       if (!clicked) {
//         video.muted = true;
//         video.play();
//       }
//     });
  
//     video.addEventListener('mouseleave', () => {
//       if (!clicked) {
//         video.pause();
//         video.currentTime = 0;
//       }
//     });
//   });
  

// Reset Video to Poster on End
// video.addEventListener('ended', () => {
//     video.pause();
//     video.currentTime = 0;
  
//     // Reset the source to truly refresh the poster
//     const source = video.querySelector('source');
//     const src = source.getAttribute('src');
//     source.setAttribute('src', '');
//     source.setAttribute('src', src);
  
//     video.load();
//   });
  
  
  


function setupVideoHandlers() {
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
      // Ensure 'ended' resets poster
      video.addEventListener('ended', () => {
        video.pause();
        video.currentTime = 0;

        const source = video.querySelector('source');
        const src = source.getAttribute('src');
        source.setAttribute('src', '');
        source.setAttribute('src', src);

        video.load();
      });

      // Hover preview (optional)
      let clicked = false;
      video.addEventListener('click', () => {
        clicked = true;
      });

      video.addEventListener('mouseenter', () => {
        if (!clicked) {
          video.muted = true;
          video.play();
        }
      });

      video.addEventListener('mouseleave', () => {
        if (!clicked) {
          video.pause();
          video.currentTime = 0;
        }
      });
    });
  }

  // Run after DOM is ready
  document.addEventListener('DOMContentLoaded', setupVideoHandlers);

  function togglePlay(videoId) {
    const videos = document.querySelectorAll('video');
    const currentVideo = document.getElementById(videoId);

    videos.forEach(v => {
      if (v !== currentVideo) {
        v.pause();
        v.currentTime = 0;

        const source = v.querySelector('source');
        const src = source.getAttribute('src');
        source.setAttribute('src', '');
        source.setAttribute('src', src);
        v.load();
      }
    });

    if (currentVideo.paused) {
      currentVideo.play();
    } else {
      currentVideo.pause();
    }
  }
