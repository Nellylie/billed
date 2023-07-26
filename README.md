
# Billed Débuggez et testez un SaaS RH

Clonez le projet :
```
$ git clone https://github.com/Nellylie/billed.git
```
### Pour démarrer le back
Se positionner sur le repertoire back
```
$ cd Billed-app-FR-Back
```

Installez les packages npm :
```
$ npm install
```
Lancez le server :
```
$ node server.js
```
Example app listening on port 5678!
Verifiez le demarrage du server : `http://127.0.0.1:5678`

### pour lancer le front
Utilisez live-server
```
$ live-server
```
Verifiez la mise en route du site : `http://127.0.0.1:8080`

## Lancer les tests en local avec Jest

```
$ npm run test
```

## Afficher la couverture de test

`http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs 
Pour se connecter :

### administrateur : 
```
utilisateur : admin@test.tld 
mot de passe : admin
```
### employé :
```
utilisateur : employee@test.tld
mot de passe : employee
```
