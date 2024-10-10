"use client";

import { FitAddon } from "@xterm/addon-fit";
import {
  Terminal,
  type ITerminalInitOnlyOptions,
  type ITerminalOptions,
} from "@xterm/xterm";
import { useEffect, useRef, useState } from "react";

import "@xterm/xterm/css/xterm.css";

export interface UseTerminalProps {
  options?: ITerminalOptions & ITerminalInitOnlyOptions;
  // listeners?: {
  //   onBinary?(data: string): void;
  //   onCursorMove?(): void;
  //   onData?(data: string): void;
  //   onKey?: (event: { key: string; domEvent: KeyboardEvent }) => void;
  //   onLineFeed?(): void;
  //   onScroll?(newPosition: number): void;
  //   onSelectionChange?(): void;
  //   onRender?(event: { start: number; end: number }): void;
  //   onResize?(event: { cols: number; rows: number }): void;
  //   onTitleChange?(newTitle: string): void;
  //   customKeyEventHandler?(event: KeyboardEvent): boolean;
  // };
}

const fitAddon = new FitAddon();

export function useTerminal({ options }: UseTerminalProps = {}) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(
    null,
  );

  useEffect(() => {
    const instance = new Terminal({
      rows: 10,
      lineHeight: 1.4,
      convertEol: true,
      theme: {
        cursor: "transparent",
        background: "rgba(0, 0, 0, 0)",
      },
    });

    instance.loadAddon(fitAddon);

    // if (listeners) {
    //   if (listeners.onBinary) instance.onBinary(listeners.onBinary);
    //   if (listeners.onCursorMove) instance.onCursorMove(listeners.onCursorMove);
    //   if (listeners.onLineFeed) instance.onLineFeed(listeners.onLineFeed);
    //   if (listeners.onScroll) instance.onScroll(listeners.onScroll);
    //   if (listeners.onSelectionChange)
    //     instance.onSelectionChange(listeners.onSelectionChange);
    //   if (listeners.onRender) instance.onRender(listeners.onRender);
    //   if (listeners.onResize) instance.onResize(listeners.onResize);
    //   if (listeners.onTitleChange)
    //     instance.onTitleChange(listeners.onTitleChange);
    //   if (listeners.onKey) instance.onKey(listeners.onKey);
    //   if (listeners.onData) instance.onData(listeners.onData);

    //   // Add Custom Key Event Handler
    //   if (listeners.customKeyEventHandler) {
    //     instance.attachCustomKeyEventHandler(listeners.customKeyEventHandler);
    //   }
    // }

    if (terminalRef.current) {
      instance.open(terminalRef.current);
    }

    setTerminalInstance(instance);

    return () => {
      instance.dispose();
      setTerminalInstance(null);
    };
  }, [
    terminalRef,
    options,
    // listeners,
    // listeners?.onBinary,
    // listeners?.onCursorMove,
    // listeners?.onData,
    // listeners?.onKey,
    // listeners?.onLineFeed,
    // listeners?.onScroll,
    // listeners?.onSelectionChange,
    // listeners?.onRender,
    // listeners?.onResize,
    // listeners?.onTitleChange,
    // listeners?.customKeyEventHandler,
  ]);

  useEffect(() => {
    if (terminalInstance) {
      fitAddon.fit();

      const handleResize = () => fitAddon.fit();

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [terminalRef, terminalInstance]);

  return { ref: terminalRef, instance: terminalInstance };
}
