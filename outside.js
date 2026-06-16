// CHECK MOBILE
let mobileBrowser = checkMobile()
let loadText = "";
let loadTextArray = [];

// MODES CONTENT
let inCRT = 'you are in cathode ray mode. switch to liquid crystal mode.'
let inLCD = 'you are in liquid crystal mode. switch to cathode ray mode.'

if (checkMobile()) {
  inCRT = 'switch to liquid crystal mode'
  inLCD = 'switch to cathode ray mode'
}

// MOBILE WINDOW SIZE RESET

function resetHeight(){
    document.body.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resetHeight);
resetHeight();

// SIDE MODES

const modeStyles = document.getElementById('mode');
const themeToggle = document.getElementById('mode-toggle');
const currentMode = document.getElementById('current-mode');

function isLcd() {
  return modeStyles.href.includes('lcd.css');
}

function setMode(lcd) {
  modeStyles.href = lcd ? 'lcd.css' : 'crt.css';
  themeToggle.innerText = lcd ? inLCD : inCRT;
  if (currentMode) currentMode.innerHTML = lcd ? 'liquid crystal' : 'cathode ray';
  localStorage.setItem('mode', lcd ? 'lcd' : 'crt');
}

const storedTheme = localStorage.getItem('mode');
setMode(storedTheme === 'lcd');

document.addEventListener('DOMContentLoaded', () => {
  themeToggle.addEventListener('click', () => setMode(!isLcd()));
});

// WOOBLE TOGGLE
const wobbleToggle = document.getElementById('wobble-toggle');
if (wobbleToggle) {
  const storedWobble = localStorage.getItem('wobble');
  if (storedWobble === 'on') {
    document.body.classList.add('fisheye');
    wobbleToggle.textContent = 'Wooble on';
  }
  wobbleToggle.addEventListener('click', () => {
    document.body.classList.toggle('fisheye');
    const isWobbling = document.body.classList.contains('fisheye');
    wobbleToggle.textContent = isWobbling ? 'Wooble on' : 'Wooble off';
    localStorage.setItem('wobble', isWobbling ? 'on' : 'off');
  });
}

/////////////////////// ON LOAD //////////////////////////
const MIN_LOADER_TIME = 3000;
const startTime = performance.now();

const canvas = document.getElementById("pose-loader");
let poseData = [];
let currentFrame = 0;
const FPS = 12;

function drawFrame(frame, ctx, W, H, connections) {
  ctx.clearRect(0, 0, W, H);

  const scale = Math.min(W, H) * 0.6;
  const centerX = W / 2;
  const centerY = H / 2 - H * 0.1;

  const points = frame.map(p => ({
    x: centerX + p.x * scale,
    y: centerY + p.y * scale
  }));

  ctx.strokeStyle = "maroon";
  ctx.lineWidth = 4;
  ctx.setLineDash([6, 4]);

  connections.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(points[a].x, points[a].y);
    ctx.lineTo(points[b].x, points[b].y);
    ctx.stroke();
  });

  ctx.setLineDash([]);

  ctx.fillStyle = "gray";
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function startPoseAnimation() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const W = canvas.width;
  const H = canvas.height;

  const connections = [
    [0, 11], [0, 12],
    [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 12], [23, 24], [11, 23], [12, 24],
    [23, 25], [25, 27], [24, 26], [26, 28]
  ];

  function animate() {
    if (!poseData.length) return;
    drawFrame(poseData[currentFrame], ctx, W, H, connections);
    currentFrame = (currentFrame + 1) % poseData.length;
    setTimeout(() => requestAnimationFrame(animate), 1000 / FPS);
  }

  requestAnimationFrame(animate);
}

