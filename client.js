

const actions = require(__dirname+'/commandsAction.js')
const filesReader = require(__dirname+'/filesReader')

const cli = require("@caporal/core").default
//SPEC 2 Vérifier la présence d’incohérences dans l’emploi du temps fourni
cli

    .version('planning-parser-cli')
    .version('0.05')
    .command('verifier', 'Commande qui permet de vérifier si un fichier <fichier> au format CRU est cohérent.')
    .alias('verify')
    .argument('<fichier>', 'Le fichier à vérifier')
    .option('-p, --showParsed', 'Log les créneaux de cours parsés et mappés dans les objets', {
        validator: cli.BOOLEAN,
        default: false
    })
    .option('-t, --showTokenized', 'Log le résultat sous forme de tokens', {validator: cli.BOOLEAN, default: false})
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readFile(args.file, options.showParsed, options.showTokenized)
        var action = new actions(logger, parsedCreneaux)
        action.verify()

    })


/**
 * SPEC 3 Consulter les salles associées à un cours et leurs caractéristiques
 */
cli
    .command('coursQuellesSalles', 'Consulte les salles associées à un cours <cours>')
    .alias('coursWhichSalles')
    .argument('<cours>', 'Nom du cours dont on souhaite connaitre les salles')
    .option('-v, --verify', 'Vérifie également la cohérence des données')
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readFileByFirstLetter(args.cours[0], false, false) // lis et parse le fichier dans le répertoire qui contient le cours (matching par lettre de l'alphabet)
        if(parsedCreneaux != null) {
            var action = new actions(logger, parsedCreneaux)
            action.coursWhichSalle(args.cours, options.verify)
        } else {
            logger.info("Aucun fichier edt.cru n'a été trouvé dans "+__dirname+"/data/undefined/")
        }
    })

// SPEC 4 Consulter la capacité maximale d’une salle donnée
cli
    .command('capaciteMaxSalle', 'Consulte la capacité maximale d\'une salle <salle>')
    .argument('<salle>', 'Le nom de la salle dont on veut la capacité maximale')
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readAllfiles() // lit et parse tout les fichiers dans le repertoire /data/
        var action = new actions(logger, parsedCreneaux)
        action.doIfSalleExiste(args.salle,()=>{
            var cptMax = action.capaciteMaxSalle(args.salle)
            console.log("Capacité maximale de la salle " + args.salle + " : " + cptMax + " places.")
        },true)
    })

// SPEC 5 Consulter les plages horaires pour lesquelles une salle donnée est libre
cli
    .command('plageHoraireLibrePourSalle', 'Consulte les plages horaires pour lesquelles une salles <salle> est libre')
    .argument('<salle>', 'Le nom de la salle dont on veut les plages horaires libres')
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readAllfiles() // lis et parse tout les fichiers dans le repertoire /data/
        var action = new actions(logger, parsedCreneaux)
        action.doIfSalleExiste(args.salle,()=>{
            console.log("Les créneaux libres pour la salle " + args.salle + " sont :")
            action.plageHoraireLibrePourSalle(args.salle)
        },true)
    })

// SPEC 6 Consulter les salles disponibles pour un créneau horaire donné
cli
    .command('sallesLibresPourPlageHoraire', 'Consulte les salles disponibles pour un jour <jour> et un créneau horaire <horaires> ; ex : lundi 10:00-12:00')
    .argument('<jour>', 'Le jour pour lequel on souhaite consulter la salle disponible')
    .argument('<horaires>', 'Créneau horaire pour lequel on souhaite consulter la salle disponible')
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readAllfiles()
        var action = new actions(logger, parsedCreneaux)
        var sallesLibres = action.findSallesLibresByPlageHoraire(args.jour, args.horaires)
        if (sallesLibres !== false) {
            console.log("Les salles libres le " + args.jour.toLowerCase() + ", de " + args.horaires.split('-')[0] + " à " + args.horaires.split("-")[1] + " sont :")
            for (var i = 0; i < sallesLibres.length; i++) {
                var s2 = sallesLibres[i + 1] === undefined ? '' : sallesLibres[i + 1]
                var s3 = sallesLibres[i + 2] === undefined ? '' : sallesLibres[i + 2]
                console.log(sallesLibres[i] + "\t\t" + s2 + "\t\t" + s3)
                i += 2
            }
        }
    })

