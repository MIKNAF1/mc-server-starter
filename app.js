const $ = (id) => document.getElementById(id);

const software = $("software");
const ram = $("ram");
const maxPlayers = $("maxPlayers");
const port = $("port");
const viewDistance = $("viewDistance");
const simDistance = $("simDistance");
const motd = $("motd");
const gamemode = $("gamemode");
const difficulty = $("difficulty");
const whitelist = $("whitelist");
const authMode = $("authMode");

const statusEl = $("status");
const downloadBtn = $("downloadZip");
const resetBtn = $("reset");

function setStatus(msg){ if (statusEl) statusEl.textContent = msg || ""; }

function sanitizeInt(n, min, max, fallback){
  const x = Number.parseInt(n, 10);
  if (Number.isNaN(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function buildServerProperties(){
  const online = authMode && authMode.value === "online" ? "true" : "false";

  const props = [
    "server-port=" + sanitizeInt(port.value, 1, 65535, 25565),
    "motd=" + (motd.value || "My Minecraft Server"),
    "max-players=" + sanitizeInt(maxPlayers.value, 1, 200, 10),
    "view-distance=" + sanitizeInt(viewDistance.value, 2, 32, 10),
    "simulation-distance=" + sanitizeInt(simDistance.value, 2, 32, 8),
    "gamemode=" + (gamemode.value || "survival"),
    "difficulty=" + (difficulty.value || "normal"),
    "online-mode=" + online,
    "white-list=" + (whitelist.value || "false"),
    "enforce-whitelist=" + (whitelist.value || "false"),
    "enable-command-block=false",
    "pvp=true",
    "spawn-protection=0",
    "level-name=world"
  ];

  return props.join("\n") + "\n";
}

function buildStartBat(ramGb){
  return `@echo off
title Minecraft Server
echo Starting server...
echo If this is the first run, it will generate files. Then you must accept the EULA.
echo.

REM Recommended: Java 17+ (or whatever your server software requires)
java -Xms${ramGb}G -Xmx${ramGb}G -jar server.jar nogui

echo.
echo Server stopped. Press any key to exit.
pause >nul
`;
}

function buildReadme(){
  const sw = software.value;
  const swName = sw === "paper" ? "Paper" : sw === "vanilla" ? "Vanilla" : sw === "fabric" ? "Fabric" : "Forge";
  const officialLink =
    sw === "paper" ? "https://papermc.io/downloads"
    : sw === "vanilla" ? "https://www.minecraft.net/en-us/download/server"
    : sw === "fabric" ? "https://fabricmc.net/use/server/"
    : "https://files.minecraftforge.net/";

  const authLine = authMode.value === "online"
    ? "Authentication: OFFICIAL (online-mode=true) ✅"
    : "Authentication: OFFLINE TEST MODE (online-mode=false) ⚠️ Less secure, use only for private testing/LAN.";

  return `MC Server Maker - Starter Pack

This ZIP contains:
- start.bat (starts the server with your chosen RAM)
- eula.txt (you must set eula=true yourself)
- server.properties (basic settings)
- README.txt (this file)

STEP-BY-STEP (Windows)
1) Download server software (${swName}) from:
   ${officialLink}

2) Put the downloaded jar in THIS folder and rename it to:
   server.jar

3) Double-click start.bat once (it may generate files and stop).

4) Open eula.txt and change:
   eula=false
   to:
   eula=true

5) Run start.bat again.

NOTES
- ${authLine}
- If friends outside your Wi-Fi need to join, port forward ${sanitizeInt(port.value, 1, 65535, 25565)} (TCP) to your PC's local IP.
- Keep view-distance reasonable to avoid lag.

Disclaimer:
This tool generates scripts/config only and does not include Minecraft/Paper/Fabric/Forge binaries.
Not affiliated with Mojang Studios or Microsoft.
`;
}

async function generateZip(){
  setStatus("Building ZIP…");
  const zip = new JSZip();

  const ramGb = sanitizeInt(ram.value, 1, 64, 4);

  zip.file("eula.txt", "eula=false\n");
  zip.file("server.properties", buildServerProperties());
  zip.file("start.bat", buildStartBat(ramGb));
  zip.file("README.txt", buildReadme());
  zip.file("PUT_server.jar_HERE.txt", "Download your server jar from the official site and rename it to server.jar.\n");

  const blob = await zip.generateAsync({type: "blob"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mc-server-starter-${software.value}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setStatus("Done! ZIP downloaded. Next: download the jar from the official page and rename it to server.jar.");
}

if (downloadBtn){
  downloadBtn.addEventListener("click", () => {
    if (authMode.value === "offline"){
      setStatus("Warning: Offline mode is less secure. Use only for private testing/LAN.");
      setTimeout(() => generateZip().catch(e => setStatus("Error: " + e.message)), 350);
      return;
    }
    generateZip().catch(e => setStatus("Error: " + e.message));
  });
}

if (resetBtn){
  resetBtn.addEventListener("click", () => {
    software.value = "paper";
    ram.value = 4;
    port.value = 25565;
    maxPlayers.value = 10;
    viewDistance.value = 10;
    simDistance.value = 8;
    motd.value = "My Minecraft Server";
    gamemode.value = "survival";
    difficulty.value = "normal";
    whitelist.value = "false";
    authMode.value = "online";
    setStatus("");
  });
}