function init() {
  // Hide content initially
  document.querySelectorAll(".hide-content").forEach(el => el.style.display = "none");

  const MAX_VIDEO_WAIT = 6000;

  // Video ready promise — resolves when video can play, or after 6s
  var videoReady = new Promise(function(resolve) {
    var vid = document.getElementById("hero-vid");
    if (!vid) return resolve();
    var timeout = setTimeout(resolve, MAX_VIDEO_WAIT);
    vid.addEventListener("canplay", function() {
      clearTimeout(timeout);
      resolve();
    });
    vid.addEventListener("error", function() {
      clearTimeout(timeout);
      resolve();
    });
    var src = vid.querySelector('source') && vid.querySelector('source').src;
    if (src) {
      fetch(src).then(function(r) { return r.blob(); }).then(function(blob) {
        vid.src = URL.createObjectURL(blob);
        vid.load();
      }).catch(function() {
        vid.load();
      });
    } else {
      vid.load();
    }
  });

  // List of JSON pose files
  const jsonFiles = ["swingaling.json", "cactus.json", "guy.json", "carlton.json"];

  // Pick one randomly
  const chosenFile = jsonFiles[Math.floor(Math.random() * jsonFiles.length)];

  var poseLoaded = fetch(chosenFile)
    .then(res => res.json())
    .then(data => {
      poseData = data;
      startPoseAnimation();
    })
    .catch(err => {
      console.error("Pose data failed to load:", err);
    });

  Promise.all([poseLoaded, videoReady]).then(function() {
    const elapsed = performance.now() - startTime;
    const remaining = MIN_LOADER_TIME - elapsed;

    setTimeout(function() {
      var loader = document.querySelector(".loader-content");
      if (loader) {
        loader.style.transition = "opacity 0.4s";
        loader.style.opacity = "0";
        setTimeout(function() { loader.remove(); }, 400);
      }
      document.querySelectorAll(".hide-content").forEach(function(el) {
        el.style.display = "block";
      });
      // Fade in the hero video and play it
      var heroBox = document.getElementById("hero-video");
      var heroVid = document.getElementById("hero-vid");
      if (heroBox) heroBox.style.opacity = "1";
      if (heroVid) {
        heroVid.play().catch(function(e) {});
      }
      document.dispatchEvent(new Event('loaderComplete'));

      var chaserEl = document.getElementById("chaser");
      if (chaserEl) {
        var chaserFrames = chaserEl.querySelectorAll(".chaser-frame");
        if (chaserFrames.length >= 2) {
          chaserEl.style.display = "block";
          var cx = Math.random() * (window.innerWidth - 60);
          var cy = Math.random() * (window.innerHeight - 60);
          var tx = Math.random() * (window.innerWidth - 60);
          var ty = Math.random() * (window.innerHeight - 60);
          var cf = 0;
          var ct = 0;
          var cs = "wander";
          var atkStart = 0;
          var atkEnd = 0;
          var cmx = 0, cmy = 0;
          document.addEventListener("mousemove", function(e) {
            cmx = e.clientX; cmy = e.clientY;
          });
          (function raf(t) {
            var d = Math.hypot(cmx - cx, cmy - cy);
            if (cs === "wander") {
              if (t - atkEnd > 3000 && Math.random() < 0.0005) {
                cs = "attack";
                atkStart = t;
                tx = cmx; ty = cmy;
                chaserFrames[0].style.display = "none";
                chaserFrames[1].style.display = "none";
                chaserFrames[2].style.display = "block";
                chaserFrames[3].style.display = "block";
              }
              cx += (tx - cx) * 0.005;
              cy += (ty - cy) * 0.005;
              if (Math.hypot(tx - cx, ty - cy) < 30) {
                if (t - atkEnd > 3000 && Math.random() < 0.1) {
                  cs = "attack";
                  atkStart = t;
                  tx = cmx; ty = cmy;
                  chaserFrames[0].style.display = "none";
                  chaserFrames[1].style.display = "none";
                  chaserFrames[2].style.display = "block";
                  chaserFrames[3].style.display = "block";
                } else {
                  tx = Math.random() * (window.innerWidth - 60);
                  ty = Math.random() * (window.innerHeight - 60);
                }
              }
            } else {
              if (d < 0.1 || t - atkStart > 3000) {
                cs = "wander";
                atkEnd = t;
                tx = cmx; ty = cmy;
                chaserFrames[0].style.display = "block";
                chaserFrames[1].style.display = "block";
                chaserFrames[2].style.display = "none";
                chaserFrames[3].style.display = "none";
              }
              tx = cmx; ty = cmy;
              cx += (tx - cx) * 0.01;
              cy += (ty - cy) * 0.01;
            }
            var fl = tx > cx ? "-1" : "1";
            chaserEl.style.transform = "translate(" + cx + "px, " + cy + "px) scaleX(" + fl + ")";
            if (t - ct > 200) {
              cf = (cf + 1) % 2;
              var off = cs === "attack" ? 2 : 0;
              chaserFrames[off].style.opacity = cf ? "0" : "1";
              chaserFrames[off + 1].style.opacity = cf ? "1" : "0";
              ct = t;
            }
            requestAnimationFrame(raf);
          })(0);
        }
      }
    }, Math.max(0, remaining));
  });
}

