<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref } from "vue";
import { Editor } from "@tiptap/vue-3";
import MenuButton from "./MenuButton.vue";
import type { MenuConfig } from "@/types";

const props = defineProps<{
  editor: Editor;
  menuConfig: MenuConfig;
}>();

// キーボード高さを保持する reactive 変数
const keyboardHeight = ref(0);

// VisualViewport を用いて正確なキーボード高さを算出
const updateKeyboardHeight = () => {
  if (window.visualViewport) {
    // visualViewport.offsetTop も考慮することで、スクロール分なども補正
    const heightDifference =
      window.innerHeight -
      window.visualViewport.height -
      window.visualViewport.offsetTop;
    keyboardHeight.value = heightDifference > 0 ? heightDifference : 0;
    // CSS変数としても設定（必要に応じて）
    document.documentElement.style.setProperty(
      "--keyboard-height",
      `${keyboardHeight.value}px`
    );
  }
};

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateKeyboardHeight);
    window.visualViewport.addEventListener("scroll", updateKeyboardHeight);
    updateKeyboardHeight();
  }
});

onBeforeUnmount(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", updateKeyboardHeight);
    window.visualViewport.removeEventListener("scroll", updateKeyboardHeight);
  }
});

// computed でインラインスタイル用の bottom プロパティを作成
const menuBarStyle = computed(() => ({
  bottom: `${keyboardHeight.value}px`,
}));
const setLink = () => {
  const previousUrl = props.editor.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === "") {
    props.editor.chain().focus().extendMarkRange("link").unsetLink().run();

    return;
  }

  // update link
  props.editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

const addImage = () => {
  const url = window.prompt("Image URL:");
  if (url) {
    props.editor.chain().focus().setImage({ src: url }).run();
  }
};
</script>

<template>
  <div class="editor-menu-bar" :style="menuBarStyle">
    <div v-if="menuConfig.heading" class="editor-menu-group">
      <menu-button
        v-for="level in [1, 2, 3]"
        :key="level"
        :is-active="editor.isActive('heading', { level })"
        :onClick="() => editor.chain().focus().toggleHeading({ level }).run()"
      >
        H{{ level }}
      </menu-button>
    </div>

    <menu-button
      v-if="menuConfig.link"
      :is-active="editor.isActive('link')"
      :onClick="
        () => {
          setLink();
        }
      "
    >
      <i class="fa-solid fa-link"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.bold"
      :is-active="editor.isActive('bold')"
      :onClick="() => editor.chain().focus().toggleBold().run()"
    >
      <i class="fa-solid fa-bold"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.italic"
      :is-active="editor.isActive('italic')"
      :onClick="() => editor.chain().focus().toggleItalic().run()"
    >
      <i class="fa-solid fa-italic"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.strike"
      :is-active="editor.isActive('strike')"
      :onClick="() => editor.chain().focus().toggleStrike().run()"
    >
      <i class="fa-solid fa-strikethrough"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.bullet"
      :is-active="editor.isActive('bulletList')"
      :onClick="() => editor.chain().focus().toggleBulletList().run()"
    >
      <i class="fa-solid fa-list-ul"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.ordered"
      :is-active="editor.isActive('orderedList')"
      :onClick="() => editor.chain().focus().toggleOrderedList().run()"
    >
      <i class="fa-solid fa-list-ol"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.highlight"
      :is-active="editor.isActive('highlight')"
      :onClick="() => editor.chain().focus().toggleHighlight().run()"
    >
      <i class="fa-solid fa-highlighter"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.blockquote"
      :is-active="editor.isActive('blockquote')"
      :onClick="() => editor.chain().focus().toggleBlockquote().run()"
    >
      <i class="fa-solid fa-quote-left"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.code"
      :is-active="editor.isActive('code')"
      :onClick="() => editor.chain().focus().toggleCode().run()"
    >
      <i class="fa-solid fa-code"></i>
    </menu-button>

    <menu-button
      v-if="menuConfig.image"
      :onClick="
        () => {
          const url = window.prompt('Image URL:');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }
      "
    >
      <i class="fa-solid fa-image"></i>
    </menu-button>
  </div>
</template>

<style lang="scss" scoped>
.editor-menu-bar {
  padding: 0.5rem;
  border-bottom: 1px solid var(--editor-border-color);
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  background-color: white;
  transition: bottom 0.3s ease; // 位置変化をスムーズに

  // スマホレイアウト用
  @media (max-width: 600px) {
    position: fixed;
    left: 0;
    right: 0;
    flex-wrap: nowrap;
    overflow-x: auto;
    background-color: white;
    /* iOS のセーフエリア対応も考慮 */
    padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom, 0));
    z-index: 1000;
  }

  .editor-menu-group {
    display: flex;
    gap: 0.25rem;
    :deep(.editor-menu-button) {
      color: black;
    }
  }
}
</style>
