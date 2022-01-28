var weekdays = require(__dirname+'/objects/weekDays')
var PlageHoraire = require(__dirname+'/objects/plageHoraire')
var Horaire = require(__dirname+"/objects/horaire")
var ical = require("icalendar")
const fs = require('fs')
var makeG = require(__dirname+"/occupation")

var commandsAction = function (logger, parsedCreneaux) {
    this.logger = logger
    this.parsedCreneaux = parsedCreneaux
}

//SPEC 2 Vérifie si les plages horaires sont cohérentes, si il n'y a pas 2 cours différents en même temps dans la même salle
commandsAction.prototype.verify = function () {
    var errorCount = 0
    var salles = new Set(this.parsedCreneaux.map(creneau => creneau.salle))
    salles.forEach((salle) => {
        var creneauxMatchingSalle = this.parsedCreneaux.filter(creneau => creneau.salle === salle)
        for (let i = 0; i < creneauxMatchingSalle.length; i++) {
            for (let j = i; j < creneauxMatchingSalle.length; j++) {
                if (!(creneauxMatchingSalle[i] === creneauxMatchingSalle[j])) {
                    if (creneauxMatchingSalle[i].plageHoraire.intersection(creneauxMatchingSalle[j].plageHoraire)) {
                        this.logger.warn(`Incohérence détectée dans les plages horaires : 
                        ${creneauxMatchingSalle[i].toString()} 
                        et
                        ${creneauxMatchingSalle[j].toString()} 
                        sont en conflit !
                        `)
                        errorCount++
                    }
                }
            }
        }
    })
    if (errorCount === 0)
        this.logger.info(`Aucune incohérence détectée dans le fichier.`)
}

// SPEC 3 Retourne les salles associées à un cours et leurs capacitaire max
commandsAction.prototype.coursWhichSalle = function (cours, verify) {
    this.parsedCreneaux = this.parsedCreneaux.filter(creneau => creneau.cours == cours)
    if (!this.parsedCreneaux.isEmpty) {
        if (verify) {
            this.verify()
        }
        var salles = new Set(this.parsedCreneaux.map(creneau => creneau.salle))

        console.log(`Les salles associées au cours ${cours} sont :`)
        salles.forEach((salle) => {
            let cptMax = this.capaciteMaxSalle(salle)
            if (cptMax === 0)
                cptMax = 'inconnu'
            console.log(`   ${salle} (capacitaire max=${cptMax})`)
        })
        //TODO afficher le type de créneau (CM, TD, TP)
    } else {
        this.logger.warn(`Le cours ${cours} n'existe pas ou n'est pas encore référencé !`)
    }
}

// SPEC 4 Retourne la capacité maximale d’une salle donnée
commandsAction.prototype.capaciteMaxSalle = function (salle) {
    var creneauMatchingSalle = this.parsedCreneaux.filter(creneau => creneau.salle === salle)
    return Math.max(...creneauMatchingSalle.map(creneau => parseInt(creneau.capacitaire)))
}

// SPEC 5 Consulter les plages horaires pour lesquelles une salle donnée est libre
commandsAction.prototype.plageHoraireLibrePourSalle = function (salle) {
    var creneauxMatchingSalle = this.parsedCreneaux.filter(creneau => creneau.salle === salle)
    weekdays.map.forEach((k, v) => { // pour chaque jour de la semaine
        var bornes = [new Horaire('8', '00'), new Horaire('20', '00')] // on suppose d'abord que la salle est libre de 8 à 20h le jour courant
        var creneauxMatchingSalleAndJour = creneauxMatchingSalle.filter(creneau => creneau.plageHoraire.jour === k)
            .forEach(creneau => {
                var index = 0
                var intersect = false
                while (!intersect && index < bornes.length) {
                    borneInf = bornes[index]
                    borneSup = bornes[index+1]
                    if (borneSup !== undefined) {
                        if (borneInf.equals(creneau.plageHoraire.debut) && borneSup.equals(creneau.plageHoraire.fin)) {
                            // retirer les 2 bornes
                            bornes.splice(index, 2)
                            intersect = true
                        } else {
                            if (borneInf.equals(creneau.plageHoraire.debut)) {
                                bornes[index] = creneau.plageHoraire.fin
                                intersect = true
                            } else if (borneSup.equals(creneau.plageHoraire.fin)) {
                                bornes[index + 1] = creneau.plageHoraire.fin
                                intersect = true
                            } else if (creneau.plageHoraire.debut.apres(borneInf) && creneau.plageHoraire.fin.avant(borneSup)) {
                                //ajouter les debut et fin entre borneInf et borneSup
                                bornes.splice(index+1, 0, creneau.plageHoraire.debut, creneau.plageHoraire.fin)
                                intersect = true
                            }
                        }
                    }
                    index+=2
                }
            })
        var horairesDispo = []
        for (var i = 0; i < bornes.length; i++) {
            horairesDispo.push(bornes[i].toString() + "-" + bornes[i + 1].toString())
            i++
        }
        console.log(k + " : " + horairesDispo.join(', '))
    })
}

