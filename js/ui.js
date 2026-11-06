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

        const rating = document.createElement("div");
        rating.className = "book-rating";
        rating.textContent = `★ ${book.rating}`;

        const price = document.createElement("span");
        price.className = "book-price";
        price.textContent = book.price === 0 ? "رایگان" : book.price + " تومان";

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(rating);
        card.appendChild(price);

        card.addEventListener("click", () => {
            window.location.href = `index.html?bookId=${book.id}`;
        });

        return card;
    },


    renderBookRow: function(title, books, containerId, categoryQuery) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const section = document.createElement("section");
        section.className = "book-row-section";

        const header = document.createElement("div");
        header.className = "row-header";

        const h2 = document.createElement("h2");
        h2.className = "row-title";
        h2.textContent = title;

        const seeAll = document.createElement("a");
        seeAll.className = "see-all-link";
        seeAll.href = `index.html?list=${categoryQuery}`;
        seeAll.textContent = "مشاهده همه";

        header.appendChild(h2);
        header.appendChild(seeAll);

        const wrapper = document.createElement("div");
        wrapper.className = "row-carousel-wrapper";

        const prevBtn = document.createElement("button");
        prevBtn.className = "carousel-btn prev";
        prevBtn.textContent = "‹";

        const nextBtn = document.createElement("button");
        nextBtn.className = "carousel-btn next";
        nextBtn.textContent = "›";

        const row = document.createElement("div");
        row.className = "books-row";

        books.forEach(book => {
            row.appendChild(this.createBookCard(book));
        });

        prevBtn.addEventListener("click", () => {
            row.scrollBy({ left: 300, behavior: 'smooth' });
        });

        nextBtn.addEventListener("click", () => {
            row.scrollBy({ left: -300, behavior: 'smooth' });
        });

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(row);
        wrapper.appendChild(nextBtn);

        section.appendChild(header);
        section.appendChild(wrapper);
        container.appendChild(section);
    }
};
