import * as fs from 'fs'
import * as path from 'node:path'
import Database from 'better-sqlite3'
import parse, {Globals, Native, Type, Variable} from 'jass-to-ast'
import {NodeValue} from './value.mjs'

const read = p => fs.readFileSync(p, {encoding: 'utf8', flag: 'r'}).replace(/\r\n/g, '\n')

const teshPath = path.join('..', 'tesh_keywords.db')
fs.copyFileSync(path.join('sdk', 'tesh_keywords.db'), teshPath)

const orig = parse(read(path.join('sdk', 'common.vanilla.j')))
const ujapi = parse(read(path.join('sdk', 'common.j')))

// orig
const mapOrig = {}

for (const node of orig) {
    if (node instanceof Globals) {
        for (const variable of node.globals) {
            if (!(variable instanceof Variable)) continue
            mapOrig[variable.name] = true
        }
    }

    if (node instanceof Type) {
        mapOrig[node.base] = true
    }


    if (node instanceof Native) {
        if (node.name.startsWith('Blz')) continue
        mapOrig[node.name] = true
    }
}

// db
const db = new Database(teshPath, {
    fileMustExist: true,
    //verbose: console.log,
})
const st = db.prepare('insert into main.keywords (keyword_type, name, calltip, description) values (@type, @name, @calltip, @description)')

const error = []

const insert = (type, name, calltip, description) => {
    const mx = 49
    if (name.length > mx) {
        error.push(`(${name.length})${name}`)
        name = name.substring(0, mx)
    }
    return st.run({
            type: type,
            name: name,
            calltip: calltip,
            description: description
        }
    )
}


// ujapi
for (const node of ujapi) {
    if (node instanceof Globals) {
        for (const variable of node.globals) {
            if (!(variable instanceof Variable)) continue
            if (mapOrig[variable.name]) continue

            if (variable.constant) {
                insert(
                    variable.name.startsWith('EVENT_') ? 'EVENT' : 'CONSTANT',
                    variable.name,
                    variable.name,
                    `/*UjAPI*/ constant ${variable.type} ${variable.name} = ${NodeValue(variable.value)}`
                )
            }
        }
    }

    if (node instanceof Type) {
        if (mapOrig[node.base]) continue
        let description = `/*UjAPI*/ type ${node.base} extends ${node.super}`
        // noinspection JSUnresolvedReference
        if (node.comment) {
            description += ` //${node.comment.trim()}`
        }
        insert('NATIVE_TYPE', node.base, '', description)
    }

    if (node instanceof Native) {
        if (node.name.startsWith('Blz')) continue
        if (mapOrig[node.name]) continue

        let calltip = ''
        let description = `/*UjAPI*/ native ${node.name} takes `
        if (node.params) {
            const list = []
            for (const p of node.params) {
                list.push(`${p.type} ${p.name}`)
            }
            const join = list.join(', ')
            calltip += `(${join})`
            description += join
        } else {
            calltip = '(nothing)'
            description += 'nothing'
        }
        const returns = ` returns ${node.returns ?? 'nothing'}`
        calltip += returns
        description += returns

        insert('NATIVE_FUNCTION', node.name, calltip, description)

    }
}

// close
db.close()
console.log(error)
