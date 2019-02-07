import * as path from "path"
import { Project } from "ts-morph"
import * as yaml from "write-yaml"

import * as fs from "fs"
import { ApiDescriber } from "./ApiDescriber"

function loadProject(tsConfigFilePath) {
    const project = new Project({
        tsConfigFilePath
    })

    const diagnostics = project.getPreEmitDiagnostics()

    if (diagnostics.length > 0) {
        console.log("Can't generate API description - compilation failed.")
        console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))
        process.exit(1)
    }

    return project
}

const tsConfigFilePath = "./openapi-example/tsconfig.json"
const descriptionFile = "./openapi-example/api-description.json"
const outputFile = "./api.yaml"
const baseDir = ".";

// const tsConfigFilePath = "./tsconfig.json"
// const descriptionFile = "./api-description.json"
// const outputFile = "./api.yaml"
// const baseDir = "/Users/vasyas/projects/elpaso/shared";

(() => {
    const description = JSON.parse(fs.readFileSync(path.relative(baseDir, descriptionFile), "utf8"))

    const project = loadProject(path.relative(baseDir, tsConfigFilePath))
    const entryFile = project.getSourceFile(description.entry.file)
    const entryInterface = entryFile.getInterface(description.entry.interface)

    const apiDescriber = new ApiDescriber(baseDir)

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