init();

        // RANDOM POETIC COMPUTATION

          var poeticcomputation = [
    "When the beat drops I'm going to fucking kill myself",
    "The sun smiles at you with eternal malice",
    "The strong decide the nature of sin.",
    "Some strange mushrooms are growing in my yard. I really don't have time for this kind of shit in my life right now.",
    "I really look up to people who are good at violence.",
    "There's an infinite amount of dimensional planes. They all contain the same amount of suffering.",
    "Did I wake you up from your depression nap?",
    "I'll have to move into a regenerative off-grid art commune again. Fuck this.",
    "You are a flesh automaton animated by neurotransmitters.",
    "You can kill me but it won't end this.",
    "They must have amnesia, they forgot that I'm him",
    "The last thing he ever saw was the price tag on them.",
    "Motherfucker looked like a Resident Evil 5 campaign extra after we was done with him.",
    "My plug look like David Hasselhoff",
    "The zaza got me speakin' Esperanto.",
    "Get the president on the phone now I fronted him a brick, I need my money.",
    "This Smith & Wesson got me movin' like an invasive species.",
    "My diamonds come from the most horrific situations possible.",
    "Smoking that good schooby-doo waa",
    "I use the steroud.",
    "Wouldn't let no one catch that photo. That shits legacy ending.",
    "Not my monkey, Not my circus, but I definitely know the clowns.",
    "Who has AIDs I need someone bit.",
    "If this website could speak, it would be saying slurs",
    "I was hospitalised for approaching perfection. Thank you for your loss.",
    "Level of poverty exceeding destitute. It's called prostitute or something.",
    "We're standing on Monkey Business, One of us wrote Hamlet",
    "We tend not to keep grudges or rivalries against certain authorities. We act on that before it formulates."

];

          randDef = poeticcomputation[Math.floor( Math.random() * poeticcomputation.length )];
          document.getElementById('definition').textContent = randDef;
          var menuPoetry = document.querySelector('.menu-poetry');
          if (menuPoetry) menuPoetry.textContent = randDef;
          var marqueeDef = document.getElementById('marquee-definition');
          if (marqueeDef) marqueeDef.textContent = randDef;

          document.querySelector(".def-div").addEventListener("click", function() {
            var text = poeticcomputation[Math.floor( Math.random() * poeticcomputation.length )];
            document.getElementById('definition').textContent = text;
            var mp = document.querySelector('.menu-poetry');
            if (mp) mp.textContent = text;
          });

          var expandIntro = document.querySelector(".expand-intro");
          if (expandIntro) {
            expandIntro.addEventListener("click", function() {
              var el = document.querySelector(".expanded-intro");
              if (el) el.classList.remove('hide-expanded');
              this.classList.add('hide-expanded');
              var dots = document.querySelector(".expand-intro-dots");
              if (dots) dots.classList.add('hide-expanded');
            });
          }

          function els(sel) { return document.querySelectorAll(sel); }
          function el(sel) { return document.querySelector(sel); }

          var testimonials = document.querySelector(".testimonials");
          if (testimonials) {
            testimonials.addEventListener("click", function() {
              els(".participate-img").forEach(function(e) {
                e.classList.add('hide'); e.classList.remove('show');
                e.classList.add('hide-test'); e.classList.remove('show-test');
              });
              els(".test").forEach(function(e) {
                e.classList.add('show-test'); e.classList.remove('hide-test');
              });
              var tt = document.getElementById('test-text');
              if (tt) tt.classList.add('hide-text');
              var pt = document.getElementById('photos-text');
              if (pt) pt.classList.remove('hide-text');
              slider.scrollLeft = 0;
              slider2.scrollLeft = 0;
              slider3.scrollLeft = 0;
              document.getElementById('participate-archive').scrollIntoView({
                block: 'start',
                behavior: 'smooth',
              });
            });
          }

          var participatePhotos = document.querySelector(".participate-photos");
          if (participatePhotos) {
            participatePhotos.addEventListener("click", function() {
              els(".participate-img").forEach(function(e) {
                e.classList.add('show'); e.classList.remove('hide');
                e.classList.add('show-test'); e.classList.remove('hide-test');
              });
              els(".test").forEach(function(e) {
                e.classList.add('hide-test'); e.classList.remove('show-test');
              });
              var tt = document.getElementById('test-text');
              if (tt) tt.classList.remove('hide-text');
              var pt = document.getElementById('photos-text');
              if (pt) pt.classList.add('hide-text');
              slider.scrollLeft = 0;
              slider2.scrollLeft = 0;
              slider3.scrollLeft = 0;
              document.getElementById('participate-archive').scrollIntoView({
                block: 'start',
                behavior: 'smooth',
              });
            });
          }

        // MOBILE MENU

          document.querySelector(".mobile-menu").addEventListener("click", function() {
              var mmc = document.querySelector(".mobile-menu-content");
              if (mmc) mmc.classList.toggle('mobile-menu-content-show');
              if (this.textContent == "☰") {
                this.textContent = "✕";
              } else {
                this.textContent = "☰";
              }
          });

          document.querySelector(".menu-close").addEventListener("click", function() {
              var mmc = document.querySelector(".mobile-menu-content");
              if (mmc) mmc.classList.remove('mobile-menu-content-show');
              var hamburger = document.querySelector(".mobile-menu");
              if (hamburger) hamburger.textContent = "☰";
          });

        // ADD UNDERLINE TO MENU BASED ON LINK

        function breadcrumbContains(text) {
          var bc = document.querySelector('.breadcrumb');
          return bc && bc.textContent.includes(text);
        }

        if (breadcrumbContains("participate")) {
            var lp = document.getElementById('link-participate');
            if (lp) lp.classList.add('underline');
        }
        if (breadcrumbContains("classes")) {
          var lc = document.getElementById('link-classes');
          if (lc) lc.classList.add('underline');
        }
        if (breadcrumbContains("about")) {
            var la = document.getElementById('link-about');
            if (la) la.classList.add('underline');
        }
        if (breadcrumbContains("projects")) {
            var lpj = document.getElementById('link-projects');
            if (lpj) lpj.classList.add('underline');
        }
        if (breadcrumbContains("people")) {
            var lpe = document.getElementById('link-people');
            if (lpe) lpe.classList.add('underline');
        }
        if (breadcrumbContains("blog")) {
            var lb = document.getElementById('link-blog');
            if (lb) lb.classList.add('underline');
        }
        if (breadcrumbContains("fundraiser")) {
            var lf = document.getElementById('link-fundraiser');
            if (lf) lf.classList.add('underline');
        }

        // FEATURED DIV LINK

            document.querySelectorAll(".featured").forEach(function(f) {
              f.addEventListener("click", function() {
                var a = this.querySelector("a");
                if (a) window.location = a.getAttribute("href");
              });
            });

            document.querySelectorAll(".featured h2, .featured h6, .featured h4, .featured h3").forEach(function(el) {
              el.addEventListener("click", function() {
                var a = this.closest('div').querySelector("a");
                if (a) window.location = a.getAttribute("href");
              });
            });

        // SCROLL ON MOBILE

            window.addEventListener("scroll", function() {
                    // placeholder for mobile scroll handling
            });

            var linkShowGrid = document.querySelector('.link-show-grid');
            var websiteGrid = document.querySelector('.website-grid');
            if (linkShowGrid && websiteGrid) {
              linkShowGrid.addEventListener('mouseenter', function() {
                websiteGrid.classList.remove('grid-hide');
              });
              linkShowGrid.addEventListener('mouseleave', function() {
                websiteGrid.classList.add('grid-hide');
              });
            }

// RANDOM CHARACTERS

function makeChars(length) {
    var result           = '';
    var characters       = ',·*.◌▫◦........';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
}

function loadingChar() {
  loadText = "";
  var possible = ",·*.◌▫◦........";

  for (var i = 0; i < 1; i++)
    loadText += possible.charAt(Math.floor(Math.random() * possible.length));

  return loadText;
}

setInterval(function(){
  let numberChar;

  if (checkMobile()) {
    numberChar = 10;
  } else {
    numberChar = 40;
  }

  loadTextArray.push(loadingChar());

  if (loadTextArray.length < (numberChar * 12)) {
      var span = document.querySelector(".loader-content p span");
      if (span) span.append(loadingChar());
    }

  if (loadTextArray.length % numberChar == 0) {
    var span2 = document.querySelector(".loader-content p span");
    if (span2) span2.appendChild(document.createElement("br"));
  }

}, 200);

// CHECK MOBILE

function checkMobile(){
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}
