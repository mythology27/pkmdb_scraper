const fs = require('fs-extra')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

const readXml = (path, cb) => {
    fs.readFile(path, (err, data) => {
        if (!err) {
            parser.parseString(data, (err, result) => {
                console.log(`Read data from ${path} successfully!`)
                cb(result)
            })
        } else {
            console.log('Could not read the XML file due to', err)
        }
    })
}


const value2barchartRank = (value) => {
    let rank
    if (value <= 30) {
        rank = 1
    } else if (value <= 60) {
        rank = 2
    } else if (value <= 90) {
        rank = 3
    } else if (value <= 120) {
        rank = 4
    } else if (value <= 150) {
        rank = 5
    } else {
        rank = 6
    }
    return `barchart-rank-${rank}`
}


module.exports = {
    readXml, value2barchartRank
}