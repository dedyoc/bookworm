// Mock data for the bookstore application

export interface Book {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  imageUrl: string;
  description: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
  };
  tags?: string[];
  publishedDate: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Author {
  id: string;
  name: string;
  count: number;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

// Sample book data
const books: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: { id: "1", name: "F. Scott Fitzgerald" },
    imageUrl: "https://picsum.photos/id/1/200/300",
    description:
      "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
    price: 15.99,
    discountPrice: 12.99,
    rating: 4.5,
    reviewCount: 128,
    category: { id: "1", name: "Fiction" },
    tags: ["Classic", "American Literature", "Jazz Age"],
    publishedDate: "1925-04-10",
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: { id: "2", name: "Harper Lee" },
    imageUrl: "https://picsum.photos/id/2/200/300",
    description:
      "To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.",
    price: 14.99,
    rating: 4.8,
    reviewCount: 235,
    category: { id: "1", name: "Fiction" },
    tags: ["Classic", "American Literature", "Legal Drama"],
    publishedDate: "1960-07-11",
  },
  {
    id: "3",
    title: "Pride and Prejudice",
    author: { id: "3", name: "Jane Austen" },
    imageUrl: "https://picsum.photos/id/3/200/300",
    description:
      "Pride and Prejudice is a romantic novel of manners written by Jane Austen in 1813. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
    price: 12.99,
    discountPrice: 9.99,
    rating: 4.7,
    reviewCount: 201,
    category: { id: "1", name: "Fiction" },
    tags: ["Classic", "Romance", "British Literature"],
    publishedDate: "1813-01-28",
  },
  {
    id: "4",
    title: "The Hobbit",
    author: { id: "4", name: "J.R.R. Tolkien" },
    imageUrl: "https://picsum.photos/id/4/200/300",
    description:
      "The Hobbit, or There and Back Again is a children's fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937 to wide critical acclaim, being nominated for the Carnegie Medal and awarded a prize from the New York Herald Tribune for best juvenile fiction.",
    price: 18.99,
    discountPrice: 15.99,
    rating: 4.9,
    reviewCount: 289,
    category: { id: "2", name: "Fantasy" },
    tags: ["Classic", "Fantasy", "Adventure"],
    publishedDate: "1937-09-21",
  },
  {
    id: "5",
    title: "1984",
    author: { id: "5", name: "George Orwell" },
    imageUrl: "https://picsum.photos/id/5/200/300",
    description:
      "1984 is a dystopian social science fiction novel by English novelist George Orwell. It was published on 8 June 1949 by Secker & Warburg as Orwell's ninth and final book completed in his lifetime.",
    price: 13.99,
    rating: 4.6,
    reviewCount: 178,
    category: { id: "3", name: "Science Fiction" },
    tags: ["Dystopian", "Political", "Social Commentary"],
    publishedDate: "1949-06-08",
  },
  {
    id: "6",
  title: "The Catcher in the Rye And To Eat A Dying Horse And To Eat A Dying Horse",
    author: { id: "6", name: "J.D. Salinger" },
    imageUrl: "https://picsum.photos/id/6/200/300",
    description:
      "The Catcher in the Rye is a novel by J. D. Salinger, partially published in serial form in 1945–1946 and as a novel in 1951. It was originally intended for adults but is often read by adolescents for its themes of angst, alienation, and as a critique of superficiality in society.",
    price: 11.99,
    discountPrice: 8.99,
    rating: 4.3,
    reviewCount: 156,
    category: { id: "1", name: "Fiction" },
    tags: ["Coming of Age", "American Literature", "Controversial"],
    publishedDate: "1951-07-16",
  },
  {
    id: "7",
    title: "The Lord of the Rings",
    author: { id: "4", name: "J.R.R. Tolkien" },
    imageUrl: "https://picsum.photos/id/7/200/300",
    description:
      "The Lord of the Rings is an epic high-fantasy novel written by English author and scholar J. R. R. Tolkien. The story began as a sequel to Tolkien's 1937 fantasy novel The Hobbit, but eventually developed into a much larger work.",
    price: 29.99,
    discountPrice: 24.99,
    rating: 4.9,
    reviewCount: 312,
    category: { id: "2", name: "Fantasy" },
    tags: ["Epic", "Fantasy", "Adventure"],
    publishedDate: "1954-07-29",
  },
  {
    id: "8",
    title: "Brave New World",
    author: { id: "7", name: "Aldous Huxley" },
    imageUrl: "https://picsum.photos/id/8/200/300",
    description:
      "Brave New World is a dystopian social science fiction novel by English author Aldous Huxley, written in 1931 and published in 1932. Largely set in a futuristic World State, whose citizens are environmentally engineered into an intelligence-based social hierarchy.",
    price: 16.99,
    rating: 4.5,
    reviewCount: 165,
    category: { id: "3", name: "Science Fiction" },
    tags: ["Dystopian", "Social Commentary", "Futuristic"],
    publishedDate: "1932-01-01",
  },
  {
    id: "9",
    title: "The Alchemist",
    author: { id: "8", name: "Paulo Coelho" },
    imageUrl: "https://picsum.photos/id/9/200/300",
    description:
      "The Alchemist is a novel by Brazilian author Paulo Coelho that was first published in 1988. Originally written in Portuguese, it became a widely translated international bestseller.",
    price: 14.99,
    discountPrice: 11.99,
    rating: 4.4,
    reviewCount: 209,
    category: { id: "4", name: "Philosophical Fiction" },
    tags: ["Spiritual", "Adventure", "Quest"],
    publishedDate: "1988-01-01",
  },
  {
    id: "10",
    title: "The Da Vinci Code",
    author: { id: "9", name: "Dan Brown" },
    imageUrl: "https://picsum.photos/id/10/200/300",
    description:
      "The Da Vinci Code is a 2003 mystery thriller novel by Dan Brown. It follows symbologist Robert Langdon and cryptologist Sophie Neveu after a murder in the Louvre Museum in Paris causes them to become involved in a battle between the Priory of Sion and Opus Dei over the possibility of Jesus Christ and Mary Magdalene having had a child together.",
    price: 19.99,
    discountPrice: 16.99,
    rating: 4.2,
    reviewCount: 245,
    category: { id: "5", name: "Mystery" },
    tags: ["Thriller", "Mystery", "Suspense"],
    publishedDate: "2003-03-18",
  },
];

