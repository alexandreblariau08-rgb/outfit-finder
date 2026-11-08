export default async function handler(req, res) {
  const urlImage = req.query.url;
  if (!urlImage) {
    return res.status(400).json({ erreur: 'Image manquante' });
  }

  const cle = process.env.SERPAPI_KEY;
  const adresse =
    'https://serpapi.com/search.json?engine=google_lens&type=products&hl=fr&country=fr' +
    '&url=' + encodeURIComponent(urlImage) +
    '&api_key=' + cle;

  try {
    const reponse = await fetch(adresse);
    const donnees = await reponse.json();

    const brut = donnees.visual_matches || [];
    const articles = brut.slice(0, 20).map(m => ({
      titre: m.title,
      lien: m.link,
      source: m.source,
      prix: m.price ? m.price.value : '',
      image: m.thumbnail
    }));

    res.status(200).json({ articles });
  } catch (erreur) {
    res.status(500).json({ erreur: 'Recherche impossible' });
  }
}
