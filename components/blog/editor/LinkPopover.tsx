"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Link2, Trash2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type LinkPopoverProps = {
  editor: Editor;
};

export default function LinkPopover({
  editor,
}: LinkPopoverProps) {
  const [open, setOpen] = useState(false);

  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;

    const previous =
      editor.getAttributes("link").href ?? "";

    setUrl(previous);
  }, [open, editor]);

  function normalizeUrl(value: string) {
    const trimmed = value.trim();

    if (!trimmed) return "";

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  function saveLink() {
    const href = normalizeUrl(url);

    if (!href) {
      editor.chain().focus().unsetLink().run();
      setOpen(false);
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href,
        target: "_blank",
        rel: "noopener noreferrer",
      })
      .run();

    setOpen(false);
  }

  function removeLink() {
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .run();

    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevents losing focus on editor
          variant={
            editor.isActive("link")
              ? "default"
              : "ghost"
          }
          size="icon"
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 space-y-4"
        align="start"
      >
        <div>
          <h3 className="font-semibold">
            Insert Link
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Add or edit a hyperlink.
          </p>
        </div>

        <Input
          placeholder="https://example.com"
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveLink();
            }
          }}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevents losing focus on editor
            size="sm"
            className="text-xs transition-colors"
            variant="destructive"
            onClick={removeLink}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>

          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevents losing focus on editor
            onClick={saveLink}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Save Link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}