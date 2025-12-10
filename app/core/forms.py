from enum import Enum

from flask_wtf import FlaskForm
from wtforms import Form, Field, ValidationError, SubmitField, IntegerField, StringField, SelectField
from wtforms.validators import InputRequired, length, Regexp, Optional, Length

MIN_PASSWORD_LENGTH: int = 8


################################################################################
# Custom Form Validators
################################################################################

# custom validator to check if the hidden field is a number in a reasonable range
class StringIntegerRange():
    def __init__(self, min:int|None=None, max:int|None=None) -> None:
        self.min = min
        self.max = max
    def __call__(self, form: Form, field: Field) -> None:
        # get the value out of the field as a string if it is present
        value: str|None = None if field.data is None else str(field.data)
        # if the value is not present this is an error
        if value is None:
            raise ValidationError("This field is required")
        # if the value is not an integer, this is an error
        try:
            num: int = int(value)
        except ValueError:
            raise ValidationError("Must be an integer")
        # if there is a lower bound and this number is less than it . . .
        if self.min is not None and num < self.min:
            raise ValidationError(f"Must be at least {self.min}")
        # if there is an upper bound and this number is greater than it . . .
        if self.max is not None and num > self.max:
            raise ValidationError(f"Must be less than {self.max}")

# custom validator to ensure the value selected is valid for the chosen enum
class CheckEnum():
    def __init__(self, e: type[Enum]) -> None:
        self.enum = e
    def __call__(self, form: Form, field: Field) -> None:
        if not hasattr(self.enum, field.data):
            names: list[str] = [member.name for member in self.enum]
            raise ValidationError(f"Must be one of ({'|'.join(names)})")

################################################################################
# Forms
################################################################################


class SearchForm(FlaskForm):
    zipcode: StringField = StringField(
        "Zipcode",
        validators=[
            Optional(),
            length(min=5, max=5, message="Zipcode must be 5 digits"),
            Regexp(r"^\d{5}$", message="Zipcode can only contain numbers")  # ensures only five digits and no letters
        ]
    )

    animal_type: SelectField = SelectField(
        "Animal Type",
        validators=[
            Optional()
        ],
        choices=[("", "Select Animal Type"), ("cat", "Cat"), ("dog", "Dog")]
    )

    age_group: SelectField = SelectField(
        "Age Group",
        validators=[
            Optional()
        ],
        choices=[("", "Select Age Group"), ("baby", "Baby"), ("young_adult", "Young Adult"), ("senior", "Senior")]   # blank option
        # fill when i know age groups
    )

    submit: SubmitField = SubmitField("Search")

class EditForm(FlaskForm):
    zipcode: StringField = StringField(validators=[Optional(),Length(min=5,max=5)])
    realPass: StringField = StringField('Current Password',
        validators=[Optional(),Length(min=MIN_PASSWORD_LENGTH)])   #figure out error flashing for if they only input one of the three password fields
    newPass: StringField = StringField('New Password',
        validators=[Optional(),Length(min=MIN_PASSWORD_LENGTH)])
    submit: SubmitField = SubmitField("Submit")
