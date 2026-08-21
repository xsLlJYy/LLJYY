
(function () {
    var SPARK_COLOR    = '#ffffff';
    var SPARK_SIZE     = 10;
    var SPARK_RADIUS   = 15;
    var SPARK_COUNT    = 8;
    var SPARK_DURATION = 400;
    var AUDIO_DIR  = '../audio/';
    var BG_VOLUME  = 0.7;   
    var CLICK_VOL  = 0.26;  
    var WOOD_VOL   = 0.36;  
    var FLIP_VOL   = 0.3;   
    var bgMusic          = null;
    var clickSound       = null;
    var audioBuilt       = false;   
    var bgStartedOnce    = false;   
    var K_BG_TIME  = '__bgm_time';
    var K_BG_UNLOCK = '__bgm_unlocked';
    function clickSpark(x, y) {
        for (var i = 0; i < SPARK_COUNT; i++) {
            var spark = document.createElement('div');
            var angle = (Math.PI * 2 * i) / SPARK_COUNT + (Math.random() - 0.5) * 0.4;
            var dist = SPARK_RADIUS * 6 * (0.8 + Math.random() * 0.4);
            spark.style.cssText =
                'position:fixed;left:' + x + 'px;top:' + y + 'px;' +
                'width:' + SPARK_SIZE + 'px;height:' + SPARK_SIZE + 'px;' +
                'background:' + SPARK_COLOR + ';border-radius:50%;' +
                'pointer-events:none;z-index:99999;' +
                'box-shadow:0 0 6px ' + SPARK_COLOR + ';' +
                'transition:transform ' + SPARK_DURATION + 'ms cubic-bezier(.2,.7,.2,1),' +
                'opacity ' + SPARK_DURATION + 'ms ease;';
            document.body.appendChild(spark);
            (function (sp, dx, dy) {
                requestAnimationFrame(function () {
                    sp.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0)';
                    sp.style.opacity = '0';
                });
            })(spark, Math.cos(angle) * dist, Math.sin(angle) * dist);
            (function (sp) {
                setTimeout(function () { sp.remove(); }, SPARK_DURATION);
            })(spark);
        }
    }
    function buildAudio() {
        if (audioBuilt) return;
        audioBuilt = true;
        bgMusic = new Audio(AUDIO_DIR + '5.mp3');
        bgMusic.loop = true;
        bgMusic.volume = BG_VOLUME;
        try {
            var saved = localStorage.getItem(K_BG_TIME);
            if (saved) {
                var t = parseFloat(saved);
                if (!isNaN(t) && t > 0) {
                    var applyTime = function () {
                        try {
                            if (!isFinite(bgMusic.duration) || t < bgMusic.duration) {
                                bgMusic.currentTime = t;
                            }
                        } catch (e) {}
                    };
                    if (bgMusic.readyState >= 1) applyTime();
                    else bgMusic.addEventListener('loadedmetadata', applyTime, { once: true });
                }
            }
        } catch (e) {}
        clickSound = new Audio(AUDIO_DIR + '2.wav');
        clickSound.volume = CLICK_VOL;
        clickSound.preload = 'auto';
    }
    function tryStartBg() {
        if (!bgMusic) return;
        var pm = bgMusic.play();
        if (pm && typeof pm.then === 'function') {
            pm.then(function () {
                bgStartedOnce = true;
                try { localStorage.setItem(K_BG_UNLOCK, '1'); } catch (e) {}
            }).catch(function () {
               
            });
        }
    }
    buildAudio();
    tryStartBg();
    try {
        if (localStorage.getItem(K_BG_UNLOCK) === '1') {
            tryStartBg();
        }
    } catch (e) {}

    function playClick() {
        if (!clickSound) return;
        try {
            clickSound.currentTime = 0;
            clickSound.play().catch(function () {});
        } catch (e) {}
    }
    document.addEventListener('click', function (e) {
        if (!audioBuilt) buildAudio();
        clickSpark(e.clientX, e.clientY);
        playClick();
        if (!bgStartedOnce) tryStartBg();
    }, true);
    function saveBgTime() {
        if (bgMusic && !isNaN(bgMusic.currentTime)) {
            try {
                localStorage.setItem(K_BG_TIME, bgMusic.currentTime);
            } catch (e) {}
        }
    }
    window.addEventListener('beforeunload', saveBgTime);
    window.addEventListener('pagehide', saveBgTime);
  
    setInterval(saveBgTime, 3000);
    window.__playWood = function () {
        var s = new Audio(AUDIO_DIR + '木块.wav');
        s.volume = WOOD_VOL;
        s.play().catch(function () {});
    };
   
    window.__playFlip = function () {
        var s = new Audio(AUDIO_DIR + '翻.wav');
        s.volume = FLIP_VOL;
        s.play().catch(function () {});
    };

    // 暂停 / 恢复背景音乐（供视频播放时调用）
    window.__pauseBg = function () {
        if (bgMusic && !bgMusic.paused) bgMusic.pause();
    };
    window.__resumeBg = function () {
        if (bgMusic && bgMusic.paused) bgMusic.play().catch(function () {});
    };
})();
