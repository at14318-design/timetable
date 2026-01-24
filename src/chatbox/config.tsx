import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  initialMessages: [
    createChatBotMessage(
      "Hello! I'm your AI assistant. How can I help you with your timetable?",
      {}
    ),
  ],
  botName: "Timetable AI",
  customStyles: {
    botMessageBox: {
      backgroundColor: "#1976d2", // Matches MUI primary color
    },
    chatButton: {
      backgroundColor: "#1976d2",
    },
  },
};

export default config;
