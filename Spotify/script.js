let current = new Audio();
let play = document.getElementById("play");
let vol = document.getElementById("volmee");
let lastSong = {
  track: "",
  name: "",
  volume: "",
};
let currFolder;
let songUL;
let songs;
let cardContainer = document.getElementsByClassName("cardContainer");
function formatSecondsToMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  let formattedMinutes = String(minutes).padStart(2, "0");
  let formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
function setLastPlayedSong(obj) {
  localStorage.setItem("lastPlayedSong", JSON.stringify(obj));
}
function getLastPlayedSong() {
  let lastPlay = JSON.parse(localStorage.getItem("lastPlayedSong"));
  return lastPlay;
}

function LoadSongs(songs) {
  songUL = document.querySelector(".songList").getElementsByTagName("ol")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
        <div class="songDetail">
            <img class="invert" src="music.svg" alt="music">
            <div class = "info">
                <div class="songName">${
                  song
                    .replaceAll("%20", " ")
                    .replaceAll("%2C", " ")
                    .replaceAll(".mp3", " ")
                    .split("-")[0]
                }</div>
                <div class="songArtist">${
                  song
                    .replaceAll("%20", " ")
                    .replaceAll("%2C", " ")
                    .replaceAll(".mp3", " ")
                    .split("-")[1]
                }</div>
            </div>
        </div>
        <div class="spanPlay">

                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">

        </div>
        </li>`;
  }
  ULresponse(songs);
}

function ULresponse(songs) {
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e, index) => {
    let song = songs[index];
    e.addEventListener("mouseenter", () => {
      e.style.cursor = "pointer";
    });
    e.addEventListener("mouseleave", () => {
      e.style.cursor = "default";
    });
    e.addEventListener("click", (element) => {
      music(`/${currFolder}/` + song, e.querySelector(".songName").innerHTML);
    });
  });
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let lis = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < lis.length; index++) {
    const element = lis[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  LoadSongs(songs);
  return songs;
}

if (getLastPlayedSong()) {
  let lastPlay = getLastPlayedSong();
  current.src = lastPlay.track;
  document.querySelector(".songInfo").innerHTML = lastPlay.name;
  current.volume = lastPlay.volume;
  current.play();
  play.src = "play.svg";
}
const music = (track, name) => {
  current.src = track;
  current.volume = JSON.parse(localStorage.getItem("lastPlayedSong")).volume;
  lastSong.track = track;
  lastSong.name = name;
  lastSong.volume = current.volume;
  setLastPlayedSong(lastSong);
  play.src = "pause.svg";
  current.play();
  document.querySelector(".songInfo").innerHTML = name;
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};
async function displayAlbum() {
  let a = await fetch(`http://127.0.0.1:5500/Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let fetchPromises = [];

  Array.from(anchors).forEach((e) => {
    if (e.href.includes("/Songs/")) {
          let folder = e.href.split("/").slice(-1)[0];
          console.log(folder);
          let fetchPromise = fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`)
              .then((response) => response.json())
              .then((response) => {
                  return `<div data-folder="${folder}" class="card">
                      <div class="playIcon">
                          <button class="svg-button">
                              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                                  xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="#00FF00" stroke-width="1.5"
                                      fill="#00FF00" />
                                  <path d="M9.5 16V8L16 12L9.5 16Z" stroke="#000000" stroke-width="1.5"
                                      stroke-linejoin="round" />
                              </svg>
                          </button>
                      </div>
                      <div class = "imgArea">
                        <img src="/Songs/${folder}/cover.png" alt="vibesOnly">
                      </div>
                      <div class="playListtitle">
                          <h3>${response.title}</h3>
                      </div>
                      <div class="playListartist">
                          <p>${response.Description}</p>
                      </div>
                  </div>`;
              })
              .catch((error) => {
                  console.error("Error fetching or parsing JSON:", error);
                  return "";
              });

        fetchPromises.push(fetchPromise);
      }
  });

  let cardHTMLArray = await Promise.all(fetchPromises);
  console.log(cardContainer[0]);
  cardContainer[0].innerHTML += cardHTMLArray.join('');
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
    });
  });
}
async function main() {
  songs = await getSongs("Songs/CLassic");
  console.log(songs);
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e, index) => {
    let song = songs[index];
    e.addEventListener("mouseenter", () => {
      e.style.cursor = "pointer";
    });
    e.addEventListener("mouseleave", () => {
      e.style.cursor = "default";
    });
    e.addEventListener("click", (element) => {
      music(`/${currFolder}/` + song, e.querySelector(".songName").innerHTML);
    });
  });
  displayAlbum();
  play.addEventListener("click", () => {
    if (current.paused) {
      current.play();
      play.src = "pause.svg";
    } else {
      current.pause();
      play.src = "Playy.svg";
    }
  });
  previus.addEventListener("click", () => {
    let index = songs.indexOf(current.src.split(`/${currFolder}/`)[1]);
    if (index - 1 <= 0) {
      music(
        `/${currFolder}/` + songs[0],
        songs[0]
          .replaceAll("%20", " ")
          .replaceAll("%2C", " ")
          .replaceAll(".mp3", " ")
          .split("-")[0]
      );
    } else if (current.currentTime < 2) {
      music(
        `/${currFolder}/` + songs[index - 1],
        songs[index - 1]
          .replaceAll("%20", " ")
          .replaceAll("%2C", " ")
          .replaceAll(".mp3", " ")
          .split("-")[0]
      );
    } else {
      if (getLastPlayedSong()) {
        let lastPlay = getLastPlayedSong();
        current.src = lastPlay.track;
        document.querySelector(".songInfo").innerHTML = lastPlay.name;
        current.play();
        play.src = "play.svg";
      }
    }
  });
  nexxt.addEventListener("click", () => {
    let index = songs.indexOf(current.src.split(`/${currFolder}/`)[1]);
    let len = songs.length;
    if (index + 1 >= len) {
      music(
        `/${currFolder}/` + songs[0],
        songs[0]
          .replaceAll("%20", " ")
          .replaceAll("%2C", " ")
          .replaceAll(".mp3", " ")
          .split("-")[0]
      );
    } else {
      music(
        `/${currFolder}/` + songs[index + 1],
        songs[index + 1]
          .replaceAll("%20", " ")
          .replaceAll("%2C", " ")
          .replaceAll(".mp3", " ")
          .split("-")[0]
      );
    }
  });
  current.addEventListener("playing", () => {
    play.src = "pause.svg";
  });
  current.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${formatSecondsToMMSS(
      current.currentTime
    )} / ${formatSecondsToMMSS(current.duration)}`;
    document.querySelector(".timePointer").style.left =
      (current.currentTime / current.duration) * 100 + "%";
  });
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".timePointer").style.left = percent + "%";
    current.currentTime = (current.duration * percent) / 100;
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });
  volmee.addEventListener("click", () => {
    if (current.volume != "0") {
      vol.src = "mute.svg";
      current.volume = "0";
      lastSong.volume = current.volume;
      document.querySelector(".volumee").getElementsByTagName("input")[0].value = 0;
    } else {
      vol.src = "highVol.svg";
      current.volume = JSON.parse(
        localStorage.getItem("lastPlayedSong")
      ).volume;
      lastSong.volume = current.volume;
      document.querySelector(".volumee").getElementsByTagName("input")[0].value = lastSong.volume*100;
    }
  });
  volRange.addEventListener("click", (e) => {
    let volu = e.target.value / 100;
    current.volume = volu;
    lastSong.volume = volu;
    if (current.volume < 0.5) {
       vol.src = "lowVol.svg";
    }
    else{
      vol.src = "highVol.svg"
    }
  });
}

main();
