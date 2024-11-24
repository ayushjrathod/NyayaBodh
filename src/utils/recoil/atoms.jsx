import { atom } from "recoil";

export const userState = atom({
  key: "userState",
  default: {
    name: "John Doe",
    age: 25,
  },
});

export const currentPhaseState = atom({
  key: "currentPhaseState",
  default: 1,
});

export const answersState = atom({
  key: "answersState",
  default: {},
});

export const currentQuestionsState = atom({
  key: "currentQuestionsState",
  default: [],
});

export const progressState = atom({
  key: "progressState",
  default: 0,
});

export const drawerOpenState = atom({
  key: "drawerOpenState",
  default: false,
});

export const chatIdState = atom({
  key: "chatIdState",
  default: null,
});

export const messagesState = atom({
  key: "messagesState",
  default: [],
});

export const inputState = atom({
  key: "inputState",
  default: "",
});

export const chatsState = atom({
  key: "chatsState",
  default: [{ id: 1, title: "General Chat" }],
});

export const initialChatMessagesState = atom({
  key: "initialChatMessagesState",
  default: {
    1: [
      {
        role: "assistant",
        content: [{ text: "Hello! How can I assist you today?" }],
      },
    ],
  },
});
