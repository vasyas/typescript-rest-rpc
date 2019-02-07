import * as path from "path"
import { Project } from "ts-morph"
import * as yaml from "write-yaml"
import * as commandLineArgs from "command-line-args"

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

const optionDefinitions = [
    { name: "tsConfig", type: String },
    { name: "apiDescription", type: String },
    { name: "output", type: String },
    { name: "baseDir", type: String },
    { name: "skip", type: String },
];

(() => {
    const { tsConfig, apiDescription, output, baseDir, skip } = commandLineArgs(optionDefinitions)

    const description = JSON.parse(fs.readFileSync(path.join(baseDir, apiDescription), "utf8"))

    const project = loadProject(path.join(baseDir, tsConfig))
    const entryFile = project.getSourceFile(description.entry.file)
    const entryInterface = entryFile.getInterface(description.entry.interface)

    const apiDescriber = new ApiDescriber(baseDir, skip)

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

    yaml.sync(output, filterUndefined(result))
})()
