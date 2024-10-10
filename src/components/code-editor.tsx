import { cn } from "@/lib/utils";
import { StreamLanguage } from "@codemirror/language";
import { properties } from "@codemirror/legacy-modes/mode/properties";
import { yaml } from "@codemirror/lang-yaml";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import type { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";

interface Props extends ReactCodeMirrorProps {
  wrapperClassName?: string;
  disabled?: boolean;
  language?: "yaml" | "properties";
}

export function CodeEditor({
  className,
  wrapperClassName,
  language = "yaml",
  editable,
  ...props
}: Props) {
  const { theme } = useTheme();

  const extensions =
    language === "yaml" ? [yaml()] : [StreamLanguage.define(properties)];

  return (
    <div
      className={cn(
        "relative size-full min-h-40 overflow-auto rounded-md border",
        wrapperClassName,
      )}
    >
      <CodeMirror
        basicSetup={{
          lineNumbers: editable,
          foldGutter: editable,
          highlightSelectionMatches: editable,
          allowMultipleSelections: editable,
        }}
        theme={theme === "dark" ? githubDark : githubLight}
        height="100%"
        width="100%"
        extensions={extensions}
        lang={language}
        editable={editable}
        {...props}
        className={cn("size-full text-sm leading-relaxed", className)}
      />
    </div>
  );
}
