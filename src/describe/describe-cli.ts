import { Project } from "ts-morph"
import * as yaml from "write-yaml"

import * as fs from "fs"
import { ApiDescriber } from "./ApiDescriber"

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

(() => {
    const description = JSON.parse(fs.readFileSync(descriptionFile, "utf8"))

    const project = loadProject()
    const entryFile = project.getSourceFile(description.entry.file)
    const entryInterface = entryFile.getInterface(description.entry.interface)

    const apiDescriber = new ApiDescriber()

    const paths = apiDescriber.describeInterface(entryInterface)

    const result = {
        ...description.header,
        paths,
        ...apiDescriber.createDefinitions(),
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

    yaml.sync(outputFile, filterUndefined(result))
})()
