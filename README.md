# Tiptap Wrap Test

This library provides a rich text editor component built with Vue 3 and Tiptap. It includes features for editing and converting content between HTML and EditorJS formats.

## Features

- Rich text editing with support for various formatting options.
- Conversion between HTML and EditorJS data formats.
- Customizable menu bar for editor controls.
- Placeholder support for empty editor content.
- Image handling with customizable attributes.

## Components

### Editor.vue

The `Editor.vue` component is the core of this library. It integrates Tiptap with Vue 3 to provide a rich text editing experience.

#### Props

- `content`: Initial content for the editor. Can be a string or EditorJS data.
- `placeholder`: Placeholder text for the editor when empty.
- `editable`: Boolean to toggle editability of the editor.
- `menuConfig`: Configuration object for enabling/disabling menu options.
- `autofocus`: Boolean or position to autofocus the editor on load.

#### Emits

- `update:content`: Emits the content in EditorJS format whenever the editor content changes.
- `ready`: Emits the editor instance when it is ready.
- `focus`: Emits a focus event when the editor gains focus.
- `blur`: Emits a blur event when the editor loses focus.

#### Conversion Functions

- `convertHTMLToEditorJS(html: string): EditorJSData`: Converts HTML content to EditorJS format.
- `convertEditorJSToHTML(data: EditorJSData): string`: Converts EditorJS data to HTML content.

### Data Conversion

The `DataConverter` class in `src/core/converter.ts` handles the conversion between Tiptap JSON and EditorJS formats. It provides static methods to convert content in both directions.

#### EditorJS to Tiptap

- Converts EditorJS blocks to Tiptap JSON nodes.
- Supports paragraph, header, list, and image blocks.

#### Tiptap to EditorJS

- Converts Tiptap JSON nodes to EditorJS blocks.
- Processes document, paragraph, heading, list, and image nodes.

## Styling

The editor is styled using SCSS in `Editor.vue`. It includes styles for the editor container, content, and various elements like headings, lists, blockquotes, and images.

## Usage

To use this library, import the `Editor.vue` component and include it in your Vue application. Configure the props and listen to the emitted events to handle content updates and editor interactions.

## External Data Output

The editor supports outputting data in EditorJS format, which is a JSON structure suitable for use with EditorJS. This allows for easy integration with systems that require structured content data.

## License

This project is licensed under the MIT License.
