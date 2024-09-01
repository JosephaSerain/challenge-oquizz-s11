const { scryptSync, timingSafeEqual, randomBytes } = require("node:crypto");

// Cette classe va proposer 2 méthodes :
//  - Une pour hasher un mot de passe
//  - Une pour vérifier si un mot de passe clair (saisi par l'utilisateur dans un formulaire d'authentification)
//    correspond à un mot de passe hashé (récupéré en BDD).
class Scrypt {
    // Cette fonction va transforme un mot de passe clair en mot de passe hashé.
    // Elle sera appelé uniquement lorsqu'on doit enregistrer un nouveau mot de passe en BDD
    // (formulaire d'inscription, formulaire de modification de mot de passe, etc.)
    static hash(password) {
        // On crée un sel
        const salt = randomBytes(16).toString("hex");

        // On crée le hash du mdp d'une longueur de 64 caractères. Plus c'est long, plus c'est safe, mais lourd en mémoire.
        // 64, c'est un bon compromis.
        // Les paramètres recommandés par l'OWASP aboutissent à une valeur de maxmem relativement élevée :
        // "Si Argon2id n'est pas disponible, utilisez scrypt avec un coût CPU/mémoire minimum de (2^17),
        // une taille de bloc minimale de 8 (1024 octets), et un paramètre de parallélisation de 1."
        // Cela représente 134220800, soit environ 134 Mo.
        const buffer = scryptSync(password, salt, 64, {
            N: 131072,
            maxmem: 134220800,
        }).toString("hex");

        // On concatene le buffer avec le salt pour obtenir le mot de passe hashé final à stocker en BDD.
        return `${buffer}.${salt}`;
    }

    // Cette fonction va comparer un mot de passe clair avec un mot de passe hashé et retourner un booleen.
    // Elle sera appelé au moment de la tentative connexion :
    //  - En gros, le Controller ira chercher en BDD, le User qui correspondà l'identifiant du formulaire de connexion,
    //    récupérant par la même le hash enregistrée en BDD.
    //  - Ensuite le controller appelle cette méthode "compare" en lui fournissant 2 paramètres : le mdp saisi par l'utilisateur lors
    //    de la tentative de connexion ET le mdp qui a été récupéré en BDD.
    static compare(plainTextPassword, hash) {
        // On commence par récupérer d'un coté le salt, de l'autre le buffer
        // qui avait été utilisé pour hasher le mdp du param "hash" .
        const [hashedPassword, salt] = hash.split(".");

        // On crée un buffer : une sorte de tableau de caractères que l'algorithme scrypt peut analyser
        // C'est l'inverse du toString("hex") de la méthode hash.
        const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");

        const clearPasswordBuffer = scryptSync(plainTextPassword, salt, 64, {
            N: 131072,
            maxmem: 134220800,
        });

        return timingSafeEqual(hashedPasswordBuf, clearPasswordBuffer);
    }
}

// Scrypt.hash("toto");

// Scrypt.compare("tutu", "559eede16f2a0343cf9f36d30b40a058161b846948345258646a6853f18412e1161823b1119b86b2453ca39e2bdf93c79703ff35f6c5cea3eb76d959ae0992a5.515141ea94b3b31f117125ee7a71a941");

module.exports = { Scrypt };