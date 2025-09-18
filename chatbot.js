import Chatbot from "https://cdn.jsdelivr.net/gh/JoeFarag-00/FlowiseChatEmbed-eChat/dist/web.js";

let lastProcessedMessage = ""; // Track the last processed message
let messageList = []; // Store all messages temporarily
let audio = null; // Store the audio object for playback control
let isPlaying = false; // Track if audio is currently playing
let ttsEnabled = false;
let ttsDebounceTimeout;
let kfuchatflowId, apiHost, googleTtsApi, qtokenEndpoint, apiKey;

function cleanMessage(message) {
    // 🧹 Remove any URLs, whether plain or inside brackets
    message = message.replace(
        /\[?\b(?:https?:\/\/|www\.)\S+\]?/gi,
        ""
    );
    message = message.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "");
    message = message.replace(/\[.*?\]\(.*?\)/g, "");
    // 🧹 Remove unnecessary special characters, keeping Arabic, English letters, and punctuation
    return message
        .replace(/[^a-zA-Z\u0600-\u06FF0-9.,? ]/g, "")
        .trim();
}

// Function to create and append the button to the DOM
function createTitleWithPlayButton() {
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("chat-title-container");

    // إنشاء عنوان الدردشة
    const titleElement = document.createElement("span");
    titleElement.textContent = "eChat with KFU";

    // إنشاء زر التشغيل
    const playButton = document.createElement("button");
    playButton.id = "playButton";
    playButton.textContent = "🗣"; // default: muted (TTS off)
    window.playButtonRef = playButton;
    // Add hover CSS styling:   
    playButton.style.border = "none";
    playButton.style.borderRadius = "7px";
    playButton.style.background = "none";
    playButton.style.cursor = "pointer";
    playButton.style.fontSize = "24px";
    playButton.style.transition = "background-color 0.3s ease";
    playButton.style.height = "2rem";
    playButton.style.width = "2rem";
    playButton.onmouseover = () => {
        playButton.style.backgroundColor = "#c69a47";
    };
    playButton.onmouseout = () => {
        playButton.style.backgroundColor = "transparent";
    };
    playButton.onclick = toggleAudioPlayback;

    // تطبيق مسافة بين العنوان والزر
    titleContainer.style.display = "flex";
    titleContainer.style.alignItems = "center";
    titleContainer.style.gap = "30px"; // هذه تضيف مسافة بين العناصر

    titleContainer.appendChild(titleElement);
    titleContainer.appendChild(playButton);

    return titleContainer;
}

function toggleAudioPlayback() {
    ttsEnabled = !ttsEnabled;
    if (window.playButtonRef) {
        if (ttsEnabled) {
            window.playButtonRef.textContent = "🔇️";
            // Immediately read the last message if one exists
            if (
                lastProcessedMessage &&
                lastProcessedMessage.trim() !== ""
            ) {
                audioQueue.stopAll();
                console.log(
                    "Immediate TTS for last message:",
                    lastProcessedMessage
                );
                playTTS(lastProcessedMessage);
            }
        } else {
            window.playButtonRef.textContent = "🗣";
            audioQueue.stopAll();
        }
    } else {
        console.error("No Play btn");
    }
}

