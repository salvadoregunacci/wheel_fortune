// ====================================
// Variables
// ====================================

let isMute = true;

let $wf;
const $wfContainer = document.querySelector('.wf__container');
const $startBtn = document.querySelector('.start_btn');
const $wfArrow = document.querySelector('.wf__arrow');
const $muteBtn = document.querySelector('.mute_btn');
const $balanceLabels = document.querySelectorAll('.balance__count');
const $level = document.querySelector('.level');
const $endModal = document.querySelector('.wf__end');
const $spinnersLabel = document.querySelector('.rotate_count__value');
const $restartBtn = document.querySelector('.end_btn');
const $gameInfo = document.querySelector('.game_info');
const $historyInfo = document.querySelector('.history_info');
const $historyBox = document.querySelector('.history_info__box');
const $historyBtn = document.querySelector('.history');
const $lastMsglabel = document.querySelector('.history__msg');
const $finishSeparator = document.querySelector('.finish_separator');
const $infoHandlers = document.querySelectorAll('.info__handler');
const $donateButtons = document.querySelectorAll('.donate_btn');
const $donateScreen = document.querySelector('.donate');
const $donateBackBtn = document.querySelector('.donate__back_btn');
const $tooltipWarning = document.querySelector('.tooltip.warning');
const $tooltipSuccess = document.querySelector('.tooltip.success');
const $buyShopItemButtons = document.querySelectorAll('.shop__item_btn');
const $buyShopItems = document.querySelectorAll('.shop__item');

let balance = 0;
let spinners = 10;
let targetX;
let targetY;
let pos = 0;
let isLock = false;

let labels = ["_", "1 000", "_", "500", "800", "700", "150", "1 500"];
let failedSegments = [2];
let spinnersSegments = [0];
const degree = 360 / labels.length;

// sounds
const sounds = {
  rotate: {
    el: document.querySelector('#rotateFx'),
    volume: 0.03
  },
  win: {
    el: document.querySelector('#winFx'),
    volume: 0.03
  },
  lose: {
    el: document.querySelector('#loseFx'),
    volume: 0.03
  },
  bg: {
    el: document.querySelector('#bgFx'),
    volume: 0.005
  },
  shop: {
    el: document.querySelector('#shopFx'),
    volume: 0.03
  },
  list: {
    el: document.querySelector('#listFx'),
    volume: 0.03
  }
}

// ====================================
// Events
// ====================================

createWheel();
onMute();

window.addEventListener("resize", () => {
  if ($wfArrow) {
    const _rect = $wfArrow.getBoundingClientRect();
    targetX = _rect.x - (_rect.width / 2);
    targetY = _rect.y + (_rect.height / 2);
  }
});

$startBtn?.addEventListener("click", startRotate);
$restartBtn?.addEventListener("click", restartGame);

$buyShopItemButtons?.forEach(btn => {
  btn.addEventListener("click", buyShopItem);
});

$donateBackBtn?.addEventListener("click", () => {
  document.body.style.overflowY = "";

  if ($donateScreen) {
    sounds.list.el.currentTime = 0;
    sounds.list.el.play();
    $donateScreen.classList.remove("active");
  }
});

$donateButtons?.forEach(item => {
  item.addEventListener("click", () => {
    if ($donateScreen) {
      if (window.innerWidth <= 1390) {
        document.body.style.overflowY = "hidden";
      }

      if ($donateScreen.classList.contains("active")) return;

      sounds.list.el.currentTime = 0;
      sounds.list.el.play();
      $donateScreen.classList.add("active");
    }
  });
});

$historyBtn?.addEventListener("click", () => {
  if ($historyInfo) $historyInfo.classList.toggle("active");
});

$infoHandlers?.forEach(item => {
  item.addEventListener("click", () => {
    const _parent = item.closest(".info_block");

    if (_parent) {
      _parent.classList.toggle("active");
    }
  });
});

$level?.addEventListener("change", () => {
  $wf.innerHTML = ``;

  switch ($level.value) {
    case "1":
      failedSegments = [2];
      spinnersSegments = [0];
      labels = ["+", "1 000", "_", "500", "800", "700", "150", "1 500"];
      break;
    case "2":
      failedSegments = [2, 6];
      spinnersSegments = [1];
      labels = ["1500", "+", "_", "6 000", "1 200", "3 000", "_", "2 300"];
      break;
    case "3":
      failedSegments = [0, 2, 5];
      labels = ["_", "6 000", "_", "25 000", "10 000", "_", "15 500", "5 000"];
      break;
    case "4":
      failedSegments = [0, 1, 2, 3, 4, 5, 6];
      labels = ["_", "_", "_", "_", "_", "_", "_", "250 000"];
      break;
  }

  changeLevel();
});

