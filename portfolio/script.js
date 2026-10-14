// ================= CONTACT FORM =================

const MY_EMAIL = "supriyadevi2504@gmail.com";
// Paste your Formspree form link here (looks like https://formspree.io/f/abcdwxyz)
const FORMSPREE_URL = "https://formspree.io/f/mjygango";

// ================= CHAT-STYLE CONTACT =================
const chatBody = document.getElementById("chatBody");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

if (chatBody && chatForm) {
    const steps = [
        { key: "name",  type: "text",  ph: "Your name",
          q: function() { return "Hi! 👋 I'm Supriya. What's your name?"; } },
        { key: "email", type: "email", ph: "you@example.com",
          q: function(d) { return "Nice to meet you, " + d.name + "! What's your email so I can reply?"; } },
        { key: "msg",   type: "text",  ph: "Type your message",
          q: function() { return "Got it! Now tell me what's on your mind ✍️"; } }
    ];
    let step = 0, data = {};

    function add(text, who) {
        const m = document.createElement("div");
        m.className = "msg " + who;
        m.textContent = text;
        chatBody.appendChild(m);
        chatBody.scrollTop = chatBody.scrollHeight;
        return m;
    }

    function botSay(text, done) {
        chatInput.disabled = true;
        const t = document.createElement("div");
        t.className = "msg bot typing";
        t.innerHTML = "<span></span><span></span><span></span>";
        chatBody.appendChild(t);
        chatBody.scrollTop = chatBody.scrollHeight;
        setTimeout(function() {
            t.remove();
            const m = add(text, "bot");
            if (done) done(m);
        }, 700);
    }

    function ask() {
        const s = steps[step];
        botSay(s.q(data), function() {
            chatInput.type = s.type;
            chatInput.placeholder = s.ph;
            chatInput.disabled = false;
            chatInput.focus();
        });
    }

    function mkBtn(html, cls) {
        const b = document.createElement("button");
        b.type = "button";
        b.innerHTML = html;
        if (cls) b.className = cls;
        return b;
    }

    function finish() {
        botSay("Thanks, " + data.name + "! Ready to send your message?", function(m) {
            const send = mkBtn('<i class="fa-solid fa-paper-plane"></i> Send message');
            const gmail = mkBtn('<i class="fa-brands fa-google"></i> Open in Gmail', "ghost");
            const again = mkBtn("Start over", "ghost");

            send.addEventListener("click", function() {
                send.disabled = true;
                send.textContent = "Sending...";
                const ok = function() {
                    m.querySelectorAll("button").forEach(function(x) { x.remove(); });
                    botSay("Sent ✅ Thank you, " + data.name + "! I'll reply to " + data.email + " soon.");
                };
                const fail = function() {
                    send.disabled = false;
                    send.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Try again';
                    botSay("Oops, couldn't send it from here. Please tap \"Open in Gmail\" or use the email on the right 🙏");
                };
                if (FORMSPREE_URL.indexOf("YOUR_FORM_ID") !== -1) { fail(); return; }
                fetch(FORMSPREE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ name: data.name, email: data.email, message: data.msg })
                }).then(function(r) { r.ok ? ok() : fail(); })
                  .catch(fail);
            });

            gmail.addEventListener("click", function() {
                window.open("https://mail.google.com/mail/?view=cm&fs=1&to=" + MY_EMAIL +
                    "&su=" + encodeURIComponent("Message from " + data.name + " (portfolio)") +
                    "&body=" + encodeURIComponent(data.msg + "\n\n— " + data.name + " (" + data.email + ")"),
                    "_blank", "noopener");
            });

            again.addEventListener("click", function() {
                chatBody.innerHTML = ""; step = 0; data = {}; ask();
            });

            m.appendChild(document.createElement("br"));
            m.appendChild(send);
            m.appendChild(gmail);
            m.appendChild(again);
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    chatForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const val = chatInput.value.trim();
        if (!val || chatInput.disabled) return;
        if (!chatInput.checkValidity()) {
            add(val, "me"); chatInput.value = "";
            botSay("Hmm, that doesn't look like an email. Try again?", function() {
                chatInput.disabled = false; chatInput.focus();
            });
            return;
        }
        add(val, "me");
        data[steps[step].key] = val;
        chatInput.value = "";
        step++;
        if (step < steps.length) ask(); else finish();
    });

    ask();
}

