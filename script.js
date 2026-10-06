

const tweetInput = document.getElementById("tweet-input");
const tweetButton = document.getElementById("tweet-button");
const timeline = document.querySelector(".timeline");

const homeSection = document.getElementById("home-section");
const exploreSection = document.getElementById("explore-section");
const exploreSearch = document.getElementById("explore-search");
const exploreResults = document.getElementById("explore-results");
const exploreEmpty = document.getElementById("explore-empty");



tweetInput.maxLength = 280;
tweetInput.setAttribute("aria-label", "Write a tweet");

const characterCount = document.createElement("span");
characterCount.className = "character-count";
characterCount.textContent = "0 / 280";

tweetButton.before(characterCount);
tweetButton.disabled = true;


function updateTweetBox() {
    characterCount.textContent = tweetInput.value.length + " / 280";

    tweetButton.disabled = tweetInput.value.trim() === "";
}

tweetInput.addEventListener("input", updateTweetBox);



function createTweet(text) {
    const tweet = document.createElement("div");
    tweet.className = "tweet";

    const profile = document.createElement("div");
    profile.className = "tweet-profile own-profile";
    profile.textContent = "N";

    const content = document.createElement("div");
    content.className = "tweet-content";

    const header = document.createElement("div");
    header.className = "tweet-header";

    const name = document.createElement("strong");
    name.textContent = "Nosipho";

    const username = document.createElement("span");
    username.textContent = "@nosipho · now";

    const paragraph = document.createElement("p");
    paragraph.className = "tweet-text";
    paragraph.textContent = text;

    header.append(name, username);
    content.append(header, paragraph);
    tweet.append(profile, content);

    timeline.prepend(tweet);

  
    if (!exploreSection.hidden) {
        runExploreSearch();
    }
}



tweetButton.addEventListener("click", function () {
    const text = tweetInput.value.trim();

    if (text === "" || text.length > 280) {
        return;
    }

    createTweet(text);

    tweetInput.value = "";
    updateTweetBox();
    tweetInput.focus();
});



const postButton = document.querySelector(".post-button");
const mobilePostButton = document.getElementById("mobile-post-button");
const composerModal = document.getElementById("composer-modal");
const composerDialog = composerModal.querySelector(".composer-dialog");
const composerInput = document.getElementById("composer-input");
const composerCount = document.getElementById("composer-count");
const composerPost = document.getElementById("composer-post");
const composerClose = document.getElementById("composer-close");


let lastFocusedElement = null;


function updateComposer() {
    const length = composerInput.value.length;
    const text = composerInput.value.trim();

    composerCount.textContent = length + " / 280";
    composerPost.disabled = text === "";
}


function getFocusableElements() {
    return composerDialog.querySelectorAll(
        'button:not([disabled]), textarea, [href], input, select, [tabindex]:not([tabindex="-1"])'
    );
}

function openComposer() {
    lastFocusedElement = document.activeElement;

    composerModal.hidden = false;
    composerModal.setAttribute("aria-hidden", "false");

    composerInput.value = "";
    updateComposer();

    composerInput.focus();
}

function closeComposer() {
    composerModal.hidden = true;
    composerModal.setAttribute("aria-hidden", "true");

    composerInput.value = "";
    updateComposer();

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function submitComposer() {
    const text = composerInput.value.trim();

    if (text === "" || text.length > 280) {
        return;
    }

    createTweet(text);

    closeComposer();
}



postButton.addEventListener("click", function () {
    openComposer();
});


mobilePostButton.addEventListener("click", function () {
    openComposer();
});


composerClose.addEventListener("click", function () {
    closeComposer();
});


composerModal.addEventListener("click", function (event) {
    if (event.target.hasAttribute("data-close-composer")) {
        closeComposer();
    }
});

composerInput.addEventListener("input", updateComposer);


composerPost.addEventListener("click", function () {
    submitComposer();
});


document.addEventListener("keydown", function (event) {
    if (composerModal.hidden) {
        return;
    }

    if (event.key === "Escape") {
        closeComposer();
        return;
    }

    if (event.key === "Tab") {
        const focusable = getFocusableElements();

        if (focusable.length === 0) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});




const navButtons = document.querySelectorAll(".nav-button");


function setActiveNav(sectionName) {
    navButtons.forEach(function (button) {
        const isActive = button.getAttribute("data-section") === sectionName;

        button.classList.toggle("active-nav", isActive);

        if (isActive) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });
}


function showHome() {
    homeSection.hidden = false;
    exploreSection.hidden = true;
    setActiveNav("home");
}


function showExplore() {
    homeSection.hidden = true;
    exploreSection.hidden = false;
    setActiveNav("explore");

   
    runExploreSearch();
    exploreSearch.focus();
}


navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const section = button.getAttribute("data-section");

        if (section === "home") {
            showHome();
        } else if (section === "explore") {
            showExplore();
        }
    });
});




function getTweetAuthor(tweet) {
    const name = tweet.querySelector(".tweet-header strong");

    if (!name) {
        return "";
    }

    return name.textContent;
}


function getTweetSearchText(tweet) {
    const parts = [];

    const author = getTweetAuthor(tweet);
    if (author) {
        parts.push(author);
    }

    const username = tweet.querySelector(
    ".tweet-header span:not(.verified):not(.tweet-more)");
    if (username) {
        parts.push(username.textContent);
    }

    const text = tweet.querySelector(".tweet-text");
    if (text) {
        parts.push(text.textContent);
    }

    const caption = tweet.querySelector(".nicki-caption");
    if (caption) {
        parts.push(caption.textContent);
    }

    const quoted = tweet.querySelector(".quoted-post");
    if (quoted) {
        parts.push(quoted.textContent);
    }

    return parts.join(" ");
}


function tweetMatchesQuery(tweet, query) {
    if (query === "") {
        return true;
    }

    const author = getTweetAuthor(tweet).toLowerCase();
    const body = getTweetSearchText(tweet).toLowerCase();

    return author.includes(query) || body.includes(query);
}


function runExploreSearch() {
    const query = exploreSearch.value.trim().toLowerCase();
    const tweets = timeline.querySelectorAll(".tweet");


    exploreResults.textContent = "";
    exploreEmpty.hidden = true;
    exploreEmpty.textContent = "";

    let matchCount = 0;

    tweets.forEach(function (tweet) {
        if (!tweetMatchesQuery(tweet, query)) {
            return;
        }

        // Clone so the Home timeline is never moved or deleted
        const copy = tweet.cloneNode(true);
        exploreResults.appendChild(copy);
        matchCount = matchCount + 1;
    });

    if (matchCount === 0) {
        
        exploreEmpty.textContent = "No tweets match your search. Try a different word or author name.";
        exploreEmpty.hidden = false;
    }
}


exploreSearch.addEventListener("input", function () {
    runExploreSearch();
});

const themeButton = document.getElementById("theme-button");

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");

    themeButton.textContent = isDarkMode ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-pressed", String(isDarkMode));
});