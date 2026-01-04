document.addEventListener('DOMContentLoaded', function() {
    const blogPostsContainer = document.getElementById('blog-posts');

    if (blogPostsContainer) {
        fetch('posts.json')
            .then(response => response.json())
            .then(posts => {
                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.classList.add('col-md-6', 'col-lg-4', 'mb-4', 'fade-in-up');
                    postElement.innerHTML = `
                        <div class="card blog-post-card h-100">
                            <img src="${post.image}" class="card-img-top" alt="Image pour ${post.title}" loading="lazy">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${post.title}</h5>
                                <p class="card-text text-muted small">${new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p class="card-text">${post.excerpt}</p>
                                <a href="post.html?id=${post.id}" class="btn btn-primary mt-auto">Lire la suite</a>
                            </div>
                        </div>
                    `;
                    blogPostsContainer.appendChild(postElement);
                });
                // Re-trigger animations for newly added elements
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
            })
            .catch(error => {
                console.error('Erreur lors du chargement des articles de blog:', error);
                blogPostsContainer.innerHTML = '<p class="text-center">Impossible de charger les articles pour le moment. Veuillez réessayer plus tard.</p>';
            });
    }
});