if ($wfArrow) {
  const _rect = $wfArrow.getBoundingClientRect();
  targetX = _rect.x - (_rect.width / 2);
  targetY = _rect.y + (_rect.height / 2);
}

sounds.bg.el.addEventListener("ended", () => {
  sounds.bg.el.currentTime = 0;
  sounds.bg.el.play();
});

$muteBtn?.addEventListener("click", () => {
  if ($muteBtn.classList.contains("active")) {

    for (const key in sounds) {
      sounds[key].el.volume = sounds[key].volume;
    }

    isMute = false;
    $muteBtn.classList.remove("active");
    sounds.bg.el.play();

    return;
  }

  onMute();
  $muteBtn.classList.add("active");
});

// ====================================
// Functions
// ====================================


function buyShopItem(e) {
  const _parent = e.target && e.target.closest(".shop__item");

  if (_parent) {
    let _price = _parent.querySelector(".shop__item_price_value");

    if (!_price) return;
    _price = parseInt(_price.textContent.replace(/\s/gm, ""));

    if ((balance - _price) < 0) {
      setTooltip($tooltipWarning, true, "Недостаточно кристаллов!", 2500);
      return;
    }

    balance -= _price;
    _parent.classList.add("buy");
    setTooltip($tooltipSuccess, true, "Приобретено", 2500);

    if (!isMute) {
      sounds.shop.currentTime = 0;
      sounds.shop.el.volume = sounds.shop.volume;
      sounds.shop.el.play();
    }

    $balanceLabels?.forEach(item => item.textContent = Intl.NumberFormat().format(balance));
  }
}


function setTooltip(tooltip, isVisible, msg = "", timeToShow = null) {
  if (tooltip) {
    if (tooltip.classList.contains("active")) return;

    if (isVisible) {
      tooltip.textContent = msg;
      tooltip.classList.add("active");
    } else {
      tooltip.classList.remove("active");
    }

    if (timeToShow) {
      setTimeout(() => {
        tooltip.classList.remove("active");
      }, timeToShow);
    }
  }
}


function restartGame() {
  deleteWheel();

  pos = 0;
  $wf.style.transform = "rotate(0deg)";
  $buyShopItems?.forEach(item => item.classList.remove("buy"));

  if ($finishSeparator) {
    $finishSeparator.classList.add("active");

    setTimeout(() => $finishSeparator.classList.remove("active"), 1000);
  }

  if ($historyBox && $lastMsglabel) {
    $historyBox.innerHTML = `
      <div class="history_info__box_title">История:</div>
      <div class="history_info__default">Пусто</div>
    `;
    $lastMsglabel.textContent = "Пусто";
  }

  balance = 0;
  spinners = 10;
  $spinnersLabel.textContent = spinners;
  $balanceLabels?.forEach(item => item.textContent = balance);
  $endModal.classList.remove("active");

  createWheel();
}


function deleteWheel() {
  $wf.remove();
}


function onMute() {
  for (const key in sounds) {
    sounds[key].el.volume = 0;
  }

  isMute = true;
}


function startRotate() {
  if (isLock) return;

  isLock = true;
  const _existSegments = document.querySelectorAll('.wf__segment');

  spinners -= 1;
  $spinnersLabel.textContent = spinners;
  _existSegments?.forEach(item => item.classList.remove("win", "lose"));

  pos += randomInt(360 * 2, 360 * 4);
  $wf.style.transform = `rotate(${pos}deg)`;
  $wfArrow.classList.add("active");

  sounds.rotate.el.currentTime = 0;

  if (!isMute) {
    sounds.rotate.el.volume = sounds.rotate.volume;
  }

  sounds.rotate.el.play();

  setTimeout(() => {
    const elements = document.elementsFromPoint(targetX, targetY);
    const tEl = elements.find(item => item.classList.contains("wf__segment"));
    const status = !tEl.classList.contains("wf__segment_failed");
    const isAddSpinner = tEl.classList.contains("wf__segment_spinner");

    let value = null;

    sounds.rotate.el.volume = 0;
    sounds.win.el.volume = 0;
    sounds.lose.el.volume = 0;

    if (!tEl) return;

    if (!isMute) {
      if (status) {
        sounds.win.el.currentTime = 0;
        sounds.win.el.volume = sounds.win.volume;
        sounds.win.el.play()
      } else {
        sounds.lose.el.currentTime = 0;
        sounds.lose.el.volume = sounds.lose.volume;
        sounds.lose.el.play()
      }
    }

    if (status) {
      if (!isAddSpinner) {
        value = tEl.querySelector(".wf__segment_label").textContent;
        balance += parseInt(value.replace(/\s/gm, ""));
        addItemHistory(`+ <span>${value}</span> кристаллов`);
      } else {
        spinners += 2 * Number($level.value);
        $spinnersLabel.textContent = spinners;
        addItemHistory(`Дабавлено <span>${2 * Number($level.value)}</span> спинов`);
      }

      tEl.classList.add("win");
    } else {
      balance = 0;
      tEl.classList.add("lose");
      addItemHistory(`Обнулил баланс`, "#e93c3c");
    }

    $balanceLabels?.forEach(item => item.textContent = Intl.NumberFormat().format(balance));
    $wfArrow.classList.remove("active");
    fadeOutAndStopAudio();
    isLock = false;

    if (spinners <= 0) {
      showFinishScreen();
    }
  }, 2000);
}


