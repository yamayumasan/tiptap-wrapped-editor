<script setup lang="ts">
import { ref, onBeforeUnmount, watch, defineExpose, computed } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "./MenuBar.vue";
import { DataConverter } from "@/core/converter";
import type { EditorProps, EditorEmits } from "@/types";
import type { EditorJSData } from "@/core/converter";

const props = withDefaults(defineProps<EditorProps>(), {
  content: "",
  placeholder: "Write something...",
  editable: true,
  menuConfig: () => ({
    bold: true,
    italic: true,
    strike: true,
    heading: true,
    bullet: true,
    ordered: true,
    link: true,
    highlight: true,
  }),
  autofocus: false,
});

const emit = defineEmits<EditorEmits>();

const editor = ref<Editor | null>(null);

// HTMLコンテンツをEditorJS形式に変換する関数
const convertHTMLToEditorJS = (html: string): EditorJSData => {
  const tempEditor = new Editor({
    extensions: [
      StarterKit.configure({}),
      Link.configure({
        openOnClick: false,
        defaultProtocol: "https",
      }),
      Highlight.configure({}),
    ],
    content: html,
  });
  const json = tempEditor.getJSON();
  tempEditor.destroy();
  console.log(json);
  return DataConverter.tiptapToEditorJS(json);
};

// EditorJS形式のデータをHTMLに変換する関数
const convertEditorJSToHTML = (data: EditorJSData): string => {
  const tiptapJSON = DataConverter.editorJSToTiptap(data);
  const tempEditor = new Editor({
    extensions: [StarterKit.configure({})], // 空の設定オブジェクトを使用
    content: tiptapJSON,
  });
  const html = tempEditor.getHTML();
  tempEditor.destroy();
  return html;
};

const htmlContent = ref("");
const editorJSContent = ref<EditorJSData | null>(null);

const content = computed(() => {
  if (typeof props.content === "string") {
    return props.content;
  }
  return convertEditorJSToHTML(props.content as EditorJSData);
});

editor.value = new Editor({
  extensions: [
    StarterKit.configure({
      bulletList: {},
      orderedList: {},
      heading: {
        levels: [1, 2, 3],
      },
      bold: {},
      italic: {},
      strike: {},
      underline: {},
      link: {},
      highlight: {},
    }),
    Link.configure({
      openOnClick: false,
      defaultProtocol: "https",
    }),
    Image.configure({
      inline: true,
      HTMLAttributes: {
        class: "editor-image",
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Highlight.configure({}),
  ],
  content: content.value,
  editable: props.editable,
  autofocus: props.autofocus,
  onUpdate: ({ editor }: { editor: Editor }) => {
    htmlContent.value = editor.getHTML();
    editorJSContent.value = convertHTMLToEditorJS(htmlContent.value);
  },
  onFocus: (event: FocusEvent) => {
    emit("focus", event);
  },
  onBlur: (event: FocusEvent) => {
    emit("blur", event);
  },
});

defineExpose({
  htmlContent,
  editorJSContent,
});

watch(
  () => props.content,
  (newContent) => {
    if (!editor.value) return;

    const currentHTML = editor.value.getHTML();
    let newHTML: string;

    if (typeof newContent === "string") {
      newHTML = newContent;
    } else {
      newHTML = convertEditorJSToHTML(newContent as EditorJSData);
    }

    const isSame = currentHTML === newHTML;
    if (!isSame) {
      editor.value.commands.setContent(newHTML, false);
    }
  }
);

watch(
  () => props.editable,
  (newEditable) => {
    if (editor.value) {
      editor.value.setEditable(newEditable);
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div class="tiptap-editor" :class="{ 'is-disabled': !editable }">
    <menu-bar
      v-if="editor && editable"
      :editor="editor"
      :menu-config="menuConfig"
    />
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<style lang="scss">
.tiptap-editor {
  border: 1px solid var(--editor-border-color);
  border-radius: 4px;
  background: var(--editor-bg-color);

  &.is-disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .editor-content {
    min-height: 500px !important;

    &:focus {
      outline: none;
    }

    p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    > * + * {
      margin-top: 0.75em;
    }

    ul,
    ol {
      padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.2;
      margin-top: 1em;
      margin-bottom: 0.5em;
    }

    blockquote {
      border-left: 3px solid var(--editor-border-color);
      margin-left: 1rem;
      padding-left: 1rem;
      color: #666;
    }

    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }

    .editor-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1rem 0;

      &.ProseMirror-selectednode {
        outline: 2px solid #68cef8;
      }
    }

    a {
      color: #0066cc;
      text-decoration: underline;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