for (let i = 11; i <= 30; i++) {
  books.push({
    id: i.toString(),
    title: `Book Title ${i}`,
    author: { id: ((i % 9) + 1).toString(), name: `Author ${(i % 9) + 1}` },
    imageUrl: `https://picsum.photos/id/${i}/200/300`,
    description: `This is the description for Book ${i}. It contains a detailed summary of the plot and themes explored in the book.`,
    price: 9.99 + (i % 10),
    discountPrice: i % 3 === 0 ? 7.99 + (i % 10) : undefined,
    rating: 3 + Math.random() * 2,
    reviewCount: 50 + i * 5,
    category: {
      id: ((i % 5) + 1).toString(),
      name: [
        "Fiction",
        "Fantasy",
        "Science Fiction",
        "Philosophical Fiction",
        "Mystery",
      ][i % 5],
    },
    publishedDate: `20${Math.floor(i / 2)}-01-01`,
  });
}

// Categories
const categories: Category[] = [
  {
    id: "1",
    name: "Fiction",
    count: books.filter((b) => b.category.id === "1").length,
  },
  {
    id: "2",
    name: "Fantasy",
    count: books.filter((b) => b.category.id === "2").length,
  },
  {
    id: "3",
    name: "Science Fiction",
    count: books.filter((b) => b.category.id === "3").length,
  },
  {
    id: "4",
    name: "Philosophical Fiction",
    count: books.filter((b) => b.category.id === "4").length,
  },
  {
    id: "5",
    name: "Mystery",
    count: books.filter((b) => b.category.id === "5").length,
  },
];

// Authors
const authors: Author[] = [
  {
    id: "1",
    name: "F. Scott Fitzgerald",
    count: books.filter((b) => b.author.id === "1").length,
  },
  {
    id: "2",
    name: "Harper Lee",
    count: books.filter((b) => b.author.id === "2").length,
  },
  {
    id: "3",
    name: "Jane Austen",
    count: books.filter((b) => b.author.id === "3").length,
  },
  {
    id: "4",
    name: "J.R.R. Tolkien",
    count: books.filter((b) => b.author.id === "4").length,
  },
  {
    id: "5",
    name: "George Orwell",
    count: books.filter((b) => b.author.id === "5").length,
  },
  {
    id: "6",
    name: "J.D. Salinger",
    count: books.filter((b) => b.author.id === "6").length,
  },
  {
    id: "7",
    name: "Aldous Huxley",
    count: books.filter((b) => b.author.id === "7").length,
  },
  {
    id: "8",
    name: "Paulo Coelho",
    count: books.filter((b) => b.author.id === "8").length,
  },
  {
    id: "9",
    name: "Dan Brown",
    count: books.filter((b) => b.author.id === "9").length,
  },
];

