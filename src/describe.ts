import { InterfaceDeclaration, Project, MethodSignature, ParameterDeclaration, Type, PropertySignature, TypeGuards } from "ts-morph"
import * as yaml from "write-yaml"

import * as fs from "fs"
import { OperationDescription } from "./operation"

const descriptionFile = "./openapi-example/api-description.json"
const outputFile = "./api.yaml"

function loadProject() {
    const project = new Project({
        tsConfigFilePath: "./openapi-example/tsconfig.json"
    })

    const diagnostics = project.getPreEmitDiagnostics()

    if (diagnostics.length > 0) {
        console.log("Can't generate API description - compilation failed.")
        console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))
        process.exit(1)
    }

    return project
}

function describeInterface(i: InterfaceDeclaration, prefix = ""): { paths, definitions } {
    let paths = {}
    let definitions = {}

    for (const method of i.getMethods()) {
        const d = new OperationDescription(method.getName())

        paths[prefix + d.getUrl()] = {
            [d.getMethod().toLowerCase()]: describeOperation(method, d)
        }
    }

    for (const prop of i.getProperties()) {
        const type = prop.getTypeNodeOrThrow().getType()

        if (type.isInterface()) {
            const declaration = type.getSymbolOrThrow().getDeclarations()[0]

            const nested = describeInterface(declaration as InterfaceDeclaration, "/" + prop.getName())

            paths = {
                ...paths,
                ...nested.paths,
            }

            definitions = {
                ...definitions,
                ...nested.definitions,
            }
        } else {
            console.warn(`Unsupported property type`, { prop: prop.getName(), type: type.getText() })
        }
    }

    return { paths, definitions }
}

function schema(type: Type) {
    if (!type) return {}

    if (type.isObject()) return objectSchema(type)

    if (type.isString()) return { type: "string" }
    if (type.isNumber()) return { type: "number" }

    console.warn(`Unsupported type ${ type.getText() }`)
    return undefined
}

function objectSchema(type: Type) {
    // TODO if named - generate reference
    // otherwise, generate in-place schema

    const properties = {
    }

    for (const prop of type.getProperties()) {
        // case 1: typed value declaration (TODO may be replace with getSymbol.getDeclarations()?)
        if (prop.getValueDeclaration()) {
            const propertySignature = prop.getValueDeclaration() as PropertySignature

            if (propertySignature.getType()) {
                properties[prop.getName()] = {
                    ...schema(propertySignature.getType())
                }
            } else {
                console.warn(`Unable to get type for property ${ prop.getName() }`)
            }
        } else {
            properties[prop.getName()] = {}
        }
    }

    return {
        type: "object",
        properties
    }
}

function requestBody(method: MethodSignature) {
    const params = method.getParameters()
    if (!params.length) return undefined

    return {
        required: !params[0].isOptional(), // TODO also, only if any keys in param type
        content: {
            "application/json": {
                schema: schema(params[0].getType())
            }
        }
    }
}

function requestParameters(method: MethodSignature) {
    const params = method.getParameters()
    if (!params.length) return undefined

    const { properties } = objectSchema(params[0].getType())

    return Object.keys(properties).map(name => ({
        in: "query",
        name,
        schema: properties[name]
    }))
}


function describeOperation(method: MethodSignature, description: OperationDescription) {
    return description.getMethod() == "GET" ?
        {
            parameters: requestParameters(method),
        }
        :
        {
            requestBody: requestBody(method)
        }
}

(() => {
    const description = JSON.parse(fs.readFileSync(descriptionFile, "utf8"))

    const project = loadProject()
    const entryFile = project.getSourceFile(description.entry.file)
    const entryInterface = entryFile.getInterface(description.entry.interface)

    const { paths, definitions } = describeInterface(entryInterface)

    const result = {
        ...description.header,
        paths,
        definitions,
    }

    function filterUndefined(obj) {
        for (const key of Object.keys(obj)) {
            if (obj[key] == undefined)
                delete obj[key]

            if (typeof obj[key] == 'object' && obj[key]) {
                filterUndefined(obj[key])
            }
        }

        return obj
    }

    console.log(filterUndefined(result).paths)

    yaml.sync(outputFile, filterUndefined(result))
})()