// SPEC 7 Générer un classement des salles par nombre de places
cli
    .command('classementSalles', 'Affiche les salles classés par ordre décroissant du nombre de places')
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readAllfiles()
        var action = new actions(logger, parsedCreneaux)
        var classement = action.classementSalles()
        console.log("Classement des salles par capacité maximale (de la plus grande à la plus petite) :")
        let index = 1
        classement.forEach((cpt, salle) => {
            console.log(index + ". " + salle + " : " + cpt + " places")
            index++
        })
    })

//SPEC 8 Générer un agenda au format iCalendar (RFC 5545) entre deux dates données pour une liste de cours donnée
cli
    .command('genererICal', 'Génére un fichier iCalendar')
    .alias('generateICal')
    .argument('<dateDebut>', 'Date (DD/MM/YYYY) de début pour laquelle on souhaite l\'agenda')
    .argument('<dateFin>', 'Date (DD/MM/YYYY) de fin pour laquelle on souhaite l\'agenda')
    .argument('<cours>', "Liste des cours qu'on souhaite intégrer à l'agenda")
    .option('-u, --mmddyyyy','Utiliser le format de date MM/DD/YYYY (US).')
    .action(({args, options, logger}) => {
        var regexDate
        if(options.mmddyyyy)
            regexDate = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/  //format MM/DD/YYYY
        else
            regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/ // format DD/MM/YYYY
        if (args.dateDebut.match(regexDate)) { // dateDebut correspond au bon format d'une date
            if (args.dateFin.match(regexDate)) { // dateFin correspond au bon format d'une date
                var fileReader = new filesReader(logger)
                var cours = args.cours.split(',')
                var parsedCreneaux = []
                var coursLetters = new Set(cours.map(c => c[0]))
                coursLetters.forEach(cours => { // on récupère tout les créneaux pour les cours souhaités
                    var parsedCreneau = fileReader.readFileByFirstLetter(cours, false, false)
                    if(parsedCreneau != null) {
                        parsedCreneaux = parsedCreneaux.concat(parsedCreneau)
                    }
                })
                if(!options.mmdyyyy) {//conversion de la date du format DD/MM/YYYY au format MM/DD/YYYY accepté par la classe Date en JS
                    function convertDMYToMDYDateFormat(dmyDateFormat) {
                        var dd = dmyDateFormat.match("^\([0-9]{1,2}\)[\/\-]")[1]
                        var mm = dmyDateFormat.match("[\/\-]\([0-9]{1,2}\)[\/\-]")[1]
                        var yyyy = dmyDateFormat.match("[\/\-]\([0-9]{4}\)$")[1]
                        return mm+'/'+dd+'/'+yyyy
                    }
                    args.dateDebut=convertDMYToMDYDateFormat(args.dateDebut)
                    args.dateFin=convertDMYToMDYDateFormat(args.dateFin)
                }
                var action = new actions(logger, parsedCreneaux)
                action.generateICal(new Date(args.dateDebut), new Date(args.dateFin), cours)
            } else {
                logger.error("argument " + "dateDebut".bold + " ne correspond pas au format de date "+((options.mmddyyyy)?"MM/DD":"DD/MM")+"/YYYY.")
            }
        } else {
            logger.error("argument " + "dateFin".bold + " ne correspond pas au format de date "+((options.mmddyyyy)?"MM/DD":"DD/MM")+"/YYYY.")
        }
    })

// SPEC 9 Visualiser graphiquement les statistiques d’occupation des salles
cli
    .command('occupation', 'Génère une image avec le taux d occupation des salles')
    .action(({args, options, logger}) => {
        var fileReader = new filesReader(logger)
        var parsedCreneaux = fileReader.readAllfiles() // lis et parse tout les fichiers dans le repertoire /data/
        var action = new actions(logger, parsedCreneaux)
        action.occup()

    })

cli.run(process.argv.slice(2))
