from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, nullable=False)

    password = Column(String(255), nullable=False)


class MT5Account(Base):

    __tablename__ = "mt5_accounts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    login = Column(String(100))

    password = Column(String(255))

    server = Column(String(255))

    user = relationship("User")