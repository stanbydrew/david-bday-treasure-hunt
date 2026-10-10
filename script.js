/* ============================================================
   Vânătoarea de comori — David
   Fără framework, fără dependențe, fără backend.
   Progresul se ține în localStorage. Răspunsurile sunt stocate
   ca hash-uri SHA-256, ca să nu se vadă în clar în cod.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- SHA-256 (implementare proprie, merge și pe file://) ----------
     crypto.subtle nu există când deschizi pagina direct ca fișier,
     așa că folosim o implementare în JS pur. Primește doar ASCII,
     ceea ce e garantat de normalize() de mai jos. */
  function sha256(ascii) {
    function rr(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    var maxWord = Math.pow(2, 32);
    var result = '';
    var words = [];
    var asciiBitLength = ascii.length * 8;
    var i, j;

    var hash = (sha256.h = sha256.h || []);
    var k = (sha256.k = sha256.k || []);
    var primeCounter = k.length;

    // Constantele algoritmului, derivate din primele 64 de numere prime.
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';

    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15];
        var w2 = w[i - 2];
        var a = hash[0];
        var e = hash[4];

        var temp1 =
          hash[7] +
          (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);

        var temp2 =
          (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  /* ---------- Normalizare răspuns ----------
     Iertător cu majuscule, spații, diacritice, cratime.
     Virgula zecimală devine punct, ca "7,5" = "7.5". */
  function normalize(s) {
    return String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/,/g, '.')
      .replace(/[^a-z0-9.]/g, '');
  }

  function matches(input, hashes) {
    var n = normalize(input);
    if (!n) return false;
    var h = sha256(n);
    for (var i = 0; i < hashes.length; i++) {
      if (hashes[i] === h) return true;
    }
    return false;
  }

  /* ---------- Datele jocului ---------- */
  var LEVELS = [
    {
      title: 'Prima locație',
      intro: '',
      clue:
        'Te îndrepți înspre un loc care a dat startul unui lucru mare și frumos.\n' +
        'Aici ai savurat pentru prima dată o cafea alături de cineva drag ție.',
      photo: 'assets/location1.jpeg',
      video: 'assets/location1.mp4',
      rewardIntro:
        'Pentru a revendica primul reward va trebui să introduci mai jos un cod pe patru roți.',
      riddles: [
        {
          q: 'Codul conține litere și cifre.',
          input: 'pin',
          length: 4,
          hint: '🚗',
          answers: [
            'bac77a84e26284229404ed42d5ee2c2c5ff65d9828304fbf786ada11e35427b9',
            'f9df6d65375ccb94b910be2ccb92316e1fdaad39357714afc1104af1878cfdb8'
          ]
        }
      ]
    },

    {
      title: 'A doua locație',
      intro:
        'Felicitări! Abia acum începem să ne încălzim!\n' +
        'Urmează să te îndrepți înspre o locație plină de peripeții!',
      clue:
        'Genunchiul s-a blocat, ambulanța a venit, injecția s-a dat, dar scările s-au mai urcat?',
      photo: 'assets/location2.jpeg',
      video: 'assets/location2.mp4',
      rewardIntro:
        'Pentru a revendica următorul reward scrie mai jos răspunsul pentru următoarea ghicitoare.',
      riddles: [
        {
          q: 'Am două picioare, da’ n-am chef să merg.\nFără mine, fitu’ e cooked.',
          hint: '👖',
          answers: [
            'ded4d3d146a02bf5b076bb05ce156fde05345e07514e2decef67d5d6d01e33f8',
            '107ef922fcb7c23bd517feb1f2413d2cccd4d11e5a023a13d7f0a0d377a0e5b2',
            '05387f952f98b269cafd9bceaecd5331956f528eeeb853e29244a95bb5034a1d'
          ]
        }
      ]
    },

    {
      title: 'A treia locație',
      intro:
        'Nice job, dude! Se pare că te descurci de minune!\n' +
        'Acum urmează să retrăiești amintiri din copilărie.',
      clue:
        'Locația următoare e formată din mai multe... câmpuri să le zic așa...\n' +
        'Aici alb-vișinii se pregătesc/pregăteau pentru a deveni mai buni.',
      photo: 'assets/location3.jpeg',
      video: 'assets/location3.mp4',
      rewardIntro:
        'Pentru a primi următoarea recompensă scrie mai jos răspunsul pentru următoarele 2 ghicitori.',
      riddles: [
        {
          q: 'O ai sau nu o ai, tot dai la poartă.',
          hint: '⚽',
          answers: [
            'a78a7c503fbd9d3057aa7274c7bdc97eb422c730d075e33728450868791db9c1',
            'eb464bac15b833078e41622fa772226e80a419b905849e97a96069b66708445e',
            'a4bbc33730906fda37f53cf5d3d0d3e86633feecb445c0e65c83d84ad1a620f7'
          ]
        },
        {
          q:
            'Se pun picioarele în ele, în general iarna, dar și când mergi la o joacă ' +
            'pe sintetic sunt bune.',
          hint: '👢',
          answers: [
            '97466e7c068e116e041a188b48564e9449b5841f9d77b9723a586526d19fe9be',
            '6b4f9fbef1e0dd1db89bb48659e65b579266a319e7d3c17fe7125af7f6d05770',
            '46514e930ab1554f6dd5fb2d0a24387aba619fe6be88de8d2bb0d69a74ba74d3',
            'cd7afff2241ff5978cd023fcf17167a542dc90be534e47138f9925713b77aee8'
          ]
        }
      ]
    },

    {
      title: 'A patra locație',
      intro:
        'Pare că te descurci de minune. Spune sincer, ți-a fost ușor până acum.\n' +
        'Hai să vedem dacă te descurci la fel de ușor și pentru următoarele.',
      clue:
        'Știi cumva unde e BOSS-ul Clujului?\n' +
        'Sincer, nici eu nu știu 😂.\n' +
        'Dar am auzit că biroul unde își face el treaba e la următoarea locație.\n' +
        'Vezi dacă îl găsești acolo.',
      photo: 'assets/location4.jpeg',
      video: 'assets/location4.mp4',
      rewardIntro:
        'Mno, aici ai de gândit puțin mai mult ca să poți primi următoarea recompensă.',
      riddles: [
        {
          q:
            'Pe turnul locației poți observa niște chestii mari, rotunde. Ceasuri se numesc.\n' +
            'Câte grade are unghiul dintre minutarul și orarul unui ceas, dacă este ora 3:15?',
          placeholder: 'număr de grade',
          hint: 'Orarul se mișcă constant și el, nu rămâne fix.',
          hintIsWords: true,
          answers: [
            'c4495da75095c64bf4e0587e45d7426f496ca4fc9fe72111715005361cfe0041',
            'd22a1fb3c4cb708ac3dcfba5f88614c8042b8d7e78a801bf2b14cab4b99475fc',
            'e7cdf37d9796c0a5f514f342b45135e90e00c842e01631e3dd680140c11f5c77'
          ]
        },
        {
          q:
            'Cu cât e mai plin, cu atât îl închizi mai bine. Dacă îl pierzi, ' +
            'îți faci griji imediat.',
          hint: '💵💳🪪',
          answers: [
            '8a4ffd27e6a85b825c681e8e44ef83f6ad4bdf31769ab139b293de3f8f56f527',
            'd897c2a3e7749c19089f5cdf709ba5fe82f94fcee148dc0570ec0f95c5807871'
          ]
        }
      ]
    },

    {
      title: 'A cincea locație',
      intro:
        'Uite că i-ai dat de cap! Merge mintea la băiatuuu!\n' +
        'Dacă până acum nu te-ai distrat, de aici sigur o să te distrezi.',
      clue:
        'Următoarea locație e pe lângă o sală de fitness și un loc unde se produce bere ' +
        '(dubios că sunt una lângă alta, știu 😂).\n' +
        'Te simți ca în ghetto-ul american, dar nu se trage cu pistoale, ' +
        'aici se trage cu lasere.',
      photo: 'assets/location5.jpeg',
      video: 'assets/location5.mp4',
      rewardIntro: 'La ghicitoarea asta ar fi bine să știi răspunsul 😂.',
      riddles: [
        {
          q: 'Îl trimiți când n-ai ce să zici,\nȘi râzi cu lacrimi, deși-i cringe.',
          hint: '⚅♹',
          answers: [
            'a28a9ca63e8460b03dff84b5645c6c2a30f48149c0e5b273525cf4b80fe8a8ca',
            '35187cfef8aa450eedac5caf7db5809282444dca8646671ed1c1c7bf80f2d0e4',
            '6fe2e0f6071ac2bb8d0b1ef26d1b691e625ba690a06edfd245847a8385aee999',
            '064b1b60fa96dc5a7a49f461f1ceb7a0db34d38405f4fb9dea9241ad408a00f6'
          ]
        }
      ]
    },

    {
      title: 'Locația 6',
      intro: 'Hai că te-am plimbat ceva astăzi. Urmează ultima locație din traseu.',
      clue: 'Un loc unde burgerii vin pe bucăți și fără carbohidrați goi.',
      photo: 'assets/location6.jpeg',
      video: 'assets/location1.mp4', // intenționat: același clip ca la locația 1
      rewardIntro: 'Și ultima recompensă...',
      riddles: [
        {
          q: 'Consumi, dar nu produci.',
          hint: '🎶',
          answers: [
            '65b43c1e46f8567ca4c5e80d822591406c85f6afbfcf530bed752ec49e317bf1',
            '58b4331be772fcddb4aa45e1b3e1a064a77a8324249617bd1a45a9845b4b8941',
            '80f189984e5ca70287d13342f6daa0db45cba3c131c4e46dc81360f3a4c4f690'
          ]
        }
      ]
    }
  ];

  var WRONG_MSGS = [
    'Nuuu. Mai încearcă. 🤨',
    'Pe lângă. Încă o dată!',
    'Nope. Gândește-te mai bine.',
    'Aproape... dar nu. 😅'
  ];

  /* ---------- Starea salvată ---------- */
  var STORE_KEY = 'david-hunt-v1';

  var state = { level: 0, solved: [], done: false, started: false };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (typeof p.level === 'number' && p.level >= 0 && p.level < LEVELS.length) {
        state.level = p.level;
      }
      if (Array.isArray(p.solved)) state.solved = p.solved;
      state.done = !!p.done;
      state.started = !!p.started;
    } catch (e) {
      /* localStorage blocat sau date corupte — pornim de la zero */
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* modul privat pe unele browsere — jocul merge, dar fără salvare */
    }
  }

  /* ---------- Elemente ---------- */
  var $ = function (id) { return document.getElementById(id); };

  var screens = {
    welcome: $('screen-welcome'),
    level: $('screen-level'),
    final: $('screen-final')
  };

  /* Urcă pagina sus. Punem valoarea pe toate variantele, pentru că
     browserele mobile nu sunt de acord între ele care element scrollează. */
  function scrollToTop() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  function show(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].hidden = key !== name;
    });
    scrollToTop();
  }

  /* ---------- Poze ----------
     Nu punem src-ul nou direct pe <img>, pentru că browserul ține
     poza veche afișată până se încarcă cea nouă. Încărcăm întâi în
     memorie și abia apoi schimbăm, cu un fade. */
  var pendingPhoto = null;

  function setPhoto(src, alt) {
    var photo = $('level-photo');
    var frame = $('photo-frame');

    frame.classList.remove('is-ready');

    // Dacă o încărcare anterioară e încă în curs, o abandonăm.
    if (pendingPhoto) {
      pendingPhoto.onload = null;
      pendingPhoto.onerror = null;
    }

    var loader = new Image();
    pendingPhoto = loader;

    function done() {
      if (pendingPhoto !== loader) return; // între timp s-a schimbat nivelul
      photo.src = src;
      photo.alt = alt;
      frame.classList.add('is-ready');
      pendingPhoto = null;
    }

    loader.onload = done;
    loader.onerror = done; // tot o arătăm, ca să nu rămână ecranul gol
    loader.src = src;

    if (loader.complete) done(); // deja în cache
  }

  /* Trage în cache poza nivelului următor cât timp jucătorul merge spre
     locație, ca trecerea mai departe să fie instantanee. */
  function preloadPhoto(index) {
    if (index < 0 || index >= LEVELS.length) return;
    var img = new Image();
    img.src = LEVELS[index].photo;
  }

  /* ---------- Randare nivel ---------- */
  function renderLevel() {
    var lvl = LEVELS[state.level];

    $('progress-label').textContent =
      'Locația ' + (state.level + 1) + ' din ' + LEVELS.length;
    $('progress-fill').style.width =
      (state.level / LEVELS.length) * 100 + '%';

    var intro = $('level-intro');
    intro.textContent = lvl.intro || '';
    intro.hidden = !lvl.intro;

    $('level-clue').textContent = lvl.clue;

    setPhoto(lvl.photo, 'Poză pentru ' + lvl.title);

    // Reîncărcăm video-ul de la zero pentru noul nivel.
    var video = $('level-video');
    video.pause();
    video.removeAttribute('src');
    video.setAttribute('src', lvl.video);
    video.setAttribute('poster', lvl.photo);
    video.load();

    $('reward-intro').textContent = lvl.rewardIntro;

    var box = $('riddles');
    box.textContent = '';
    lvl.riddles.forEach(function (riddle, idx) {
      box.appendChild(buildRiddle(riddle, idx));
    });

    $('unlocked').hidden = true;
    $('btn-next').textContent =
      state.level === LEVELS.length - 1 ? 'FINAL 🏁' : 'URMĂTOAREA LOCAȚIE →';

    checkLevelComplete();
    scrollToTop();
    preloadPhoto(state.level + 1);
  }

  /* Construiește casetele de tip PIN: N căsuțe de un caracter, cu
     trecere automată la următoarea și ștergere cu Backspace.
     Nu verifică singur — verificarea se face doar din buton (sau Enter). */
  function buildPin(length, onSubmit, onType) {
    var boxes = [];

    var pin = document.createElement('div');
    pin.className = 'pin';

    function value() {
      return boxes
        .map(function (b) { return b.value; })
        .join('');
    }

    function focusBox(i) {
      if (i >= 0 && i < boxes.length) {
        boxes[i].focus();
        boxes[i].select();
      }
    }

    for (var i = 0; i < length; i++) {
      var box = document.createElement('input');
      box.type = 'text';
      box.className = 'pin-box';
      box.maxLength = 1;
      box.autocomplete = 'off';
      box.autocapitalize = 'characters';
      box.spellcheck = false;
      box.setAttribute('aria-label', 'Caracterul ' + (i + 1) + ' din ' + length);
      pin.appendChild(box);
      boxes.push(box);
    }

    boxes.forEach(function (box, index) {
      box.addEventListener('input', function () {
        // Păstrăm doar litere și cifre, cu majuscule.
        var cleaned = box.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        box.value = cleaned.slice(-1);
        if (onType) onType();
        if (box.value && index < boxes.length - 1) {
          focusBox(index + 1);
        }
      });

      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !box.value && index > 0) {
          e.preventDefault();
          boxes[index - 1].value = '';
          focusBox(index - 1);
          if (onType) onType();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          focusBox(index - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          focusBox(index + 1);
        } else if (e.key === 'Enter' && onSubmit) {
          e.preventDefault();
          onSubmit();
        }
      });

      // Lipit din clipboard: împrăștiem caracterele în căsuțe.
      box.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text') || '';
        var chars = text.toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
        for (var j = 0; j + index < boxes.length && j < chars.length; j++) {
          boxes[index + j].value = chars[j];
        }
        if (onType) onType();
        focusBox(Math.min(index + chars.length, boxes.length - 1));
      });

      box.addEventListener('focus', function () { box.select(); });
    });

    return {
      el: pin,
      boxes: boxes,
      getValue: value,
      disable: function () {
        boxes.forEach(function (b) { b.disabled = true; });
      },
      focusFirst: function () { focusBox(0); }
    };
  }

  function buildRiddle(riddle, idx) {
    var alreadySolved = state.solved.indexOf(idx) !== -1;
    var isPin = riddle.input === 'pin';

    var wrap = document.createElement('div');
    wrap.className = 'riddle' + (alreadySolved ? ' solved' : '');

    var q = document.createElement('p');
    q.className = 'riddle-q';
    q.textContent = riddle.q;
    wrap.appendChild(q);

    var row = document.createElement('div');
    row.className = 'answer-row' + (isPin ? ' answer-row--pin' : '');

    var pin = null;
    var input = null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-check';
    btn.textContent = 'VERIFICĂ';

    function clearBadFeedback() {
      if (feedback.classList.contains('bad')) {
        feedback.className = 'feedback';
        feedback.textContent = '';
      }
    }

    if (isPin) {
      pin = buildPin(riddle.length || 4, function () { attempt(); }, clearBadFeedback);
      row.appendChild(pin.el);
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.autocomplete = 'off';
      input.autocapitalize = 'off';
      input.spellcheck = false;
      input.placeholder = riddle.placeholder || 'răspunsul tău';
      input.setAttribute('aria-label', 'Răspuns');
      row.appendChild(input);
    }

    row.appendChild(btn);
    wrap.appendChild(row);

    var feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('role', 'status');
    wrap.appendChild(feedback);

    // Hint ascuns până la apăsare.
    var hintRow = document.createElement('div');
    hintRow.className = 'hint-row';
    var hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'btn-hint';
    hintBtn.textContent = 'Hint?';
    var hintText = document.createElement('p');
    hintText.className = 'hint-text' + (riddle.hintIsWords ? ' is-words' : '');
    hintText.hidden = true;
    hintText.textContent = riddle.hint;

    hintBtn.addEventListener('click', function () {
      hintText.hidden = false;
      hintBtn.hidden = true;
    });

    hintRow.appendChild(hintBtn);
    hintRow.appendChild(hintText);
    wrap.appendChild(hintRow);

    var locked = false;

    function markSolved(justNow) {
      locked = true;
      wrap.classList.add('solved');
      btn.disabled = true;
      btn.hidden = true;

      if (justNow) {
        // Lăsăm la vedere ce a scris, dar blocat.
        if (pin) pin.disable();
        if (input) input.disabled = true;
        feedback.className = 'feedback ok';
        feedback.textContent = '✓ Corect!';
      } else {
        // Reluat din progresul salvat — nu știm ce a scris, ascundem câmpul.
        row.hidden = true;
        feedback.className = 'feedback ok';
        feedback.textContent = '✓ Rezolvată';
      }

      if (state.solved.indexOf(idx) === -1) state.solved.push(idx);
      save();
      checkLevelComplete();

      if (justNow) revealNextButton();
    }

    function attempt() {
      if (locked) return;
      var value = pin ? pin.getValue() : input.value;

      if (pin && value.length < (riddle.length || 4)) {
        feedback.className = 'feedback bad';
        feedback.textContent = 'Completează toate căsuțele.';
        return;
      }
      if (!normalize(value)) {
        feedback.className = 'feedback bad';
        feedback.textContent = 'Scrie ceva mai întâi 🙂';
        return;
      }

      if (matches(value, riddle.answers)) {
        markSolved(true);
      } else {
        feedback.className = 'feedback bad';
        feedback.textContent =
          WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)];
      }
    }

    btn.addEventListener('click', attempt);

    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          attempt();
        }
      });
      input.addEventListener('input', clearBadFeedback);
    }

    if (alreadySolved) markSolved(false);

    return wrap;
  }

  function checkLevelComplete() {
    var total = LEVELS[state.level].riddles.length;
    $('unlocked').hidden = state.solved.length < total;
  }

  /* După un răspuns corect: închide tastatura de pe telefon și coboară
     la butonul de continuare, ca să fie clar ce urmează. */
  function revealNextButton() {
    var unlocked = $('unlocked');
    if (unlocked.hidden) return;

    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    window.setTimeout(function () {
      try {
        unlocked.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        try { unlocked.scrollIntoView(); } catch (e2) { /* ignorăm */ }
      }
      try {
        $('btn-next').focus({ preventScroll: true });
      } catch (e) {
        $('btn-next').focus();
      }
    }, 180);
  }

  /* ---------- Confetti ----------
     Canvas simplu, fără biblioteci. Pornește la ecranul final. */
  var confetti = (function () {
    var canvas = $('confetti');
    var ctx = null;
    var pieces = [];
    var rafId = null;
    var endAt = 0;
    var COLORS = [
      '#ffd60a', '#ffc93c', '#ffffff', '#ff5a5a',
      '#46d369', '#4aa8ff', '#c77dff', '#ff9f1c'
    ];

    function reduceMotion() {
      return (
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    }

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(count) {
      var w = window.innerWidth;
      for (var i = 0; i < count; i++) {
        pieces.push({
          x: Math.random() * w,
          y: -20 - Math.random() * window.innerHeight * 0.5,
          w: 6 + Math.random() * 7,
          h: 9 + Math.random() * 9,
          vy: 1.8 + Math.random() * 2.8,
          vx: -1.1 + Math.random() * 2.2,
          rot: Math.random() * Math.PI,
          vr: -0.14 + Math.random() * 0.28,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          sway: Math.random() * Math.PI * 2
        });
      }
    }

    function frame() {
      var h = window.innerHeight;
      var w = window.innerWidth;
      ctx.clearRect(0, 0, w, h);

      for (var i = pieces.length - 1; i >= 0; i--) {
        var p = pieces[i];
        p.sway += 0.03;
        p.x += p.vx + Math.sin(p.sway) * 0.7;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.y > h + 30) {
          pieces.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      // Mai aruncăm confetti cât timp suntem în fereastra de pornire.
      if (Date.now() < endAt && pieces.length < 260) spawn(3);

      if (pieces.length) {
        rafId = window.requestAnimationFrame(frame);
      } else {
        stop();
      }
    }

    function stop() {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
      pieces = [];
      if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      canvas.hidden = true;
    }

    function start(durationMs) {
      if (!canvas || !canvas.getContext || reduceMotion()) return;
      ctx = ctx || canvas.getContext('2d');
      if (!ctx) return;

      canvas.hidden = false;
      size();
      pieces = [];
      endAt = Date.now() + (durationMs || 4500);
      spawn(90);

      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
      if (ctx && !canvas.hidden) size();
    });

    return { start: start, stop: stop };
  })();

  /* ---------- Navigare ---------- */
  function startGame() {
    state.started = true;
    save();
    show('level');
    renderLevel();
  }

  function nextLevel() {
    $('level-video').pause();

    if (state.level === LEVELS.length - 1) {
      state.done = true;
      save();
      show('final');
      confetti.start(5000);
      return;
    }

    state.level += 1;
    state.solved = [];
    save();
    renderLevel();
  }

  function resetProgress() {
    if (!window.confirm('Sigur vrei să ștergi progresul și să începi de la capăt?')) {
      return;
    }
    state = { level: 0, solved: [], done: false, started: false };
    try {
      localStorage.removeItem(STORE_KEY);
    } catch (e) { /* ignorăm */ }
    confetti.stop();
    $('level-video').pause();
    show('welcome');
  }

  /* ---------- Pornire ---------- */
  $('btn-start').addEventListener('click', startGame);
  $('btn-next').addEventListener('click', nextLevel);
  $('btn-reset').addEventListener('click', resetProgress);

  load();

  if (state.done) {
    show('final');
    confetti.start(3500);
  } else if (state.started) {
    show('level');
    renderLevel();
  } else {
    show('welcome');
  }
})();
