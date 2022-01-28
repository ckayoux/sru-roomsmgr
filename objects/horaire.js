var weekday = require(__dirname+"/weekDays")

var horaire = function(h, m){
    this.heure = h
    this.minutes = m

}

horaire.prototype.toString = function () {
    return this.heure + ':' + this.minutes
}

// vrai si l'horaire courant (this) est apres ou identique au parametre (autreHoraire)
horaire.prototype.apres = function (autreHoraire) {
    if (parseInt(this.heure) > parseInt(autreHoraire.heure)) {
        return true
    } else if (parseInt(this.heure) === parseInt(autreHoraire.heure)){
        return parseInt(this.minutes) > parseInt(autreHoraire.minutes)
    }
    return false
}

// vrai si l'horaire courant (this) est avant ou identique au parametre (autreHoraire)
horaire.prototype.avant = function (autreHoraire) {
    if (parseInt(this.heure) < parseInt(autreHoraire.heure)) {
        return true
    } else if (parseInt(this.heure) === parseInt(autreHoraire.heure)){
        return parseInt(this.minutes) < parseInt(autreHoraire.minutes)
    }
    return false
}

horaire.prototype.equals = function (autreHoraire) {
    return parseInt(this.heure) === parseInt(autreHoraire.heure) && parseInt(this.minutes) === parseInt(autreHoraire.minutes)
}

module.exports = horaire
