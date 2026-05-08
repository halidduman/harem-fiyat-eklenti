<div class="glassContainer">
  <button type="button" class="glassBtn">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5v14"/>
    </svg>
  </button>
</div>

<svg style="display: none">
  <filter id="container-glass" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
    <feDisplacementMap in="SourceGraphic" in2="blur" scale="77" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="btn-glass" primitiveUnits="objectBoundingBox">
    qyXA4haoTdsx2Hsdqh17UC1ufhMI60D/P28r5Vnu3BR8AAAAAElFTkSuQmCC" x="0" y="0" width="1" height="1" result="map"></feImage>
    <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur"></feGaussianBlur>
    <feDisplacementMap id="disp" in="blur" in2="map" scale="1" xChannelSelector="R" yChannelSelector="G" />
    </feDisplacementMap>
  </filter>
</svg>



body {
 font-family: sans-serif;
 font-weight: 300;
 background: url(https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/flowers.jpg) center center;
 background-size: 400px;
 height: 100vh;
 -webkit-animation: moveBackground 60s linear infinite;
         animation: moveBackground 60s linear infinite;
 display: -webkit-box;
 display: -ms-flexbox;
 display: flex;
 -webkit-box-align: center;
     -ms-flex-align: center;
         align-items: center;
 -webkit-box-pack: center;
     -ms-flex-pack: center;
         justify-content: center;
 margin:0;
 padding:0;
}

.glassContainer {
  position: fixed;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center;
  width: 300px;
  height: 200px;
  border-radius: 30px;
}

.glassContainer::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: 30px;
    -webkit-box-shadow: inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), inset 0 0 3px 1px rgba(255, 255, 255, 0.7);
            box-shadow: inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), inset 0 0 3px 1px rgba(255, 255, 255, 0.7);
}

.glassContainer::after {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    border-radius: 30px;
    -webkit-backdrop-filter: blur(0px);
            backdrop-filter: blur(0px);
    -webkit-filter: url(#container-glass);
            filter: url(#container-glass);
    overflow: hidden;
    isolation: isolate;
}

.glassBtn {
  position: relative;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center;
  cursor: pointer;
  width: 70px;
  height: 70px;
  padding: 15px;
  background: transparent;
  border-radius: 9999px;
  outline: none;
  border: none;
  z-index: 0;
}

.glassBtn::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: 9999px;
    -webkit-box-shadow: inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), inset 0 0 3px 1px rgba(255, 255, 255, 0.7);
            box-shadow: inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7), inset 0 0 3px 1px rgba(255, 255, 255, 0.7);
    background-color: rgb(255 255 255 / 10%);
}

.glassBtn::after {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    border-radius: 9999px;
    -webkit-backdrop-filter: blur(0px);
            backdrop-filter: blur(0px);
    -webkit-filter: url(#btn-glass);
            filter: url(#btn-glass);
    overflow: hidden;
    isolation: isolate;
}

.glassBtn svg {
  width: 100%;
  height: 100%;
  stroke: #fff;
}

@-webkit-keyframes moveBackground {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 0% -1000%;
  }
}

@keyframes moveBackground {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 0% -1000%;
  }
}

bu ilki

/* LIQUID GLASS STYLES */

.liquidGlass-wrapper {
  position: relative;
  display: flex;
  font-weight: 600;
  overflow: hidden;

  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);

  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
}

.liquidGlass-effect {
  position: absolute;
  z-index: 0;
  inset: 0;

  backdrop-filter: blur(3px);
  filter: url(#glass-distortion);
  overflow: hidden;
}

.liquidGlass-tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.50);
}

.liquidGlass-shine {
  position: absolute;
  inset: 0;
  z-index: 2;

  overflow: hidden;

  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
    inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);
}

.liquidGlass-text {
  z-index: 3;
  font-size: 2rem;
  color: black;
}

/* OTHER STYLES */

body {
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("https://media.istockphoto.com/id/1430511443/vector/christmas-mistletoe-foliage-and-berries-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=oqxlH7ytgd5yjBQroACirJ1gH7Au1tq8gmsdeGd-Crk=")
    center center;
  background-size: 500px;
  font-family: sans-serif;
  font-weight: 300;

  animation: moveBackground 60s linear infinite;
}

