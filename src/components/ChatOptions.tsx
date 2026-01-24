import React from "react";
import { Chip, Box } from "@mui/material";

interface ChatOptionsProps {
  actionProvider: any;
}

const ChatOptions: React.FC<ChatOptionsProps> = (props) => {
  const options = [
    {
      text: "What is my next class?",
      handler: () =>
        props.actionProvider.handleUserMessage("What is my next class?"),
      id: 1,
    },
    {
      text: "Show me my timetable for today",
      handler: () =>
        props.actionProvider.handleUserMessage(
          "Show me my timetable for today",
        ),
      id: 2,
    },
    {
      text: "Rate my timetable",
      handler: () =>
        props.actionProvider.handleUserMessage("Rate my timetable"),
      id: 3,
    },
    {
      text: "Do I have any free slots on Monday?",
      handler: () =>
        props.actionProvider.handleUserMessage(
          "Do I have any free slots on Monday?",
        ),
      id: 3,
    },
    {
      text: "What classes do I have on Friday?",
      handler: () =>
        props.actionProvider.handleUserMessage(
          "What classes do I have on Friday?",
        ),
      id: 3,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, mb: 1 }}>
      {options.map((option) => (
        <Chip
          key={option.id}
          label={option.text}
          onClick={option.handler}
          color="primary"
          variant="outlined"
          size="small"
          clickable
        />
      ))}
    </Box>
  );
};

export default ChatOptions;