// SPEC 6 Consulter les salles disponibles pour un créneau horaire donné
commandsAction.prototype.findSallesLibresByPlageHoraire = function (jour, horaires) {
    if (weekdays.contains(jour)) {
        if (!horaires.match(/(([0-23]\:[0-59])|\:)\-(([0-23]\:[0-59])|\:)/)) {
            var salles = new Set(this.parsedCreneaux.map(c => c.salle))
            var horairesSplited = horaires.split(/\:|\-/)
            var plageHoraire = new PlageHoraire(jour, [horairesSplited[0], horairesSplited[1]], [horairesSplited[2], horairesSplited[3]])
            var sallesOccupees = this.parsedCreneaux.filter(c => plageHoraire.intersection(c.plageHoraire)).map(c => c.salle)
            var sallesLibres = [...salles].filter(salle => !sallesOccupees.includes(salle)).filter(salle => !(salle === '' || salle === -1))
            return sallesLibres
        } else {
            this.logger.warn('Plage horaire invalide !')
            return false
        }
    } else {
        this.logger.warn('Jour invalide !')
        return false
    }
}

// SPEC 7 Générer un classement des salles par nombre de places
commandsAction.prototype.classementSalles = function () {
    var salles = new Set(this.parsedCreneaux.map(c => c.salle).filter(salle => !(salle === '' || salle === -1)))
    var sallesCapaciteMax = new Map()
    salles.forEach(salle => sallesCapaciteMax.set(salle, this.capaciteMaxSalle(salle)))
    return new Map([...sallesCapaciteMax.entries()].sort((a, b) => b[1] - a[1])) // on ordonne la map par valeur (capacite) decroissante
}

// SPEC 8
commandsAction.prototype.generateICal = function (dateDebut, dateFin, cours) {
    var agenda = new ical.iCalendar() // création de l'objet icalendar
    this.parsedCreneaux = this.parsedCreneaux.filter(creneau => cours.includes(creneau.cours)) // on ne recupere que les créneaux des cours demandés
    // pour chaque jour, on itère
    var dateCourante = dateDebut
    while (dateCourante <= dateFin) {
        var day = weekdays.getByDate(dateCourante)
        this.parsedCreneaux
            .filter(creneau => (day === creneau.plageHoraire.jour))
            .forEach(creneau => {
                var event = new ical.VEvent('icalendar-generator')
                event.setSummary(creneau.cours)
                event.setLocation(creneau.salle)
                event.setDescription(creneau.getTypeOfCours())
                var debutCreneau = new Date(dateCourante)
                debutCreneau.setHours(creneau.plageHoraire.debut.heure)
                debutCreneau.setMinutes(creneau.plageHoraire.debut.minutes)
                var finCreneau = new Date(dateCourante)
                finCreneau.setHours(creneau.plageHoraire.fin.heure)
                finCreneau.setMinutes(creneau.plageHoraire.fin.minutes)
                event.setDate(debutCreneau, finCreneau)
                agenda.addComponent(event)
            })
        dateCourante.setDate(dateCourante.getDate() + 1)
    }
    var now = new Date()
    var nomFichier = now.getDay().toString() + now.getMonth().toString() + now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString() + ".ics"
    fs.appendFile(__dirname+"/iCalendar/" + nomFichier, agenda.toString(), function (err) {
        if (err) throw err
        console.log('Fichier ' + nomFichier + ' sauvegardé')
    })
}

//SPEC 9
commandsAction.prototype.occup = function () {
            let pourc=0.0
            let tab=[]
            let lSalles= new Set(this.parsedCreneaux.map(c => c.salle).filter(salle => !(salle === '' || salle === -1)))

        lSalles.forEach(salle=>{//

            var creneauxMatchingSalle = this.parsedCreneaux.filter(creneau => creneau.salle === salle)
        weekdays.map.forEach((k, v) => { // pour chaque jour de la semaine
            var bornes = [new Horaire('8', '00'), new Horaire('20', '00')] // on suppose d'abord que la salle est libre de 8 à 20h le jour courant
            var creneauxMatchingSalleAndJour = creneauxMatchingSalle.filter(creneau => creneau.plageHoraire.jour === k)
                .forEach(creneau => {
                    pourc+=8.33*creneau.plageHoraire.duree()
                    var index = 0

                })
        tab.push({slle : salle ,jour: k, valeur : pourc })

            pourc=0

        })

    })

        let r=tab.toString
        let fd=JSON.stringify(tab)
        makeG.make(tab)
        fs.writeFile(__dirname+'/test.txt', fd, err => {
    if (err) {
        console.error(err)
        return
    }
    //file written successfully
    })
}

/**
 * Gestion du cas où la salle demandée n'est pas référencée dans les edt parsés
 * @author houdebef
 * @since 1.0.7 (bon ok c'est du bulls**t en vrai y a pas vraiment de versions) 02/01/2022 - fixing issue #4
 */

commandsAction.prototype.salleExiste = function(nomSalle) {
    return this.parsedCreneaux.filter(creneau => creneau.salle === nomSalle).length > 1
}
commandsAction.prototype.salle404 = function (nomSalle) {
    this.logger.error(`!-- Salle ${nomSalle} non référencée --!`)
}



commandsAction.prototype.doIfSalleExiste = function(nomSalle,operation,verbose) {
    if ( this.salleExiste(nomSalle) ){
        operation()
        return true
    }
    else{
        (verbose) ? this.salle404(nomSalle) : null
        return false
    }
}

module.exports = commandsAction
