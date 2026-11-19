const UI = {
    createBookCard: function(book, options = {}) {
        const card = document.createElement("div");
        card.className = "book-card";

        const favBtn = document.createElement("button");
        favBtn.type = "button";
        favBtn.className = "card-fav-btn";
        favBtn.dataset.bookId = book.id;
        favBtn.title = "علاقه‌مندی";

        const isFav = Array.isArray(options.favorites) && options.favorites.includes(book.id);
        favBtn.classList.toggle("active", isFav);
        favBtn.textContent = isFav ? "♥" : "♡";

        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (typeof options.onToggleFavorite === "function") {
                options.onToggleFavorite(book.id);
            }
        });

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

        card.appendChild(favBtn);
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

    renderBooksList: function(books, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = "";

        books.forEach(book => {
            const card = this.createBookCard(book, options);
            container.appendChild(card);
        });
    },

    renderBookRow: function(title, books, containerId, categoryQuery, options = {}) {
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
            row.appendChild(this.createBookCard(book, options));
        });

        prevBtn.addEventListener("click", () => {
            row.scrollBy({ left: 300, behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
            row.scrollBy({ left: -300, behavior: "smooth" });
        });

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(row);
        wrapper.appendChild(nextBtn);

        section.appendChild(header);
        section.appendChild(wrapper);
        container.appendChild(section);
    },

    showBookNotFound: function() {
        const container = document.getElementById("book-details-view");
        if (!container) return;

        container.innerHTML = "";

        const box = document.createElement("div");
        box.className = "empty-state";

        const msg = document.createElement("p");
        msg.textContent = "کتاب یافت نشد";

        const backLink = document.createElement("a");
        backLink.href = "index.html";
        backLink.className = "btn-primary";
        backLink.style.textDecoration = "none";
        backLink.style.display = "inline-block";
        backLink.textContent = "بازگشت به صفحه اصلی";

        box.appendChild(msg);
        box.appendChild(backLink);
        container.appendChild(box);
    },

    renderBookDetails: function(book) {
        const container = document.getElementById("book-details-view");
        if (!container) return;

        container.innerHTML = "";

        const detailsWrapper = document.createElement("div");
        detailsWrapper.className = "book-details-container";

        const coverCol = document.createElement("div");
        coverCol.className = "book-details-cover";

        const img = document.createElement("img");
        img.src = book.cover;
        img.alt = book.title;
        coverCol.appendChild(img);

        const infoCol = document.createElement("div");
        infoCol.className = "book-details-info";

        const title = document.createElement("h2");
        title.className = "book-details-title";
        title.textContent = book.title;

        const meta = document.createElement("div");
        meta.className = "book-details-meta";

        const authorSpan = document.createElement("span");
        authorSpan.textContent = `نویسنده: ${book.author}`;

        const categorySpan = document.createElement("span");
        categorySpan.textContent = `دسته: ${book.category}`;

        const ratingSpan = document.createElement("span");
        ratingSpan.textContent = `امتیاز: ${book.rating} ★`;

        meta.append(authorSpan, categorySpan, ratingSpan);

        const price = document.createElement("p");
        price.className = "book-details-price";
        price.textContent = book.price === 0 ? "قیمت: رایگان" : `قیمت: ${book.price} تومان`;

        const desc = document.createElement("p");
        desc.className = "book-details-description";
        desc.textContent = book.description;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "book-actions";

        const buyBtn = document.createElement("button");
        buyBtn.type = "button";
        buyBtn.className = "btn-action btn-buy";
        buyBtn.id = "btn-buy";

        const favBtn = document.createElement("button");
        favBtn.type = "button";
        favBtn.className = "btn-action btn-fav";
        favBtn.id = "btn-fav";

        const sampleBtn = document.createElement("button");
        sampleBtn.type = "button";
        sampleBtn.className = "btn-action btn-sample";
        sampleBtn.id = "btn-sample";
        sampleBtn.textContent = "باز کردن نمونه";

        actionsDiv.append(buyBtn, favBtn, sampleBtn);
        infoCol.append(title, meta, price, desc, actionsDiv);
        detailsWrapper.append(coverCol, infoCol);
        container.appendChild(detailsWrapper);

        const relatedDiv = document.createElement("div");
        relatedDiv.className = "related-books-section";
        relatedDiv.id = "related-books-container";
        container.appendChild(relatedDiv);
    },

    renderLibraryView: function(libraryBooks, favoriteBooks, callbacks) {
        const container = document.getElementById("library-view");
        if (!container) return;

        container.innerHTML = "";

        const receivedSection = document.createElement("section");
        receivedSection.className = "library-section";

        const receivedTitle = document.createElement("h2");
        receivedTitle.className = "library-section-title";
        receivedTitle.textContent = `کتاب‌های دریافت شده (${libraryBooks.length})`;
        receivedSection.appendChild(receivedTitle);

        if (libraryBooks.length === 0) {
            const emptyReceived = document.createElement("div");
            emptyReceived.className = "empty-state";

            const emptyText = document.createElement("p");
            emptyText.textContent = "هنوز کتابی دریافت یا خریداری نکرده‌اید.";

            const browseBtn = document.createElement("button");
            browseBtn.type = "button";
            browseBtn.className = "btn-primary";
            browseBtn.textContent = "مشاهده کتاب‌ها";
            browseBtn.addEventListener("click", callbacks.onBrowseBooks);

            emptyReceived.append(emptyText, browseBtn);
            receivedSection.appendChild(emptyReceived);
        } else {
            const receivedGrid = document.createElement("div");
            receivedGrid.className = "books-grid";

            libraryBooks.forEach(book => {
                const card = this.createBookCard(book, {
                    favorites: callbacks.favorites,
                    onToggleFavorite: callbacks.onToggleFavorite
                });

                const actions = document.createElement("div");
                actions.className = "library-card-actions";

                const openBtn = document.createElement("button");
                openBtn.type = "button";
                openBtn.className = "btn-read-book";
                openBtn.textContent = "باز کردن کتاب";
                openBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    callbacks.onOpenBook(book);
                });

                actions.appendChild(openBtn);
                card.appendChild(actions);
                receivedGrid.appendChild(card);
            });

            receivedSection.appendChild(receivedGrid);
        }

        const favSection = document.createElement("section");
        favSection.className = "library-section";

        const favTitle = document.createElement("h2");
        favTitle.className = "library-section-title";
        favTitle.textContent = `علاقه‌مندی‌ها (${favoriteBooks.length})`;
        favSection.appendChild(favTitle);

        if (favoriteBooks.length === 0) {
            const emptyFav = document.createElement("div");
            emptyFav.className = "empty-state";

            const emptyFavText = document.createElement("p");
            emptyFavText.textContent = "فهرست علاقه‌مندی‌های شما خالی است.";

            emptyFav.appendChild(emptyFavText);
            favSection.appendChild(emptyFav);
        } else {
            const favGrid = document.createElement("div");
            favGrid.className = "books-grid";

            favoriteBooks.forEach(book => {
                const card = this.createBookCard(book, {
                    favorites: callbacks.favorites,
                    onToggleFavorite: callbacks.onToggleFavorite
                });

                const actions = document.createElement("div");
                actions.className = "library-card-actions";

                const removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.className = "btn-remove-fav";
                removeBtn.textContent = "حذف از علاقه‌مندی";
                removeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    callbacks.onToggleFavorite(book.id);
                });

                actions.appendChild(removeBtn);
                card.appendChild(actions);
                favGrid.appendChild(card);
            });

            favSection.appendChild(favGrid);
        }

        container.append(receivedSection, favSection);
    }
};