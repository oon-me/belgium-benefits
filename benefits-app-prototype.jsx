import React, { useState } from "react";
import { Search, MapPin, ChevronRight, ChevronLeft, Home, MessageCircle, PlusCircle, Check, Clock, ExternalLink, Send, Baby, Building2, Heart, Briefcase, HelpCircle, Smartphone, CreditCard, FileText } from "lucide-react";

// ---- Design tokens ----
const c = {
  paper: "#F7F5EF",
  paperDim: "#EFEBE1",
  ink: "#1C2B39",
  inkSoft: "#4B5B68",
  post: "#2F5C8A",
  postDeep: "#1F4165",
  gold: "#B8863B",
  green: "#4C7A5E",
  greenBg: "#E7EFE9",
  clay: "#B5533C",
  clayBg: "#F5E5DF",
  line: "#DBD5C7",
};

const displayFont = "Georgia, 'Iowan Old Style', 'Palatino Linotype', serif";
const bodyFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const monoFont = "'SF Mono', 'IBM Plex Mono', ui-monospace, monospace";

// ---- Translations (UI chrome only — benefit content gets localized during content research) ----
const translations = {
  en: {
    langLabel: "English",
    headline0: "What you're owed,\nfound in one place.",
    sub0: "Belgium has dozens of benefits you must actively request — or lose. We'll match them to your region.",
    getStarted: "Get started",
    step: "Step {n} of {total}",
    headlineRegion: "Where do you live?",
    subRegion: "Some benefits vary by commune, not just region.",
    regionLabel: "Region",
    communeLabel: "Commune",
    continueBtn: "Continue",
    headlineSituation: "What's going on\nright now?",
    subSituation: "Pick anything that applies. We'll show those first — you can still browse everything after.",
    headlineIncome: "One last thing\n(totally optional)",
    subIncome: "This just helps us order what we show first. It never hides anything, and this app is for everyone regardless of income.",
    seeMatches: "See my matches",
    showEverything: "Show me everything",
    yourBenefits: "Your benefits",
    searchPlaceholder: "Search benefits...",
    matchedTo: "Matched to:",
    localTipsHeader: "Local tips for you",
    communityTip: "Community tip",
    notOfficial: "not an official government benefit",
    whatYoullNeed: "What you'll need",
    newToItsme: "New to itsme?",
    itsmeTip: "Fastest way: open your bank app (Belfius, BNP Paribas Fortis, KBC, ING, or Hello Bank) and look for \"Activate itsme.\" No bank app that supports it? You can activate it instead with your eID card and a card reader at itsme-id.com.",
    howToRequest: "How to request it",
    openOfficial: "Open official request page",
    lastVerified: "Last verified",
    youCouldReceive: "You could receive",
    deadline: "Deadline",
    chatHeadline: "Ask what applies to you",
    chatSub: "Answers only from our verified benefit database",
    chatPlaceholder: "Describe your situation...",
    submitHeadline: "Submit a benefit",
    submitSub: "Reviewed by moderators before it goes live",
    submitBtn: "Submit for review",
    navBrowse: "Browse",
    navAsk: "Ask",
    navSubmit: "Submit",
    back: "Back",
    forward: "Forward",
    noMatches: "No matches. Try another search or category.",
    verified: "Verified",
    community: "Community",
    fields: { title: "Title", institution: "Responsible institution", amount: "Approximate amount", deadlineLabel: "Deadline / timing rule", link: "Official link" },
    categories: { housing: "Housing", family: "Family", health: "Health", employment: "Employment", other: "Other" },
    situations: { pregnancy: "Expecting or adopting a child", "job-loss": "Lost my job", "buying-home": "Buying a home", renting: "Renting", "health-issue": "Health issue or disability" },
    income: { lower: "Lower income", middle: "Middle income", higher: "Higher income", skip: "Prefer not to say" },
  },
  nl: {
    langLabel: "Nederlands",
    headline0: "Waar je recht op hebt,\nallemaal op één plek.",
    sub0: "België heeft tientallen voordelen die je zelf moet aanvragen — anders verlies je ze. Wij tonen wat past bij jouw regio.",
    getStarted: "Aan de slag",
    step: "Stap {n} van {total}",
    headlineRegion: "Waar woon je?",
    subRegion: "Sommige voordelen verschillen per gemeente, niet enkel per regio.",
    regionLabel: "Regio",
    communeLabel: "Gemeente",
    continueBtn: "Verder",
    headlineSituation: "Wat is jouw\nsituatie nu?",
    subSituation: "Kies wat van toepassing is. We tonen dit eerst — je kan nadien nog alles bekijken.",
    headlineIncome: "Nog één ding\n(helemaal optioneel)",
    subIncome: "Dit helpt ons enkel om te bepalen wat we eerst tonen. Niets wordt verborgen, en deze app is voor iedereen, ongeacht inkomen.",
    seeMatches: "Toon mijn resultaten",
    showEverything: "Toon alles",
    yourBenefits: "Jouw voordelen",
    searchPlaceholder: "Zoek voordelen...",
    matchedTo: "Afgestemd op:",
    localTipsHeader: "Lokale tips voor jou",
    communityTip: "Tip van de gemeenschap",
    notOfficial: "geen officieel overheidsvoordeel",
    whatYoullNeed: "Wat je nodig hebt",
    newToItsme: "Nieuw met itsme?",
    itsmeTip: "Snelste manier: open je bank-app (Belfius, BNP Paribas Fortis, KBC, ING of Hello Bank) en zoek naar \"itsme activeren.\" Geen bank-app die dit ondersteunt? Activeer itsme dan met je eID-kaart en een kaartlezer via itsme-id.com.",
    howToRequest: "Hoe aanvragen",
    openOfficial: "Open officiële aanvraagpagina",
    lastVerified: "Laatst gecontroleerd op",
    youCouldReceive: "Je zou kunnen ontvangen",
    deadline: "Deadline",
    chatHeadline: "Vraag wat voor jou geldt",
    chatSub: "Antwoorden enkel uit onze geverifieerde databank",
    chatPlaceholder: "Beschrijf je situatie...",
    submitHeadline: "Voordeel toevoegen",
    submitSub: "Wordt gecontroleerd door moderators voor publicatie",
    submitBtn: "Indienen ter controle",
    navBrowse: "Bladeren",
    navAsk: "Vraag",
    navSubmit: "Toevoegen",
    back: "Terug",
    forward: "Vooruit",
    noMatches: "Geen resultaten. Probeer een andere zoekterm of categorie.",
    verified: "Geverifieerd",
    community: "Gemeenschap",
    fields: { title: "Titel", institution: "Verantwoordelijke instantie", amount: "Geschat bedrag", deadlineLabel: "Deadline / tijdsregel", link: "Officiële link" },
    categories: { housing: "Wonen", family: "Gezin", health: "Gezondheid", employment: "Werk", other: "Andere" },
    situations: { pregnancy: "In verwachting of adoptie", "job-loss": "Ik verloor mijn job", "buying-home": "Een huis kopen", renting: "Huren", "health-issue": "Gezondheidsprobleem of beperking" },
    income: { lower: "Lager inkomen", middle: "Middeninkomen", higher: "Hoger inkomen", skip: "Zeg ik liever niet" },
  },
  fr: {
    langLabel: "Français",
    headline0: "Ce à quoi vous avez droit,\nregroupé au même endroit.",
    sub0: "La Belgique propose des dizaines d'avantages que vous devez demander vous-même — sinon vous les perdez. Nous les associons à votre région.",
    getStarted: "Commencer",
    step: "Étape {n} sur {total}",
    headlineRegion: "Où habitez-vous ?",
    subRegion: "Certains avantages varient selon la commune, pas seulement la région.",
    regionLabel: "Région",
    communeLabel: "Commune",
    continueBtn: "Continuer",
    headlineSituation: "Quelle est votre\nsituation actuelle ?",
    subSituation: "Choisissez ce qui s'applique. Nous l'afficherons en premier — vous pourrez tout voir ensuite.",
    headlineIncome: "Une dernière chose\n(entièrement facultatif)",
    subIncome: "Cela nous aide seulement à classer ce que nous montrons en premier. Rien n'est caché, et cette application est pour tout le monde, quel que soit le revenu.",
    seeMatches: "Voir mes résultats",
    showEverything: "Tout afficher",
    yourBenefits: "Vos avantages",
    searchPlaceholder: "Rechercher un avantage...",
    matchedTo: "Associé à :",
    localTipsHeader: "Astuces locales pour vous",
    communityTip: "Astuce communautaire",
    notOfficial: "pas un avantage officiel du gouvernement",
    whatYoullNeed: "Ce dont vous aurez besoin",
    newToItsme: "Nouveau avec itsme ?",
    itsmeTip: "Le plus rapide : ouvrez l'application de votre banque (Belfius, BNP Paribas Fortis, KBC, ING ou Hello Bank) et cherchez « Activer itsme ». Pas d'application bancaire compatible ? Activez itsme avec votre carte eID et un lecteur de carte sur itsme-id.com.",
    howToRequest: "Comment le demander",
    openOfficial: "Ouvrir la page de demande officielle",
    lastVerified: "Dernière vérification le",
    youCouldReceive: "Vous pourriez recevoir",
    deadline: "Échéance",
    chatHeadline: "Demandez ce qui s'applique à vous",
    chatSub: "Réponses uniquement issues de notre base vérifiée",
    chatPlaceholder: "Décrivez votre situation...",
    submitHeadline: "Proposer un avantage",
    submitSub: "Vérifié par des modérateurs avant publication",
    submitBtn: "Soumettre pour vérification",
    navBrowse: "Parcourir",
    navAsk: "Demander",
    navSubmit: "Proposer",
    back: "Retour",
    forward: "Suivant",
    noMatches: "Aucun résultat. Essayez une autre recherche ou catégorie.",
    verified: "Vérifié",
    community: "Communauté",
    fields: { title: "Titre", institution: "Organisme responsable", amount: "Montant approximatif", deadlineLabel: "Échéance / règle de délai", link: "Lien officiel" },
    categories: { housing: "Logement", family: "Famille", health: "Santé", employment: "Emploi", other: "Autre" },
    situations: { pregnancy: "En attente d'un enfant ou adoption", "job-loss": "J'ai perdu mon emploi", "buying-home": "Achat d'un logement", renting: "Location", "health-issue": "Problème de santé ou handicap" },
    income: { lower: "Revenu modeste", middle: "Revenu moyen", higher: "Revenu élevé", skip: "Je préfère ne pas dire" },
  },
  de: {
    langLabel: "Deutsch",
    headline0: "Was Ihnen zusteht,\nan einem Ort.",
    sub0: "Belgien bietet Dutzende Vergünstigungen, die Sie selbst beantragen müssen — sonst verlieren Sie sie. Wir zeigen Ihnen, was zu Ihrer Region passt.",
    getStarted: "Loslegen",
    step: "Schritt {n} von {total}",
    headlineRegion: "Wo wohnen Sie?",
    subRegion: "Manche Vergünstigungen unterscheiden sich je Gemeinde, nicht nur je Region.",
    regionLabel: "Region",
    communeLabel: "Gemeinde",
    continueBtn: "Weiter",
    headlineSituation: "Was ist gerade\nIhre Situation?",
    subSituation: "Wählen Sie, was zutrifft. Wir zeigen das zuerst — danach können Sie alles durchsehen.",
    headlineIncome: "Noch eine Sache\n(völlig freiwillig)",
    subIncome: "Das hilft uns nur, die Reihenfolge festzulegen. Nichts wird verborgen, und diese App ist für alle gedacht, unabhängig vom Einkommen.",
    seeMatches: "Meine Treffer zeigen",
    showEverything: "Alles anzeigen",
    yourBenefits: "Ihre Vergünstigungen",
    searchPlaceholder: "Vergünstigungen suchen...",
    matchedTo: "Passend zu:",
    localTipsHeader: "Lokale Tipps für Sie",
    communityTip: "Tipp aus der Gemeinschaft",
    notOfficial: "keine offizielle staatliche Vergünstigung",
    whatYoullNeed: "Was Sie brauchen",
    newToItsme: "Neu bei itsme?",
    itsmeTip: "Am schnellsten: Öffnen Sie Ihre Banking-App (Belfius, BNP Paribas Fortis, KBC, ING oder Hello Bank) und suchen Sie nach „itsme aktivieren\". Keine passende Banking-App? Aktivieren Sie itsme stattdessen mit Ihrer eID-Karte und einem Kartenlesegerät auf itsme-id.com.",
    howToRequest: "So beantragen Sie es",
    openOfficial: "Offizielle Antragsseite öffnen",
    lastVerified: "Zuletzt geprüft am",
    youCouldReceive: "Sie könnten erhalten",
    deadline: "Frist",
    chatHeadline: "Fragen Sie, was für Sie gilt",
    chatSub: "Antworten nur aus unserer geprüften Datenbank",
    chatPlaceholder: "Beschreiben Sie Ihre Situation...",
    submitHeadline: "Vergünstigung einreichen",
    submitSub: "Wird vor Veröffentlichung von Moderatoren geprüft",
    submitBtn: "Zur Prüfung einreichen",
    navBrowse: "Durchsuchen",
    navAsk: "Fragen",
    navSubmit: "Einreichen",
    back: "Zurück",
    forward: "Weiter",
    noMatches: "Keine Treffer. Versuchen Sie eine andere Suche oder Kategorie.",
    verified: "Geprüft",
    community: "Gemeinschaft",
    fields: { title: "Titel", institution: "Zuständige Behörde", amount: "Ungefährer Betrag", deadlineLabel: "Frist / Zeitregel", link: "Offizieller Link" },
    categories: { housing: "Wohnen", family: "Familie", health: "Gesundheit", employment: "Arbeit", other: "Sonstiges" },
    situations: { pregnancy: "Erwarten oder Adoption eines Kindes", "job-loss": "Ich habe meinen Job verloren", "buying-home": "Ein Haus kaufen", renting: "Mieten", "health-issue": "Gesundheitsproblem oder Behinderung" },
    income: { lower: "Niedrigeres Einkommen", middle: "Mittleres Einkommen", higher: "Höheres Einkommen", skip: "Keine Angabe" },
  },
};

