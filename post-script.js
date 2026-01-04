document.addEventListener('DOMContentLoaded', function() {
    const postContentContainer = document.getElementById('post-content');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postContentContainer && postId) {
        fetch('posts.json')
            .then(response => response.json())
            .then(posts => {
                const post = posts.find(p => p.id == postId);
                if (post) {
                    document.title = `${post.title} - Mon Portfolio`;
                    const postHTML = `
                        <header class="post-header text-center mb-4">
                            <h1 class="display-5 fade-in-up">${post.title}</h1>
                            <p class="text-muted fade-in-up">${new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </header>
                        <img src="${post.image}" class="img-fluid rounded mb-4 fade-in-up" alt="Image pour ${post.title}">
                        <div class="post-body fade-in-up">
                            ${post.content}
                        </div>
                        <hr class="my-5">
                        <div class="text-center fade-in-up">
                            <a href="blog.html" class="btn btn-outline-primary"><i class="bi bi-arrow-left"></i> Retour au Blog</a>
                        </div>
                    `;
                    postContentContainer.innerHTML = postHTML;
                     // Re-trigger animations
                    const animatedElements = document.querySelectorAll('.fade-in-up');
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('is-visible');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.1 });
                    animatedElements.forEach(el => observer.observe(el));

                } else {
                    postContentContainer.innerHTML = '<div class="alert alert-danger text-center">Article non trouvé.</div>';
                }
            })
            .catch(error => {
                console.error("Erreur lors du chargement de l'article:", error);
                postContentContainer.innerHTML = '<div class="alert alert-danger text-center">Impossible de charger l\'article pour le moment.</div>';
            });
    } else {
        postContentContainer.innerHTML = '<div class="alert alert-warning text-center">Aucun article spécifié.</div>';
    }
});
