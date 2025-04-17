import random
from datetime import datetime, timedelta
from decimal import Decimal

from faker import Faker
from sqlmodel import Session, SQLModel, create_engine, delete

from src.auth.models import User
from src.auth.service import get_password_hash
from src.author.models import Author
from src.book.models import Book
from src.category.models import Category
from src.config import settings  # Import settings to get DATABASE_URL
from src.discount.models import Discount
from src.order.models import Order, OrderItem, OrderStatus
from src.review.models import Review

# Constants for the number of records to generate
NUM_USERS = 20
NUM_CATEGORIES = 10
NUM_AUTHORS = 15
NUM_BOOKS = 50
NUM_REVIEWS_PER_BOOK = 3
NUM_DISCOUNTS = 10
NUM_ORDERS = 30
MAX_ITEMS_PER_ORDER = 5

fake = Faker()

# Database setup
engine = create_engine(
    settings.DATABASE_URL, echo=False
)  # Use DATABASE_URL from settings


def clear_data(session: Session):
    """Deletes all data from the tables in the correct order."""
    print("Clearing existing data...")
    # Delete in reverse order of dependency
    session.exec(delete(OrderItem))
    session.exec(delete(Order))
    session.exec(delete(Discount))
    session.exec(delete(Review))
    session.exec(delete(Book))
    session.exec(delete(Author))
    session.exec(delete(Category))
    session.exec(delete(User))
    session.commit()
    print("Existing data cleared.")


# def create_db_and_tables():
#     """Creates database tables."""
#     SQLModel.metadata.create_all(engine)


def seed_users(session: Session):
    """Seeds the database with fake users."""
    users = []
    for _ in range(NUM_USERS):
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = fake.unique.email()
        password = "testing1"  # Use a common password for simplicity
        hashed_password = get_password_hash(password)
        is_admin = random.choice([True, False, False])  # Lower chance of admin
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            hashed_password=hashed_password,
            admin=is_admin,
            created_at=fake.date_time_this_decade(),
            updated_at=datetime.now(),
        )
        users.append(user)
    session.add_all(users)
    session.commit()
    print(f"Seeded {len(users)} users.")
    return users


def seed_categories(session: Session):
    """Seeds the database with fake categories."""
    categories = []
    for _ in range(NUM_CATEGORIES):
        category = Category(
            category_name=fake.unique.word().capitalize() + " Books",
            category_desc=fake.sentence(),
            created_at=fake.date_time_this_decade(),
            updated_at=datetime.now(),
        )
        categories.append(category)
    session.add_all(categories)
    session.commit()
    print(f"Seeded {len(categories)} categories.")
    return categories


def seed_authors(session: Session):
    """Seeds the database with fake authors."""
    authors = []
    for _ in range(NUM_AUTHORS):
        author = Author(
            author_name=fake.unique.name(),
            author_bio=fake.paragraph(),
            created_at=fake.date_time_this_decade(),
            updated_at=datetime.now(),
        )
        authors.append(author)
    session.add_all(authors)
    session.commit()
    print(f"Seeded {len(authors)} authors.")
    return authors


def seed_books(session: Session, authors: list[Author], categories: list[Category]):
    """Seeds the database with fake books."""
    books = []
    for _ in range(NUM_BOOKS):
        book = Book(
            book_title=fake.catch_phrase(),
            book_summary=fake.text(max_nb_chars=500),
            book_price=Decimal(random.uniform(9.99, 99.99)).quantize(Decimal("0.01")),
            book_cover_photo=fake.image_url(),
            category_id=random.choice(categories).id,
            author_id=random.choice(authors).id,
            created_at=fake.date_time_this_year(),
            updated_at=datetime.now(),
        )
        books.append(book)
    session.add_all(books)
    session.commit()
    print(f"Seeded {len(books)} books.")
    return books


