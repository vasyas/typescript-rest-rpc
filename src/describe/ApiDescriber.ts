import * as path from "path"
import { InterfaceDeclaration, MethodSignature, ObjectFlags, PropertySignature, Type } from "ts-morph"
import { OperationDescription } from "../operation"

export class ApiDescriber {
    describeInterface(i: InterfaceDeclaration, prefix = ""): any {
        let paths = {}

        for (const method of i.getMethods()) {
            const d = new OperationDescription(method.getName())

            paths[prefix + d.getUrl()] = {
                [d.getMethod().toLowerCase()]: this.operation(method, d)
            }
        }

        for (const prop of i.getProperties()) {
            const type = prop.getTypeNodeOrThrow().getType()

            if (type.isInterface()) {
                const declaration = type.getSymbolOrThrow().getDeclarations()[0]

                const nestedPaths = this.describeInterface(declaration as InterfaceDeclaration, "/" + prop.getName())

                paths = {
                    ...paths,
                    ...nestedPaths,
                }
            } else {
                console.warn(`Unsupported property type`, { prop: prop.getName(), type: type.getText() })
            }
        }

        return paths
    }

    createDefinitions() {
        if (!this.typeDefinitions.length) return {}

        const schemas = this.typeDefinitions.reduce((r, type) => {
            r[this.getTypeReferenceName(type)] = this.objectSchema(type)
            return r
        }, {})

        return {
            components: {
                schemas
            }
        }
    }


    private operation(method: MethodSignature, description: OperationDescription) {
        const responses = this.operationResponses(method)

        return description.getMethod() == "GET"
            ? { parameters: this.requestParameters(method), responses, }
            : { requestBody: this.requestBody(method), responses, }
    }

    private operationResponses(method: MethodSignature) {
        const returnType = method.getReturnType()

        if (!returnType || returnType.isUndefined()) return undefined

        // should be Promise<smth>, get smth
        const promisedReturn = returnType.getTypeArguments()[0]

        if (promisedReturn.getText() == "void") return undefined

        return {
            "200": {
                description: "Success",
                content: {
                    "application/json": {
                        schema: this.schema(promisedReturn)
                    }
                }
            }
        }
    }

    private requestBody(method: MethodSignature) {
        const params = method.getParameters()
        if (!params.length) return undefined

        return {
            required: !params[0].isOptional(), // TODO also, only if any keys in param type
            content: {
                "application/json": {
                    schema: this.schema(params[0].getType())
                }
            }
        }
    }

    requestParameters(method: MethodSignature) {
        const params = method.getParameters()
        if (!params.length) return undefined

        const { properties } = this.objectSchema(params[0].getType())

        return Object.keys(properties).map(name => ({
            in: "query",
            name,
            schema: properties[name]
        }))
    }

    private schema(type: Type) {
        if (!type) return {}

        // generate reference or in-place schema?
        if (type.isObject() && (type.getObjectFlags() & ObjectFlags.Anonymous) == 0) {
            this.typeDefinitions.push(type)

            return {
                "$ref": `#/components/schemas/${ this.getTypeReferenceName(type) }`
            }
        }

        if (type.isObject()) return this.objectSchema(type)

        if (type.isString()) return { type: "string" }
        if (type.isNumber()) return { type: "number" }

        console.warn(`Unsupported type ${ type.getText() }`)
        return undefined
    }

    private objectSchema(type: Type) {
        const properties = {
        }

        for (const prop of type.getProperties()) {
            // case 1: typed value declaration (TODO may be replace with getSymbol.getDeclarations()?)
            if (prop.getValueDeclaration()) {
                const propertySignature = prop.getValueDeclaration() as PropertySignature

                if (propertySignature.getType()) {
                    properties[prop.getName()] = {
                        ...this.schema(propertySignature.getType())
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

    private getTypeReferenceName(type: Type): string {
        const text = type.getText()
        const idx = text.lastIndexOf(".")

        const name = text.substring(idx + 1)
        const absolutePath = text.match(/"(.*?)"/)[1]

        const modulePath = path.relative(process.cwd(), absolutePath).replace("/", ".")

        return `${modulePath}.${name}`
    }

    private typeDefinitions = []
}