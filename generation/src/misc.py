import ast
import json

from src.prompts import CLASS_EXAMPLE, EXTRA_CONSTRAINT_FOR_CLASS, FUNCTION_EXAMPLE, USER_PROMPT


LEVEL_PARAMS = None
with open("./src/level_spec.json", "r", encoding="utf8") as file:
    LEVEL_PARAMS = json.load(file)


def load_level_params(level: str) -> dict:
    """ Load level params
    """
    level_data = LEVEL_PARAMS["levels"][level]

    forbidden_types = tuple(
        getattr(ast, name) for name in level_data["forbidden_ast_nodes"]
    )

    return {
        "params": level_data,
        "forbidden_ast_types": forbidden_types,
    }


def gen_user_prompt(level: str) -> str:
    """ Generate user prompt depending of the level
    """
    kata_type = "function" if level in ("kyu10", "kyu9", "kyu8", "kyu7", "kyu6", "kyu5", "kyu4", "kyu3", "kyu2", "kyu1") else "class"
    kata_type_config = {
        "example": FUNCTION_EXAMPLE if kata_type == "function" else CLASS_EXAMPLE,
        "extra_constraint_for_class": EXTRA_CONSTRAINT_FOR_CLASS if kata_type == "class" else ""
    }
    return USER_PROMPT.format(**(load_level_params(level)["params"] | kata_type_config))
