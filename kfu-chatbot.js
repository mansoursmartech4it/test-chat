// Wrap everything in an IIFE to avoid polluting the global scope
(async function (global) {
  // Dynamically import the Chatbot module
  const ChatbotModule = await import(
    "https://cdn.jsdelivr.net/gh/JoeFarag-00/FlowiseChatEmbed-eChat/dist/web.js"
  );
  const Chatbot = ChatbotModule.default;

  // Expose a global object
  global.KFUChatbot = {
    lastProcessedMessage: "",
    ttsEnabled: false,
    init: function () {
      console.log("✅ KFUChatbot initialized");

      // Your previous initialization logic here, e.g.,
      this.loadConfig();
    },

    loadConfig: async function () {
      try {
        const configResponse = await fetch(
          "https://ns1.smart24services.com/get-config"
        );
        const configData = await configResponse.json();
        this.kfuchatflowId = configData.kfuchatflowId;
        this.apiHost = configData.apiHost;
        this.googleTtsApi = configData.googleTtsApi;
        this.qtokenEndpoint = configData.qtokenEndpoint;

        const apiKeyResponse = await fetch(
          "https://ns1.smart24services.com/get-api-key"
        );
        const apiKeyData = await apiKeyResponse.json();
        this.apiKey = apiKeyData.apiKey;
        global.GROQ_API_KEY = configData.brtokenEndpoint;

        this.initializeChatbot();
      } catch (error) {
        console.error("❌ Failed to load config:", error);
      }
    },

    initializeChatbot: function () {
      Chatbot.init({
        chatflowid: this.kfuchatflowId,
        apiHost: this.apiHost,
        apiKey: this.apiKey,
        chatflowConfig: {},
        theme: {
          button: { /* your button config */ },
          chatWindow: { /* your chatWindow config */ }
        },
        observersConfig: {
          observeMessages: (messages) => {
            const lastMessageObj = messages[messages.length - 1];
            if (!lastMessageObj || lastMessageObj.type !== "apiMessage") return;

            if (
              lastMessageObj.message &&
              lastMessageObj.message !== this.lastProcessedMessage
            ) {
              this.lastProcessedMessage = lastMessageObj.message;
            }
          },
        },
      });
    },
  };
})(window);
