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