const langOptions = [
  { id: "nl", flag: "🇳🇱" },
  { id: "fr", flag: "🇫🇷" },
  { id: "de", flag: "🇩🇪" },
  { id: "en", flag: "🇬🇧" },
];

function useT(lang) {
  return (key) => {
    const val = translations[lang]?.[key];
    return val !== undefined ? val : translations.en[key];
  };
}

const categories = [
  { id: "housing", icon: Building2, emoji: "🏠" },
  { id: "family", icon: Baby, emoji: "👶" },
  { id: "health", icon: Heart, emoji: "❤️" },
  { id: "employment", icon: Briefcase, emoji: "💼" },
  { id: "other", icon: HelpCircle, emoji: "✨" },
];

const situations = [
  { id: "pregnancy", icon: Baby, emoji: "👶" },
  { id: "job-loss", icon: Briefcase, emoji: "💼" },
  { id: "buying-home", icon: Building2, emoji: "🏠" },
  { id: "renting", icon: Home, emoji: "🔑" },
  { id: "health-issue", icon: Heart, emoji: "❤️" },
];

const incomeTiers = [
  { id: "lower", emoji: "🌱" },
  { id: "middle", emoji: "🌿" },
  { id: "higher", emoji: "🌳" },
  { id: "skip", emoji: "🤝" },
];

