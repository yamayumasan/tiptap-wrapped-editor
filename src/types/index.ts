import type { Editor } from "@tiptap/vue-3";

export interface MenuConfig {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  heading?: boolean;
  bullet?: boolean;
  ordered?: boolean;
  code?: boolean;
  blockquote?: boolean;
  link?: boolean;
  highlight?: boolean;
  image?: boolean;
}

export interface EditorProps {
  content?: string;
  placeholder?: string;
  editable?: boolean;
  menuConfig?: MenuConfig;
  autofocus?: boolean | "start" | "end" | number;
}

export interface EditorEmits {
  (e: "update:content", content: string): void;
  (e: "ready", editor: Editor): void;
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
}
