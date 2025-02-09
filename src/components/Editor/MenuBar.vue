<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { Editor } from "@tiptap/vue-3";
import MenuButton from "./MenuButton.vue";
import type { MenuConfig } from "@/types";

// props の定義
const props = defineProps<{
  editor: Editor;
  menuConfig: MenuConfig;
}>();

// VisualViewport を利用してキーボード高さを取得する処理（既存）
const keyboardHeight = ref(0);
const updateKeyboardHeight = () => {
  if (window.visualViewport) {
    const heightDifference =
      window.innerHeight -
      window.visualViewport.height -
      window.visualViewport.offsetTop;
    keyboardHeight.value = heightDifference > 0 ? heightDifference : 0;
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

const menuBarStyle = computed(() => ({
  bottom: `${keyboardHeight.value}px`,
}));

// 既存の setLink, addImage 等の関数はそのまま
const setLink = () => {
  const previousUrl = props.editor.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);
  if (url === null) return;
  if (url === "") {
    props.editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
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

// --- カスタム画像ブロック用の処理 ---
// カスタム画像ブロック用のドロップダウンの表示状態を管理
const showCustomImageDropdown = ref(false);

// 画像アイコンがクリックされたらドロップダウンを表示
const toggleCustomImageDropdown = () => {
  showCustomImageDropdown.value = !showCustomImageDropdown.value;
};

// ユーザーが列数を選択したときの処理
const selectCustomImageColumns = (columns: number) => {
  // まず画像 URL をプロンプトで入力させる
  const url = window.prompt("Custom Image URL:");
  if (url) {
    // カスタム画像ブロックの挿入コマンドを実行（CustomImageBlock 拡張で定義済みのコマンド）
    props.editor
      .chain()
      .focus()
      .setCustomImageBlock({ src: url, columns })
      .run();
  }
  // 選択後はドロップダウンを閉じる
  showCustomImageDropdown.value = false;
};

// ドロップダウン以外の部分（クリックで閉じるなど）の処理は必要に応じて追加可能
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
      :onClick="setLink"
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
      v-if="menuConfig.highlight"
      :is-active="editor.isActive('highlight')"
      :onClick="() => editor.chain().focus().toggleHighlight().run()"
    >
      <i class="fa-solid fa-highlighter"></i>
    </menu-button>

    <div class="custom-image-block-wrapper" style="position: relative">
      <menu-button
        v-if="menuConfig.customImageBlock"
        :onClick="toggleCustomImageDropdown"
      >
        <i class="fa-solid fa-image"></i>
      </menu-button>
      <div v-if="showCustomImageDropdown" class="custom-image-dropdown">
        <button @click="selectCustomImageColumns(1)">1列</button>
        <button @click="selectCustomImageColumns(2)">2列</button>
        <button @click="selectCustomImageColumns(3)">3列</button>
      </div>
    </div>

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
  </div>
</template>

<style lang="scss" scoped>
.editor-menu-bar {
  padding: 0.75rem; // パディングをやや拡大
  border-bottom: 1px solid var(--editor-border-color);
  display: flex;
  gap: 0.75rem; // 各メニュー間の間隔を広く
  align-items: center;
  flex-wrap: wrap;
  background-color: white;
  transition: bottom 0.3s ease;

  // スマホレイアウト用
  @media (max-width: 600px) {
    position: fixed;
    left: 0;
    right: 0;
    flex-wrap: nowrap;
    overflow-x: auto;
    background-color: white;
    padding: 0.75rem 0.75rem calc(0.75rem + env(safe-area-inset-bottom, 0));
    z-index: 1000;
  }

  .editor-menu-group {
    display: flex;
    gap: 0.5rem;
    :deep(.editor-menu-button) {
      color: black;
      font-size: 1rem; // アイコンサイズを大きく
      padding: 0.5rem 0.75rem; // クリック領域を拡大
    }
  }

  :deep(.editor-menu-button) {
    font-size: 1rem; // アイコンサイズを大きく
    padding: 0.5rem 0.75rem; // クリック領域を拡大
  }
}

/* カスタム画像ブロックのドロップダウン */
.custom-image-block-wrapper {
  position: relative;
}

.custom-image-dropdown {
  position: absolute;
  bottom: 100%; /* ボタンの上に表示 */
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: #fff;
  border: 1px solid var(--editor-border-color);
  border-radius: 4px;
  padding: 0.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.custom-image-dropdown button {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.custom-image-dropdown button:hover {
  background: var(--editor-hover-bg, #f0f0f0);
}
</style>
