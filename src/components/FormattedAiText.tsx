"use client";

import React from "react";

interface FormattedAiTextProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and strips stray asterisks.
 */
export function formatAiInline(text: string, isUser = false): React.ReactNode {
  if (!text) return "";

  // Split by bold (**...**), inline code (`...`), or italic (*...*)
  const tokens = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g);

  return tokens.map((token, idx) => {
    // Bold: **text**
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      const boldText = token.slice(2, -2);
      return (
        <strong
          key={idx}
          className={`font-extrabold ${isUser ? "text-white" : "text-[#083328] dark:text-[#A3F03A]"}`}
        >
          {boldText}
        </strong>
      );
    }

    // Code: `text`
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      const codeText = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px]"
        >
          {codeText}
        </code>
      );
    }

    // Italic: *text*
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      const italicText = token.slice(1, -1);
      return (
        <em key={idx} className="italic opacity-90">
          {italicText}
        </em>
      );
    }

    // Normal text: strip any stray double asterisks that weren't closed
    const cleanText = token.replace(/\*\*/g, "").replace(/\*/g, "");
    return <span key={idx}>{cleanText}</span>;
  });
}

/**
 * Strips raw asterisks completely for simple single-line text (e.g. badges, alerts).
 */
export function cleanAiText(text: string): string {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

/**
 * Rich AI text renderer supporting paragraphs, bullet points, numbers, and clean bold typography.
 */
export function FormattedAiText({ content, className = "", isUser = false }: FormattedAiTextProps) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className={`space-y-1.5 leading-relaxed text-sm ${className}`}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        // Empty line -> spacer
        if (!line) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading: ### or ##
        if (line.startsWith("### ") || line.startsWith("## ")) {
          const headingText = line.replace(/^#{2,3}\s+/, "");
          return (
            <h4
              key={idx}
              className={`font-extrabold text-[13px] tracking-tight mt-2 mb-1 uppercase ${
                isUser ? "text-white" : "text-[#083328] dark:text-[#A3F03A]"
              }`}
            >
              {formatAiInline(headingText, isUser)}
            </h4>
          );
        }

        // Bullet point: * or - or •
        if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
          const bulletText = line.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${
                  isUser ? "bg-white/80" : "bg-[#083328] dark:bg-[#A3F03A]"
                }`}
              />
              <div className="flex-1 text-inherit">
                {formatAiInline(bulletText, isUser)}
              </div>
            </div>
          );
        }

        // Numbered list: e.g. "1. " or "2. "
        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const num = numMatch[1];
          const text = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1">
              <span
                className={`text-[11px] font-extrabold shrink-0 mt-0.5 ${
                  isUser ? "text-white/80" : "text-[#083328] dark:text-[#A3F03A]"
                }`}
              >
                {num}.
              </span>
              <div className="flex-1 text-inherit">
                {formatAiInline(text, isUser)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="my-0.5">
            {formatAiInline(line, isUser)}
          </p>
        );
      })}
    </div>
  );
}