/*
GREEN BACKGROUND
https://media.istockphoto.com/id/1430511443/vector/christmas-mistletoe-foliage-and-berries-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=oqxlH7ytgd5yjBQroACirJ1gH7Au1tq8gmsdeGd-Crk=

ORANGE BACKGROUND
https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/beautiful-orange-and-pastel-flowers-seamless-pattern-julien.jpg

MARGARITAS BACKGROUND
https://static.vecteezy.com/system/resources/previews/056/652/082/non_2x/hand-drawn-white-flower-seamless-pattern-floral-repeating-wallpaper-for-textile-design-fabric-print-wrapping-paper-cute-daisy-flowers-on-blue-background-repeated-ditsy-texture-vector.jpg

SPRING FLOWERS BACKGROUND
https://img.freepik.com/free-vector/flat-floral-spring-pattern-design_23-2150117078.jpg

VECTOR WINDS BACKGROUND
https://i.ibb.co/MDbLn4N4/vectors.png

RED FLOWERS BACKGROUND
https://www.publicdomainpictures.net/pictures/610000/velka/seamless-floral-wallpaper-art-1715193626Gct.jpg
*/

a {
  text-decoration: none;
}

.wrapper {
  display: flex;
  gap: 25px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}


.dock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 2rem;
  padding: 0.6rem;
}

/* NOTE: You need to duplicate styles onto the child `div`s (`> div`) so that the glass wrapper and all the layers are affected in the same way.  */
.dock,
.dock > div {
  border-radius: 2rem;
}

.dock:hover {
  padding: 0.8rem;
  border-radius: 2.5rem;
}
.dock:hover > div {
  border-radius: 2.5rem;
}

.dock img {
  width: 75px;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  cursor: pointer;
}

.dock img:hover {
  transform: scale(0.95);
  transform-origin: center center;
}

@keyframes moveBackground {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 0% -1500%;
  }
}

 <div class="wrapper">
        <div class="liquidGlass-wrapper dock">
          <div class="liquidGlass-effect"></div>
          <div class="liquidGlass-tint"></div>
          <div class="liquidGlass-shine"></div>
          <div class="liquidGlass-text">
            <div class="dock">
              <img
                src="https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/finder.png"
                alt="Finder"
              />
              <img
                src="https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/map.png"
                alt="Finder"
              />
              <img
                src="https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/messages.png"
                alt="Finder"
              />
              <img
                src="https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/notes.png"
                alt="Finder"
              />
              <img
                src="https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/safari.png"
                alt="Finder"
              />
              <img
                src="https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/books.png"
                alt="Finder"
              />
            </div>
          </div>
        </div>

    <svg style="display: none">
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves="1"
          seed="5"
          result="turbulence"
        />
        <!-- Seeds: 14, 17,  -->

        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>

        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />

        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lighting-color="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>

        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />

        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="150"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    bu apple gibi içindeki ikon görsel vs boşver cama odaklan sadece 


        <button class="glass-button">
      <span>CRYSTAL</span>
    </button>

    <svg style="position: absolute; width: 0; height: 0">
      <filter
        id="glass"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        primitiveUnits="objectBoundingBox"
      >
        <feImage
          
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          result="map"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
        <feDisplacementMap
          id="disp"
          in="blur"
          in2="map"
          scale="0.8"
          xChannelSelector="R"
          yChannelSelector="G"
        ></feDisplacementMap>
      </filter>
    </svg>

@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap");
body {
  height: 150vh;
  background: url("https://images.unsplash.com/photo-1683657535824-5b570c7a1749?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
  background-size: cover;
  animation: floatBG 15s ease-in-out infinite;
}

@keyframes floatBG {
  0%,
  100% {
    background-position: center center;
  }
  25% {
    background-position: 30% 70%;
  }
  50% {
    background-position: 70% 30%;
  }
  75% {
    background-position: 40% 60%;
  }
}

.glass-button {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  outline: none;
  width: 350px;
  height: 180px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  255, 0.3);
  background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.2) 0%,
  rgba(255, 255, 255, 0.08) 50%,
  rgba(255, 255, 255, 0.03) 100%
);

  backdrop-filter: url(#glass);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 2.2);
}

.glass-button span {
  font-family: "Orbitron", sans-serif;
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.glass-button:hover {
  transform: translate(-50%, -50%) scale(1.05);
}


const feImage = document.querySelector("feImage");
fetch("https://essykings.github.io/JavaScript/map.png")
  .then((response) => {
    return response.blob();
  })
  .then((blob) => {
    const objURL = URL.createObjectURL(blob);

    feImage.setAttribute("href", objURL);
  });


sadece cam efektine odaklan şimdilik bunlar 



