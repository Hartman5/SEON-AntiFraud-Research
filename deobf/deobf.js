const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const t = require("@babel/types")

const fs = require("fs")

const code = fs.readFileSync("./input.js", "utf-8")

const ast = parser.parse(code)

const Deobfuscator = {
    VariableDeclaration(path) {
        const {declarations} = path.node

        if (
            declarations.length == 1 &&
            t.isArrayExpression(declarations[0].init) &&
            declarations[0].init.elements.every(el => t.isStringLiteral(el))
        ) {
            console.log("Found stringarray: ", declarations[0].id.name)

            const stringArrayName = declarations[0].id.name
            const stringArrayElements = declarations[0].init.elements

            const binding = path.scope.getBinding(stringArrayName)
            if (!binding || !binding.constant) return;


            let canRemoveArray = true
            binding.referencePaths.forEach(refPath => {
                const parent = refPath.parentPath

                if (
                    parent.isMemberExpression() &&
                    parent.node.object == refPath.node &&
                    t.isNumericLiteral(parent.node.property)
                ) {
                    const index = parent.node.property.value
                    const replacement = stringArrayElements[index]
                    parent.replaceWith(replacement)

                    console.log("replaced", replacement.value)
                } else {
                    canRemoveArray = false
                }
            })

            if (canRemoveArray) path.remove();
        }
    }
}

traverse(ast, Deobfuscator)

const {code: deobfCode} = generator(ast) 

fs.writeFileSync("output.js", deobfCode)