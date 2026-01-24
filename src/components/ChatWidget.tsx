import { Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import { Box, Fab, Paper } from "@mui/material";
import React, { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import ActionProvider from "../chatbox/ActionProvider";
import config from "../chatbox/config";
import MessageParser from "../chatbox/MessageParser";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            mb: 2,
            overflow: "hidden",
            borderRadius: 2,
            height: 500,
            width: 300,
          }}
        >
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </Paper>
      )}
      <Fab color="primary" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
};

export default ChatWidget;
