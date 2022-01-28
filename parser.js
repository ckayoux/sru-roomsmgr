var creneau = require(__dirname+'/objects/creneau')
var PlageHoraire = require(__dirname+'/objects/plageHoraire')

var parser = function (logger, showParsed, showTokenized) {
    this.parsedCreneaux = []
    this.errorCount = 0
    this.logger = logger //TODO rediriger messages d'erreur vers logger (logger.error ou logger.warning ?)
    this.showParsed = showParsed
    this.showTokenized = showTokenized
}

parser.prototype.errMsg = function (msg, input) {
    this.errorCount++
    this.logger.error("Erreur de parsing ! avant " + input + " -- msg : " + msg)
}

// parse : analyze data by calling the first non terminal rule of the grammar
parser.prototype.parse = function (data) {
    var tData = this.tokenize(data)
    this.cours(tData)
    if (this.showParsed) {
        console.log(this.parsedCreneaux.toString())
    }
    if (this.errorCount === 0)
        this.logger.info(`Fichier parsé avec succès`)
}

parser.prototype.tokenize = function (data) {
    var separator = /(\/|\/\/|\r\n|\n|\r|=|,)/
    var separatorToRemove = /(\/\/|=|,)/
    data = data.split(separator)
    data = data.filter((val, idx) => !val.match(separatorToRemove) && !(val === ''))
    this.commentaireDebut(data)
    if (this.showTokenized) {
        console.log(data)
    }
    return data
}

// COMMENTAIRE = (TEXTE CRLF / ‘+UVUV’ CRLF 1*TEXTE CRLF)
parser.prototype.commentaireDebut = function (data) {
    var first = data[0]
    while (!first.match(/(\+)/) || first.match(/(\+UVUV)/)) {
        data.shift()
        first = data[0]
    }
    return data
}

// Read and return a symbol from input
parser.prototype.next = function (input) {
    return input.shift()
}

// expect : expect the next symbol to be symbole.
parser.prototype.expect = function (symbole, input) {
    var next = this.next(input)
    if (symbole === next ) {
        return true
    } else {
        this.errMsg("Symbole " + next + " ne match pas avec le symbole " + symbole + " attendu", input)
    }
    return false
    //TODO retourner un objet composé de 1) resultat booléen 2) string a fournir au logger
}

// COURS = ‘+’ NOMCOURS CRLF 1*CRENEAU
// NOMCOURS = 2A-Z 2*(A-Z / DIGIT)
parser.prototype.cours = function (input) {
    var next = input[0]
    var cours = next.match(/\+[A-Z]{2}(\d|[A-Z])*/)
    if (cours != null) {
        this.next(input)
        if (this.next(input).match(/\r\n|\n/)) {
            cours[0] = cours[0].replace('+', '')
            this.creneau(cours[0], input)
            return true
        } else {
            this.errMsg("Retour à la ligne attendu après le cours " + cours)
        }
    } else {
        return false
    }

}


// CRENEAU = ‘1,’ TYPESEANCE ‘,P=’ 1*DIGIT ‘,H=’ JOUR WSP PLAGEHORAIRE ‘,’ ISG ‘,S=’ NOMSALLE ’//’ CRLF
parser.prototype.creneau = function (cours, input) {
    var debutCreneau = this.next(input)
    if (matched = debutCreneau.match(/((\?\?|\*\*)\u00201?)|1/)) {
        var args = this.body(input)
        args.forEach((arg) => {
            var c = new creneau(arg.type, cours, arg.capa, arg.plageHoraire, arg.index, arg.salle, arg.commentaire)
            this.parsedCreneaux.push(c)
        })
        if (input.length > 0) {
            if (!this.cours(input)) {
                this.creneau(cours, input)
            }
        }
    } else if (!debutCreneau.match(/\n|\r\n/)) { // si retour ligne -> fin du fichier
        this.errMsg("Début de créneau incorrect", input)
    }
}

parser.prototype.body = function (input) {
    var type = this.type(input)
    var capa = this.capacitaire(input)
    this.expect("H", input)
    var plageHoraire = this.plageHoraire(input)
    var index = this.indexSousGroupe(input)
    var salle = this.salle(input)
    this.expect("/", input)
    if (input[0].match(/\//)) {
        this.next(input)
        var commentaire = this.commentaire(input)
        return [{type: type, capa: capa, plageHoraire: plageHoraire, index: index, salle: salle, commentaire: commentaire}]
    } else {
        //FIXME les doubles créneaux non gérés
        var autreSeance_plageHoraire = this.plageHoraire(input)
        var autreSeance_index = this.indexSousGroupe(input)
        var autreSeance_salle = this.salle(input)
        this.expect("/", input)
        this.expect("/", input)
        var autreSeance_commentaire = this.commentaire(input)
        return [{type: type, capa: capa, plageHoraire: plageHoraire, index: index, salle: salle, commentaire: commentaire},
            {type: type, capa: capa, plageHoraire: autreSeance_plageHoraire, index: autreSeance_index, salle: autreSeance_salle, commentaire: autreSeance_commentaire}
        ]
    }

}

//TYPESEANCE = (‘C’ / ‘D’ / ‘T’) DIGIT
parser.prototype.type = function (input) {
    var curS = this.next(input)
    if (matched = curS.match(/(C|D|T)\d/)) {
        return matched[0]
    } else {
        this.errMsg("Format du type de cours invalide", input)
    }
}

// 1*DIGIT
parser.prototype.capacitaire = function (input) {
    this.expect("P", input)
    var curS = this.next(input)
    if (matched = curS.match(/\d+/)) {
        return matched[0]
    } else {
        this.errMsg("Format de capacitaire invalide", input)
    }
}

parser.prototype.plageHoraire = function (input) {
    var curS = this.next(input)
    if (matched = curS.match(/(L|MA|ME|J|V|S)\u0020(([0-1]?[0-9]?|20|21|22|23):[0-5]?[0-9]?)\-(([0-1]?[0-9]?|20|21|22|23):[0-5]?[0-9]?)/)) {
        var jour = matched[0].split(' ')[0]
        var horaires = matched[0].split(' ')[1]
        var debut = horaires.split('-')[0].split(':')
        var fin = horaires.split('-')[1].split(':')
        return new PlageHoraire(jour, debut, fin)
    } else {
        this.errMsg("Format de plage horaire invalide", input)
    }
}

// ISG = ‘F’ DIGIT
parser.prototype.indexSousGroupe = function (input) {
    var curS = this.next(input)
    if (matched = curS.match(/F(\d|[A-Z])?/)) { //TODO [A-Z] temporaire -> fichier EF/edt.cru erreur ligne 93 erreur ?
        return matched[0]
    } else {
        this.errMsg("Format d'index de sous groupe invalide", input)
    }
}

// NOMSALLE = {1,3}A-Z {1,3}DIGIT
parser.prototype.salle = function (input) {
    this.expect("S", input)
    if (!input[0].match(/\//)) {
        var curS = this.next(input)
        if (matched = curS.match(/([A-Z]{1,3}\d{1,3})*/)) {
            return matched[0]
        } else {
            this.errMsg("Format de salle invalide", input)
        }
    } else {
        return -1
    }

}

parser.prototype.commentaire = function (input) {
    var curS = this.next(input)
    if (!curS.match(/\r\n|\n/)) {
        this.next(input)
        return curS
    }
}

module.exports = parser
