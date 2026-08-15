# FOURMILIÈRE

Le réseau des petites associations qui œuvrent ensemble pour soutenir les victimes de violences conjugales.

**En ligne :** https://elodiepapillon.github.io/fourmiliere/

---

## Pourquoi

Quand une personne fuit un domicile et arrive dans un département où elle n'a aucune attache, le système officiel la renvoie souvent vers des dispositifs qui exigent un lien avec la commune. Le 3919 est régulièrement saturé.

Les petites associations locales, elles, accueillent — mais personne ne les trouve.

FOURMILIÈRE rend ce réseau visible.

---

## Ce que fait l'outil

**Pour les personnes qui cherchent de l'aide**
- Un annuaire des petites associations du département
- Les horaires réels, les conditions d'accès, ce qu'il faut apporter
- Une indication claire : l'association accueille-t-elle les personnes venant d'ailleurs ?
- **Consultable sans connexion internet** : une fois l'application ouverte une première fois, les coordonnées restent disponibles sur l'appareil

**Pour les associations**
- Chaque association rédige et modifie elle-même sa fiche
- Une fiche de présentation libre : qui nous sommes, les dispositifs proposés, ce que nous ne pouvons pas faire
- Un statut en un clic : disponible, saturée, fermée

---

## Principes

- **Gratuit** pour tout le monde, sans publicité ni compte à créer
- **Aucune donnée saisie à la place des associations** : elles seules renseignent leurs informations
- **Validation avant publication** : une fiche n'apparaît qu'après vérification, pour éviter les fausses coordonnées
- **Retrait possible à tout moment**

---

## Périmètre

Essonne (91) uniquement pour l'instant. L'objectif est de valider la méthode sur un département avant d'envisager une réplication ailleurs.

---

## État du projet

Prototype en cours de construction. L'annuaire et l'inscription fonctionnent ; la synchronisation des statuts en temps réel est en développement.

---

## Technique

React · Dexie (IndexedDB, cache local hors connexion) · Supabase (base partagée) · GitHub Pages

Architecture : l'application lit d'abord les données locales, puis se met à jour depuis le serveur quand une connexion est disponible.

---

## Contact

Élodie Perrichon