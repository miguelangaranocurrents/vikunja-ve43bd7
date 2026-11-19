import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain text for the clipboard. ProseMirror's default flattens lists into bare lines,
// so list markers are kept here: bullets become "- " and ordered items "1. ".
function nodeToLines(node: ProseMirrorNode, indent: string): string[] {
	if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
		const lines: string[] = []
		let index = 1
		node.forEach((item) => {
			let marker = '- '
			if (node.type.name === 'orderedList') {
				marker = `${index}. `
			}
			index++
			const itemLines = listItemToLines(item)
			itemLines.forEach((line, i) => {
				if (i === 0) {
					lines.push(`${indent}${marker}${line}`)
				} else {
					lines.push(`${indent}${' '.repeat(marker.length)}${line}`)
				}
			})
		})
		return lines
	}

	if (node.isTextblock || node.isText) {
		return node.textContent.split('\n').map(line => `${indent}${line}`)
	}

	const lines: string[] = []
	node.forEach((child) => {
		lines.push(...nodeToLines(child, indent))
	})
	return lines
}

// Returns the lines of a list item without its marker. Nested lists stay indented.
function listItemToLines(item: ProseMirrorNode): string[] {
	const lines: string[] = []
	item.forEach((child) => {
		if (child.type.name === 'bulletList' || child.type.name === 'orderedList' || child.type.name === 'taskList') {
			lines.push(...nodeToLines(child, '  '))
		} else {
			lines.push(...nodeToLines(child, ''))
		}
	})
	return lines
}

export function serializeSliceToText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach((node) => {
		lines.push(...nodeToLines(node, ''))
	})
	return lines.join('\n')
}
