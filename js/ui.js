const UI = {
    createBookCard: function(book) {
        const card = document.createElement("div");
        card.className = "book-card";

        const img = document.createElement("img");
        img.src = book.cover;
        img.alt = book.title;
        img.className = "book-cover";

        const title = document.createElement("h3");
        title.className = "book-title";
        title.textContent = book.title;

        const author = document.createElement("p");
        author.className = "book-author";
        author.textContent = book.author;

        const price = document.createElement("span");
        price.className = "book-price";
        price.textContent = book.price === 0 ? "رایگان" : book.price + " تومان";

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(price);

        return card;
    },

    renderBooksList: function(books, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = ""; 
        
        books.forEach(book => {
            const card = this.createBookCard(book);
            container.appendChild(card);
        });
    }
};