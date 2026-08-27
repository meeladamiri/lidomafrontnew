import { useEffect, useRef, useState } from "react";

/**
 * The message box.
 *
 * Grows with the text up to a ceiling, then scrolls — a textarea fixed at one
 * row hides what you are writing, and one that grows without limit eventually
 * pushes the conversation off the screen.
 *
 * Enter sends on a desktop, where there is a keyboard and Shift+Enter is a
 * natural newline. On a touch keyboard Enter is the only way to start a new
 * line, so there it does exactly that and the send button is the way to send.
 */

const MAX_HEIGHT = 140;
/** One "still typing" ping per this window, not one per keystroke. */
const TYPING_THROTTLE_MS = 3000;

interface Props {
  disabled?: boolean;
  isDesktop: boolean;
  placeholder?: string;
  onSend: (body: string) => void;
  onTyping?: () => void;
}

function Composer({ disabled, isDesktop, placeholder, onSend, onTyping }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const lastTypingAt = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const body = value.trim();
    if (!body || disabled) return;
    setValue("");
    onSend(body);
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (!onTyping) return;
    const now = Date.now();
    if (now - lastTypingAt.current < TYPING_THROTTLE_MS) return;
    lastTypingAt.current = now;
    onTyping();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-end gap-x-8 border-t-1 border-solid border-gray-EFEFEF bg-white p-12"
    >
      <label htmlFor="chat-composer" className="sr-only">
        نوشتن پیام
      </label>
      <textarea
        id="chat-composer"
        ref={ref}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder={placeholder ?? "پیام خود را بنویسید…"}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          if (!isDesktop || event.shiftKey) return;
          event.preventDefault();
          submit();
        }}
        className="max-h-[140px] flex-1 resize-none rounded-12 border-1 border-solid border-gray-EFEFEF bg-gray-F5F5F7 px-12 py-10 text-14 leading-24 font-r text-black outline-none transition-colors placeholder:text-gray-B0AFBC focus:border-primary-main focus:bg-white disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="ارسال پیام"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-12 bg-primary-main text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <i aria-hidden="true" className="icon-SendMessage text-20" />
      </button>
    </form>
  );
}

export default Composer;