const localTips = [
  {
    id: "t1",
    commune: "Ghent",
    situations: ["pregnancy"],
    partner: true,
    content: {
      en: { title: "Babytheek Gent — borrow baby clothes", desc: "Rent a full wardrobe of baby clothes for a year for €50 — handy since babies outgrow clothes in weeks. Swap sizes as your baby grows.", address: "Sample address, Ghent" },
      nl: { title: "Babytheek Gent — huur babykledij", desc: "Huur een volledige babykledij-garderobe voor een jaar voor €50 — handig want baby's groeien razendsnel uit hun kleren. Wissel van maat naarmate je baby groeit.", address: "Voorbeeldadres, Gent" },
      fr: { title: "Babytheek Gent — location de vêtements pour bébé", desc: "Louez une garde-robe complète de vêtements pour bébé pendant un an pour 50 € — pratique, car les bébés grandissent vite. Échangez les tailles au fur et à mesure.", address: "Adresse exemple, Gand" },
      de: { title: "Babytheek Gent — Babykleidung leihen", desc: "Leihen Sie für ein Jahr eine komplette Babykleidungs-Garderobe für 50 € — praktisch, da Babys ihre Kleidung schnell auswachsen. Tauschen Sie die Größen, wenn Ihr Baby wächst.", address: "Beispieladresse, Gent" },
    },
  },
  {
    id: "t2",
    commune: "Ghent",
    situations: ["job-loss"],
    partner: true,
    content: {
      en: { title: "Too Good To Go — rescue groceries nearby", desc: "Pick up surprise bags of unsold food from nearby supermarkets and bakeries at a fraction of the price via the Too Good To Go app.", address: "Multiple locations" },
      nl: { title: "Too Good To Go — red voedsel in de buurt", desc: "Haal verrassingspakketten met onverkocht eten op bij supermarkten en bakkers in de buurt, voor een fractie van de prijs via de Too Good To Go-app.", address: "Meerdere locaties" },
      fr: { title: "Too Good To Go — sauvez des courses près de chez vous", desc: "Récupérez des paniers surprise d'invendus dans les supermarchés et boulangeries voisins, à prix réduit via l'application Too Good To Go.", address: "Plusieurs emplacements" },
      de: { title: "Too Good To Go — Lebensmittel in der Nähe retten", desc: "Holen Sie sich Überraschungstüten mit unverkauften Lebensmitteln von Supermärkten und Bäckereien in der Nähe zu einem Bruchteil des Preises über die Too Good To Go-App.", address: "Mehrere Standorte" },
    },
  },
];

function getContent(item, lang) {
  return item.content[lang] || item.content.en;
}

