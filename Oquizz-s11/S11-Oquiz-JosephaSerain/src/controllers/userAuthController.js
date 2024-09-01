
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");
const { User } = require("../models");
const { Scrypt } = require("../auth/Scrypt");

const userAuthController = {
    // Affiche le formulaire d'inscription
    async renderSignUpPage(req, res) {
        res.render("signup");
    },

    // Traite la soumission du formulaire d'inscription
    async handleSignUpFormSubmission(req, res) {
        // Récupérer et vérifier la validité des données saisies dans le form (ça, ça vaut pour tous les traitements de formulaire).
        // Si on a la moindre erreur, alors on réaffiche le formulaire, mais avec un petit message d'erreur en prime.

        const { firstname, lastname, email, password, confirmation } = req.body;
        // C'est la meme chose que les 5 lignes suivantes :
        // const firstname = req.body.firstname;
        // const lastname = req.body.lastname;
        // const email = req.body.email;
        // const password = req.body.password;
        // const confirmation = req.body.confirmation;

        // On vérifie que tous les champs de form obligatoires sont bel et bien remplis
        if (!firstname || !lastname || !email || !password || !confirmation) {
            return res.render("signup", { errorMessage: "Veuillez remplir tous les champs." });
        }

        // On vérifie que l'email est valide.
        if (!emailValidator.validate(email)) {
            return res.render("signup", { errorMessage: "L'email n'est pas valide." });
        }

        // On vérifie que le password est valide.
        const schema = new passwordValidator();
        schema
            .is().min(8) // Minimum length 8
            .is().max(100) // Maximum length 100
            .has().uppercase() // Must have uppercase letters
            .has().lowercase() // Must have lowercase letters
            .has().digits(1) // Must have at least 1 digit
            .has().symbols(1); // Must have at least 1 symbol
        if (!schema.validate(password)) {
            return res.render("signup", {
                errorMessage: "Le mot de passe doit faire entre 8 et 100 caractères et contenir 1 maj, 1 min, 1 chiffre et 1 caractère spécial"
            });
        }

        // On vérifie que le mot de passe et les mot de passe de confirmation sont identiques.
        // On teste avec : Toto1!0000
        if (password !== confirmation) {
            return res.render("signup", { errorMessage: "Le mot de passe et le mot de passe de confirmation doivent être identiques." });
        }

        // On vérifie si l'email est libre, parcequ'on ne peut pas avoir plusieurs User avec le même identifiant.
        // Comme cette vérif interroge une BDD, elle est plus lourde que les autres. On la met donc en dernière pour la faire
        // uniquement si toutes les autres sont passées => ça évite de la faire parfois pour rien.
        const existingUserWithSameEmail = await User.findOne({ where: { email } });
        // C'est la même chose que la ligne suivante.
        // Quand la clé d'un objet se nomme comme la variable contenant la valeur, on peut raccourcir de la sorte.
        // const existingUserWithSameEmail = await User.findOne({ where: { email: email } });
        if (existingUserWithSameEmail) {
            return res.render("signup", { errorMessage: "Il existe déjà un compte pour cet email." });
        }

        // Si tout est ok, on enregistre en BDD notre nouvel User, puis on redirige vers le formulaire de login.
        await User.create({
            firstname,
            lastname,
            email,
            password: Scrypt.hash(password),
        });

        res.redirect("/login");
    },

    // Affiche le form de connexion
    async renderLoginPage(req, res) {
        res.render("login");
    },

    async handleLoginFormSubmission(req,res) {
        const { email, password } = req.body;

        // Pas besoin de réutiliser emailValidator et passwordValidator car à priori, l'email et le password ont déjà été
        // vérifiés à l'inscription. Si on peut tenter de se connecter, c'est qu'on s'est déjà inscrit et qu'on  y déjà passé.
        // Faire les vérifications ne casserait rien, mais ça prendrait de la ressource pour pas grand chose.

        // On cherche en BDD le bon utilisateur grace à l'email.
        const user = await User.findOne({ where: { email } });
        if (!user || !Scrypt.compare(password, user.password)) {
            return res.render("login", { errorMessage: "Mauvais couple email / mot de passe.", });
        }

        // Si on est arrivé ici, c'est que le couple email / mdp est ok.
        // On stocke en session le nécessaire pour "rester connecter" et on redirige vers la page d'accueil.

        user.password = ""; // On enlève le hash du password de l'objet avant de le mettre en session => securité.
        req.session.user = user;
        res.redirect("/");
    },

    // On se déconnecte
    async logout(req, res) {
        req.session.user = null;
        res.redirect("/login");
    }
};

module.exports = userAuthController;
