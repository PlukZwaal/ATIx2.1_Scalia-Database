# Acteursbeheer Systeem

## Beschrijving
Dit is een server-side applicatie voor het beheren van acteurs en hun filmkoppelingen. De applicatie is bedoeld voor medewerkers om snel informatie op te zoeken, aan te passen, toe te voegen of te verwijderen.

## Technologie
- **Backend:** Node.js met Express.js
- **Database:** MySQL (Sakila database)
- **Frontend:** EJS templates met Bootstrap 5
- **Authenticatie:** JWT tokens met bcrypt
- **Testing:** Jest
- **Deployment:** Azure Web App met CI/CD via GitHub Actions

## Functionaliteiten
1. **Acteurs bekijken** - Overzicht van alle acteurs met filmtelling
2. **Acteur details** - Bekijk alle films van een specifieke acteur
3. **Acteurs bewerken** - Aanpassen van naam en film-koppelingen
4. **Acteurs aanmaken** - Nieuwe acteurs toevoegen
5. **Acteurs verwijderen** - Met wachtwoord verificatie

## Database Setup
1. Installeer MySQL
2. Importeer de Sakila sample database
3. Stel de database verbinding in via environment variabelen

## Environment Variabelen
Lokaal ontwikkelen:
- verander het bestand `example.env` naar `.env` bestand aan in de root van het project en vul de juiste waardes in.

Azure deployment:
- Ga naar Azure Web App > Configuration > Application settings
- Voeg dezelfde variabelen toe als hierboven
- Gebruik de juiste database credentials voor de productie omgeving.

## Installatie
```bash
npm install
npm run dev  # Development server op poort 3000
npm test     # Tests uitvoeren
```

## Live Versie
De applicatie draait live op Azure en wordt automatisch gedeployed via GitHub Actions bij elke push naar de main branch.