const benefits = [
  {
    id: 1,
    category: "family",
    situations: ["pregnancy"],
    region: "Flanders",
    communes: [],
    institution: "Kind & Gezin",
    verified: "12 Jul 2026",
    status: "verified",
    content: {
      en: {
        title: "Geboortepremie (Birth Grant)",
        desc: "A one-time payment when you're expecting or adopting a child.",
        deadline: "Request from 4 months before due date",
        amount: "€1,247",
        requirements: [
          { type: "phone", label: "itsme app (easiest — set up via your bank app)" },
          { type: "card", label: "or: Belgian eID card + eID card reader + computer" },
          { type: "id", label: "Belgian National Registry number" },
        ],
        steps: [
          "Create an account on Groeipakket.be",
          "Fill in expected due date and household details",
          "Submit before the 4-month deadline",
          "Payment issued the month before birth",
        ],
      },
      nl: {
        title: "Geboortepremie",
        desc: "Een eenmalige uitkering wanneer je een kindje verwacht of adopteert.",
        deadline: "Aan te vragen vanaf 4 maanden voor de uitgerekende datum",
        amount: "€1.247",
        requirements: [
          { type: "phone", label: "itsme-app (makkelijkst — activeren via je bank-app)" },
          { type: "card", label: "of: Belgische eID-kaart + eID-kaartlezer + computer" },
          { type: "id", label: "Belgisch rijksregisternummer" },
        ],
        steps: [
          "Maak een account aan op Groeipakket.be",
          "Vul de uitgerekende datum en gezinsgegevens in",
          "Dien in vóór de deadline van 4 maanden",
          "Uitbetaling de maand vóór de geboorte",
        ],
      },
      fr: {
        title: "Prime de naissance",
        desc: "Un paiement unique lorsque vous attendez ou adoptez un enfant.",
        deadline: "À demander à partir de 4 mois avant la date prévue",
        amount: "1.247 €",
        requirements: [
          { type: "phone", label: "Application itsme (le plus simple — à activer via votre appli bancaire)" },
          { type: "card", label: "ou : carte eID belge + lecteur de carte eID + ordinateur" },
          { type: "id", label: "Numéro de registre national belge" },
        ],
        steps: [
          "Créez un compte sur Groeipakket.be",
          "Indiquez la date prévue et les informations du ménage",
          "Soumettez avant le délai de 4 mois",
          "Paiement versé le mois précédant la naissance",
        ],
      },
      de: {
        title: "Geburtsprämie",
        desc: "Eine einmalige Zahlung, wenn Sie ein Kind erwarten oder adoptieren.",
        deadline: "Antragstellung ab 4 Monate vor dem Geburtstermin",
        amount: "1.247 €",
        requirements: [
          { type: "phone", label: "itsme-App (am einfachsten — Aktivierung über Ihre Banking-App)" },
          { type: "card", label: "oder: belgische eID-Karte + eID-Kartenlesegerät + Computer" },
          { type: "id", label: "Belgische Nationalregisternummer" },
        ],
        steps: [
          "Erstellen Sie ein Konto auf Groeipakket.be",
          "Geben Sie den Geburtstermin und Haushaltsdaten ein",
          "Reichen Sie den Antrag vor der 4-Monats-Frist ein",
          "Auszahlung im Monat vor der Geburt",
        ],
      },
    },
  },
  {
    id: 2,
    category: "housing",
    situations: ["buying-home", "job-loss"],
    region: "Federal",
    communes: [],
    institution: "Your mortgage lender",
    verified: "8 Jul 2026",
    status: "verified",
    content: {
      en: {
        title: "Mortgage Payment Protection Insurance",
        desc: "If either spouse loses their job, this covers mortgage payments for a set period. Not automatic — must be requested when the loan is signed.",
        deadline: "Must request at time of loan signing",
        amount: "Covers mortgage payments",
        requirements: [
          { type: "id", label: "Valid ID (eID card is enough — no reader needed for this one)" },
          { type: "doc", label: "Mortgage loan offer/documents" },
        ],
        steps: [
          "Ask your lender about 'gewaarborgd wonen' or lost-income cover",
          "Compare terms — coverage length varies",
          "Request in writing before signing the final loan contract",
        ],
      },
      nl: {
        title: "Verzekering gewaarborgd wonen",
        desc: "Als een van beide partners de job verliest, dekt dit de hypotheekbetalingen voor een bepaalde periode. Niet automatisch — moet aangevraagd worden bij het afsluiten van de lening.",
        deadline: "Aan te vragen bij het ondertekenen van de lening",
        amount: "Dekt hypotheekbetalingen",
        requirements: [
          { type: "id", label: "Geldige identiteitskaart (eID volstaat — geen kaartlezer nodig voor dit onderdeel)" },
          { type: "doc", label: "Hypothecaire leningsdocumenten" },
        ],
        steps: [
          "Vraag je kredietverstrekker naar 'gewaarborgd wonen' of inkomensverliesdekking",
          "Vergelijk de voorwaarden — dekkingsduur verschilt",
          "Vraag dit schriftelijk aan vóór het ondertekenen van de definitieve leningsovereenkomst",
        ],
      },
      fr: {
        title: "Assurance protection des paiements hypothécaires",
        desc: "Si l'un des conjoints perd son emploi, cette assurance couvre les paiements hypothécaires pendant une période déterminée. Pas automatique — doit être demandée lors de la signature du prêt.",
        deadline: "À demander lors de la signature du prêt",
        amount: "Couvre les paiements hypothécaires",
        requirements: [
          { type: "id", label: "Pièce d'identité valide (la carte eID suffit — pas de lecteur nécessaire ici)" },
          { type: "doc", label: "Documents de l'offre de prêt hypothécaire" },
        ],
        steps: [
          "Demandez à votre prêteur une couverture en cas de perte de revenus ('logement garanti')",
          "Comparez les conditions — la durée de couverture varie",
          "Faites la demande par écrit avant de signer le contrat de prêt définitif",
        ],
      },
      de: {
        title: "Hypotheken-Zahlungsschutzversicherung",
        desc: "Verliert einer der Partner den Job, deckt diese Versicherung die Hypothekenzahlungen für einen bestimmten Zeitraum. Nicht automatisch — muss bei der Unterzeichnung des Kredits beantragt werden.",
        deadline: "Bei Unterzeichnung des Kredits zu beantragen",
        amount: "Deckt Hypothekenzahlungen",
        requirements: [
          { type: "id", label: "Gültiger Ausweis (eID-Karte genügt — hierfür kein Kartenlesegerät nötig)" },
          { type: "doc", label: "Unterlagen zum Hypothekendarlehen" },
        ],
        steps: [
          "Fragen Sie Ihren Kreditgeber nach einer Absicherung bei Einkommensverlust",
          "Vergleichen Sie die Bedingungen — die Deckungsdauer variiert",
          "Beantragen Sie dies schriftlich vor Unterzeichnung des endgültigen Kreditvertrags",
        ],
      },
    },
  },
  {
    id: 3,
    category: "housing",
    situations: ["renting", "job-loss"],
    region: "Flanders",
    communes: [],
    institution: "Wonen Vlaanderen",
    verified: "2 Jul 2026",
    status: "verified",
    content: {
      en: {
        title: "Rent Subsidy (Huurpremie)",
        desc: "Monthly support for low-income households renting on the private market.",
        deadline: "Apply anytime, backdated up to 12 months",
        amount: "Up to €200/month",
        requirements: [
          { type: "phone", label: "itsme app or eID card + reader for the online form" },
          { type: "doc", label: "Lease contract + proof of income" },
        ],
        steps: [
          "Check eligibility on wonenvlaanderen.be",
          "Submit application with proof of income and lease",
          "Wait for confirmation letter",
        ],
      },
      nl: {
        title: "Huurpremie",
        desc: "Maandelijkse ondersteuning voor gezinnen met een laag inkomen die op de private markt huren.",
        deadline: "Op elk moment aan te vragen, met terugwerkende kracht tot 12 maanden",
        amount: "Tot €200/maand",
        requirements: [
          { type: "phone", label: "itsme-app of eID-kaart + lezer voor het online formulier" },
          { type: "doc", label: "Huurcontract + inkomensbewijs" },
        ],
        steps: [
          "Controleer of je in aanmerking komt op wonenvlaanderen.be",
          "Dien de aanvraag in met inkomensbewijs en huurcontract",
          "Wacht op de bevestigingsbrief",
        ],
      },
      fr: {
        title: "Prime de loyer (Huurpremie)",
        desc: "Soutien mensuel pour les ménages à faible revenu qui louent sur le marché privé.",
        deadline: "À demander à tout moment, avec effet rétroactif jusqu'à 12 mois",
        amount: "Jusqu'à 200 €/mois",
        requirements: [
          { type: "phone", label: "Application itsme ou carte eID + lecteur pour le formulaire en ligne" },
          { type: "doc", label: "Contrat de bail + preuve de revenus" },
        ],
        steps: [
          "Vérifiez votre éligibilité sur wonenvlaanderen.be",
          "Soumettez la demande avec une preuve de revenus et le contrat de bail",
          "Attendez la lettre de confirmation",
        ],
      },
      de: {
        title: "Mietzuschuss (Huurpremie)",
        desc: "Monatliche Unterstützung für Haushalte mit niedrigem Einkommen, die auf dem privaten Markt mieten.",
        deadline: "Jederzeit zu beantragen, rückwirkend bis zu 12 Monate",
        amount: "Bis zu 200 €/Monat",
        requirements: [
          { type: "phone", label: "itsme-App oder eID-Karte + Lesegerät für das Online-Formular" },
          { type: "doc", label: "Mietvertrag + Einkommensnachweis" },
        ],
        steps: [
          "Prüfen Sie Ihre Berechtigung auf wonenvlaanderen.be",
          "Reichen Sie den Antrag mit Einkommensnachweis und Mietvertrag ein",
          "Warten Sie auf das Bestätigungsschreiben",
        ],
      },
    },
  },
  {
    id: 4,
    category: "family",
    situations: ["pregnancy"],
    region: "Wallonia",
    communes: [],
    institution: "FAMIWAL",
    verified: "5 Jul 2026",
    status: "community",
    content: {
      en: {
        title: "Birth Grant — Wallonia (Prime Naissance)",
        desc: "Wallonia's equivalent one-time birth payment, requested through a different body than Flanders.",
        deadline: "Request from 2 months before due date",
        amount: "€1,247",
        steps: [
          "Register with FAMIWAL or your caisse d'allocations",
          "Submit medical certificate of pregnancy",
          "Confirm bank details for payout",
        ],
      },
      nl: {
        title: "Geboortepremie — Wallonië (Prime Naissance)",
        desc: "Het Waalse equivalent van de eenmalige geboorte-uitkering, aan te vragen bij een andere instantie dan in Vlaanderen.",
        deadline: "Aan te vragen vanaf 2 maanden voor de uitgerekende datum",
        amount: "€1.247",
        steps: [
          "Registreer je bij FAMIWAL of je uitbetalingskas",
          "Dien een medisch attest van zwangerschap in",
          "Bevestig je bankgegevens voor de uitbetaling",
        ],
      },
      fr: {
        title: "Prime de naissance — Wallonie",
        desc: "L'équivalent wallon du paiement unique de naissance, à demander auprès d'un organisme différent de celui de la Flandre.",
        deadline: "À demander à partir de 2 mois avant la date prévue",
        amount: "1.247 €",
        steps: [
          "Inscrivez-vous auprès de FAMIWAL ou de votre caisse d'allocations",
          "Soumettez un certificat médical de grossesse",
          "Confirmez vos coordonnées bancaires pour le versement",
        ],
      },
      de: {
        title: "Geburtsprämie — Wallonien (Prime Naissance)",
        desc: "Das wallonische Äquivalent der einmaligen Geburtszahlung, zu beantragen bei einer anderen Stelle als in Flandern.",
        deadline: "Antragstellung ab 2 Monate vor dem Geburtstermin",
        amount: "1.247 €",
        steps: [
          "Registrieren Sie sich bei FAMIWAL oder Ihrer Familienausgleichskasse",
          "Reichen Sie ein ärztliches Schwangerschaftsattest ein",
          "Bestätigen Sie Ihre Bankdaten für die Auszahlung",
        ],
      },
    },
  },
];

