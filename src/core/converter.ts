import { generateUniqueId } from "./utils.ts";
import { JSONContent } from "@tiptap/vue-3";

export interface EditorJSBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface EditorJSData {
  time: number;
  blocks: EditorJSBlock[];
  version: string;
}

export class DataConverter {
  /**
   * Tiptap JSON を EditorJS 形式に変換
   */
  static tiptapToEditorJS(content: JSONContent): EditorJSData {
    const blocks: EditorJSBlock[] = [];

    function processNode(node: JSONContent): void {
      type Mark = { type: string; attrs?: Record<string, any> };
      type Child = { text?: string; marks?: Mark[] };
      switch (node.type) {
        case "doc":
          // docノードの子ノードを処理
          node.content?.forEach((child) => processNode(child));
          break;

        case "paragraph":
          const textContent = node.content
            ?.map((child: Child) => {
              let text = child.text || "";
              if (child.marks) {
                child.marks.forEach((mark: Mark) => {
                  switch (mark.type) {
                    case "bold":
                      text = `<strong>${text}</strong>`;
                      break;
                    case "italic":
                      text = `<em>${text}</em>`;
                      break;
                    case "strike":
                      text = `<s>${text}</s>`;
                      break;
                    case "link":
                      text = `<a href="${mark.attrs?.href}">${text}</a>`;
                      break;
                  }
                });
              }
              return text;
            })
            .join("");

          blocks.push({
            id: generateUniqueId(),
            type: "paragraph",
            data: {
              text: textContent,
            },
          });
          break;

        case "heading":
          blocks.push({
            id: generateUniqueId(),
            type: "header",
            data: {
              text: node.content?.[0]?.text || "",
              level: node.attrs?.level || 1,
            },
          });
          break;

        case "bulletList":
          blocks.push({
            id: generateUniqueId(),
            type: "list",
            data: {
              style: "unordered",
              items:
                node.content?.map(
                  (item) => item.content?.[0]?.content?.[0]?.text || ""
                ) || [],
            },
          });
          break;

        case "orderedList":
          blocks.push({
            id: generateUniqueId(),
            type: "list",
            data: {
              style: "ordered",
              items:
                node.content?.map(
                  (item) => item.content?.[0]?.content?.[0]?.text || ""
                ) || [],
            },
          });
          break;

        case "image":
          blocks.push({
            id: generateUniqueId(),
            type: "image",
            data: {
              url: node.attrs?.src || "",
              caption: node.attrs?.alt || "",
              withBorder: node.attrs?.withBorder || false,
              withBackground: node.attrs?.withBackground || false,
              stretched: node.attrs?.stretched || false,
            },
          });
          break;

        // 他のノードタイプも必要に応じて追加
      }
    }

    processNode(content);

    return {
      time: Date.now(),
      blocks,
      version: "2.30.6", // バージョンは適宜更新
    };
  }

  /**
   * EditorJS 形式を Tiptap JSON に変換
   */
  static editorJSToTiptap(data: EditorJSData): JSONContent {
    const content: JSONContent[] = data.blocks.map((block) => {
      switch (block.type) {
        case "paragraph":
          return {
            type: "paragraph",
            content: block.data.text
              ? [
                  {
                    type: "text",
                    text: block.data.text,
                  },
                ]
              : undefined,
          };

        case "header":
          return {
            type: "heading",
            attrs: { level: block.data.level },
            content: [
              {
                type: "text",
                text: block.data.text,
              },
            ],
          };

        case "list":
          const listType =
            block.data.style === "ordered" ? "orderedList" : "bulletList";
          return {
            type: listType,
            content: block.data.items.map((item) => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: item,
                    },
                  ],
                },
              ],
            })),
          };

        case "image":
          return {
            type: "image",
            attrs: {
              src: block.data.url,
              alt: block.data.caption,
              withBorder: block.data.withBorder,
              withBackground: block.data.withBackground,
              stretched: block.data.stretched,
            },
          };

        default:
          return {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "",
              },
            ],
          };
      }
    });

    return {
      type: "doc",
      content,
    };
  }
}
