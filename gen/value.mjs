import {BinaryOp, Call, FourCC} from 'jass-to-ast'

export const NodeisPrimitive = node => node instanceof String || ['boolean', 'number', 'string'].indexOf(typeof node) >= 0

export const NodeRawToS = string =>
    string.charCodeAt(3) |
    string.charCodeAt(2) << 8 |
    string.charCodeAt(1) << 16 |
    string.charCodeAt(0) << 24

/**
 * @param s
 * @return {string}
 * @private
 */
export const NodePrimitive = s => s instanceof FourCC ? `${NodeRawToS(s)}` : s

/**
 * @param node
 * @return {string}
 * @private
 */
export const NodeArg = (node) => {
    if (NodeisPrimitive(node)) return NodePrimitive(node)
    if (node instanceof BinaryOp) return `${node.left}${node.operator}${node.right}`
    return node
}

/**
 * @param node
 * @return {string}
 * @private
 */
export const NodeValue = (node) => {
    if (NodeisPrimitive(node)) return NodePrimitive(node)
    if (node instanceof Call) {
        const args = []
        if (node.args) {
            for (const arg of node.args) {
                args.push(NodeArg(arg))
            }
        }
        return `${node.name}(${args.join(', ')})`
    }
    return node
}
