# Import SQLAlchemy declarative base
from app.core.database import Base  # noqa
from app.models.user import User  # noqa
from app.models.patient import Patient  # noqa

# Any core/common shared models can be declared here.
# Sub-models will inherit from this Base.

