from sqlalchemy import Column, Integer, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from utils.pagination import paginate_query, parse_pagination_args


Base = declarative_base()


class Row(Base):
    __tablename__ = "pagination_test_rows"

    id = Column(Integer, primary_key=True)


def test_pagination_returns_requested_page_and_total():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    session.add_all([Row() for _ in range(6)])
    session.commit()

    rows, pagination = paginate_query(session.query(Row).order_by(Row.id), 2, 2)

    assert [row.id for row in rows] == [3, 4]
    assert pagination == {"page": 2, "per_page": 2, "total": 6, "total_pages": 3}
    session.close()
    engine.dispose()


def test_pagination_args_apply_safe_bounds():
    assert parse_pagination_args({"page": "-1", "per_page": "500"}) == (1, 100)
    assert parse_pagination_args({"page": "invalid", "per_page": "0"}) == (1, 1)


def test_pagination_clamps_out_of_range_page_and_handles_empty_query():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    session.add_all([Row() for _ in range(3)])
    session.commit()

    rows, pagination = paginate_query(session.query(Row).order_by(Row.id), 99, 2)
    assert [row.id for row in rows] == [3]
    assert pagination == {"page": 2, "per_page": 2, "total": 3, "total_pages": 2}

    rows, pagination = paginate_query(session.query(Row).filter(Row.id < 0), 1, 2)
    assert rows == []
    assert pagination == {"page": 1, "per_page": 2, "total": 0, "total_pages": 1}

    session.close()
    engine.dispose()
