<template>
  <button
    class="editor-menu-button"
    :class="{ 'is-active': isActive }"
    type="button"
    @click="onClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isActive?: boolean;
  onClick?: () => void;
}>();
</script>

<style lang="scss">
.editor-menu-button {
  padding: 0.5rem;
  border: 1px solid var(--editor-border-color);
  background: var(--editor-bg-color);
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;

  &:hover {
    background: var(--editor-hover-bg);
  }

  &.is-active {
    background: var(--editor-active-bg);
    border-color: var(--editor-active-border);
  }
}
</style>