const regions = ["Flanders", "Wallonia", "Brussels"];
const communesByRegion = {
  Flanders: ["Antwerp", "Ghent", "Leuven", "Bruges", "Kortrijk"],
  Wallonia: ["Liège", "Namur", "Charleroi", "Mons"],
  Brussels: ["Brussels City", "Schaerbeek", "Ixelles", "Uccle"],
};

function StampBadge({ status, t }) {
  const verified = status === "verified";
  return (
    <div
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
      style={{
        borderColor: verified ? c.green : c.gold,
        color: verified ? c.green : c.gold,
        background: verified ? c.greenBg : "#F6EDDB",
        fontFamily: bodyFont,
      }}
    >
      {verified ? <Check size={11} /> : <Clock size={11} />}
      {verified ? t("verified") : t("community")}
    </div>
  );
}

function TopNav({ canBack, canForward, onBack, onForward, t, dark }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2" style={{ background: dark ? c.ink : c.paper }}>
      <button
        onClick={onBack}
        disabled={!canBack}
        className="flex items-center gap-1.5 rounded-full pl-2.5 pr-4 py-2 text-sm font-bold disabled:opacity-25 transition-opacity"
        style={{
          background: canBack ? c.gold : "transparent",
          color: canBack ? c.ink : dark ? "#8AA0AE" : c.inkSoft,
          border: canBack ? "none" : `1.5px solid ${dark ? "#3A4A57" : c.line}`,
        }}
      >
        <ChevronLeft size={20} strokeWidth={3} />
        {t("back")}
      </button>
      <button
        onClick={onForward}
        disabled={!canForward}
        className="flex items-center justify-center w-10 h-10 rounded-full disabled:opacity-20 transition-opacity shrink-0"
        style={{
          background: canForward ? (dark ? "#2A3A47" : "white") : "transparent",
          border: `1.5px solid ${canForward ? c.post : dark ? "#3A4A57" : c.line}`,
        }}
        aria-label={t("forward")}
      >
        <ChevronRight size={18} strokeWidth={3} color={canForward ? c.post : dark ? "#8AA0AE" : c.inkSoft} />
      </button>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const t = useT(lang);

  const [history, setHistory] = useState([{ screen: "onboarding", step: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const current = history[historyIndex];

  const [region, setRegion] = useState(null);
  const [commune, setCommune] = useState(null);
  const [activeBenefit, setActiveBenefit] = useState(null);
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedSituations, setSelectedSituations] = useState([]);
  const [income, setIncome] = useState(null);

  const navigate = (node) => {
    const truncated = history.slice(0, historyIndex + 1);
    const newHistory = [...truncated, node];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  const goBack = () => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  };
  const goForward = () => {
    if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
  };

  const filtered = benefits.filter((b) => {
    if (category && b.category !== category) return false;
    if (query && !getContent(b, lang).title.toLowerCase().includes(query.toLowerCase())) return false;
    if (selectedSituations.length > 0 && !b.situations.some((s) => selectedSituations.includes(s))) return false;
    return true;
  });

  const navProps = {
    canBack: historyIndex > 0,
    canForward: historyIndex < history.length - 1,
    onBack: goBack,
    onForward: goForward,
    t,
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ background: "#E5E0D3", fontFamily: bodyFont }}>
      <div className="relative w-[380px] h-[780px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8" style={{ borderColor: "#0F1720", background: c.paper }}>
        <div className="h-full flex flex-col">
          {current.screen === "onboarding" && (
            <>
              <TopNav {...navProps} dark />
              <Onboarding
                step={current.step}
                goTo={(step) => navigate({ screen: "onboarding", step })}
                region={region}
                setRegion={setRegion}
                commune={commune}
                setCommune={setCommune}
                selectedSituations={selectedSituations}
                setSelectedSituations={setSelectedSituations}
                income={income}
                setIncome={setIncome}
                lang={lang}
                setLang={setLang}
                t={t}
                onDone={() => navigate({ screen: "home" })}
              />
            </>
          )}
          {current.screen === "home" && (
            <>
              <TopNav {...navProps} />
              <HomeScreen
                region={region}
                commune={commune}
                query={query}
                setQuery={setQuery}
                category={category}
                setCategory={setCategory}
                selectedSituations={selectedSituations}
                setSelectedSituations={setSelectedSituations}
                items={filtered}
                t={t}
                lang={lang}
                onOpen={(b) => {
                  setActiveBenefit(b);
                  navigate({ screen: "detail" });
                }}
                onChangeLocation={() => navigate({ screen: "onboarding", step: 1 })}
              />
              <BottomNav current={current.screen} navigate={navigate} t={t} />
            </>
          )}
          {current.screen === "detail" && activeBenefit && (
            <>
              <TopNav {...navProps} />
              <DetailScreen benefit={activeBenefit} t={t} lang={lang} />
              <BottomNav current={current.screen} navigate={navigate} t={t} />
            </>
          )}
          {current.screen === "chat" && (
            <>
              <TopNav {...navProps} />
              <ChatScreen t={t} />
              <BottomNav current={current.screen} navigate={navigate} t={t} />
            </>
          )}
          {current.screen === "submit" && (
            <>
              <TopNav {...navProps} />
              <SubmitScreen t={t} />
              <BottomNav current={current.screen} navigate={navigate} t={t} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Onboarding({ step, goTo, region, setRegion, commune, setCommune, selectedSituations, setSelectedSituations, income, setIncome, lang, setLang, t, onDone }) {
  const toggleSituation = (id) => {
    setSelectedSituations((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };
  const stepLabel = t("step").replace("{n}", step + 1).replace("{total}", "4");

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 overflow-y-auto" style={{ background: c.ink }}>
      <div className="flex-1 flex flex-col justify-center">
        {step === 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {langOptions.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border"
                style={{
                  borderColor: lang === l.id ? c.gold : "#3A4A57",
                  background: lang === l.id ? "rgba(184,134,59,0.18)" : "transparent",
                  color: lang === l.id ? c.gold : "#B7C4CE",
                }}
              >
                <span>{l.flag}</span> {translations[l.id].langLabel}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: c.gold, fontFamily: bodyFont }}>
          {stepLabel}
        </p>
        <h1 className="text-3xl leading-tight mb-3 whitespace-pre-line" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
          {step === 0 ? t("headline0") : step === 1 ? t("headlineRegion") : step === 2 ? t("headlineSituation") : t("headlineIncome")}
        </h1>
        <p className="text-sm mb-8" style={{ color: "#B7C4CE" }}>
          {step === 0 ? t("sub0") : step === 1 ? t("subRegion") : step === 2 ? t("subSituation") : t("subIncome")}
        </p>

        {step === 0 && (
          <button onClick={() => goTo(1)} className="flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm" style={{ background: c.gold, color: c.ink }}>
            {t("getStarted")} <ChevronRight size={16} />
          </button>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8AA0AE" }}>
                {t("regionLabel")}
              </p>
              <div className="flex gap-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRegion(r);
                      setCommune(null);
                    }}
                    className="flex-1 rounded-lg py-2.5 text-xs font-semibold border"
                    style={{
                      borderColor: region === r ? c.gold : "#3A4A57",
                      background: region === r ? "rgba(184,134,59,0.15)" : "transparent",
                      color: region === r ? c.gold : "#B7C4CE",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {region && (
              <div>
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8AA0AE" }}>
                  {t("communeLabel")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {communesByRegion[region].map((cm) => (
                    <button
                      key={cm}
                      onClick={() => setCommune(cm)}
                      className="rounded-lg py-2.5 text-xs font-semibold border"
                      style={{
                        borderColor: commune === cm ? c.gold : "#3A4A57",
                        background: commune === cm ? "rgba(184,134,59,0.15)" : "transparent",
                        color: commune === cm ? c.gold : "#B7C4CE",
                      }}
                    >
                      {cm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!region || !commune}
              onClick={() => goTo(2)}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm disabled:opacity-30"
              style={{ background: c.gold, color: c.ink }}
            >
              {t("continueBtn")} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2.5">
              {situations.map((s) => {
                const active = selectedSituations.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSituation(s.id)}
                    className="flex items-center gap-3 rounded-2xl py-4 px-4 text-base font-semibold border-2 text-left"
                    style={{
                      borderColor: active ? c.gold : "#3A4A57",
                      background: active ? "rgba(184,134,59,0.18)" : "transparent",
                      color: active ? c.gold : "#D7DEE3",
                    }}
                  >
                    <span className="text-2xl leading-none">{s.emoji}</span>
                    {t("situations")[s.id]}
                    {active && <Check size={18} className="ml-auto" />}
                  </button>
                );
              })}
            </div>

            <button onClick={() => goTo(3)} className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm" style={{ background: c.gold, color: c.ink }}>
              {t("continueBtn")} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              {incomeTiers.map((tier) => {
                const active = income === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setIncome(tier.id)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-2 text-xs font-semibold border-2"
                    style={{
                      borderColor: active ? c.gold : "#3A4A57",
                      background: active ? "rgba(184,134,59,0.18)" : "transparent",
                      color: active ? c.gold : "#D7DEE3",
                    }}
                  >
                    <span className="text-2xl leading-none">{tier.emoji}</span>
                    {t("income")[tier.id]}
                  </button>
                );
              })}
            </div>

            <button onClick={onDone} className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm" style={{ background: c.gold, color: c.ink }}>
              {selectedSituations.length > 0 ? t("seeMatches") : t("showEverything")} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({ region, commune, query, setQuery, category, setCategory, selectedSituations, setSelectedSituations, items, onOpen, onChangeLocation, t, lang }) {
  const situationLabels = situations.filter((s) => selectedSituations.includes(s.id)).map((s) => t("situations")[s.id]);
  return (
    <div className="flex-1 overflow-y-auto pb-4" style={{ background: c.paper }}>
      <div className="px-5 pt-2 pb-4" style={{ background: c.ink }}>
        <button onClick={onChangeLocation} className="flex items-center gap-1.5 text-xs mb-3" style={{ color: c.gold }}>
          <MapPin size={13} />
          {commune}, {region} <ChevronRight size={12} />
        </button>
        <h1 className="text-2xl mb-3" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
          {t("yourBenefits")}
        </h1>
        {situationLabels.length > 0 && (
          <button
            onClick={() => setSelectedSituations([])}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3 text-[11px] font-medium"
            style={{ background: "rgba(184,134,59,0.18)", color: c.gold }}
          >
            {t("matchedTo")} {situationLabels.join(", ")}
            <span className="ml-1 font-bold">✕</span>
          </button>
        )}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "#2A3A47" }}>
          <Search size={15} color="#8AA0AE" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: c.paper }}
          />
        </div>
      </div>

      <div className="flex gap-2 px-5 py-3 overflow-x-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(active ? null : cat.id)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap"
              style={{
                borderColor: active ? c.post : c.line,
                background: active ? c.post : "white",
                color: active ? "white" : c.inkSoft,
              }}
            >
              <Icon size={12} /> {t("categories")[cat.id]}
            </button>
          );
        })}
      </div>

      <div className="px-5 flex flex-col gap-3">
        {items.map((b) => {
          const bc = getContent(b, lang);
          return (
            <button key={b.id} onClick={() => onOpen(b)} className="text-left rounded-xl p-4 border" style={{ background: "white", borderColor: c.line }}>
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-sm font-semibold pr-2" style={{ color: c.ink, fontFamily: displayFont }}>
                  {bc.title}
                </p>
                <StampBadge status={b.status} t={t} />
              </div>
              <p className="text-xs mb-2" style={{ color: c.inkSoft }}>
                {bc.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: c.gold, fontFamily: monoFont }}>
                  {bc.amount}
                </span>
                <span className="text-[11px]" style={{ color: c.inkSoft }}>
                  {b.institution}
                </span>
              </div>
            </button>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-center py-10" style={{ color: c.inkSoft }}>
            {t("noMatches")}
          </p>
        )}
      </div>

      {localTips.filter((tip) => tip.commune === commune && tip.situations.some((s) => selectedSituations.includes(s))).length > 0 && (
        <div className="px-5 mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.inkSoft }}>
            💡 {t("localTipsHeader")}
          </p>
          <div className="flex flex-col gap-3">
            {localTips
              .filter((tip) => tip.commune === commune && tip.situations.some((s) => selectedSituations.includes(s)))
              .map((tip) => {
                const tc = getContent(tip, lang);
                return (
                  <div key={tip.id} className="rounded-xl p-4 border-2 border-dashed" style={{ borderColor: c.gold, background: "#FBF6EA" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold pr-2" style={{ color: c.ink, fontFamily: displayFont }}>
                        {tc.title}
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0" style={{ background: c.gold, color: "white" }}>
                        {t("communityTip")}
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: c.inkSoft }}>
                      {tc.desc}
                    </p>
                    <p className="text-[10px]" style={{ color: c.inkSoft }}>
                      📍 {tc.address} · {t("notOfficial")}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailScreen({ benefit, t, lang }) {
  const bc = getContent(benefit, lang);
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: c.paper }}>
      <div className="px-5 pt-2 pb-5" style={{ background: c.ink }}>
        <StampBadge status={benefit.status} t={t} />
        <h1 className="text-2xl mt-2 mb-1" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
          {bc.title}
        </h1>
        <p className="text-xs" style={{ color: "#8AA0AE" }}>
          {benefit.institution} · {benefit.region}
        </p>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-xl p-4 mb-4 text-center" style={{ background: "#F6EDDB" }}>
          <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: c.gold }}>
            {t("youCouldReceive")}
          </p>
          <p className="text-2xl font-bold" style={{ color: c.gold, fontFamily: monoFont }}>
            {bc.amount}
          </p>
        </div>

        <div className="rounded-xl p-4 mb-4 border-2 border-dashed flex items-start gap-3" style={{ borderColor: c.clay, background: c.clayBg }}>
          <Clock size={16} color={c.clay} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: c.clay }}>
              {t("deadline")}
            </p>
            <p className="text-xs" style={{ color: c.ink }}>
              {bc.deadline}
            </p>
          </div>
        </div>

        <p className="text-sm mb-5" style={{ color: c.ink }}>
          {bc.desc}
        </p>

        {bc.requirements && bc.requirements.length > 0 && (
          <div className="rounded-xl p-4 mb-5" style={{ background: c.paperDim, border: `1px solid ${c.line}` }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: c.inkSoft }}>
              🎒 {t("whatYoullNeed")}
            </p>
            <div className="flex flex-col gap-2">
              {bc.requirements.map((r, i) => {
                const Icon = r.type === "phone" ? Smartphone : r.type === "card" ? CreditCard : r.type === "id" ? CreditCard : FileText;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon size={15} color={c.post} className="mt-0.5 shrink-0" />
                    <p className="text-xs" style={{ color: c.ink }}>
                      {r.label}
                    </p>
                  </div>
                );
              })}
            </div>
            {bc.requirements.some((r) => r.type === "phone") && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: c.line }}>
                <p className="text-[11px] font-semibold mb-1" style={{ color: c.post }}>
                  {t("newToItsme")}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: c.inkSoft }}>
                  {t("itsmeTip")}
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.inkSoft }}>
          {t("howToRequest")}
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {bc.steps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: c.post, color: "white" }}>
                {i + 1}
              </div>
              <p className="text-xs pt-0.5" style={{ color: c.ink }}>
                {s}
              </p>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-sm mb-3" style={{ background: c.post, color: "white" }}>
          {t("openOfficial")} <ExternalLink size={14} />
        </button>
        <p className="text-[10px] text-center" style={{ color: c.inkSoft }}>
          {t("lastVerified")} {benefit.verified}
        </p>
      </div>
    </div>
  );
}

