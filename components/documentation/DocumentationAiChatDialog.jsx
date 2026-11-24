"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  JacoButton,
  JacoModal,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";

import { unwrapArticlePayload } from "./moduleOptions";

const MESSAGE_MAX_LENGTH = 4000;
const HINT_ID = "documentation-ai-chat-hint";
const ERROR_ID = "documentation-ai-chat-error";

function readPayloadText(payload, fallback) {
  const text = payload?.text;

  if (typeof text === "string" && text.trim()) {
    return text.trim();
  }

  return fallback;
}

function normalizeChatMessage(item) {
  const role = item?.role;
  const text = item?.text;

  if ((role !== "user" && role !== "assistant") || typeof text !== "string" || !text.trim()) {
    return null;
  }

  return {
    id: item?.id ?? null,
    role,
    text,
    created_at: typeof item?.created_at === "string" ? item.created_at : null,
  };
}

function normalizeChatMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.map((item) => normalizeChatMessage(item)).filter(Boolean);
}

function formatChatTime(value) {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}`;
}

function scrollContainerToEnd(node) {
  let current = node?.parentElement || null;

  while (current) {
    const overflowY = window.getComputedStyle(current).overflowY;

    if (overflowY === "auto" || overflowY === "scroll") {
      current.scrollTop = current.scrollHeight;
      return;
    }

    current = current.parentElement;
  }
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const time = formatChatTime(message.created_at);

  return (
    <Box sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <Box
        role="article"
        aria-label={isUser ? "Ваше сообщение" : "Ответ ИИ"}
        sx={{
          maxWidth: "min(100%, 520px)",
          px: 1.5,
          py: 1.25,
          borderRadius: uiRadii.md,
          backgroundColor: isUser ? uiColors.primarySoft : uiColors.surfaceMuted,
          border: `1px solid ${isUser ? "transparent" : uiColors.borderLight}`,
        }}
      >
        <Typography
          component="p"
          sx={{ m: 0, mb: 0.5, ...uiTypography.label, fontWeight: 500, color: uiColors.textMuted }}
        >
          {isUser ? "Вы" : "ИИ"}
        </Typography>
        <Typography
          component="p"
          sx={{
            m: 0,
            ...uiTypography.body,
            color: uiColors.textStrong,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {message.text}
        </Typography>
        {time ? (
          <Typography
            component="p"
            sx={{ m: 0, mt: 0.75, ...uiTypography.compactLabel, color: uiColors.textMuted }}
          >
            <time dateTime={message.created_at}>{time}</time>
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function DocumentationAiChatDialog({
  open,
  moduleKey,
  moduleName,
  api_laravel,
  onClose,
  showAlert,
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [composerError, setComposerError] = useState("");

  const historyGenRef = useRef(0);
  const loadingRef = useRef(false);
  const sendingRef = useRef(false);
  const mountedRef = useRef(true);
  const moduleKeyRef = useRef(moduleKey);
  const prevModuleKeyRef = useRef(moduleKey);
  const bottomRef = useRef(null);

  moduleKeyRef.current = moduleKey;

  const title = moduleName ? `Помощь от ИИ · ${moduleName}` : "Помощь от ИИ";
  const showCenteredState = loading || Boolean(loadError) || messages.length === 0;

  const isCurrentRequest = useCallback((requestId) => requestId === historyGenRef.current, []);

  const fetchHistory = useCallback(
    async (requestId) => {
      if (!moduleKey) {
        if (!mountedRef.current || !isCurrentRequest(requestId)) {
          return;
        }

        setMessages([]);
        setLoadError("Модуль не выбран");
        return;
      }

      try {
        const response = await api_laravel("get_ai_chat_history", {
          module_key: moduleKey,
        });

        if (!mountedRef.current || !isCurrentRequest(requestId)) {
          return;
        }

        const payload = unwrapArticlePayload(response);

        if (payload?.st === false) {
          setMessages([]);
          setLoadError(readPayloadText(payload, "Не удалось загрузить историю"));
          return;
        }

        setMessages(normalizeChatMessages(payload?.messages));
        setLoadError("");
      } catch (error) {
        if (!mountedRef.current || !isCurrentRequest(requestId)) {
          return;
        }

        const payload = unwrapArticlePayload(error?.response?.data);
        setMessages([]);
        setLoadError(readPayloadText(payload, "Не удалось загрузить историю"));
      }
    },
    [api_laravel, isCurrentRequest, moduleKey],
  );

  const reloadHistory = useCallback(async () => {
    if (!open) {
      return;
    }

    const requestId = historyGenRef.current + 1;
    historyGenRef.current = requestId;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    setMessages([]);
    setComposerError("");

    try {
      await fetchHistory(requestId);
    } finally {
      if (mountedRef.current && isCurrentRequest(requestId)) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [fetchHistory, isCurrentRequest, open]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      historyGenRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (prevModuleKeyRef.current === moduleKey) {
      return;
    }

    prevModuleKeyRef.current = moduleKey;
    setDraft("");
    setComposerError("");
  }, [moduleKey]);

  useEffect(() => {
    if (!open) {
      historyGenRef.current += 1;
      loadingRef.current = false;
      setLoading(false);
      return undefined;
    }

    const requestId = historyGenRef.current + 1;
    historyGenRef.current = requestId;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    setMessages([]);
    setComposerError("");

    let active = true;

    (async () => {
      try {
        await fetchHistory(requestId);
      } finally {
        if (active && mountedRef.current && requestId === historyGenRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [fetchHistory, open, moduleKey]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollContainerToEnd(bottomRef.current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, messages, loading, loadError, sending]);

  const sendMessage = async () => {
    const message = draft.trim();
    const sentModuleKey = moduleKey;
    const requestGen = historyGenRef.current;

    if (
      !sentModuleKey ||
      !message ||
      sendingRef.current ||
      loadingRef.current ||
      loading ||
      sending
    ) {
      return;
    }

    if (message.length > MESSAGE_MAX_LENGTH) {
      const text = "Сообщение должно быть от 1 до 4000 символов";
      setComposerError(text);
      showAlert(false, text);
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setComposerError("");

    try {
      const response = await api_laravel("send_ai_chat_message", {
        module_key: sentModuleKey,
        message,
      });

      if (!mountedRef.current) {
        return;
      }

      const payload = unwrapArticlePayload(response);
      const userMessage = normalizeChatMessage(payload?.user_message);
      const assistantMessage = normalizeChatMessage(payload?.assistant_message);
      const sameModule = moduleKeyRef.current === sentModuleKey;
      const current = isCurrentRequest(requestGen);

      if (payload?.st === false || !userMessage || !assistantMessage) {
        const text = readPayloadText(payload, "Не удалось отправить сообщение");

        if (current && sameModule) {
          setComposerError(text);
        }

        showAlert(false, text);
        return;
      }

      if (!current || !sameModule) {
        if (sameModule) {
          setDraft("");
        }
        return;
      }

      setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
      setDraft("");
      setComposerError("");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      const payload = unwrapArticlePayload(error?.response?.data);
      const text = readPayloadText(payload, "Не удалось отправить сообщение");
      const sameModule = moduleKeyRef.current === sentModuleKey;

      if (isCurrentRequest(requestGen) && sameModule) {
        setComposerError(text);
      }

      showAlert(false, text);
    } finally {
      sendingRef.current = false;

      if (mountedRef.current) {
        setSending(false);
      }
    }
  };

  const handleDraftKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent?.isComposing) {
      return;
    }

    event.preventDefault();
    sendMessage();
  };

  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      containedDesktopScroll
      desktopMaxHeight="80dvh"
      contentSx={{ pb: 2 }}
      actionsSx={{ alignItems: "stretch" }}
      actions={
        <Box sx={{ width: "100%" }}>
          {composerError ? (
            <Typography
              id={ERROR_ID}
              role="alert"
              sx={{ mb: 1, ...uiTypography.label, color: uiColors.primary }}
            >
              {composerError}
            </Typography>
          ) : null}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { xs: "stretch", sm: "flex-end" } }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <JacoTextInput
                label="Сообщение"
                placeholder="Спросите про этот модуль"
                value={draft}
                multiline
                minRows={2}
                maxRows={5}
                disabled={sending}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (composerError) {
                    setComposerError("");
                  }
                }}
                onKeyDown={handleDraftKeyDown}
                inputProps={{
                  maxLength: MESSAGE_MAX_LENGTH,
                  "aria-describedby": composerError ? `${ERROR_ID} ${HINT_ID}` : HINT_ID,
                  "aria-invalid": composerError ? true : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
                    alignItems: "flex-start",
                  },
                }}
              />
            </Box>
            <JacoButton
              type="button"
              compact
              loading={sending}
              disabled={!moduleKey || loading || sending || !draft.trim()}
              onClick={sendMessage}
              aria-label="Отправить сообщение"
              sx={{ flexShrink: 0, minWidth: { sm: 132 } }}
            >
              Отправить
            </JacoButton>
          </Stack>
          <Typography
            id={HINT_ID}
            sx={{ mt: 1, ...uiTypography.compactLabel, color: uiColors.textMuted }}
          >
            Enter отправляет сообщение, Shift+Enter переносит строку.
          </Typography>
        </Box>
      }
    >
      <Box
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={loading || undefined}
        aria-label={moduleName ? `Сообщения чата модуля ${moduleName}` : "Сообщения чата"}
        sx={{
          minHeight: { xs: 240, sm: 420 },
          display: "flex",
          flexDirection: "column",
          justifyContent: showCenteredState ? "center" : "flex-start",
        }}
      >
        {loading ? (
          <Stack
            spacing={1.5}
            sx={{ alignItems: "center" }}
          >
            <CircularProgress
              size={28}
              sx={{ color: uiColors.primary }}
            />
            <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted }}>
              Загрузка истории…
            </Typography>
          </Stack>
        ) : loadError ? (
          <Stack
            spacing={1.5}
            sx={{ alignItems: "center", textAlign: "center" }}
          >
            <Typography
              role="alert"
              sx={{ ...uiTypography.body, color: uiColors.text }}
            >
              {loadError}
            </Typography>
            <JacoButton
              type="button"
              tone="secondary"
              compact
              onClick={reloadHistory}
            >
              Повторить
            </JacoButton>
          </Stack>
        ) : messages.length === 0 ? (
          <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted, textAlign: "center" }}>
            Пока нет сообщений. Спросите про этот модуль — история сохранится только для вас и
            останется у этого модуля.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {messages.map((message, index) => (
              <ChatBubble
                key={`${message.role}-${message.id ?? "local"}-${index}`}
                message={message}
              />
            ))}
          </Stack>
        )}
        <Box
          ref={bottomRef}
          aria-hidden="true"
        />
      </Box>
    </JacoModal>
  );
}
