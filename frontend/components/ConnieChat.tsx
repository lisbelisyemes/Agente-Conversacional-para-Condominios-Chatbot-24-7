"use client";

import { useEffect, useRef, useState } from "react";

type Sender = "connie" | "user";

interface Bubble {
  sender: Sender;
  text: string;
}

type Step =
  | { bubble: Bubble }
  | { typing: number };

const STEPS: Step[] = [
  { bubble: { sender: "connie", text: "Hola 👋 Soy Connie, tu asistente de condominio." } },
  { typing: 1300 },
  { bubble: { sender: "user", text: "Hola Connie, ¿cuánto debo pagar?" } },
  { typing: 1500 },
  { bubble: { sender: "connie", text: "Estoy consultando tu estado de cuenta..." } },
  { typing: 1700 },
  { bubble: { sender: "connie", text: "Tu saldo pendiente es de $250." } },
  { typing: 1400 },
  { bubble: { sender: "user", text: "¿También puedes ayudarme a reportar una incidencia?" } },
  { typing: 1300 },
  { bubble: { sender: "connie", text: "Claro. Puedo ayudarte a registrar tu reporte." } },
  { typing: 1500 },
  { bubble: { sender: "user", text: "Hay una fuga de agua en el apartamento 304." } },
  { typing: 1500 },
  { bubble: { sender: "connie", text: "Entendido. Voy a registrar el reporte." } },
];

const MESSAGE_READ_DELAY = 950;
const LOOP_RESTART_DELAY = 5000;

export default function ConnieChat() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const scheduled: number[] = [];

    const schedule = (callback: () => void, delay: number) => {
      const id = window.setTimeout(callback, delay);
      scheduled.push(id);
    };

    const beginConversation = () => {
      setBubbles([]);
      setIsTyping(false);
      let index = 0;

      const tick = () => {
        if (index >= STEPS.length) {
          schedule(beginConversation, LOOP_RESTART_DELAY);
          return;
        }
        const step = STEPS[index];
        index += 1;

        if ("bubble" in step) {
          setIsTyping(false);
          setBubbles((current) => [...current, step.bubble]);
          schedule(tick, MESSAGE_READ_DELAY);
        } else {
          setIsTyping(true);
          schedule(() => {
            setIsTyping(false);
            schedule(tick, 450);
          }, step.typing);
        }
      };

      tick();
    };

    beginConversation();

    return () => {
      scheduled.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = chatBodyRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [bubbles, isTyping]);

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-xl shadow-brand-900/10">
      <div className="flex items-center gap-3 border-b border-brand-100 bg-brand-900 px-5 py-4">
        <div className="grid size-9 place-items-center rounded-full bg-white/15 text-sm font-bold text-white">
          C
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Connie</p>
          <p className="flex items-center gap-1.5 text-[11px] text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            En línea
          </p>
        </div>
        <span className="ml-auto rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-100">
          Demostración
        </span>
      </div>

      <div ref={chatBodyRef} className="flex h-[26rem] flex-col gap-3 overflow-y-auto bg-brand-50 px-4 py-5">
        {bubbles.map((bubble, index) => (
          <div
            key={`${bubble.text}-${index}`}
            className={`animate-chat-in flex ${bubble.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                bubble.sender === "connie"
                  ? "rounded-bl-md bg-white text-slate-800"
                  : "rounded-br-md bg-brand-900 text-white"
              }`}
            >
              {bubble.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="animate-chat-in flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              <span className="typing-dot size-2 rounded-full bg-brand-400" />
              <span className="typing-dot size-2 rounded-full bg-brand-400" style={{ animationDelay: "0.2s" }} />
              <span className="typing-dot size-2 rounded-full bg-brand-400" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}