function ChatScreen({ t }) {
  const [messages] = useState([
    { role: "assistant", text: "Hi — I can help you figure out what you're entitled to. What's your situation?" },
    { role: "user", text: "I'm expecting a baby in Ghent, Flanders." },
    { role: "assistant", text: "In Flanders, you're entitled to the Geboortepremie (€1,247) via Kind & Gezin — apply from 4 months before your due date. You may also qualify for the Groeipakket monthly child allowance. Want the request steps?" },
  ]);
  return (
    <div className="flex-1 flex flex-col" style={{ background: c.paper }}>
      <div className="px-5 pt-2 pb-4" style={{ background: c.ink }}>
        <h1 className="text-xl" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
          {t("chatHeadline")}
        </h1>
        <p className="text-[11px] mt-1" style={{ color: "#8AA0AE" }}>
          {t("chatSub")}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed"
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? c.post : "white",
              color: m.role === "user" ? "white" : c.ink,
              border: m.role === "user" ? "none" : `1px solid ${c.line}`,
            }}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="px-5 pb-6 pt-2 flex items-center gap-2 border-t" style={{ borderColor: c.line }}>
        <input placeholder={t("chatPlaceholder")} className="flex-1 rounded-full px-4 py-2.5 text-xs outline-none border" style={{ borderColor: c.line, color: c.ink }} />
        <button className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: c.post }}>
          <Send size={14} color="white" />
        </button>
      </div>
    </div>
  );
}

