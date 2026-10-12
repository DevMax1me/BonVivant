// Questionnaire d'exploration des traits autistiques.
// Chaque item est noté de 0 à 3 (plus c'est haut, plus le trait est présent).
// rev: true => item inversé (le score est calculé comme 3 - réponse).
//
// Les domaines s'inspirent des critères du DSM-5-TR (A : communication et
// interactions sociales, B : comportements restreints et répétitifs, y compris
// la sensorialité, C : début précoce), des sous-échelles de l'AQ (Baron-Cohen
// et al., 2001), du CAT-Q (Hull et al., 2019) pour le camouflage, et des
// travaux sur la sensorialité (Dunn ; Robertson & Simmons, GSQ).
// Les formulations sont originales : ce n'est PAS une reproduction de ces
// outils et le questionnaire n'est pas validé psychométriquement.

const DOMAINS = [
  {
    id: "reciprocite",
    core: true,
    title: "Réciprocité dans la conversation",
    ref: "DSM-5 critère A1 · AQ « communication »",
    intro: "Comment se déroulent vos échanges avec les autres au quotidien ?",
    low: "Les échanges verbaux vous paraissent plutôt fluides.",
    high: "Les échanges verbaux (tour de parole, bavardage, démarrage et fin de conversation) demandent beaucoup d'effort ou vous échappent.",
    items: [
      { id: "r1", text: "J'ai du mal à savoir quand intervenir dans une conversation de groupe." },
      { id: "r2", text: "Il m'arrive de parler longuement d'un sujet qui me passionne sans m'apercevoir que l'autre s'en désintéresse." },
      { id: "r3", text: "Les conversations de politesse (« small talk ») me semblent pénibles ou sans objet." },
      { id: "r4", text: "J'engage facilement la conversation avec quelqu'un que je ne connais pas.", rev: true },
      { id: "r5", text: "Je ne sais pas comment terminer une conversation sans être brusque ou mal à l'aise." },
      { id: "r6", text: "En groupe, j'ai souvent l'impression d'être un observateur à l'extérieur de ce qui se joue." }
    ]
  },
  {
    id: "nonverbal",
    core: true,
    title: "Communication non verbale et sous-entendus",
    ref: "DSM-5 critère A2 · AQ « communication »",
    intro: "Il s'agit ici de la façon dont vous lisez et produisez les signaux implicites.",
    low: "Vous décodez en général aisément les signaux implicites.",
    high: "Les signaux implicites (regards, ton, ironie, sous-entendus) sont difficiles à décoder ou à produire spontanément.",
    items: [
      { id: "n1", text: "Je prends souvent les phrases au pied de la lettre ; l'ironie, les sous-entendus ou les expressions imagées m'échappent." },
      { id: "n2", text: "J'ai du mal à interpréter les expressions du visage ou le ton de voix des autres." },
      { id: "n3", text: "Je devine facilement ce que quelqu'un pense ou ressent d'après son attitude.", rev: true },
      { id: "n4", text: "Soutenir le regard de quelqu'un me demande un effort, ou on m'a dit que mon regard était trop fixe ou fuyant." },
      { id: "n5", text: "On me dit que mon ton, ma gestuelle ou mes mimiques ne correspondent pas à ce que je ressens." },
      { id: "n6", text: "J'ai besoin que l'on me dise les choses explicitement : les demandes indirectes ne passent pas." }
    ]
  },
  {
    id: "relations",
    core: true,
    title: "Relations, amitiés et codes sociaux",
    ref: "DSM-5 critère A3 · AQ « compétences sociales »",
    intro: "Pensez à vos amitiés, au travail, aux sorties et aux règles non écrites de la vie en société.",
    low: "Vous vous sentez globalement à l'aise dans la vie sociale.",
    high: "Créer, comprendre et maintenir des relations, ainsi que deviner les règles implicites, vous demande un effort inhabituel.",
    items: [
      { id: "s1", text: "J'ai peu d'amis proches, ou j'ai du mal à maintenir mes amitiés malgré mon envie." },
      { id: "s2", text: "Je comprends ce que l'autre ressent, mais je ne sais pas quoi dire ou faire pour réagir de façon appropriée." },
      { id: "s3", text: "Les règles sociales implicites (politesse, hiérarchie, ce qui « se fait ») me semblent illogiques ou difficiles à deviner." },
      { id: "s4", text: "Je me sens à l'aise dans les événements sociaux (fêtes, réunions, repas de groupe).", rev: true },
      { id: "s5", text: "Je préfère nettement les activités en solitaire aux activités à plusieurs." },
      { id: "s6", text: "J'ai souvent eu l'impression d'être « différent(e) » des autres, sans comprendre pourquoi." }
    ]
  },
  {
    id: "routines",
    core: true,
    title: "Routines, prévisibilité et flexibilité",
    ref: "DSM-5 critère B (immuabilité, routines) · AQ « changement d'attention »",
    intro: "Comment réagissez-vous aux imprévus, aux transitions et aux habitudes bousculées ?",
    low: "Vous vous adaptez en général sans trop de difficulté aux changements.",
    high: "L'imprévu et les transitions provoquent un stress important ; les routines vous apportent une sécurité très forte.",
    items: [
      { id: "f1", text: "Les changements de plan imprévus me stressent beaucoup." },
      { id: "f2", text: "J'aime que certaines choses soient toujours faites de la même manière (trajets, repas, rituels, rangement)." },
      { id: "f3", text: "Je m'adapte facilement à un changement de dernière minute.", rev: true },
      { id: "f4", text: "Quand une routine est perturbée, je peux être submergé(e) : irritabilité, panique, repli ou « blocage »." },
      { id: "f5", text: "J'ai du mal à passer d'une activité à une autre, surtout lorsque je suis absorbé(e)." },
      { id: "f6", text: "Les situations nouvelles exigent de moi beaucoup de préparation : je me fais des scénarios à l'avance." }
    ]
  },
  {
    id: "interets",
    core: true,
    title: "Intérêts intenses, détails et gestes répétitifs",
    ref: "DSM-5 critère B (intérêts restreints, stéréotypies) · AQ « souci du détail »",
    intro: "Pensez à vos passions, à votre façon de percevoir les détails et à vos gestes qui vous apaisent.",
    low: "Vos intérêts sont variés et votre attention porte plutôt sur l'ensemble.",
    high: "Vous avez des intérêts très intenses, une attention marquée aux détails et/ou des gestes répétitifs apaisants (stimming).",
    items: [
      { id: "i1", text: "J'ai des centres d'intérêt très intenses sur lesquels j'accumule une grande quantité de connaissances." },
      { id: "i2", text: "Je remarque des détails (motifs, bruits, erreurs, petits changements) que les autres ne voient pas." },
      { id: "i3", text: "J'aime les listes, les classifications, les collections, les chiffres ou les dates." },
      { id: "i4", text: "Je suis plus attiré(e) par la vue d'ensemble que par les détails.", rev: true },
      { id: "i5", text: "Quand une activité me passionne, je perds complètement la notion du temps et des besoins de mon corps." },
      { id: "i6", text: "Je répète certains gestes (me balancer, tapoter, tourner un objet, battre des mains, me gratter, fredonner) pour me calmer ou me concentrer." }
    ]
  },
  {
    id: "sensorialite",
    core: true,
    title: "Sensorialité",
    ref: "DSM-5 critère B (hyper/hyposensibilité) · Sensory Profile · GSQ",
    intro: "Pensez à vos cinq sens et à la façon dont votre corps réagit à l'environnement.",
    low: "Votre rapport aux sensations est peu perturbant.",
    high: "Votre perception sensorielle (sons, lumières, textures, odeurs, douleur) est plus intense, moins filtrée ou moins ressentie que la moyenne.",
    items: [
      { id: "z1", text: "Certains bruits (aspirateur, mastication, bruit de fond, sirènes) me sont insupportables ou m'empêchent de me concentrer." },
      { id: "z2", text: "Les lumières vives ou clignotantes, ou les environnements visuellement chargés, me fatiguent vite." },
      { id: "z3", text: "Certaines textures (étiquettes, coutures, aliments) me sont intolérables." },
      { id: "z4", text: "Les odeurs fortes me dérangent beaucoup plus que la plupart des gens." },
      { id: "z5", text: "Je suis peu sensible à la douleur, au chaud ou au froid, ou je ne m'en rends compte que tard." },
      { id: "z6", text: "Dans un lieu bondé ou bruyant, je suis vite épuisé(e) et j'ai besoin de m'isoler." }
    ]
  },
  {
    id: "camouflage",
    core: false,
    title: "Camouflage (masking)",
    ref: "CAT-Q (Hull et al., 2019) · Lai, Cassidy, Pearson",
    intro: "Le camouflage désigne les stratégies conscientes ou non pour paraître « comme tout le monde » en société.",
    low: "Vous vous comportez de manière assez naturelle en société.",
    high: "Vous compensez, imitez ou vous vous contrôlez fortement en société, souvent au prix d'une grande fatigue. Cela peut masquer des traits aux yeux des autres.",
    items: [
      { id: "c1", text: "Je prépare ou répète à l'avance ce que je vais dire dans une situation sociale." },
      { id: "c2", text: "J'imite les expressions, les gestes ou la façon de parler des autres pour passer inaperçu(e)." },
      { id: "c3", text: "Je me force à regarder dans les yeux, à sourire ou à hocher la tête pour paraître attentif(ve)." },
      { id: "c4", text: "Après un événement social, je suis vidé(e) et j'ai besoin de plusieurs heures, voire plusieurs jours, pour récupérer." },
      { id: "c5", text: "J'ai l'impression de jouer un rôle ou de porter un masque avec les autres." },
      { id: "c6", text: "Je me comporte de la même manière avec les autres qu'en étant seul(e), sans me contrôler.", rev: true }
    ]
  },
  {
    id: "parcours",
    core: false,
    title: "Enfance et retentissement dans la vie",
    ref: "DSM-5 critères C et D (début précoce, retentissement)",
    intro: "Les traits autistiques sont présents dès le développement précoce, même s'ils ne sont pas toujours repérés. Pensez à votre enfance et à votre vie d'adulte.",
    low: "Peu d'éléments d'enfance ou de retentissement évocateurs.",
    high: "Votre enfance et/ou votre parcours présentent plusieurs éléments évocateurs d'un fonctionnement autistique.",
    items: [
      { id: "e1", text: "Enfant, j'avais du mal à jouer avec les autres enfants, ou je préférais jouer seul(e)." },
      { id: "e2", text: "Enfant, je préférais aligner, trier ou classer mes jouets plutôt que jouer à faire semblant." },
      { id: "e3", text: "Enfant, j'avais des intérêts, des rituels ou des habitudes très marqués que l'on trouvait « particuliers »." },
      { id: "e4", text: "Enfant, on me décrivait comme « timide », « bizarre », « dans la lune » ou « trop sérieux(se) »." },
      { id: "e5", text: "J'ai eu des particularités de langage dans l'enfance (parler tôt comme un petit adulte, tard, répéter des phrases, voix inhabituelle)." },
      { id: "e6", text: "À l'âge adulte, j'ai connu épuisement, anxiété, dépression ou burn-out liés aux exigences sociales ou sensorielles du quotidien." }
    ]
  }
];

