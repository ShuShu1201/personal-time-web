/**
 * ChronoCraft - Personal Web Time & Focus Application
 * Complete Engine: Live Real-Time Clock, Luxury Analog Watch, World Timezones,
 * Pomodoro Focus Timer, Activity Time Tracker, and Daily Timeline Planner.
 */

(function () {
  'use strict';

  /* ==========================================================================
     Application State
     ========================================================================== */
  const STATE = {
    theme: localStorage.getItem('chrono_theme') || 'theme-dark',
    soundEnabled: localStorage.getItem('chrono_sound') !== 'false',
    timeFormat: localStorage.getItem('chrono_time_format') || '24H',
    showMilliseconds: localStorage.getItem('chrono_show_ms') !== 'false',
    selectedTimezone: localStorage.getItem('chrono_timezone') || 'local',
    isFullscreen: false,
    user: JSON.parse(localStorage.getItem('chrono_user') || JSON.stringify({
      name: '許嘉修',
      motto: '專注當下，日拱一卒 ｜ AIoT-DA 學習空間',
      avatarGrad: 'linear-gradient(135deg, #00f2fe, #4facfe)'
    })),
    pomodoro: {
      mode: 'work', // 'work' | 'shortBreak' | 'longBreak'
      durations: {
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
      },
      timeLeft: 25 * 60,
      isRunning: false,
      timerId: null,
      completedSessions: parseInt(localStorage.getItem('chrono_pomo_count') || '0', 10)
    },
    tracker: {
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      timerId: null,
      selectedCategory: 'work',
      categories: {
        work: { label: '工作', color: '#00f2fe' },
        study: { label: '學習', color: '#a855f7' },
        code: { label: '程式', color: '#38ef7d' },
        read: { label: '閱讀', color: '#f59e0b' },
        life: { label: '休閒', color: '#ec4899' }
      },
      logs: JSON.parse(localStorage.getItem('chrono_time_logs') || '[]')
    },
    timeline: {
      items: JSON.parse(localStorage.getItem('chrono_timeline_items') || 'null')
    }
  };

  // Ensure default name is set to 許嘉修 if empty or using previous placeholder
  if (!STATE.user.name || STATE.user.name === '我的空間') {
    STATE.user.name = '許嘉修';
    STATE.user.motto = '專注當下，日拱一卒 ｜ AIoT-DA 學習空間';
    localStorage.setItem('chrono_user', JSON.stringify(STATE.user));
  }

  // Seed default schedule items if empty
  if (!STATE.timeline.items) {
    STATE.timeline.items = [
      { id: '1', start: '09:00', end: '10:30', title: '深度專注：專案核心架構規劃', category: 'focus', completed: true },
      { id: '2', start: '11:00', end: '12:00', title: '團隊同步與技術討論會議', category: 'meeting', completed: false },
      { id: '3', start: '12:00', end: '13:30', title: '營養午餐與放鬆散步', category: 'rest', completed: false },
      { id: '4', start: '14:00', end: '16:30', title: '編寫功能模組與測試驗證', category: 'work', completed: false },
      { id: '5', start: '17:30', end: '18:30', title: '運動鍛鍊與慢跑', category: 'exercise', completed: false }
    ];
    saveTimeline();
  }

  // Seed initial logs for rich dashboard preview
  if (STATE.tracker.logs.length === 0) {
    STATE.tracker.logs = [
      { id: 'l1', title: '系統原型介面設計', category: 'work', duration: 45 * 60, timestamp: Date.now() - 7200000 },
      { id: 'l2', title: '前端效能與響應式調優', category: 'code', duration: 30 * 60, timestamp: Date.now() - 3600000 }
    ];
    saveLogs();
  }

  /* ==========================================================================
     Audio Synthesizer (Web Audio API)
     ========================================================================== */
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playChime(type = 'success') {
    if (!STATE.soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.45); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      } else {
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio playback not permitted or unsupported:', e);
    }
  }

  /* ==========================================================================
     DOM Cache
     ========================================================================== */
  const dom = {
    body: document.body,
    greetingIcon: document.getElementById('greetingIcon'),
    greetingText: document.getElementById('greetingText'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIconOn: document.getElementById('soundIconOn'),
    soundIconOff: document.getElementById('soundIconOff'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    sunIcon: document.getElementById('sunIcon'),
    moonIcon: document.getElementById('moonIcon'),
    profileBadge: document.getElementById('profileBadge'),
    userAvatar: document.getElementById('userAvatar'),
    userNameDisplay: document.getElementById('userNameDisplay'),

    // Hero TIME NOW Section
    heroTimeSection: document.getElementById('heroTimeSection'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    milliseconds: document.getElementById('milliseconds'),
    ampm: document.getElementById('ampm'),
    liveDateString: document.getElementById('liveDateString'),
    weekPill: document.getElementById('weekPill'),
    dayOfYearPill: document.getElementById('dayOfYearPill'),
    currentTzPill: document.getElementById('currentTzPill'),
    dayProgressBar: document.getElementById('dayProgressBar'),
    dayProgressPercent: document.getElementById('dayProgressPercent'),
    timeFormatToggleBtn: document.getElementById('timeFormatToggleBtn'),
    formatLabel: document.getElementById('formatLabel'),
    msToggleBtn: document.getElementById('msToggleBtn'),
    msToggleLabel: document.getElementById('msToggleLabel'),
    copyTimeBtn: document.getElementById('copyTimeBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    timezoneSelect: document.getElementById('timezoneSelect'),
    copyToast: document.getElementById('copyToast'),

    // Analog Watch
    acDialMarkers: document.getElementById('acDialMarkers'),
    analogHourHand: document.getElementById('analogHourHand'),
    analogMinuteHand: document.getElementById('analogMinuteHand'),
    analogSecondHand: document.getElementById('analogSecondHand'),
    analogCityLabel: document.getElementById('analogCityLabel'),

    // World Clocks Strip
    wtTaipei: document.getElementById('wtTaipei'),
    wtTokyo: document.getElementById('wtTokyo'),
    wtLondon: document.getElementById('wtLondon'),
    wtNewYork: document.getElementById('wtNewYork'),
    wtSydney: document.getElementById('wtSydney'),

    // Pomodoro
    pomodoroCount: document.getElementById('pomodoroCount'),
    tabBtns: document.querySelectorAll('.timer-tabs .tab-btn'),
    timerProgressRing: document.getElementById('timerProgressRing'),
    pomodoroDisplay: document.getElementById('pomodoroDisplay'),
    timerStatusLabel: document.getElementById('timerStatusLabel'),
    timerMainBtn: document.getElementById('timerMainBtn'),
    timerBtnText: document.getElementById('timerBtnText'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    timerResetBtn: document.getElementById('timerResetBtn'),
    timerSkipBtn: document.getElementById('timerSkipBtn'),

    // Tracker
    taskNameInput: document.getElementById('taskNameInput'),
    categoryChips: document.getElementById('categoryChips'),
    stopwatchDisplay: document.getElementById('stopwatchDisplay'),
    stopwatchToggleBtn: document.getElementById('stopwatchToggleBtn'),
    stopwatchBtnText: document.getElementById('stopwatchBtnText'),
    trackerIndicator: document.getElementById('trackerIndicator'),
    todayTotalLogged: document.getElementById('todayTotalLogged'),
    categoryBars: document.getElementById('categoryBars'),
    logsList: document.getElementById('logsList'),
    clearLogsBtn: document.getElementById('clearLogsBtn'),

    // Timeline
    timelineCountSummary: document.getElementById('timelineCountSummary'),
    addTimelineItemForm: document.getElementById('addTimelineItemForm'),
    planStartTime: document.getElementById('planStartTime'),
    planEndTime: document.getElementById('planEndTime'),
    planTitleInput: document.getElementById('planTitleInput'),
    planCategorySelect: document.getElementById('planCategorySelect'),
    hoursBarTrack: document.getElementById('hoursBarTrack'),
    timelineNowPointer: document.getElementById('timelineNowPointer'),
    timelineItemsList: document.getElementById('timelineItemsList'),

    // Profile Modal
    profileModal: document.getElementById('profileModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelProfileBtn: document.getElementById('cancelProfileBtn'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    inputUserName: document.getElementById('inputUserName'),
    inputUserMotto: document.getElementById('inputUserMotto'),
    avatarColorChoices: document.getElementById('avatarColorChoices')
  };

  /* ==========================================================================
     Theme & Config Sync
     ========================================================================== */
  function applyTheme(theme) {
    STATE.theme = theme;
    dom.body.className = theme;
    localStorage.setItem('chrono_theme', theme);
    if (theme === 'theme-light') {
      dom.sunIcon.classList.remove('hidden');
      dom.moonIcon.classList.add('hidden');
    } else {
      dom.sunIcon.classList.add('hidden');
      dom.moonIcon.classList.remove('hidden');
    }
  }

  function applySoundState() {
    if (STATE.soundEnabled) {
      dom.soundIconOn.classList.remove('hidden');
      dom.soundIconOff.classList.add('hidden');
    } else {
      dom.soundIconOn.classList.add('hidden');
      dom.soundIconOff.classList.remove('hidden');
    }
    localStorage.setItem('chrono_sound', STATE.soundEnabled);
  }

  function applyUserProfile() {
    dom.userNameDisplay.textContent = STATE.user.name || '我的空間';
    dom.userAvatar.textContent = (STATE.user.name && STATE.user.name.length > 0) ? STATE.user.name.charAt(0) : '我';
    dom.userAvatar.style.background = STATE.user.avatarGrad;
    localStorage.setItem('chrono_user', JSON.stringify(STATE.user));
  }

  /* ==========================================================================
     Analog Clock Dial Generation
     ========================================================================== */
  function setupAnalogDial() {
    if (!dom.acDialMarkers) return;
    dom.acDialMarkers.innerHTML = '';
    const cx = 110, cy = 110;

    for (let i = 0; i < 60; i++) {
      const angle = (i * 6) * (Math.PI / 180);
      const isMajor = i % 5 === 0;
      const rOuter = 96;
      const rInner = isMajor ? 84 : 91;

      const x1 = cx + rOuter * Math.sin(angle);
      const y1 = cy - rOuter * Math.cos(angle);
      const x2 = cx + rInner * Math.sin(angle);
      const y2 = cy - rInner * Math.cos(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('class', isMajor ? 'ac-marker ac-marker-major' : 'ac-marker');
      dom.acDialMarkers.appendChild(line);
    }
  }

  /* ==========================================================================
     Real-Time Clock Engine (High Precision)
     ========================================================================== */
  function formatTwoDigits(num) {
    return num < 10 ? '0' + num : '' + num;
  }

  function getWeekNumber(d) {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }

  function getDayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  let lastSecond = -1;

  function tickClock() {
    const now = new Date();

    // Timezone date calculation
    let dateToDisplay = now;
    if (STATE.selectedTimezone !== 'local') {
      try {
        const tzString = now.toLocaleString('en-US', { timeZone: STATE.selectedTimezone });
        dateToDisplay = new Date(tzString);
      } catch (e) {
        console.warn('Timezone calculation fallback:', e);
      }
    }

    const rawHours = dateToDisplay.getHours();
    const minutes = dateToDisplay.getMinutes();
    const seconds = dateToDisplay.getSeconds();
    const ms = now.getMilliseconds(); // real-time ms

    // Digital Hours / Minutes / Seconds
    if (STATE.timeFormat === '24H') {
      dom.hours.textContent = formatTwoDigits(rawHours);
      dom.ampm.classList.add('hidden');
      if (dom.formatLabel) dom.formatLabel.textContent = '24H 制';
    } else {
      const isPM = rawHours >= 12;
      const displayHours = rawHours % 12 === 0 ? 12 : rawHours % 12;
      dom.hours.textContent = formatTwoDigits(displayHours);
      dom.ampm.classList.remove('hidden');
      dom.ampm.textContent = isPM ? 'PM' : 'AM';
      if (dom.formatLabel) dom.formatLabel.textContent = '12H 制';
    }
    dom.minutes.textContent = formatTwoDigits(minutes);
    dom.seconds.textContent = formatTwoDigits(seconds);

    // Milliseconds display
    if (STATE.showMilliseconds) {
      dom.milliseconds.classList.remove('hidden');
      dom.milliseconds.textContent = '.' + formatTwoDigits(Math.floor(ms / 10));
    } else {
      dom.milliseconds.classList.add('hidden');
    }

    // Luxury Analog Watch Hands (Smooth sweeping motion)
    const secondAngle = (seconds + ms / 1000) * 6;
    const minuteAngle = (minutes + seconds / 60) * 6;
    const hourAngle = ((rawHours % 12) + minutes / 60) * 30;

    dom.analogSecondHand.setAttribute('transform', `rotate(${secondAngle} 110 110)`);
    dom.analogMinuteHand.setAttribute('transform', `rotate(${minuteAngle} 110 110)`);
    dom.analogHourHand.setAttribute('transform', `rotate(${hourAngle} 110 110)`);

    // Updates that only need to happen once per second
    if (seconds !== lastSecond) {
      lastSecond = seconds;

      // Full Date String
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const year = dateToDisplay.getFullYear();
      const month = formatTwoDigits(dateToDisplay.getMonth() + 1);
      const date = formatTwoDigits(dateToDisplay.getDate());
      const dayName = days[dateToDisplay.getDay()];
      dom.liveDateString.textContent = `${year}年 ${month}月 ${date}日 ${dayName}`;

      // Week & Day of Year Pills
      dom.weekPill.textContent = `第 ${getWeekNumber(dateToDisplay)} 週`;
      dom.dayOfYearPill.textContent = `第 ${getDayOfYear(dateToDisplay)} 天`;

      // Timezone Pill & City Label
      const tzNames = {
        'local': '本地標準時間 (Local)',
        'Asia/Taipei': '台北 (UTC+8)',
        'Asia/Tokyo': '東京 (UTC+9)',
        'Europe/London': '倫敦 (UTC+1)',
        'Europe/Paris': '巴黎 (UTC+2)',
        'America/New_York': '紐約 (UTC-4)',
        'America/Los_Angeles': '洛杉磯 (UTC-7)',
        'Australia/Sydney': '雪梨 (UTC+10)',
        'UTC': 'UTC 標準時間'
      };
      dom.currentTzPill.textContent = `時區：${tzNames[STATE.selectedTimezone] || STATE.selectedTimezone}`;

      const cityLabels = {
        'local': 'LOCAL',
        'Asia/Taipei': 'TAIPEI',
        'Asia/Tokyo': 'TOKYO',
        'Europe/London': 'LONDON',
        'Europe/Paris': 'PARIS',
        'America/New_York': 'NEW YORK',
        'America/Los_Angeles': 'LOS ANGELES',
        'Australia/Sydney': 'SYDNEY',
        'UTC': 'UTC'
      };
      dom.analogCityLabel.textContent = cityLabels[STATE.selectedTimezone] || 'TIME NOW';

      // Day Progress Bar
      const secondsPassed = rawHours * 3600 + minutes * 60 + seconds;
      const dayProgress = ((secondsPassed / 86400) * 100).toFixed(1);
      dom.dayProgressBar.style.width = `${dayProgress}%`;
      dom.dayProgressPercent.textContent = `${dayProgress}%`;

      // Timeline 24H Indicator
      if (dom.timelineNowPointer) {
        const nowPointerPct = ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;
        dom.timelineNowPointer.style.left = `${nowPointerPct}%`;
      }

      // Greeting
      updateGreeting(rawHours);

      // World Clocks
      updateWorldCities(now);
    }

    requestAnimationFrame(tickClock);
  }

  function updateGreeting(hour) {
    let greeting = '';
    let icon = '✨';
    if (hour >= 5 && hour < 9) {
      greeting = '清晨好，朝氣蓬勃的一天開始了';
      icon = '🌅';
    } else if (hour >= 9 && hour < 12) {
      greeting = '上午好，精力充沛，專注投入';
      icon = '☀️';
    } else if (hour >= 12 && hour < 14) {
      greeting = '中午好，享用美味午餐，稍事放鬆';
      icon = '🍱';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好，持續保持節奏與高效產出';
      icon = '☕';
    } else if (hour >= 18 && hour < 22) {
      greeting = '傍晚安好，梳理今日收穫，享受生活';
      icon = '🌆';
    } else {
      greeting = '夜深了，注意休息充電，迎接嶄新明天';
      icon = '🌙';
    }

    const namePrefix = STATE.user.name ? `${STATE.user.name}，` : '';
    const mottoSuffix = STATE.user.motto ? ` ｜ ${STATE.user.motto}` : '';
    dom.greetingIcon.textContent = icon;
    dom.greetingText.textContent = `${namePrefix}${greeting}${mottoSuffix}`;
  }

  function updateWorldCities(baseDate) {
    const tzMap = {
      wtTaipei: 'Asia/Taipei',
      wtTokyo: 'Asia/Tokyo',
      wtLondon: 'Europe/London',
      wtNewYork: 'America/New_York',
      wtSydney: 'Australia/Sydney'
    };

    for (const [id, tz] of Object.entries(tzMap)) {
      try {
        const timeStr = baseDate.toLocaleTimeString('zh-Hant', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        if (dom[id]) dom[id].textContent = timeStr;
      } catch (e) {
        // Fallback
      }
    }
  }

  /* ==========================================================================
     Hero Tool Actions: Copy Time & Fullscreen
     ========================================================================== */
  function copyCurrentTime() {
    const now = new Date();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    navigator.clipboard.writeText(timeStr).then(() => {
      playChime('click');
      dom.copyToast.classList.remove('hidden');
      setTimeout(() => {
        dom.copyToast.classList.add('hidden');
      }, 2500);
    }).catch(() => {
      alert(`現在時間：${timeStr}`);
    });
  }

  function toggleFullscreen() {
    playChime('click');
    STATE.isFullscreen = !STATE.isFullscreen;
    dom.heroTimeSection.classList.toggle('fullscreen-active', STATE.isFullscreen);

    if (STATE.isFullscreen) {
      dom.fullscreenBtn.innerHTML = '<span class="tool-icon">✕</span><span>退出全螢幕</span>';
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      dom.fullscreenBtn.innerHTML = '<span class="tool-icon">⛶</span><span>全螢幕</span>';
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  /* ==========================================================================
     Pomodoro Focus Timer
     ========================================================================== */
  const RING_CIRCUMFERENCE = 2 * Math.PI * 120; // 753.98
  dom.timerProgressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;

  function formatPomoTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${formatTwoDigits(mins)}:${formatTwoDigits(secs)}`;
  }

  function renderPomodoro() {
    const { timeLeft, durations, mode } = STATE.pomodoro;
    const totalDuration = durations[mode];

    dom.pomodoroDisplay.textContent = formatPomoTime(timeLeft);
    dom.pomodoroCount.textContent = STATE.pomodoro.completedSessions;

    const progress = timeLeft / totalDuration;
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    dom.timerProgressRing.style.strokeDashoffset = offset;

    document.title = STATE.pomodoro.isRunning
      ? `(${formatPomoTime(timeLeft)}) ChronoCraft 專注中`
      : 'ChronoCraft ｜ 現在時間 ＆ 個人專屬時鐘儀表板';
  }

  function setPomodoroMode(mode) {
    if (STATE.pomodoro.isRunning) {
      pausePomodoro();
    }
    STATE.pomodoro.mode = mode;
    STATE.pomodoro.timeLeft = STATE.pomodoro.durations[mode];

    dom.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'work') {
      dom.timerStatusLabel.textContent = '準備就緒，專注投入！';
    } else if (mode === 'shortBreak') {
      dom.timerStatusLabel.textContent = '小憩 5 分鐘，喝口水伸展身體';
    } else {
      dom.timerStatusLabel.textContent = '長休 15 分鐘，充分放鬆身心';
    }

    renderPomodoro();
  }

  function startPomodoro() {
    if (STATE.pomodoro.isRunning) return;
    playChime('click');
    STATE.pomodoro.isRunning = true;
    dom.playIcon.classList.add('hidden');
    dom.pauseIcon.classList.remove('hidden');
    dom.timerBtnText.textContent = '暫停計時';
    dom.timerMainBtn.classList.remove('btn-pulse');

    STATE.pomodoro.timerId = setInterval(() => {
      if (STATE.pomodoro.timeLeft > 0) {
        STATE.pomodoro.timeLeft--;
        renderPomodoro();
      } else {
        finishPomodoro();
      }
    }, 1000);
  }

  function pausePomodoro() {
    if (!STATE.pomodoro.isRunning) return;
    playChime('click');
    STATE.pomodoro.isRunning = false;
    clearInterval(STATE.pomodoro.timerId);
    dom.playIcon.classList.remove('hidden');
    dom.pauseIcon.classList.add('hidden');
    dom.timerBtnText.textContent = '繼續專注';
    dom.timerMainBtn.classList.add('btn-pulse');
  }

  function resetPomodoro() {
    playChime('click');
    pausePomodoro();
    STATE.pomodoro.timeLeft = STATE.pomodoro.durations[STATE.pomodoro.mode];
    dom.timerBtnText.textContent = STATE.pomodoro.mode === 'work' ? '開始專注' : '開始休息';
    renderPomodoro();
  }

  function finishPomodoro() {
    pausePomodoro();
    playChime('success');

    if (STATE.pomodoro.mode === 'work') {
      STATE.pomodoro.completedSessions++;
      localStorage.setItem('chrono_pomo_count', STATE.pomodoro.completedSessions);

      const autoLog = {
        id: 'auto_' + Date.now(),
        title: '番茄鐘專注完成 🍅',
        category: 'work',
        duration: 25 * 60,
        timestamp: Date.now()
      };
      STATE.tracker.logs.unshift(autoLog);
      saveLogs();
      renderTracker();

      alert('🎉 恭喜！您完成了一輪 25 分鐘的高效專注！請好好休息。');
      setPomodoroMode('shortBreak');
    } else {
      alert('⏰ 休息時間結束！準備好開始下一段高效專注了嗎？');
      setPomodoroMode('work');
    }
  }

  /* ==========================================================================
     Time Tracker & Activity Logger
     ========================================================================== */
  function saveLogs() {
    localStorage.setItem('chrono_time_logs', JSON.stringify(STATE.tracker.logs));
  }

  function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${formatTwoDigits(hours)}:${formatTwoDigits(mins)}:${formatTwoDigits(secs)}`;
  }

  function toggleTracker() {
    if (!STATE.tracker.isRunning) {
      playChime('click');
      STATE.tracker.isRunning = true;
      STATE.tracker.startTime = Date.now() - (STATE.tracker.elapsedSeconds * 1000);
      dom.stopwatchBtnText.textContent = '結束並保存';
      dom.stopwatchToggleBtn.classList.add('running');
      dom.trackerIndicator.textContent = '記錄中...';
      dom.trackerIndicator.classList.add('active');

      STATE.tracker.timerId = setInterval(() => {
        STATE.tracker.elapsedSeconds = Math.floor((Date.now() - STATE.tracker.startTime) / 1000);
        dom.stopwatchDisplay.textContent = formatDuration(STATE.tracker.elapsedSeconds);
      }, 1000);
    } else {
      playChime('success');
      clearInterval(STATE.tracker.timerId);
      STATE.tracker.isRunning = false;

      const title = dom.taskNameInput.value.trim() || '未命名專注任務';
      const duration = Math.max(STATE.tracker.elapsedSeconds, 1);

      STATE.tracker.logs.unshift({
        id: 'log_' + Date.now(),
        title: title,
        category: STATE.tracker.selectedCategory,
        duration: duration,
        timestamp: Date.now()
      });
      saveLogs();

      STATE.tracker.elapsedSeconds = 0;
      dom.stopwatchDisplay.textContent = '00:00:00';
      dom.stopwatchBtnText.textContent = '開始計時';
      dom.stopwatchToggleBtn.classList.remove('running');
      dom.trackerIndicator.textContent = '閒置中';
      dom.trackerIndicator.classList.remove('active');
      dom.taskNameInput.value = '';

      renderTracker();
    }
  }

  function deleteLog(logId) {
    STATE.tracker.logs = STATE.tracker.logs.filter(l => l.id !== logId);
    saveLogs();
    renderTracker();
  }

  function renderTracker() {
    const catTotals = { work: 0, study: 0, code: 0, read: 0, life: 0 };
    let totalSeconds = 0;

    STATE.tracker.logs.forEach(log => {
      if (catTotals[log.category] !== undefined) {
        catTotals[log.category] += log.duration;
      }
      totalSeconds += log.duration;
    });

    const totalMinutes = Math.round(totalSeconds / 60);
    dom.todayTotalLogged.textContent = `總計：${totalMinutes} 分鐘 (${(totalSeconds / 3600).toFixed(1)} 小時)`;

    dom.categoryBars.innerHTML = '';
    for (const [catKey, info] of Object.entries(STATE.tracker.categories)) {
      const catSec = catTotals[catKey] || 0;
      const pct = totalSeconds > 0 ? Math.round((catSec / totalSeconds) * 100) : 0;
      const mins = Math.round(catSec / 60);

      const barItem = document.createElement('div');
      barItem.className = 'cat-bar-item';
      barItem.innerHTML = `
        <div class="cat-bar-header">
          <span>${info.label} (${mins}分)</span>
          <span>${pct}%</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${pct}%; background-color: ${info.color}"></div>
        </div>
      `;
      dom.categoryBars.appendChild(barItem);
    }

    dom.logsList.innerHTML = '';
    if (STATE.tracker.logs.length === 0) {
      dom.logsList.innerHTML = '<div class="empty-state">尚無記錄，開始專注計時吧！</div>';
      return;
    }

    STATE.tracker.logs.slice(0, 10).forEach(log => {
      const catInfo = STATE.tracker.categories[log.category] || { label: log.category, color: '#00f2fe' };
      const durationStr = formatDuration(log.duration);
      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `
        <div class="log-item-left">
          <span class="log-tag-badge" style="color: ${catInfo.color}; border: 1px solid ${catInfo.color}40">${catInfo.label}</span>
          <span class="log-title" title="${escapeHtml(log.title)}">${escapeHtml(log.title)}</span>
        </div>
        <div class="log-item-right">
          <span class="log-duration">${durationStr}</span>
          <button class="log-delete-btn" data-id="${log.id}" title="刪除此紀錄">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      item.querySelector('.log-delete-btn').addEventListener('click', () => {
        deleteLog(log.id);
      });

      dom.logsList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  /* ==========================================================================
     Daily Timeline & Schedule Planner
     ========================================================================== */
  function saveTimeline() {
    localStorage.setItem('chrono_timeline_items', JSON.stringify(STATE.timeline.items));
  }

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function getCategoryColor(cat) {
    const colors = {
      work: 'linear-gradient(135deg, #00f2fe, #4facfe)',
      meeting: 'linear-gradient(135deg, #a855f7, #c084fc)',
      focus: 'linear-gradient(135deg, #f43f5e, #fb7185)',
      rest: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      exercise: 'linear-gradient(135deg, #10b981, #34d399)'
    };
    return colors[cat] || 'linear-gradient(135deg, #00f2fe, #4facfe)';
  }

  function getCategoryLabel(cat) {
    const labels = {
      work: '💼 工作事務',
      meeting: '👥 會議交流',
      focus: '🎯 深度專注',
      rest: '☕ 休息用餐',
      exercise: '🏃 運動健康'
    };
    return labels[cat] || cat;
  }

  function renderTimeline() {
    const items = STATE.timeline.items;
    const completedCount = items.filter(i => i.completed).length;
    dom.timelineCountSummary.textContent = `${completedCount} / ${items.length} 任務已完成`;

    const existingBlocks = dom.hoursBarTrack.querySelectorAll('.hour-block');
    existingBlocks.forEach(b => b.remove());

    items.forEach(item => {
      const startMins = timeToMinutes(item.start);
      const endMins = timeToMinutes(item.end);
      if (endMins > startMins) {
        const leftPct = (startMins / 1440) * 100;
        const widthPct = ((endMins - startMins) / 1440) * 100;

        const block = document.createElement('div');
        block.className = 'hour-block';
        block.style.left = `${leftPct}%`;
        block.style.width = `${widthPct}%`;
        block.style.background = getCategoryColor(item.category);
        block.title = `${item.start} - ${item.end}: ${item.title}`;
        block.textContent = item.title;
        dom.hoursBarTrack.appendChild(block);
      }
    });

    dom.timelineItemsList.innerHTML = '';
    items.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `timeline-card-item ${item.completed ? 'completed' : ''}`;
      card.innerHTML = `
        <div class="t-left">
          <input type="checkbox" class="custom-checkbox" ${item.completed ? 'checked' : ''} aria-label="完成任務" />
          <div class="t-info">
            <span class="t-time-span">${item.start} - ${item.end}</span>
            <span class="t-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
            <span class="t-category">${getCategoryLabel(item.category)}</span>
          </div>
        </div>
        <button class="t-delete-btn" title="刪除規劃">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      card.querySelector('.custom-checkbox').addEventListener('change', e => {
        item.completed = e.target.checked;
        if (item.completed) playChime('click');
        saveTimeline();
        renderTimeline();
      });

      card.querySelector('.t-delete-btn').addEventListener('click', () => {
        STATE.timeline.items = STATE.timeline.items.filter(i => i.id !== item.id);
        saveTimeline();
        renderTimeline();
      });

      dom.timelineItemsList.appendChild(card);
    });
  }

  function addTimelineItem(e) {
    e.preventDefault();
    const start = dom.planStartTime.value;
    const end = dom.planEndTime.value;
    const title = dom.planTitleInput.value.trim();
    const category = dom.planCategorySelect.value;

    if (!title) return;
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      alert('請注意：結束時間必須晚於開始時間！');
      return;
    }

    playChime('click');
    STATE.timeline.items.push({
      id: 'task_' + Date.now(),
      start,
      end,
      title,
      category,
      completed: false
    });

    saveTimeline();
    renderTimeline();
    dom.planTitleInput.value = '';
  }

  /* ==========================================================================
     Profile Settings Modal Handling
     ========================================================================== */
  let selectedGrad = STATE.user.avatarGrad;

  function openProfileModal() {
    dom.inputUserName.value = STATE.user.name || '';
    dom.inputUserMotto.value = STATE.user.motto || '';
    dom.profileModal.classList.remove('hidden');

    const dots = dom.avatarColorChoices.querySelectorAll('.color-dot');
    dots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.grad === STATE.user.avatarGrad);
    });
  }

  function closeProfileModal() {
    dom.profileModal.classList.add('hidden');
  }

  function saveProfileModal() {
    STATE.user.name = dom.inputUserName.value.trim() || '我的空間';
    STATE.user.motto = dom.inputUserMotto.value.trim() || '專注當下，日拱一卒';
    STATE.user.avatarGrad = selectedGrad;
    applyUserProfile();
    closeProfileModal();
  }

  /* ==========================================================================
     Event Listeners Attachment
     ========================================================================== */
  function attachEventListeners() {
    // Theme toggle
    dom.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = STATE.theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
      applyTheme(nextTheme);
    });

    // Sound toggle
    dom.soundToggleBtn.addEventListener('click', () => {
      STATE.soundEnabled = !STATE.soundEnabled;
      applySoundState();
      playChime('click');
    });

    // Profile modal
    dom.profileBadge.addEventListener('click', openProfileModal);
    dom.closeModalBtn.addEventListener('click', closeProfileModal);
    dom.cancelProfileBtn.addEventListener('click', closeProfileModal);
    dom.saveProfileBtn.addEventListener('click', saveProfileModal);
    dom.profileModal.addEventListener('click', e => {
      if (e.target === dom.profileModal) closeProfileModal();
    });

    dom.avatarColorChoices.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        dom.avatarColorChoices.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        selectedGrad = dot.dataset.grad;
      });
    });

    // 12H / 24H Toggle
    if (dom.timeFormatToggleBtn) {
      dom.timeFormatToggleBtn.addEventListener('click', () => {
        STATE.timeFormat = STATE.timeFormat === '24H' ? '12H' : '24H';
        localStorage.setItem('chrono_time_format', STATE.timeFormat);
        playChime('click');
      });
    }

    // Milliseconds toggle
    if (dom.msToggleBtn) {
      dom.msToggleBtn.addEventListener('click', () => {
        STATE.showMilliseconds = !STATE.showMilliseconds;
        localStorage.setItem('chrono_show_ms', STATE.showMilliseconds);
        dom.msToggleLabel.textContent = `毫秒: ${STATE.showMilliseconds ? '開' : '關'}`;
        playChime('click');
      });
      dom.msToggleLabel.textContent = `毫秒: ${STATE.showMilliseconds ? '開' : '關'}`;
    }

    // Copy Time
    if (dom.copyTimeBtn) {
      dom.copyTimeBtn.addEventListener('click', copyCurrentTime);
    }

    // Fullscreen
    if (dom.fullscreenBtn) {
      dom.fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Timezone selector
    if (dom.timezoneSelect) {
      dom.timezoneSelect.value = STATE.selectedTimezone;
      dom.timezoneSelect.addEventListener('change', e => {
        STATE.selectedTimezone = e.target.value;
        localStorage.setItem('chrono_timezone', STATE.selectedTimezone);
        playChime('click');
      });
    }

    // Pomodoro Controls
    dom.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setPomodoroMode(btn.dataset.mode);
      });
    });

    dom.timerMainBtn.addEventListener('click', () => {
      if (STATE.pomodoro.isRunning) {
        pausePomodoro();
      } else {
        startPomodoro();
      }
    });

    dom.timerResetBtn.addEventListener('click', resetPomodoro);
    dom.timerSkipBtn.addEventListener('click', () => {
      if (confirm('確定要跳過當前階段嗎？')) {
        finishPomodoro();
      }
    });

    // Tracker Category Chips
    dom.categoryChips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        dom.categoryChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        STATE.tracker.selectedCategory = chip.dataset.cat;
      });
    });

    dom.stopwatchToggleBtn.addEventListener('click', toggleTracker);
    dom.clearLogsBtn.addEventListener('click', () => {
      if (confirm('確定要清空所有時間追蹤記錄嗎？')) {
        STATE.tracker.logs = [];
        saveLogs();
        renderTracker();
      }
    });

    // Timeline Form
    dom.addTimelineItemForm.addEventListener('submit', addTimelineItem);
  }

  /* ==========================================================================
     Application Initialization
     ========================================================================== */
  function init() {
    applyTheme(STATE.theme);
    applySoundState();
    applyUserProfile();
    setupAnalogDial();

    // Start precision clock loop
    tickClock();

    // Pomodoro
    renderPomodoro();

    // Tracker
    renderTracker();

    // Timeline
    renderTimeline();

    // Events
    attachEventListeners();
  }

  // Initialize immediately or on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