function SubmitScreen({ t }) {
  const fields = t("fields");
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: c.paper }}>
      <div className="px-5 pt-2 pb-5" style={{ background: c.ink }}>
        <h1 className="text-xl" style={{ color: c.paper, fontFamily: displayFont, fontWeight: 700 }}>
          {t("submitHeadline")}
        </h1>
        <p className="text-[11px] mt-1" style={{ color: "#8AA0AE" }}>
          {t("submitSub")}
        </p>
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">
        {[
          { label: fields.title, placeholder: "e.g. Energiepremie" },
          { label: fields.institution, placeholder: "e.g. Fluvius" },
          { label: fields.amount, placeholder: "e.g. €150" },
          { label: fields.deadlineLabel, placeholder: "e.g. within 3 months of invoice" },
          { label: fields.link, placeholder: "https://..." },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs font-semibold" style={{ color: c.ink }}>
              {field.label}
            </label>
            <input placeholder={field.placeholder} className="w-full mt-1.5 rounded-lg px-3 py-2.5 text-xs border outline-none" style={{ borderColor: c.line }} />
          </div>
        ))}
        <button className="w-full rounded-lg py-3.5 font-semibold text-sm mt-2" style={{ background: c.gold, color: c.ink }}>
          {t("submitBtn")}
        </button>
      </div>
    </div>
  );
}

function BottomNav({ current, navigate, t }) {
  const items = [
    { id: "home", icon: Home, label: t("navBrowse") },
    { id: "chat", icon: MessageCircle, label: t("navAsk") },
    { id: "submit", icon: PlusCircle, label: t("navSubmit") },
  ];
  return (
    <div className="flex border-t" style={{ borderColor: c.line, background: "white" }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = current === it.id || (current === "detail" && it.id === "home");
        return (
          <button key={it.id} onClick={() => navigate({ screen: it.id })} className="flex-1 flex flex-col items-center gap-1 py-2.5">
            <Icon size={18} color={active ? c.post : c.inkSoft} />
            <span className="text-[10px] font-medium" style={{ color: active ? c.post : c.inkSoft }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
