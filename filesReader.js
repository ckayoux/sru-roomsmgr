/**
 *  Constants
 */
const fs = require('fs') // for file stream
const parser = require(__dirname+'/parser.js') // default parser


/**
 *  Checks if the default workspace exists
 *  ./data
 *  ./data/undefined
 *
 * @returns {string[]} of folders
 */
const getDirectories = function () {
    const folder = __dirname+'/data'
    const folder2 = __dirname+'/data/undefined'

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
        console.log("Work folders (" + folder+ ") was created successfully !")
    }

    if (!fs.existsSync(folder2)) {
        fs.mkdirSync(folder2)
        console.log("Work folders (" + folder2 + ") was created successfully !")
    }

    return fs.readdirSync(folder)
}


/**
 * This function creates a list of found edt.cru files
 *
 * @param logger of the main program
 */
var filesReader = function (logger) {
    this.logger = logger
    this.parsedCreneaux = []
    this.files = []
    getDirectories().forEach((directory) => {
        const path = __dirname+"/data/"  + directory + "/edt.cru"
        if (fs.existsSync(path)) {
            this.files.push(path)
        }
    }, this)
}


/**
 * Parse the slots of the files edt.cru
 *
 * @returns {[]|*}
 */
filesReader.prototype.readAllfiles = function () {
    this.files.forEach((file) => {
        this.readFile(file, false, false)
    })
    return this.parsedCreneaux
}


/**
 * Parse a file passed as argument
 *
 * @param file to read
 * @param showParsed true -> print the slots
 * @param showTokenized true -> print tokenize
 * @returns {[]|*}
 */
filesReader.prototype.readFile = function (file, showParsed, showTokenized) {
    var data = fs.readFileSync(file, 'utf8')
    var analyzer = new parser(this.logger, showParsed, showTokenized)
    analyzer.parse(data)
    this.parsedCreneaux = this.parsedCreneaux.concat(analyzer.parsedCreneaux)
    return this.parsedCreneaux
}

/**
 * Parse a directory passed as argument
 *
 * @param directoryLetter where we take the edt.cru
 * @param showParsed true -> print the slots
 * @param showTokenized true -> print tokenize
 * @returns {[]|*|null}
 */
filesReader.prototype.readFileByFirstLetter = function (directoryLetter, showParsed, showTokenized) {
    var dir = getDirectories().find(d => String(d).includes(String(directoryLetter)))
    const path = __dirname+"/data" + "/" + dir + "/edt.cru"
    if (fs.existsSync(path)) {
        var data = fs.readFileSync(__dirname+"/data" + "/" + dir + "/edt.cru", 'utf8')
        var analyzer = new parser(this.logger, showParsed, showTokenized)
        analyzer.parse(data)
        this.parsedCreneaux = this.parsedCreneaux.concat(analyzer.parsedCreneaux)
        return this.parsedCreneaux
    }
    return null
}

// Export the filesReader function
module.exports = filesReader
