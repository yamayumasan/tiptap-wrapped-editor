import { Node, mergeAttributes } from "@tiptap/core";

export interface CustomImageBlockOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImageBlock: {
      setCustomImageBlock: (options: {
        src: string;
        columns: number;
      }) => ReturnType;
      toggleColumns: () => ReturnType;
    };
  }
}

export const CustomImageBlock = Node.create<CustomImageBlockOptions>({
  name: "customImageBlock",

  group: "block",

  content: "inline*",

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      columns: {
        default: 1,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-image-block"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "custom-image-block",
        class: `custom-image-block columns-${node.attrs.columns}`,
      }),
      [
        "img",
        {
          src: node.attrs.src,
          alt: "Custom Image",
          style: "max-width: 100%; display: block;",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setCustomImageBlock:
        ({ src, columns }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src, columns },
          });
        },
      toggleColumns:
        () =>
        ({ state, commands }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);

          if (node && node.type.name === this.name) {
            const currentColumns = node.attrs.columns;
            const newColumns = currentColumns === 1 ? 3 : 1;
            return commands.updateAttributes(this.name, {
              columns: newColumns,
            });
          }

          return false;
        },
    };
  },
});