function initializeChatbot() {
    Chatbot.init({
        chatflowid: kfuchatflowId,
        apiHost: apiHost,
        apiKey: apiKey,
        chatflowConfig: {},
        theme: {
            button: {
                backgroundColor: "#13616b",
                color: "#ffffff",
                right: 20,
                bottom: 20,
                size: 85,
                dragAndDrop: true,
                iconColor: "#c69a47",
                customIconSrc: "icon.jpeg",
                autoWindowOpen: {
                    autoOpen: true,
                    openDelay: 2,
                    autoOpenOnMobile: false,
                },
            },
            tooltip: {
                showTooltip: true,
                tooltipMessage: "Chat With AI !",
                tooltipBackgroundColor: "#13616b",
                tooltipTextColor: "#ffffff",
                tooltipFontSize: 16,
            },
            disclaimer: {
                title: "Disclaimer",
                message:
                    "باستخدام هذا المتحدث الذكى فأنت موافق على كل شروط الاستخدام وسياسة الخصوصية للموقع ",
                textColor: "#13616b",
                buttonColor: "#0d6c74",
                buttonText: "ابدأ المحادثه",
                buttonTextColor: "white",
                blurredBackgroundColor: "rgba(19, 97, 107, 0.4)",
                backgroundColor: "white",
            },
            customCSS: ``,
            chatWindow: {
                showTitle: true,
                showAgentMessages: true,
                title: createTitleWithPlayButton(),
                titleAvatarSrc: "icon.jpeg",
                textColor: "#13616b",
                welcomeMessage:
                    "مرحبًا بك في الموقع الإلكتروني لجامعة الملك فيصل! 👋 أنا مساعدك الذكي، جاهز أساعدك في أي استفسار يخص القبول، البرامج الأكاديمية، أو الخدمات الجامعية. اسألني اللي تحتاجه، وأنا حاضر! 🎓",
                errorMessage:
                    ".حاليا نحن لا يمكننا توفير هذه المعلومات والسبب أننا مازلنا فى مرحلة التطوير",
                backgroundColor: "#ffffff",
                backgroundImage: "enter image path or link",
                poweredByTextColor: "white",
                height: 575,
                width: 550,
                fontSize: 16,
                starterPrompts: [
                    "عن جامعة الملك فيصل",
                    "ما هى احدث الاخبار",
                    "الجوائز",
                    "جميع اعضاء الإدارة العليا",
                ],
                starterPromptFontSize: 15,
                clearChatOnReload: false,
                sourceDocsTitle: "Sources:",
                renderHTML: true,
                botMessage: {
                    backgroundColor: "#f0f7f8",
                    textColor: "#13616b",
                    showAvatar: true,
                    avatarSrc: "icon.jpeg",
                },
                userMessage: {
                    backgroundColor: "#13616b",
                    textColor: "#ffffff",
                    showAvatar: false,
                    avatarSrc: "chatbot.jpeg",
                },
                textInput: {
                    placeholder: "... اكتب رسالتك هنا ",
                    backgroundColor: "#ffffff",
                    textColor: "#13616b",
                    sendButtonColor: "#0d6c74",
                    maxChars: 2000,
                    maxCharsWarningMessage:
                        "You exceeded the characters limit. Please input less than 2000 characters.",
                    autoFocus: true,
                    sendMessageSound: true,
                    sendSoundLocation: "send_message.mp3",
                    receiveMessageSound: true,
                    receiveSoundLocation: "receive_message.mp3",
                },
                feedback: {
                    color: "#13616b",
                },
                dateTimeToggle: {
                    date: true,
                    time: true,
                },
            },
        },
        observersConfig: {
            // User input has changed
            //observeUserInput: (userInput) => {
            // console.log({ userInput });
            //},
            // The bot message stack
            observeMessages: (messages) => {
                const lastMessageObj =
                    messages[messages.length - 1];
                if (!lastMessageObj) return;
                // Only trigger TTS for bot messages
                if (lastMessageObj.type !== "apiMessage") return;

                if (
                    lastMessageObj.message &&
                    lastMessageObj.message !== lastProcessedMessage
                ) {
                    lastProcessedMessage = lastMessageObj.message;
                    // clear to avoid any early trigs
                    if (ttsDebounceTimeout)
                        clearTimeout(ttsDebounceTimeout);
                    // Wait 1 second after the last update before firing TTS
                    ttsDebounceTimeout = setTimeout(() => {
                        if (ttsEnabled) {
                            audioQueue.stopAll();
                            console.log(
                                "Final Bot TTS:",
                                lastMessageObj.message
                            );
                            playTTS(lastMessageObj.message);
                        }
                    }, 1000);
                }
            },
        },
    });
}

async function loadConfig() {
    try {
        const configResponse = await fetch(
            "https://ns1.smart24services.com/get-config"
        );
        const configData = await configResponse.json();
        kfuchatflowId = configData.kfuchatflowId;
        apiHost = configData.apiHost;
        googleTtsApi = configData.googleTtsApi;
        qtokenEndpoint = configData.qtokenEndpoint;

        const apiKeyResponse = await fetch(
            "https://ns1.smart24services.com/get-api-key"
        );
        const apiKeyData = await apiKeyResponse.json();
        apiKey = apiKeyData.apiKey;
        window.GROQ_API_KEY = configData.brtokenEndpoint;

        initializeChatbot(); // ✅ Call it AFTER config loads
    } catch (error) {
        console.error("❌ Failed to load config:", error);
    }
}

