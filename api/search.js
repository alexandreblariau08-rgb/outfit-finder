export default async function handler(req, res) {
  const urlImage = req.query.url;
  if (!urlImage) {
    return res.status(400).json({ erreur: 'Image manquante' });
  }

  const cle = (process.env.SERPAPI_KEY || '').trim();
  if (!cle) {
    return res.status(200).json({ articles: [], erreur: 'Cle SERPAPI_KEY introuvable sur Vercel' });
  }

  const adresse =
    'https://serpapi.com/search.json?engine=google_lens&type=products&hl=fr&country=fr' +
    '&url=' + encodeURIComponent(urlImage) +
    '&api_key=' + cle;

  try {
    const reponse = await fetch(adresse);
    const donnees = await reponse.json();

    if (donnees.error) {
      return res.status(200).json({ articles: [], erreur: donnees.error });
    }

    const brut = donnees.visual_matches || [];
    const articles = brut.slice(0, 20).map(m => ({
      titre: m.title,
      lien: m.link,
      source: m.source,
      prix: m.price ? m.price.value : '',
      image: m.thumbnail
    }));

    res.status(200).json({ articles, nb: brut.length });
  } catch (erreur) {
    res.status(500).json({ erreur: 'Recherche impossible' });
  }
}
