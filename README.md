# SRU-roomsmgr

Projet GL02 @UTT 2021/2022

-----------------

## Table des matières
1. [Description](#description)
2. [Pré-requis d'utilisation](#pré-requis-dutilisation)
3. [Installation des dépendances](#installation-des-dépendances)
4. [Usage](#usage)
5. [Commandes](#commandes)
4. [Technologies utilisées](#technologies-utilisées)
6. [Documentation](#documentation)
7. [License](#license)
8. [Contributeurs](#contributeurs)

## Description
***
Ce logiciel a été produit pour le compte de l'Université Centrale de la République de Sealand (_SRU_) en vue de faciliter la gestion de ses locaux ainsi que l'organisation de ses usagers (enseignants et étudiants) en leur proposant un outil de suivi de l'occupation des salles de cours. 

Il fonctionne sur la base des emplois du temps exportés au format _CRU_ par le système de planification générale des cours (_PGC_) de l'établissement, qui réalise associent aux créneaux de cours hebdomadaires les salles dans lesquelles ils se déroulent.

## Pré-requis d'utilisation
***
Avoir installé npm et node.js.

## Installation des dépendances
***
```aidl
npm install
```


## Usage
***
```
node client.js <command> [ARGUMENTS...] [OPTIONS...]
```

## Commandes
***
```aidl
Type 'client.js help <command>' to get some help about a command

    verify                               Commande qui permet de vérifier si un fichier <file> au format CRU est cohérent.                               
    coursWhichSalles                     Consulte les salles associées à un cours <cours>       
    capaciteMaxSalle                     Consulte la capacité maximale d'une salle <salle>      
    plageHoraireLibrePourSalle           Consulte les plages horaires pour lesquelles une salles <salle> est libre                                      
    sallesLibresPourPlageHoraire         Consulte les salles disponibles pour un jour <jour> et un créneau horaire <horaires>                          
    classementSalles                     Affiche les salles classés par ordre décroissant du nombre de places                                       
    generateICal                         Génére un fichier iCalendar  
```

## Technologies utilisées
<p align="left"> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a> </p>

## Documentation
***
Un guide destiné aux utilisateurs finaux peut être trouvée à [cette adresse](https://git.utt.fr/carrierl/yellow-team-a21-gl02/-/wikis/Guide-Utilisateur/Pr%C3%A9face).

Une documentation système, destinée aux équipes de développement et de maintenance, [est également mise à disposition](https://git.utt.fr/carrierl/yellow-team-a21-gl02/-/wikis/Guide-D%C3%A9veloppeur/Organisation-du-code-source).

## License
***
Copyright © 2021-2025 YellowTeam

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Contributeurs
***
#### Equipe de développement
- **CARRIER Lisa** - ISI1 @[carrierl](https://git.utt.fr/carrierl/yellow-team-a21-gl02/-/commits/main?author=carrierl) et @[liza02](https://git.utt.fr/carrierl/yellow-team-a21-gl02/-/commits/main?author=liza02)

#### Equipe de développement
- **HOUDEBERT Félix** - TC04 @[houdebef](https://git.utt.fr/houdebef)
- **PHILIPPE Romain** - ISI1 @[philippr](https://git.utt.fr/philippr)
- **KADANGHA Gnouyarou Marc-Arthur** -ISI2 @[kadanghg](https://git.utt.fr/kadanghg)
