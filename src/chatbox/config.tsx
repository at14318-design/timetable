import { createChatBotMessage } from "react-chatbot-kit";
import ChatOptions from "../components/ChatOptions";

const config = {
  botName: "TimetableBot",
  initialMessages: [
    createChatBotMessage(
      "Hello! How can I help you with your schedule today?",
      {
        widget: "chatOptions", // Display options immediately on load
      },
    ),
  ],
  widgets: [
    {
      widgetName: "chatOptions",
      widgetFunc: (props: any) => <ChatOptions {...props} />,
      props: {},
      mapStateToProps: [],
    },
  ],
  // ... other config
};

export default config;
