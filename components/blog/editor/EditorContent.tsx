"use client";

import { EditorContent as TiptapEditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

type Props = {
  editor: Editor;
};

export default function EditorContent({ editor }: Props) {
  return (
    <div className="relative bg-gradient-to-b from-white to-slate-50/30">
      <TiptapEditorContent
        editor={editor}
        className="
          min-h-[800px]
          px-10
          py-10
          
          [&_.ProseMirror]:prose
          [&_.ProseMirror]:prose-slate
          [&_.ProseMirror]:prose-xl
          [&_.ProseMirror]:max-w-none
          [&_.ProseMirror]:space-y-6
          [&_.ProseMirror]:font-serif
          [&_.ProseMirror]:text-slate-800

          [&_.ProseMirror_h1]:scroll-mt-24
          [&_.ProseMirror_h1]:text-4xl
          [&_.ProseMirror_h1]:font-bold
          [&_.ProseMirror_h1]:tracking-tight
          [&_.ProseMirror_h1]:text-slate-900
          [&_.ProseMirror_h1]:mt-10
          [&_.ProseMirror_h1]:mb-6

          [&_.ProseMirror_h2]:scroll-mt-24
          [&_.ProseMirror_h2]:text-3xl
          [&_.ProseMirror_h2]:font-semibold
          [&_.ProseMirror_h2]:tracking-tight
          [&_.ProseMirror_h2]:text-slate-800
          [&_.ProseMirror_h2]:mt-8
          [&_.ProseMirror_h2]:mb-4

          [&_.ProseMirror_h3]:scroll-mt-24
          [&_.ProseMirror_h3]:text-2xl
          [&_.ProseMirror_h3]:font-semibold
          [&_.ProseMirror_h3]:text-slate-800
          [&_.ProseMirror_h3]:mt-6
          [&_.ProseMirror_h3]:mb-3

          [&_.ProseMirror_h4]:scroll-mt-24
          [&_.ProseMirror_h4]:text-xl
          [&_.ProseMirror_h4]:font-medium
          [&_.ProseMirror_h4]:text-slate-700
          [&_.ProseMirror_h4]:mt-5
          [&_.ProseMirror_h4]:mb-2

          [&_.ProseMirror_p]:text-slate-700
          [&_.ProseMirror_p]:leading-8
          [&_.ProseMirror_p]:text-lg
          [&_.ProseMirror_p]:my-4

          [&_.ProseMirror_a]:text-amber-600
          [&_.ProseMirror_a]:no-underline
          [&_.ProseMirror_a]:font-medium
          hover:[&_.ProseMirror_a]:underline
          hover:[&_.ProseMirror_a]:text-amber-700

          [&_.ProseMirror_strong]:text-slate-900
          [&_.ProseMirror_strong]:font-semibold

          [&_.ProseMirror_em]:text-slate-700
          [&_.ProseMirror_em]:italic

          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:pl-8
          [&_.ProseMirror_ul]:my-4
          
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:pl-8
          [&_.ProseMirror_ol]:my-4
          
          [&_.ProseMirror_li]:my-2
          [&_.ProseMirror_li]:text-lg

          [&_.ProseMirror_ul[data-type='taskList']]:list-none
          [&_.ProseMirror_ul[data-type='taskList']]:pl-0

          [&_.ProseMirror_pre]:rounded-xl
          [&_.ProseMirror_pre]:border
          [&_.ProseMirror_pre]:border-slate-800
          [&_.ProseMirror_pre]:bg-slate-950
          [&_.ProseMirror_pre]:p-6
          [&_.ProseMirror_pre]:my-6
          [&_.ProseMirror_pre]:overflow-x-auto
          
          [&_.ProseMirror_pre_code]:bg-transparent
          [&_.ProseMirror_pre_code]:p-0
          [&_.ProseMirror_pre_code]:text-sm

          [&_.ProseMirror_blockquote]:border-l-4
          [&_.ProseMirror_blockquote]:border-amber-500
          [&_.ProseMirror_blockquote]:bg-amber-50/50
          [&_.ProseMirror_blockquote]:py-4
          [&_.ProseMirror_blockquote]:pl-6
          [&_.ProseMirror_blockquote]:pr-4
          [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_blockquote]:my-6
          [&_.ProseMirror_blockquote]:rounded-r-lg

          [&_.ProseMirror_img]:rounded-xl
          [&_.ProseMirror_img]:shadow-xl
          [&_.ProseMirror_img]:mx-auto
          [&_.ProseMirror_img]:my-8
          [&_.ProseMirror_img]:max-w-full

          [&_.ProseMirror_.tableWrapper]:overflow-x-auto
          [&_.ProseMirror_.tableWrapper]:my-6
          [&_.ProseMirror_.tableWrapper]:max-w-full
          [&_.ProseMirror_table]:w-full
          [&_.ProseMirror_table]:border-collapse
          [&_.ProseMirror_table]:my-0
          [&_.ProseMirror_table]:overflow-hidden
          [&_.ProseMirror_table]:rounded-xl
          [&_.ProseMirror_table]:shadow-sm

          [&_.ProseMirror_th]:border
          [&_.ProseMirror_th]:border-slate-200
          [&_.ProseMirror_th]:bg-slate-100
          [&_.ProseMirror_th]:p-4
          [&_.ProseMirror_th]:text-left
          [&_.ProseMirror_th]:font-semibold
          [&_.ProseMirror_th]:text-slate-800

          [&_.ProseMirror_td]:border
          [&_.ProseMirror_td]:border-slate-200
          [&_.ProseMirror_td]:p-4
          [&_.ProseMirror_td]:text-slate-700

          [&_.ProseMirror_.is-editor-empty::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_.is-editor-empty::before]:text-slate-400
          [&_.ProseMirror_.is-editor-empty::before]:float-left
          [&_.ProseMirror_.is-editor-empty::before]:pointer-events-none
          [&_.ProseMirror_.is-editor-empty::before]:h-0
          [&_.ProseMirror_.is-editor-empty::before]:text-xl
          [&_.ProseMirror_.is-editor-empty::before]:italic

          [&_.ProseMirror_.is-empty::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_.is-empty::before]:text-slate-400
          [&_.ProseMirror_.is-empty::before]:float-left
          [&_.ProseMirror_.is-empty::before]:pointer-events-none
          [&_.ProseMirror_.is-empty::before]:h-0
          [&_.ProseMirror_.is-empty::before]:text-xl
          [&_.ProseMirror_.is-empty::before]:italic

          focus:outline-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:transition-all
          [&_.ProseMirror]:duration-200
        "
      />
    </div>
  );
}
