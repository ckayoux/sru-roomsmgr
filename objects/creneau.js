var creneau = function(t, cours, c, h, i, s, com){
    this.type = t
    this.cours = cours
    this.capacitaire = c
    this.plageHoraire = h
    this.indexSousGroupe = i
    this.salle = s
    this.commentaire = com
}

creneau.prototype.getTypeOfCours = function () {
    switch (this.type[0]) {
        case 'D' :
            return "TD"
        case 'T' :
            return "TP"
        case 'C' :
            return "CM"
    }
}

creneau.prototype.toString = function () {
    var string =  `\ncreneau {
    type: ${this.type.brightGreen},
    cours: ${this.cours.brightGreen},
    capacitaire: ${this.capacitaire.brightGreen},
    plageHoraire: ${this.plageHoraire.toString()},
    indexSousGroupe: ${this.indexSousGroupe.brightGreen},
    salle: ${this.salle.brightGreen}`
    if (!(this.commentaire === undefined)) {
        string+=`,\n    commentaire: ${this.commentaire.brightGreen}
            }`
    }else {
        string+=`\n}`
    }
    return string
}

module.exports = creneau