const reviews: Review[] = [];
for (let i = 1; i <= 10; i++) {
  for (let j = 1; j <= 5; j++) {
    reviews.push({
      id: `${i}-${j}`,
      bookId: i.toString(),
      userId: j.toString(),
      userName: `User ${j}`,
      rating: 3 + Math.random() * 2,
      title: `Review ${j} for Book ${i}`,
      content: `This is review ${j} for book ${i}. It contains the reviewer's thoughts and opinions about the book.`,
      date: new Date(Date.now() - j * 86400000).toISOString(),
    });
  }
}

// Api delay for examining skeleton loading
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API functions
export const api = {
  // Books
  getBooks: async (
    params: {
      page?: number;
      limit?: number;
      category?: string;
      author?: string;
      minRating?: number;
      sort?: "price-asc" | "price-desc" | "on-sale" | "popularity";
      onSale?: boolean;
    } = {}
  ) => {
    await delay(500); // Simulate network delay

    const {
      page = 1,
      limit = 10,
      category,
      author,
      minRating,
      sort,
      onSale,
    } = params;

    let filteredBooks = [...books];

    // Apply filters
    if (category) {
      filteredBooks = filteredBooks.filter(
        (book) => book.category.id === category
      );
    }

    if (author) {
      filteredBooks = filteredBooks.filter((book) => book.author.id === author);
    }

    if (minRating) {
      filteredBooks = filteredBooks.filter((book) => book.rating >= minRating);
    }

    if (onSale) {
      filteredBooks = filteredBooks.filter(
        (book) => book.discountPrice !== undefined
      );
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case "price-asc":
          filteredBooks.sort(
            (a, b) =>
              (a.discountPrice || a.price) - (b.discountPrice || b.price)
          );
          break;
        case "price-desc":
          filteredBooks.sort(
            (a, b) =>
              (b.discountPrice || b.price) - (a.discountPrice || a.price)
          );
          break;
        case "on-sale":
          filteredBooks.sort((a, b) => {
            const aOnSale = a.discountPrice !== undefined ? 1 : 0;
            const bOnSale = b.discountPrice !== undefined ? 1 : 0;
            return bOnSale - aOnSale;
          });
          break;
        case "popularity":
          filteredBooks.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    // Calculate pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBooks = filteredBooks.slice(start, end);

    return {
      books: paginatedBooks,
      total: filteredBooks.length,
      page,
      limit,
      totalPages: Math.ceil(filteredBooks.length / limit),
    };
  },

  getBookById: async (id: string) => {
    await delay(300);
    const book = books.find((b) => b.id === id);
    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  },

  // Categories
  getCategories: async () => {
    await delay(200);
    return categories;
  },

  // Authors
  getAuthors: async () => {
    await delay(200);
    return authors;
  },

  // Reviews
  getReviewsByBookId: async (
    bookId: string,
    params: {
      page?: number;
      limit?: number;
      sort?: "newest" | "oldest" | "rating-high" | "rating-low";
      filterRating?: number;
    } = {}
  ) => {
    await delay(400);

    const { page = 1, limit = 5, sort = "newest", filterRating } = params;

    let filteredReviews = reviews.filter((r) => r.bookId === bookId);

    if (filterRating) {
      filteredReviews = filteredReviews.filter(
        (r) => Math.floor(r.rating) === filterRating
      );
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        filteredReviews.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        filteredReviews.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "rating-high":
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
    }

    // Calculate pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedReviews = filteredReviews.slice(start, end);

    return {
      reviews: paginatedReviews,
      total: filteredReviews.length,
      page,
      limit,
      totalPages: Math.ceil(filteredReviews.length / limit),
    };
  },

  addReview: async (
    bookId: string,
    review: {
      rating: number;
      title: string;
      content: string;
    }
  ) => {
    await delay(500);

    const newReview: Review = {
      id: `${bookId}-${reviews.length + 1}`,
      bookId,
      userId: "current-user",
      userName: "Current User",
      rating: review.rating,
      title: review.title,
      content: review.content,
      date: new Date().toISOString(),
    };

    reviews.push(newReview);

    const book = books.find((b) => b.id === bookId);
    if (book) {
      const bookReviews = reviews.filter((r) => r.bookId === bookId);
      book.reviewCount = bookReviews.length;
      book.rating =
        bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
    }

    return newReview;
  },

  // Orders
  createOrder: async (items: { id: string; quantity: number }[]) => {
    await delay(700);

    return {
      orderId: `order-${Date.now()}`,
      date: new Date().toISOString(),
      items: items.map((item) => {
        const book = books.find((b) => b.id === item.id);
        return {
          id: item.id,
          title: book?.title || "Unknown Book",
          price: book?.discountPrice || book?.price || 0,
          quantity: item.quantity,
        };
      }),
      total: items.reduce((sum, item) => {
        const book = books.find((b) => b.id === item.id);
        return sum + (book?.discountPrice || book?.price || 0) * item.quantity;
      }, 0),
    };
  },
};
