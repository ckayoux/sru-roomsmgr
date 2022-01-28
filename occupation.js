#!/usr/bin/node
const vg = require('vega')
const vegalite = require('vega-lite')
const fs = require('fs')

const make = (occupation) => {
    var chart = {
        "data" : { "values" : occupation},
        "mark": { "type": "line","point": true},
        "width": 900,
        "height": 500,
        "encoding": {
            "x": {
                "field": "jour", "type": "ordinal",  "title": "jour"
            },
            "y": {"field": "valeur", "type": "quantitative","title": "pourcentage"},
            "color": {
                "field":"slle", "type":"nominal", "title":"Salle","scale": {"scheme": "category20b"}
            }
        }
    }

    function makeid(length) {
        var result           = ''
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        var charactersLength = characters.length
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength))
        }
        return result
    }

    let a = makeid(7)

    const myChart = vegalite.compile(chart).spec

    /* SVG version */
    var runtime = vg.parse(myChart)
    var view = new vg.View(runtime).renderer('svg').run()
    var mySvg = view.toSVG()

    mySvg.then(function(res){
        fs.writeFileSync(__dirname+"/graphique/"+a+".svg", res)
        view.finalize()
        //logger.info("%s", JSON.stringify(myChart, null, 2))
        console.log("Your visualization is at : "+__dirname+"/graphique/"+a+".svg")

    })
}

module.exports = {
    make : make
}
