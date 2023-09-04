console.log("Welcome to Spotify");

// Initialize the Variables
let songIndex = 0;
let audioElement = new Audio(); // Create an audio element
let masterPlay = document.getElementById("masterPlay");
let myProgressBar = document.getElementById("myProgressBar");
let masterSongName = document.getElementById("masterSongName");
let gif = document.getElementById("gif");
let songItemsContainer = document.querySelector(".songItemContainer");
let pausedTime = 0;

let songs = [
  {
    songName: "Brown Rang .mp3",
    filePath: "songs/Brown Rang International Villager 320 Kbps.mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Check-Kar.mp3",
    filePath: "songs/Check-Kar_320(PagalWorld).mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Chhote Chhote Peg .mp3",
    filePath: "songs/Chhote Chhote Peg Sonu Ke Titu Ki Sweety 320 Kbps.mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Let Me Down Slowly x Main Dhoondne Ko .mp3",
    filePath:
      "songs/Let Me Down Slowly x Main Dhoondne Ko Zamaane Mein (Gravero Mashup)_320(PagalWorld.cm).mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Kudi Tu Butter.mp3",
    filePath: "songs/Kudi Tu Butter Bajatey Raho 320 Kbps.mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Main-Barishh-Ki-Boli.mp3",
    filePath:
      "songs/Main-Barishh-Ki-Boli-Samajhtha-Nahi-Tha_320(PagalWorld).mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Mann Meri Jaan.mp3",
    filePath: "songs/Mann Meri Jaan.mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Pal-Ek-Pal.mp3",
    filePath: "songs/Pal-Ek-Pal_320(PagalWorld).mp3",
    coverPath: "covers/2.jpg",
  },
  {
    songName: "Get Up Jawani.mp3",
    filePath: "songs/Get Up Jawani International Villager 320 Kbps.mp3",
    coverPath: "covers/2.jpg",
  },
];

// Function to create song items
function createSongItem(song, index) {
  const songItem = document.createElement("div");
  songItem.classList.add(
    "songItem",
    "md:h-8",
    "flex",
    "md:mt-3",
    "m-2",
    "md:text-sm",
    "items-center",
    "text-[10px]",
    "text-white"
  );

  songItem.innerHTML = `
            <div class="songItem   md:h-8 flex md:mt-3 m-2 items-center md:ml-96 text-[10px] md:text-sm text-white">
            <i data-song-index="${index}" class="songItemPlay fa-regular fa-circle-play fa-xl cursor-pointer px-3"></i>
            <span class="songName">${song.songName}</span>
            <img class="w-6 mr-5 ml-2 md:md-5 rounded-full" src="${song.coverPath}" alt="${song.songName}">
            </div>`;

  songItemsContainer.appendChild(songItem);

  songItem.querySelector(".songItemPlay").addEventListener("click", () => {
    playSong(index);
  });
}


// Initialize an array to store the paused times for each song
let pausedTimes = new Array(songs.length).fill(0);

// ...

function playSong(index) {
  // Check if the clicked song is already playing
  if (audioElement.paused || songIndex !== index) {
    // Pause the current song if it's playing
    if (!audioElement.paused) {
      audioElement.pause();
    }

    // Reset play/pause icons for all song items
    const allPlayButtons = document.querySelectorAll(".songItemPlay");
    allPlayButtons.forEach((button) => {
      button.classList.remove("fa-circle-pause");
      button.classList.add("fa-circle-play");
    });

    // Play the new song
    audioElement.src = songs[index].filePath;
    audioElement.currentTime = pausedTimes[index]; // Set the playback position
    audioElement.play();
    masterPlay.classList.remove("fa-circle-play");
    masterPlay.classList.add("fa-circle-pause");
    gif.style.opacity = 1;
    songIndex = index;

    // Update the play/pause icon for the clicked song item
    const playButton = document.querySelector(`.songItemPlay[data-song-index="${index}"]`);
    if (playButton) {
      playButton.classList.remove("fa-circle-play");
      playButton.classList.add("fa-circle-pause");
    }
  } else {
    // The same song is clicked to pause/resume
    if (audioElement.paused) {
      audioElement.play();
      masterPlay.classList.remove("fa-circle-play");
      masterPlay.classList.add("fa-circle-pause");

      // Update the play/pause icon for the clicked song item
      const playButton = document.querySelector(`.songItemPlay[data-song-index="${index}"]`);
      if (playButton) {
        playButton.classList.remove("fa-circle-play");
        playButton.classList.add("fa-circle-pause");
      }
    } else {
      audioElement.pause();
      masterPlay.classList.remove("fa-circle-pause");
      masterPlay.classList.add("fa-circle-play");
      // Store the current playback position when pausing
      pausedTimes[index] = audioElement.currentTime; // Store paused time for the current song

      // Update the play/pause icon for the clicked song item
      const playButton = document.querySelector(`.songItemPlay[data-song-index="${index}"]`);
      if (playButton) {
        playButton.classList.remove("fa-circle-pause");
        playButton.classList.add("fa-circle-play");
      }
    }
  }
}

    
  

// Create song items
songs.forEach((song, index) => {
  createSongItem(song, index);
});

// Handle play/pause click
masterPlay.addEventListener("click", () => {
  if (audioElement.paused || audioElement.currentTime <= 0) {
    playSong(songIndex);
  } else {
    audioElement.pause();
    masterPlay.classList.remove("fa-circle-pause");
    masterPlay.classList.add("fa-circle-play");
    gif.style.opacity = 0;
    pausedTime = audioElement.currentTime; // Update pausedTime
  }
});


// Listen to Events
audioElement.addEventListener("timeupdate", () => {
  // Update Seekbar
  progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
  myProgressBar.value = progress;
});

myProgressBar.addEventListener("change", () => {
  audioElement.currentTime =
    (myProgressBar.value * audioElement.duration) / 100;
});

// Play next song
document.getElementById("next").addEventListener("click", () => {
  if (songIndex < songs.length - 1) {
    playSong(songIndex + 1);
  } else {
    playSong(0);
  }
});

// Play previous song
document.getElementById("previous").addEventListener("click", () => {
  if (songIndex > 0) {
    playSong(songIndex - 1);
  } else {
    playSong(songs.length - 1);
  }
});