const CHOICES = [
  { value: 0, label: "Pas du tout d'accord" },
  { value: 1, label: "Plutôt pas d'accord" },
  { value: 2, label: "Plutôt d'accord" },
  { value: 3, label: "Tout à fait d'accord" }
];

const SOURCES = [
  { name: "DSM-5-TR (American Psychiatric Association, 2022)", note: "Critères diagnostiques du trouble du spectre de l'autisme (TSA), niveaux de soutien 1 à 3." },
  { name: "Baron-Cohen S. et al. (2001), Autism-Spectrum Quotient (AQ)", note: "Journal of Autism and Developmental Disorders, 31(1). Cinq dimensions : compétences sociales, changement d'attention, souci du détail, communication, imagination." },
  { name: "Ritvo R. et al. (2011), RAADS-R", note: "Questionnaire d'évaluation des traits autistiques chez l'adulte (langage, relations sociales, intérêts circonscrits, sensorimoteur)." },
  { name: "Hull L. et al. (2019), CAT-Q", note: "Camouflaging Autistic Traits Questionnaire : compensation, masquage, assimilation." },
  { name: "Lord C. et al., ADOS-2 · Rutter M. et al., ADI-R", note: "Outils de référence pour l'évaluation clinique par un professionnel formé." },
  { name: "Haute Autorité de Santé (France), recommandations de bonne pratique", note: "Diagnostic et repérage du TSA chez l'adulte et chez l'enfant ; Centres Ressources Autisme (CRA)." },
  { name: "Constantino J. & Todd R. ; Lundström S. et al.", note: "Les traits autistiques se distribuent de façon continue dans la population générale." },
  { name: "Lai M.-C. et al. ; Hull L. et al. ; Gould J. & Ashton-Smith J.", note: "Particularités de présentation chez les femmes et les personnes qui camouflent, sous-diagnostiquées." }
];
