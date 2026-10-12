(function () {
  "use strict";

  var STORAGE_KEY = "spectre-v1";
  var MAX_ITEM = 3;
  var SHORT = {
    reciprocite: "Conversation",
    nonverbal: "Non-verbal",
    relations: "Relations",
    routines: "Routines",
    interets: "Intérêts",
    sensorialite: "Sensorialité",
    camouflage: "Camouflage",
    parcours: "Enfance"
  };

  var TOTAL_ITEMS = DOMAINS.reduce(function (n, d) { return n + d.items.length; }, 0);

  // ---------- état ----------
  var state = { step: "intro", answers: {} };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved && typeof saved.answers === "object") {
        state.answers = saved.answers;
        state.step = saved.step === "result" || typeof saved.step === "number" ? saved.step : "intro";
        if (state.step === "result" && answeredCount() < TOTAL_ITEMS) state.step = "intro";
      }
    } catch (e) { /* stockage indisponible : on continue sans */ }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignoré */ }
  }

  function clearSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignoré */ }
  }

  function answeredCount() {
    return DOMAINS.reduce(function (n, d) {
      return n + d.items.filter(function (it) { return state.answers[it.id] !== undefined; }).length;
    }, 0);
  }

  // ---------- calcul des résultats ----------
  function itemScore(item, answers) {
    var v = answers[item.id];
    if (v === undefined) return null;
    return item.rev ? MAX_ITEM - v : v;
  }

  function band(pct) {
    if (pct < 30) return { key: "faible", label: "Peu de traits rapportés" };
    if (pct < 50) return { key: "modere", label: "Quelques traits rapportés" };
    if (pct < 70) return { key: "notable", label: "Nombre notable de traits" };
    return { key: "eleve", label: "Nombre élevé de traits" };
  }

  function computeResults(answers) {
    var domains = DOMAINS.map(function (d) {
      var sum = 0;
      d.items.forEach(function (it) { sum += itemScore(it, answers) || 0; });
      var pct = Math.round(sum / (d.items.length * MAX_ITEM) * 100);
      return { id: d.id, core: d.core, title: d.title, short: SHORT[d.id], low: d.low, high: d.high, sum: sum, pct: pct, band: band(pct) };
    });
    var total = domains.reduce(function (n, d) { return n + d.sum; }, 0);
    var globalPct = Math.round(total / (TOTAL_ITEMS * MAX_ITEM) * 100);
    var core = domains.filter(function (d) { return d.core; });
    var corePct = Math.round(core.reduce(function (n, d) { return n + d.pct; }, 0) / core.length);
    var byId = {};
    domains.forEach(function (d) { byId[d.id] = d; });
    return {
      domains: domains,
      byId: byId,
      globalPct: globalPct,
      globalBand: band(globalPct),
      corePct: corePct,
      camouflagePct: byId.camouflage.pct,
      childhoodPct: byId.parcours.pct
    };
  }

  function insightsFor(r) {
    var out = [];
    var core = r.domains.filter(function (d) { return d.core; }).slice().sort(function (a, b) { return b.pct - a.pct; });
    var top = core.slice(0, 2).filter(function (d) { return d.pct >= 50; });
    if (top.length) {
      out.push("Vos réponses se concentrent surtout sur : " + top.map(function (d) { return "« " + d.title.toLowerCase() + " » (" + d.pct + " %)"; }).join(" et ") + ".");
    } else {
      out.push("Aucun domaine ne ressort nettement au-dessus de 50 % : vos réponses sont plutôt réparties et modérées.");
    }

    var soc = (r.byId.reciprocite.pct + r.byId.nonverbal.pct + r.byId.relations.pct) / 3;
    var rep = (r.byId.routines.pct + r.byId.interets.pct + r.byId.sensorialite.pct) / 3;
    if (soc >= 50 && rep >= 50) {
      out.push("Les deux grandes dimensions du DSM-5 sont présentes dans vos réponses : la communication/les interactions sociales (" + Math.round(soc) + " %) et les comportements, intérêts et sensorialité (" + Math.round(rep) + " %). L'autisme se définit par la présence conjointe des deux.");
    } else if (soc >= 50 && rep < 50) {
      out.push("Vos réponses sont surtout marquées côté social/communication (" + Math.round(soc) + " %), moins côté routines, intérêts et sensorialité (" + Math.round(rep) + " %). D'autres explications (anxiété sociale, traits schizoïdes, TDAH, timidité marquée) sont à envisager en plus de l'autisme.");
    } else if (rep >= 50 && soc < 50) {
      out.push("Vos réponses sont surtout marquées côté routines, intérêts et sensorialité (" + Math.round(rep) + " %), moins côté social (" + Math.round(soc) + " %). Cela peut correspondre à une hypersensibilité, à un TDAH ou à un fonctionnement autistique bien compensé : seule une évaluation clinique peut trancher.");
    }

    if (r.camouflagePct >= 60 && r.corePct < r.camouflagePct - 10) {
      out.push("Votre camouflage est élevé (" + r.camouflagePct + " %) alors que vos traits « visibles » le sont moins (" + r.corePct + " %). La recherche (Hull, Lai, Gould) montre que le masquage peut gommer les signes extérieurs et retarder le diagnostic, en particulier chez les femmes et les personnes ayant appris à compenser. Le coût est souvent un épuisement important.");
    } else if (r.camouflagePct >= 60) {
      out.push("Votre niveau de camouflage est élevé (" + r.camouflagePct + " %) : même si vous vous adaptez, cela vous demande probablement beaucoup d'énergie.");
    }

    if (r.childhoodPct < 30 && r.globalPct >= 50) {
      out.push("Vous rapportez beaucoup de traits à l'âge adulte mais peu d'éléments dans l'enfance (" + r.childhoodPct + " %). L'autisme est un trouble du neurodéveloppement dont les signes existent dès l'enfance, même discrets ; si vous avez peu de souvenirs, les témoignages de proches ou des bulletins scolaires peuvent aider. D'autres causes (stress chronique, trauma, anxiété, épuisement) peuvent aussi produire des traits similaires plus tard.");
    } else if (r.childhoodPct >= 50 && r.globalPct >= 40) {
      out.push("Les éléments d'enfance sont cohérents avec le reste de vos réponses (" + r.childhoodPct + " %) : le critère de début précoce, nécessaire pour un diagnostic, est donc plausible.");
    }

    if (r.byId.sensorialite.pct >= 70) {
      out.push("Votre sensorialité ressort fortement (" + r.byId.sensorialite.pct + " %). Les particularités sensorielles sont très fréquentes dans l'autisme, mais existent aussi dans l'hypersensibilité, le TDAH, la migraine ou l'anxiété.");
    }
    return out;
  }

  // ---------- utilitaires DOM ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] === true) node.setAttribute(k, "");
        else if (attrs[k] !== false && attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function svg(tag, attrs, children) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  var main = document.getElementById("main");
  var progressWrap = document.getElementById("progressWrap");
  var progress = document.getElementById("progress");
  var progressBar = document.getElementById("progressBar");
  var progressLabel = document.getElementById("progressLabel");

  function go(step) {
    state.step = step;
    save();
    render();
    window.scrollTo(0, 0);
    var h = main.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  function updateProgress() {
    var show = typeof state.step === "number";
    progressWrap.hidden = !show;
    if (!show) return;
    var n = answeredCount();
    var pct = Math.round(n / TOTAL_ITEMS * 100);
    progress.setAttribute("aria-valuenow", String(pct));
    progressBar.style.width = pct + "%";
    progressLabel.textContent = "Partie " + (state.step + 1) + " sur " + DOMAINS.length + " · " + n + " réponses sur " + TOTAL_ITEMS;
  }

  // ---------- écrans ----------
  function renderIntro() {
    var consent = el("input", { type: "checkbox", id: "consent" });
    var start = el("button", { class: "btn", type: "button", disabled: true, onclick: function () { go(0); } }, [answeredCount() > 0 ? "Reprendre" : "Commencer le questionnaire"]);
    consent.addEventListener("change", function () { start.disabled = !consent.checked; });

    var children = [
      el("h1", { text: "Où vous situez-vous sur le spectre autistique ?" }),
      el("p", { class: "lead", text: "Un questionnaire de " + TOTAL_ITEMS + " questions, en " + DOMAINS.length + " parties, pour explorer vos traits autistiques et obtenir un profil détaillé. Compter environ 10 minutes." }),
      el("div", { class: "notice", role: "note" }, [
        el("strong", { text: "À lire avant de commencer" }),
        el("p", { text: "Cet outil sert à explorer, pas à diagnostiquer. Seul un professionnel formé (psychiatre, psychologue, neuropsychologue) peut poser un diagnostic de trouble du spectre de l'autisme, après un entretien approfondi et des outils comme l'ADOS-2 ou l'ADI-R." }),
        el("ul", {}, [
          el("li", { text: "Les questions sont inspirées des critères du DSM-5-TR et de questionnaires scientifiques (AQ, CAT-Q, RAADS-R), mais ce n'est pas un test validé : les seuils sont indicatifs." }),
          el("li", { text: "Un score élevé n'est pas un diagnostic ; un score faible n'exclut pas l'autisme, surtout en cas de camouflage." }),
          el("li", { text: "D'autres situations (anxiété sociale, TDAH, trauma, hypersensibilité) donnent des résultats proches." })
        ])
      ]),
      el("div", { class: "card" }, [
        el("h2", { text: "Comment répondre" }),
        el("p", { text: "Pour chaque phrase, indiquez à quel point elle vous correspond en général, à l'âge adulte (sauf les questions d'enfance). Répondez spontanément, sans chercher la « bonne » réponse. Pensez à ce que vous êtes vraiment, pas à ce que vous montrez aux autres." }),
        el("p", { class: "hint", text: "Vos réponses restent dans votre navigateur. Rien n'est envoyé à un serveur." }),
        el("label", { class: "consent", for: "consent" }, [consent, el("span", { text: "J'ai compris que ce questionnaire ne remplace pas un avis médical et ne constitue pas un diagnostic." })]),
        start
      ])
    ];
    if (answeredCount() > 0) {
      children.push(el("p", { class: "hint" }, [
        "Une partie de vos réponses a été conservée sur cet appareil. ",
        el("button", { class: "btn secondary", type: "button", onclick: function () { restart(); } }, ["Tout effacer et recommencer"])
      ]));
    }
    return children;
  }

  function renderDomain(index) {
    var d = DOMAINS[index];
    var form = el("form", { novalidate: true, onsubmit: function (e) { e.preventDefault(); } });

    d.items.forEach(function (it, i) {
      var legend = el("legend", {}, [el("span", { class: "q-num", text: (i + 1) + "." }), it.text]);
      var choices = el("div", { class: "choices" });
      CHOICES.forEach(function (c) {
        var input = el("input", { type: "radio", name: it.id, value: String(c.value), required: true });
        if (state.answers[it.id] === c.value) input.checked = true;
        input.addEventListener("change", function () {
          state.answers[it.id] = c.value;
          save();
          updateProgress();
          refreshNav();
        });
        choices.appendChild(el("label", { class: "choice" }, [input, el("span", { class: "choice-box", text: c.label })]));
      });
      form.appendChild(el("fieldset", { class: "q" }, [legend, choices]));
    });

    var back = el("button", { class: "btn secondary", type: "button", onclick: function () { go(index === 0 ? "intro" : index - 1); } }, ["Retour"]);
    var isLast = index === DOMAINS.length - 1;
    var next = el("button", { class: "btn", type: "button", onclick: function () { go(isLast ? "result" : index + 1); } }, [isLast ? "Voir mon profil" : "Partie suivante"]);
    var hint = el("span", { class: "hint", "aria-live": "polite" });

    function refreshNav() {
      var missing = d.items.filter(function (it) { return state.answers[it.id] === undefined; }).length;
      next.disabled = missing > 0;
      hint.textContent = missing > 0 ? missing + " question" + (missing > 1 ? "s" : "") + " sans réponse" : "";
    }
    refreshNav();

    return [
      el("h2", { text: d.title }),
      el("p", { class: "ref", text: d.ref }),
      el("p", { class: "lead", text: d.intro }),
      el("div", { class: "card" }, [form]),
      el("div", { class: "actions" }, [back, el("div", { class: "right" }, [hint, next])])
    ];
  }

  function radar(r) {
    var cx = 200, cy = 175, R = 110, n = r.domains.length;
    function pt(i, frac, extra) {
      var a = (-90 + i * 360 / n) * Math.PI / 180;
      var rad = R * frac + (extra || 0);
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    }
    var root = svg("svg", { class: "radar", viewBox: "0 0 400 350", role: "img", "aria-label": "Graphique radar du profil par domaine" });
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var pts = r.domains.map(function (_, i) { return pt(i, f).join(","); }).join(" ");
      root.appendChild(svg("polygon", { class: "grid", points: pts }));
    });
    r.domains.forEach(function (d, i) {
      var p = pt(i, 1);
      root.appendChild(svg("line", { class: "axis", x1: cx, y1: cy, x2: p[0], y2: p[1] }));
      var l = pt(i, 1, 16);
      var cos = Math.cos((-90 + i * 360 / n) * Math.PI / 180);
      var t = svg("text", { x: l[0], y: l[1] + 3, "text-anchor": Math.abs(cos) < 0.2 ? "middle" : (cos > 0 ? "start" : "end") });
      t.textContent = d.short;
      root.appendChild(t);
    });
    var shape = r.domains.map(function (d, i) { return pt(i, d.pct / 100).join(","); }).join(" ");
    root.appendChild(svg("polygon", { class: "shape", points: shape }));
    r.domains.forEach(function (d, i) {
      var p = pt(i, d.pct / 100);
      root.appendChild(svg("circle", { class: "dot", cx: p[0], cy: p[1], r: 3.5 }));
    });
    return root;
  }

  function renderResult() {
    var r = computeResults(state.answers);

    var gauge = el("div", { class: "gauge" }, [
      el("div", { class: "gauge-track", role: "img", "aria-label": "Position de " + r.globalPct + " % sur le continuum des traits" }, [
        el("div", { class: "gauge-marker", style: "left:" + Math.min(97, Math.max(3, r.globalPct)) + "%" })
      ]),
      el("div", { class: "gauge-scale", "aria-hidden": "true" }, [el("span", { text: "Peu de traits" }), el("span", { text: "Population générale" }), el("span", { text: "Beaucoup de traits" })])
    ]);

    var summary = el("div", { class: "card" }, [
      el("h1", { text: "Votre profil" }),
      el("div", { style: "display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:8px" }, [
        el("span", { class: "score-big", text: r.globalPct + " %" }),
        el("div", {}, [el("span", { class: "badge", text: r.globalBand.label }), el("p", { class: "hint", style: "margin:4px 0 0", text: "Score global sur les " + TOTAL_ITEMS + " questions" })])
      ]),
      gauge,
      el("p", {}, ["Traits « centraux » (parties 1 à 6) : ", el("strong", { text: r.corePct + " %" }), " · Camouflage : ", el("strong", { text: r.camouflagePct + " %" }), " · Enfance et retentissement : ", el("strong", { text: r.childhoodPct + " %" }), "."]),
      el("p", { class: "hint", text: "Les seuils (30 / 50 / 70 %) sont indicatifs et ne proviennent pas d'une validation clinique. Ils servent uniquement à situer vos réponses." })
    ]);

    var rows = r.domains.map(function (d) {
      return el("div", { class: "domain-row" }, [
        el("div", { class: "domain-head" }, [el("h3", { text: d.title }), el("span", { class: "pct", text: d.pct + " % · " + d.band.label })]),
        el("div", { class: "bar", role: "img", "aria-label": d.title + " : " + d.pct + " %" }, [el("span", { style: "width:" + d.pct + "%" })]),
        el("p", { text: d.pct >= 50 ? d.high : d.low })
      ]);
    });

    var profile = el("div", { class: "card" }, [el("h2", { text: "Détail par domaine" }), radar(r), el("div", { style: "margin-top:20px" }, rows)]);

    var obs = el("div", { class: "card" }, [
      el("h2", { text: "Ce que l'on peut observer" }),
      el("ul", { class: "insights" }, insightsFor(r).map(function (t) { return el("li", { text: t }); }))
    ]);

    var meaning = el("div", { class: "card" }, [
      el("h2", { text: "Comment lire ce « spectre »" }),
      el("p", { text: "Le « spectre » n'est pas une ligne allant de « un peu autiste » à « très autiste ». Les traits autistiques se répartissent de façon continue dans toute la population ; l'autisme correspond à un profil particulier de ces traits, présent depuis l'enfance et qui entraîne des difficultés significatives dans la vie quotidienne." }),
      el("p", { text: "Les « niveaux » 1, 2 et 3 du DSM-5 décrivent le niveau de soutien nécessaire, pas le nombre de traits : une personne avec peu de traits visibles peut avoir un besoin de soutien important, et inversement. Ce questionnaire ne peut pas évaluer ces niveaux." })
    ]);

    var next = el("div", { class: "card" }, [
      el("h2", { text: "Et maintenant ?" }),
      el("ul", { class: "insights" }, [
        el("li", { text: "Si ce profil vous parle ou si vous souffrez des difficultés décrites, parlez-en à votre médecin traitant, qui peut vous orienter." }),
        el("li", { text: "En France, les Centres Ressources Autisme (CRA) et les plateformes de diagnostic de l'adulte réalisent ou orientent les évaluations. Ailleurs, rapprochez-vous d'un service de psychiatrie ou de neuropsychologie spécialisé dans l'adulte." }),
        el("li", { text: "Vous pouvez imprimer cette page pour la montrer à un professionnel : elle résume vos réponses par domaine." }),
        el("li", { text: "Si vous traversez une période de grande détresse, n'attendez pas : en France, le 3114 (numéro national de prévention du suicide) est joignable 24 h/24." })
      ])
    ]);

    var sources = el("div", { class: "card" }, [
      el("details", {}, [
        el("summary", { text: "Sources et méthode" }),
        el("p", { text: "Les 8 parties s'appuient sur les domaines suivants. Les formulations sont originales (aucune reproduction d'un questionnaire protégé) et n'ont pas été validées statistiquement. Chaque item est noté de 0 à 3 ; les items inversés sont recalculés ; le score d'un domaine est la somme rapportée au maximum possible." }),
        el("ul", { class: "sources" }, SOURCES.map(function (s) { return el("li", {}, [s.name, el("span", { text: s.note })]); }))
      ])
    ]);

    var actions = el("div", { class: "actions" }, [
      el("button", { class: "btn secondary", type: "button", onclick: function () { go(DOMAINS.length - 1); } }, ["Modifier mes réponses"]),
      el("div", { class: "right" }, [
        el("button", { class: "btn secondary", type: "button", onclick: function () { window.print(); } }, ["Imprimer / PDF"]),
        el("button", { class: "btn", type: "button", onclick: function () { if (confirm("Effacer toutes vos réponses ?")) restart(); } }, ["Recommencer"])
      ])
    ]);

    return [summary, profile, obs, meaning, next, sources, actions];
  }

  function restart() {
    state = { step: "intro", answers: {} };
    clearSaved();
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    main.textContent = "";
    var nodes;
    if (state.step === "result") nodes = renderResult();
    else if (typeof state.step === "number") nodes = renderDomain(state.step);
    else nodes = renderIntro();
    nodes.forEach(function (n) { main.appendChild(n); });
    updateProgress();
  }

  window.__spectre = { computeResults: computeResults, band: band, state: function () { return state; } };

  load();
  render();
})();
