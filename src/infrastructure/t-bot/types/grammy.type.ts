import {
  Conversation as C,
  type ConversationFlavor} from "@grammyjs/conversations";
import type { Bot, Context } from "grammy";

export type MyContext = ConversationFlavor<Context> & {
  user?: {
    id: string
  }
}

export type MyBot = Bot<MyContext>

export type Conversation = C