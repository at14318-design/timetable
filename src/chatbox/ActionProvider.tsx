import React from "react";
import api from "../api/axios";

const ActionProvider = ({ createChatBotMessage, setState, children }: any) => {
  const handleUserMessage = async (message: string) => {
    const loadingMessage = createChatBotMessage("Thinking...");
    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }));

    try {
      const userId = localStorage.getItem("userId");
      // Call your backend API
      const response = await api.post("/ai", { message, userId });
      const reply =
        response.data.reply ||
        response.data.message ||
        "I processed your request.";

      const botMessage = createChatBotMessage(reply);

      setState((prev: any) => {
        const newMessages = prev.messages.filter(
          (msg: any) => msg.id !== loadingMessage.id,
        );
        return {
          ...prev,
          messages: [...newMessages, botMessage],
        };
      });
    } catch (error) {
      const errorMessage = createChatBotMessage(
        "Sorry, I'm having trouble connecting to the AI service.",
      );
      setState((prev: any) => {
        const newMessages = prev.messages.filter(
          (msg: any) => msg.id !== loadingMessage.id,
        );
        return {
          ...prev,
          messages: [...newMessages, errorMessage],
        };
      });
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleUserMessage,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