class AudioQueue {
    constructor() {
        this.queue = [];
        this.currentAudio = null;
        this.isPlaying = false;
    }

    addAudio(audio) {
        this.queue.push(audio);
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    async playNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }
        this.isPlaying = true;
        this.currentAudio = this.queue.shift();
        this.currentAudio.addEventListener("ended", () => {
            this.currentAudio = null;
            this.playNext();
        });
        try {
            await this.currentAudio.play();
        } catch (error) {
            console.error("Error playing audio:", error);
            this.playNext();
        }
    }

    stopAll() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.queue = [];
        this.isPlaying = false;
    }
}

function chunkText(text, chunkSize = 80) {
    const words = text.split(" ");
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (const word of words) {
        if (currentLength + word.length > chunkSize) {
            chunks.push(currentChunk.join(" "));
            currentChunk = [word];
            currentLength = word.length;
        } else {
            currentChunk.push(word);
            currentLength += word.length + 1;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
    }

    return chunks;
}

function chunkText2(text, tokenLimit = 50) {
    if (text !== "") {
        const words = text.split(" ");
        const chunks = [];
        let currentChunk = [];
        let currentLength = 0;

        for (const word of words) {
            currentChunk.push(word);
            currentLength++;

            if (currentLength >= tokenLimit && word.includes(".")) {
                chunks.push(currentChunk.join(" "));
                currentChunk = [];
                currentLength = 0;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(" "));
        }

        return chunks;
    }
}

const audioQueue = new AudioQueue();

async function fetchGoogleAccessToken() {
    try {
        const response = await fetch("qtokenEndpoint");
        if (!response.ok) throw new Error("Failed to fetch token");

        const data = await response.json();
        if (data.access_token) {
            console.log("✅ Got New Access Token");
            return data.access_token;
        } else {
            throw new Error("Invalid token response");
        }
    } catch (error) {
        console.error("❌ Error Fetching Token:", error);
        return null;
    }
}

function splitTextByLanguage(text) {
    const words = text.split(/\s+/);
    let chunks = [];
    let currentChunk = [];
    let currentLang = detectLanguage(words[0]);

    words.forEach((word) => {
        const lang = detectLanguage(word);
        if (lang !== currentLang && currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.join(" "),
                lang: currentLang,
            });
            currentChunk = [];
        }
        currentChunk.push(word);
        currentLang = lang;
    });

    if (currentChunk.length > 0) {
        chunks.push({
            text: currentChunk.join(" "),
            lang: currentLang,
        });
    }

    return chunks;
}

function detectLanguage(text) {
    return /[\u0600-\u06FF]/.test(text) ? "ar-XA" : "en-US";
}

async function playTTS(text) {
    if (!ttsEnabled) {
        console.log("🔇 TTS is disabled, skipping playback.");
        return;
    }

    const cleanedText = cleanMessage(text);
    if (!cleanedText) {
        console.log(
            "🚨 No valid text after cleaning. Skipping TTS."
        );
        return;
    }

    const chunks = splitTextByLanguage(cleanedText);
    console.log("✅ Processed TTS chunks:", chunks);

    for (let i = 0; i < chunks.length; i++) {
        if (i > 0) {
            await new Promise((resolve) =>
                setTimeout(resolve, 300)
            );
        }

        const requestBody = {
            model:
                chunks[i].lang === "ar-XA"
                    ? "playai-tts-arabic"
                    : "playai-tts",
            input: chunks[i].text,
            voice:
                chunks[i].lang === "ar-XA"
                    ? "Nasser-PlayAI"
                    : "Fritz-PlayAI",
            response_format: "wav",
        };

        try {
            const response = await fetch(
                "https://api.groq.com/openai/v1/audio/speech",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${window.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audioQueue.addAudio(audio);
            } else {
                console.error(
                    "❌ Groq TTS API Error:",
                    await response.text()
                );
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
        }
    }
}

async function playAudio(audio) {
    return new Promise((resolve) => {
        audio.play();
        audio.onended = resolve;
    });
}

loadConfig();