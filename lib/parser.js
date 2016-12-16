'use strict'

const treeAdapter = require('parse5').treeAdapters.default

const _defaultOpts = {
	nSpace: 2,
	ignoreBody: true,
	allowEmptyAttribute: true
}

class Parser {


	constructor(root, opts = _defaultOpts) {
		this.root = root
		this.opts = opts
		this.pug = ''

		this._spacesOrTab = isNaN(opts.nSpace) ? '\t' : ' '.repeat(parseInt(opts.nSpace))
	}

	parse() {
		return new Promise((yep, nope) => {
			const walk = this.walk(this.root.childNodes, 0)
			let it

			do {
				it = walk.next()
			} while (!it.done)

			yep(this.pug.substring(1))
		})
	}

	/**
	 * DOM tree traversal
	 * Depth-first search (pre-order)
	 *
	 * @param {DOM} tree - DOM tree or Node
	 * @param {Number} level - Current tree level
	 */
	*
	walk(tree, level) {
		if (!tree) return

		for (let i = 0; i < tree.length; i++) {
			const node = tree[i]

			this.pug += `\n${this.parseNode(node, level)}`

			if (
				node.childNodes &&
				node.childNodes.length > 0 &&
				!this.isUniqueTextNode(node)
			) {
				yield* this.walk(node.childNodes, level + 1)
			}
		}
	}

	parseNode(node, level) {
			const indentation = this._spacesOrTab.repeat(level)

			if (treeAdapter.isDocumentTypeNode(node)) return `${indentation}doctype html`

			if (treeAdapter.isTextNode(node)) return `${indentation}| ${node.value}`

			if (treeAdapter.isCommentNode(node))
				return `${node.data.split('\n').map(l => `${indentation}//${l}`).join('\n')}`

		if (treeAdapter.isElementNode(node)) {
			let line = `${indentation}${this.setAttributes(node)}`

			if (this.isUniqueTextNode(node))
				line += ` ${node.childNodes[0].value}`

			return line
		}

		return node
	}

	setAttributes(node) {
		let str = node.tagName === 'div' ? '' : node.tagName
		let attributes = []
		let classList = []

		// Adds #id and .class
		if (node.id) str += `#${node.id}`

		for (let a = 0; a < node.attrs.length; a++) {
			const attr = node.attrs[a]

			switch (attr.name) {
				case undefined:
				case 'id':
				case 'class':
					classList = attr.value.split(' ')
					break
				default:
					const attVal = this.opts.allowEmptyAttribute && !attr.value ? `${attr.name}` : `${attr.name}='${attr.value}'`
					attributes.push(attVal)
					break
			}
		}

		if (classList.length) str += `.${classList.join('.')}`
		if (attributes.length) str += `(${attributes.join(', ')})`

		return str
	}

	// Identify Node type
	is(type, node) {
		return (node.nodeName === type)
	}

	isUniqueTextNode(node) {
		return node.childNodes.length === 1 && treeAdapter.isTextNode(node.childNodes[0])
	}
}

module.exports = Parser