function showFinishScreen() {
  if ($endModal) {
    $endModal.classList.add("active");
  }
}


function createWheel() {
  if (!$wfContainer) return;

  $wf = document.createElement("div");
  $wf.classList.add("wf__element");
  $wfContainer.after($wf);

  labels.forEach((label, index) => {
    const newSegment = createSegment(label, index);
    $wf.append(newSegment);
  });
}


function changeLevel() {
  labels.forEach((label, index) => {
    const newSegment = createSegment(label, index);
    $wf.append(newSegment);
  });
}


function createSegment(label, index) {
  const el = document.createElement("div");
  el.classList.add("wf__segment");

  const isFailedSegment = failedSegments.includes(index);
  const isSpinnerSegment = spinnersSegments.includes(index);

  if (isFailedSegment) {
    el.classList.add("wf__segment_failed");
  }

  if (isSpinnerSegment) {
    el.classList.add("wf__segment_spinner");
  }

  el.append(createLabel(label, isFailedSegment, isSpinnerSegment));
  el.style.transform = `rotate(${degree * index}deg) skewX(${degree - 90}deg)`;

  return el;
}


function createLabel(label, isFailedSegment, isSpinnerSegment) {
  const el = document.createElement("div");
  el.classList.add("wf__segment_label");
  el.style.transform = `translateX(35%) skewX(${90 - degree}deg)`;

  if (isFailedSegment) {
    el.insertAdjacentHTML("beforeend",
      `<div class="wf__segment_text" style="transform: translate(5%, -${100 - (labels.length * 10)}%) rotate(-${degree / 2}deg)">
        <img src="./img/bomb.webp" alt="bomb">
      </div>`
    );
  } else if (isSpinnerSegment) {
    el.insertAdjacentHTML("beforeend",
      `<div class="wf__segment_text" style="transform: translate(5%, -${100 - (labels.length * 10)}%) rotate(-${degree / 2}deg)">
        <img src="./img/spinners.webp" alt="spinners">
      </div>`
    );
  } else {
    let _x = 0;
    let _y = 8;

    if (window.innerWidth <= 560) {
      _x = "-5%";
      _y = 12;
    }

    el.insertAdjacentHTML("beforeend",
      `<div class="wf__segment_text" style="transform: translate(${_x}, -${100 - (labels.length * _y)}%) rotate(-${degree / 2}deg)">${label}</div>`
    );
  }

  return el;
}


function addItemHistory(msg, color = "#fff") {
  const _defaultLabel = document.querySelector('.history_info__default');

  if (_defaultLabel) _defaultLabel.remove();
  if (!($historyBox || $lastMsglabel)) return;

  $lastMsglabel.textContent = removeHtmlTags(msg);
  $historyBox.insertAdjacentHTML("beforeend", `
    <div class="history_item">
      <span class="history_item__time">${getCurrentTime()}</span>
      <span class="history_item__text" style="color: ${color ? color : "#fff"}">${msg}</span>
    </div>
  `);

  $historyBox.scrollTop = $historyBox.scrollHeight;
}


function randomInt(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}


function fadeOutAndStopAudio() {
  let volume = sounds.rotate.el.volume;
  const fadeOutInterval = setInterval(() => {
    volume -= 0.1;
    volume = Math.max(0, volume);
    sounds.rotate.el.volume = volume;
    if (volume <= 0) {
      sounds.rotate.el.pause();
      clearInterval(fadeOutInterval);
    }
  }, 100);
}


function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}


function removeHtmlTags(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}