const copyBtn = document.getElementById("copyMail");
if (copyBtn) copyBtn.addEventListener("click", function() {
    const done = function() {
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(function() { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy email'; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(MY_EMAIL).then(done, done); else done();
});


// ================= MOBILE MENU =================

const menuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector("nav");

if (menuButton) {

    menuButton.addEventListener("click", function() {

        navigation.classList.toggle("mobile-show");

    });

}

// ================= THEME TOGGLE =================
const root = document.documentElement;
const themeBtn = document.querySelector(".theme-btn");
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
if (saved === "dark") root.setAttribute("data-theme", "dark");

function syncThemeIcon() {
    if (themeBtn) themeBtn.innerHTML = root.dataset.theme === "dark"
        ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}
syncThemeIcon();
if (themeBtn) themeBtn.addEventListener("click", function() {
    const dark = root.dataset.theme !== "dark";
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    syncThemeIcon();
});

// close mobile menu after clicking a link
document.querySelectorAll("nav a").forEach(function(a) {
    a.addEventListener("click", function() { navigation.classList.remove("mobile-show"); });
});

// ================= SCROLL PROGRESS + BACK TO TOP =================
const bar = document.getElementById("progress");
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", function() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("show", window.scrollY > 400);
});
if (toTop) toTop.addEventListener("click", function() { window.scrollTo({ top: 0, behavior: "smooth" }); });

// ================= SCROLL REVEAL =================
const revealItems = document.querySelectorAll(
    ".page-heading, .about-card, .about-photo, .info-box, .skill-large-card, .project-box, .experience-box, .contact-form, .contact-info, .stats div"
);
revealItems.forEach(function(el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 80 + "ms";
});
const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
}, { threshold: 0.12 });
revealItems.forEach(function(el) { io.observe(el); });

// ================= COUNT-UP STATS =================
const counters = document.querySelectorAll("[data-count]");
const cio = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        let n = 0;
        const t = setInterval(function() {
            n++; el.textContent = n;
            if (n >= target) clearInterval(t);
        }, 300 / target + 120 / target);
        cio.unobserve(el);
    });
}, { threshold: 0.6 });
counters.forEach(function(c) { cio.observe(c); });

// ================= TYPING EFFECT =================
const typed = document.getElementById("typed");
if (typed) {
    const words = ["Machine Learning", "Data Science", "Data Analytics", "Deep Learning"];
    let w = 0, c = 0, del = false;
    (function tick() {
        const word = words[w];
        typed.textContent = word.slice(0, c);
        if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
        if (del && c === 0) { del = false; w = (w + 1) % words.length; }
        c += del ? -1 : 1;
        setTimeout(tick, del ? 45 : 90);
    })();
}


// ================= 3D TILT ON CODE BOX =================
const codeBox = document.querySelector(".code-box");
if (codeBox) {
    codeBox.style.transition = "transform .15s ease-out";
    codeBox.addEventListener("mousemove", function(e) {
        const r = codeBox.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        codeBox.style.transform = "perspective(900px) rotateY(" + x * 12 + "deg) rotateX(" + (-y * 12) + "deg)";
    });
    codeBox.addEventListener("mouseleave", function() {
        codeBox.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
    });
}

// ================= SCROLL SPY (highlight nav link of visible section) =================
const spyLinks = document.querySelectorAll('nav a[href^="#"]');
const spySections = Array.from(spyLinks).map(function(a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
if (spySections.length) {
    function spy() {
        let current = spySections[0];
        spySections.forEach(function(sec) {
            if (sec.getBoundingClientRect().top <= window.innerHeight * 0.35) current = sec;
        });
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = spySections[spySections.length - 1];
        spyLinks.forEach(function(a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + current.id);
        });
    }
    window.addEventListener("scroll", spy);
    spy();
}