def seed_reviews(session: Session, users: list[User], books: list[Book]):
    """Seeds the database with fake reviews."""
    reviews = []
    reviewed_pairs = set()  # Ensure a user reviews a book only once

    for book in books:
        num_reviews = random.randint(0, NUM_REVIEWS_PER_BOOK)
        available_users = users[:]
        random.shuffle(available_users)

        for i in range(min(num_reviews, len(available_users))):
            user = available_users[i]
            if (user.id, book.id) not in reviewed_pairs:
                review = Review(
                    book_id=book.id,
                    user_id=user.id,
                    rating=random.randint(1, 5),
                    review_title=fake.sentence(nb_words=5),
                    review_details=fake.paragraph(nb_sentences=3),
                    review_date=fake.date_time_between(start_date=book.created_at),
                    created_at=fake.date_time_this_year(),
                    updated_at=datetime.now(),
                )
                reviews.append(review)
                reviewed_pairs.add((user.id, book.id))

    session.add_all(reviews)
    session.commit()
    print(f"Seeded {len(reviews)} reviews.")
    return reviews


def seed_discounts(session: Session, books: list[Book]):
    """Seeds the database with fake discounts."""
    discounts = []
    discounted_books = random.sample(books, min(NUM_DISCOUNTS, len(books)))

    for book in discounted_books:
        discount_price = (book.book_price * Decimal(random.uniform(0.5, 0.9))).quantize(
            Decimal("0.01")
        )
        start_date = fake.date_between(start_date="-1y", end_date="+1y")
        end_date = fake.date_between(
            start_date=start_date,
            end_date=start_date + timedelta(days=random.randint(30, 365)),
        )

        # Allow some discounts to be open-ended
        if random.random() < 0.1:
            start_date = None
        if random.random() < 0.1:
            end_date = None
        # Ensure start is before end if both exist
        if start_date and end_date and start_date > end_date:
            start_date, end_date = end_date, start_date

        discount = Discount(
            book_id=book.id,
            discount_price=discount_price,
            discount_start_date=start_date,
            discount_end_date=end_date,
            created_at=fake.date_time_this_year(),
            updated_at=datetime.now(),
        )
        discounts.append(discount)

    session.add_all(discounts)
    session.commit()
    print(f"Seeded {len(discounts)} discounts.")
    return discounts


def seed_orders(session: Session, users: list[User], books: list[Book]):
    """Seeds the database with fake orders and order items."""
    orders_to_create = []
    all_items_to_create = []

    for _ in range(NUM_ORDERS):
        user = random.choice(users)
        num_items = random.randint(1, MAX_ITEMS_PER_ORDER)
        order_books = random.sample(books, min(num_items, len(books)))
        order_date = fake.date_time_this_year()

        current_order_items = []
        total_amount = Decimal("0.00")

        for book in order_books:
            quantity = random.randint(1, 3)
            # Simplified price logic for seeding - just use book price
            # In a real scenario, check for active discounts here
            price = book.book_price
            item_total = price * Decimal(quantity)
            total_amount += item_total

            order_item = OrderItem(
                # order_id will be set later
                book_id=book.id,
                quantity=quantity,
                price=price,
                created_at=order_date,
                updated_at=order_date,
            )
            current_order_items.append(order_item)

        order = Order(
            user_id=user.id,
            order_date=order_date,
            order_amount=total_amount,
            status=random.choice(list(OrderStatus)),
            created_at=order_date,
            updated_at=order_date,
        )
        # Store order and its items together temporarily
        orders_to_create.append((order, current_order_items))

    # Add orders first
    session.add_all([order for order, items in orders_to_create])
    session.flush()  # Flush to get order IDs

    # Now link items to orders and prepare them for adding
    for order, items in orders_to_create:
        for item in items:
            item.order_id = order.id  # Set the obtained order ID
            all_items_to_create.append(item)

    # Add all items
    session.add_all(all_items_to_create)
    session.commit()
    print(
        f"Seeded {len(orders_to_create)} orders and {len(all_items_to_create)} order items."
    )
    # Return only orders as items are implicitly linked
    return [order for order, items in orders_to_create], all_items_to_create


def seed_all():
    """Runs all seeding functions."""
    print("Starting database seeding...")
    # create_db_and_tables()  # Ensure tables exist

    with Session(engine) as session:
        # Clear existing data first
        clear_data(session)

        print("Seeding users...")
        users = seed_users(session)

        print("Seeding categories...")
        categories = seed_categories(session)

        print("Seeding authors...")
        authors = seed_authors(session)

        print("Seeding books...")
        books = seed_books(session, authors, categories)

        print("Seeding reviews...")
        seed_reviews(session, users, books)

        print("Seeding discounts...")
        seed_discounts(session, books)

        print("Seeding orders...")
        seed_orders(session, users, books)

    print("Database seeding completed.")


if __name__ == "__main__":
    seed_all()
