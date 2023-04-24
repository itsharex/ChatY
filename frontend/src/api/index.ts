import { fetchEventSource, type EventSourceMessage } from '@microsoft/fetch-event-source';
import { OPEN_AI_MODELS, OPEN_AI_HOST } from '@/config/constant.config';
import { useChatSessionStore } from '@/store/chat';
import { getSettingStorage } from '@/utils/chat';
import { omit } from '@/utils/utils';
import { chatSessionDB } from '@/db';
import type { ChatMessage, ChatCompletionCbData } from '@/types/openai';

const url = '/v1/chat/completions';
interface chatCompletionStreamReq {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}
export const getChatCompletionStream = async (
  req: chatCompletionStreamReq,
  callback: (data: ChatCompletionCbData) => void,
) => {
  const { apiKey, temperature, maxReplayLength } = getSettingStorage();
  if (!apiKey) return;
  const abortController = new AbortController();
  const desc = useChatSessionStore.getState().session.description;
  const setAbortController = useChatSessionStore.getState().setAbortController;
  setAbortController(abortController);

  fetchEventSource(OPEN_AI_HOST + url, {
    method: 'POST',
    body: JSON.stringify({
      model: OPEN_AI_MODELS.GPT3,
      messages: [{ role: 'system', content: desc }, ...req.messages],
      temperature: req.temperature || temperature,
      max_tokens: req.maxTokens || maxReplayLength,
      stream: true,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    signal: abortController.signal,
    async onopen(res) {
      // connect good
      if (res.ok) return;
      // ...others
    },
    async onmessage(msg: EventSourceMessage) {
      if (msg.data === '[DONE]') return;
      const jsonData = JSON.parse(msg.data);
      if (!jsonData.choices[0].delta.content) return;
      const cbData = {
        id: jsonData.id,
        created: jsonData.created,
        content: jsonData.choices[0].delta.content,
      };
      callback(cbData);
    },
    onclose() {
      // save session data
      const data = useChatSessionStore.getState().session;
      chatSessionDB.update(data.id, omit(data, ['id']));
    },
    onerror(err) {
      throw new Error(err);
    },
  });
};