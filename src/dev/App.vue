<script setup lang="ts">
import { ref } from "vue";
import Editor from "@/components/Editor/Editor.vue";

const content = ref("<p>Hello World! 🌍</p>");
const activeTab = ref("editor");

const onEditorReady = (editor: any) => {
  console.log("Editor is ready!", editor);
};

const editorRef = ref(null);
</script>

<template>
  <div class="app">
    <!-- タブヘッダー -->
    <div class="tab-header">
      <button
        :class="{ active: activeTab === 'editor' }"
        @click="activeTab = 'editor'"
      >
        Editor
      </button>
      <button
        :class="{ active: activeTab === 'output' }"
        @click="activeTab = 'output'"
      >
        Output
      </button>
    </div>

    <!-- タブコンテンツ -->
    <div class="tab-content">
      <!-- エディタタブ -->
      <div v-if="activeTab === 'editor'" class="editor-container">
        <Editor
          ref="editorRef"
          v-model:content="content"
          @ready="onEditorReady"
        />
      </div>
      <!-- 出力タブ -->
      <div v-if="activeTab === 'output'" class="output-container">
        <h2>Output HTML</h2>
        <pre>{{ editorRef.htmlContent }}</pre>
        <h2>Output Json</h2>
        <pre>{{ editorRef.editorJSContent }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
/* 画面全体を使用するレイアウト */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

/* タブヘッダーのスタイル */
.tab-header {
  display: flex;
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.tab-header button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
}

.tab-header button.active {
  background: #ddd;
  font-weight: bold;
}

/* タブコンテンツエリア */
.tab-content {
  flex: 1;
  overflow: auto;
}

/* 各タブのコンテナ */
.editor-container,
.output-container {
  height: 100%;
  padding: 1rem;
}

/* 出力タブの背景 */
.output-container {
  background: #f5f5f5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
