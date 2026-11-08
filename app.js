const champPhoto = document.getElementById('photo');
const apercu = document.getElementById('apercu');
const statut = document.getElementById('statut');
const resultats = document.getElementById('resultats');

// Réglages Cloudinary : remplace par tes propres valeurs
const CLOUD_NAME = 'lih3ubuk';
const UPLOAD_PRESET = 'outfit';

champPhoto.addEventListener('change', async () => {
  const fichier = champPhoto.files[0];
  if (!fichier) return;

  apercu.src = URL.createObjectURL(fichier);
  apercu.hidden = false;
  resultats.innerHTML = '';

  try {
    statut.textContent = 'Envoi de la photo...';
    const urlImage = await envoyerImage(fichier);

    statut.textContent = 'Recherche des articles...';
    const reponse = await fetch('/api/search?url=' + encodeURIComponent(urlImage));
    const donnees = await reponse.json();

    if (!donnees.articles || donnees.articles.length === 0) {
      statut.textContent = 'Aucun article trouvé. Essaie avec une photo plus nette.';
      return;
    }

    statut.textContent = donnees.articles.length + ' articles trouvés';
    afficher(donnees.articles);
  } catch (erreur) {
    statut.textContent = 'Oups, une erreur est survenue. Réessaie.';
    console.error(erreur);
  }
});

async function envoyerImage(fichier) {
  const formulaire = new FormData();
  formulaire.append('file', fichier);
  formulaire.append('upload_preset', UPLOAD_PRESET);

  const reponse = await fetch(
    'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload',
    { method: 'POST', body: formulaire }
  );
  const donnees = await reponse.json();
  return donnees.secure_url;
}

function afficher(articles) {
  resultats.innerHTML = articles.map(a => `
    <a class="carte" href="${a.lien}" target="_blank" rel="noopener">
      <img src="${a.image || ''}" alt="">
      <div class="infos">
        <span class="titre">${a.titre}</span>
        <span class="site">${a.source || ''}</span>
        <span class="prix">${a.prix || ''}</span>
      </div>
    </a>
  `).join('');
}
